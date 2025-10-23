const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({
  path: process.env.FALTA_EMS_ENV
    ? path.resolve(process.env.FALTA_EMS_ENV)
    : path.resolve(__dirname, '../../.env')
});

const { getDb } = require('../../shared/database');
const {
  createAdmin,
  findAdminByEmail,
  findAdminById,
  listAdmins,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  createUser,
  listUsers,
  findUserById,
  updateUser,
  updateUserPassword,
  findUserByEmail
} = require('../../shared/repositories');
const {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateTempPassword
} = require('../../shared/security');
const {
  adminRegistrationSchema,
  adminLoginSchema,
  userCreationSchema,
  userUpdateSchema,
  userPasswordResetSchema
} = require('../../shared/validators');
const {
  sendAdminCreationEmail,
  sendUserCreationEmail
} = require('../../shared/email');

const PORT = process.env.ADMIN_SERVER_PORT || 4000;
const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY;

// Initialise the database right away
getDb();

const app = express();

// CORS configuration - allow both local development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://agniswarbanerjee05.github.io'
    ];
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

function sanitizeAdmin(admin) {
  if (!admin) return null;
  const { password_hash, ...rest } = admin;
  return rest;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyToken(token);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-server' });
});

app.post('/api/admin/register', async (req, res) => {
  try {
    if (ADMIN_REGISTRATION_KEY) {
      const suppliedKey = req.headers['x-registration-key'] || req.body.registrationKey;
      if (suppliedKey !== ADMIN_REGISTRATION_KEY) {
        return res.status(403).json({ error: 'Invalid registration key' });
      }
    }

    const payload = adminRegistrationSchema.parse(req.body);
    const existing = findAdminByEmail(payload.email);
    if (existing) {
      return res.status(409).json({ error: 'Admin already exists' });
    }
    
    // Check if email is already used by a user account
    const existingUser = findUserByEmail(payload.email);
    if (existingUser) {
      return res.status(409).json({ error: 'This email is already used by a user account' });
    }
    
    const passwordHash = await hashPassword(payload.password);
    const admin = createAdmin({
      email: payload.email,
      passwordHash,
      plainPassword: payload.password,
      fullName: payload.fullName
    });
    const token = generateToken({
      sub: admin.id,
      email: admin.email,
      role: 'admin'
    });
    
    // Send confirmation email asynchronously (don't block response)
    sendAdminCreationEmail({
      email: admin.email,
      fullName: admin.full_name,
      password: payload.password
    }).catch(err => {
      console.error('Failed to send admin creation email:', err);
    });
    
    return res.status(201).json({
      admin: sanitizeAdmin(admin),
      token
    });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid payload', details: error.issues });
    }
    console.error('Failed to register admin', error);
    return res.status(500).json({ error: 'Failed to register admin' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const payload = adminLoginSchema.parse(req.body);
    
    // Check if this email belongs to a user account (not admin)
    const userAccount = findUserByEmail(payload.email);
    const adminAccount = findAdminByEmail(payload.email);
    if (userAccount && !adminAccount) {
      return res.status(403).json({ error: 'User accounts cannot login through admin portal. Please use the user login.' });
    }
    
    const admin = findAdminByEmail(payload.email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await verifyPassword(payload.password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({
      sub: admin.id,
      email: admin.email,
      role: 'admin'
    });
    return res.json({
      admin: sanitizeAdmin(admin),
      token
    });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid payload', details: error.issues });
    }
    console.error('Failed to login admin', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/users', requireAuth, async (req, res) => {
  try {
    const payload = userCreationSchema.parse(req.body);
    
    // Check if email is already used by an admin
    const existingAdmin = findAdminByEmail(payload.email);
    if (existingAdmin) {
      return res.status(409).json({ error: 'This email is already used by an admin account' });
    }
    
    const existingUser = findUserByEmail(payload.email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with that email' });
    }
    const rawPassword = payload.password || generateTempPassword();
    const passwordHash = await hashPassword(rawPassword);
    const user = createUser({
      email: payload.email,
      passwordHash,
      plainPassword: rawPassword,
      fullName: payload.fullName,
      status: payload.status ?? 'ACTIVE',
      createdBy: req.admin.id
    });
    
    // Send confirmation email asynchronously (don't block response)
    sendUserCreationEmail({
      email: user.email,
      fullName: user.full_name,
      password: rawPassword,
      isAdmin: false
    }).catch(err => {
      console.error('Failed to send user creation email:', err);
    });
    
    return res.status(201).json({
      user: sanitizeUser(user),
      credentials: {
        email: user.email,
        password: rawPassword,
        temporary: !payload.password
      }
    });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid payload', details: error.issues });
    }
    console.error('Failed to create user', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users', requireAuth, (req, res) => {
  try {
    const users = listUsers().map(sanitizeUser);
    return res.json({ users });
  } catch (error) {
    console.error('Failed to list users', error);
    return res.status(500).json({ error: 'Failed to list users' });
  }
});

app.get('/api/admins', requireAuth, (req, res) => {
  try {
    const admins = listAdmins().map(sanitizeAdmin);
    return res.json({ admins });
  } catch (error) {
    console.error('Failed to list admins', error);
    return res.status(500).json({ error: 'Failed to list admins' });
  }
});

app.put('/api/admins/:id', requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid admin id' });
  }
  
  try {
    const payload = { id, ...req.body };
    
    // Check if email is being changed and if it conflicts with another user/admin
    if (payload.email) {
      const existingUser = findUserByEmail(payload.email);
      if (existingUser) {
        return res.status(409).json({ error: 'This email is already used by a user account' });
      }
      const existingAdmin = findAdminByEmail(payload.email);
      if (existingAdmin && existingAdmin.id !== id) {
        return res.status(409).json({ error: 'This email is already used by another admin' });
      }
    }
    
    const admin = updateAdmin(payload);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    return res.json({ admin: sanitizeAdmin(admin) });
  } catch (error) {
    console.error('Failed to update admin', error);
    return res.status(500).json({ error: 'Failed to update admin' });
  }
});

app.post('/api/admins/:id/reset-password', requireAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid admin id' });
  }

  try {
    const admin = findAdminById(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const rawPassword = req.body?.password || generateTempPassword();
    const passwordHash = await hashPassword(rawPassword);
    const updated = updateAdminPassword(id, passwordHash, rawPassword);

    return res.json({
      admin: sanitizeAdmin(updated),
      credentials: {
        email: updated.email,
        password: rawPassword,
        temporary: !req.body?.password
      }
    });
  } catch (error) {
    console.error('Failed to reset admin password', error);
    return res.status(500).json({ error: 'Failed to reset admin password' });
  }
});

app.delete('/api/admins/:id', requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid admin id' });
  }

  try {
    const admin = findAdminById(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Prevent deleting yourself
    if (admin.id === req.admin.id) {
      return res.status(403).json({ error: 'Cannot delete your own admin account' });
    }

    // Check if this is the last admin
    const allAdmins = listAdmins();
    if (allAdmins.length <= 1) {
      return res.status(403).json({ error: 'Cannot delete the last admin account' });
    }

    deleteAdmin(id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete admin', error);
    return res.status(500).json({ error: 'Failed to delete admin' });
  }
});

app.get('/api/users/:id', requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  const user = findUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: sanitizeUser(user) });
});

app.put('/api/users/:id', requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  try {
    const payload = userUpdateSchema.parse(req.body);
    const user = findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (payload.email) {
      const clash = findUserByEmail(payload.email);
      if (clash && clash.id !== id) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }
    const updated = updateUser({ id, ...payload });
    return res.json({ user: sanitizeUser(updated) });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid payload', details: error.issues });
    }
    console.error('Failed to update user', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

app.post('/api/users/:id/reset-password', requireAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  try {
    const payload = userPasswordResetSchema.optional().parse(req.body ?? {});
    const user = findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const rawPassword = payload?.password || generateTempPassword();
    const passwordHash = await hashPassword(rawPassword);
    const updated = updateUserPassword(id, passwordHash, rawPassword);
    return res.json({
      user: sanitizeUser(updated),
      credentials: {
        email: updated.email,
        password: rawPassword,
        temporary: !payload?.password
      }
    });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid payload', details: error.issues });
    }
    console.error('Failed to reset password', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.delete('/api/users/:id', requireAuth, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  try {
    const db = getDb();
    const existing = findUserById(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }
    db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(PORT, () => {
  console.log(`Admin server running on port ${PORT}`);
});
