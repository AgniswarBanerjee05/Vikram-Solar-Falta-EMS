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
  findUserByEmail,
  findUserById,
  updateUserPassword,
  findAdminByEmail
} = require('../../shared/repositories');
const {
  verifyPassword,
  hashPassword,
  generateToken,
  verifyToken
} = require('../../shared/security');
const {
  userLoginSchema,
  userChangePasswordSchema
} = require('../../shared/validators');

const PORT = process.env.USER_SERVER_PORT || 5000;

getDb();

const app = express();
app.use(cors());
app.use(express.json());

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

function requireUser(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyToken(token);
    if (payload.role !== 'user') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-server' });
});

app.post('/api/login', async (req, res) => {
  try {
    const payload = userLoginSchema.parse(req.body);
    
    // Check if this email belongs to an admin account
    const adminAccount = findAdminByEmail(payload.email);
    if (adminAccount) {
      return res.status(403).json({ error: 'Admin accounts cannot login through user portal. Please use the admin login.' });
    }
    
    const user = findUserByEmail(payload.email);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await verifyPassword(payload.password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(
      { sub: user.id, email: user.email, role: 'user' },
      { expiresIn: '4h' }
    );

    return res.json({
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid payload', details: error.issues });
    }
    console.error('Failed to login user', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/me', requireUser, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: sanitizeUser(user) });
});

app.put('/api/me/password', requireUser, async (req, res) => {
  try {
    const payload = userChangePasswordSchema.parse(req.body);
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const valid = await verifyPassword(payload.currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid current password' });
    }
    const newHash = await hashPassword(payload.newPassword);
    const updated = updateUserPassword(user.id, newHash, payload.newPassword);
    return res.json({ user: sanitizeUser(updated) });
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid payload', details: error.issues });
    }
    console.error('Failed to change password', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(PORT, () => {
  console.log(`User server running on port ${PORT}`);
});
