const { getDb } = require('./database');

function normalizeRow(row) {
  if (!row) return null;
  return { ...row };
}

function createAdmin({ email, passwordHash, fullName, plainPassword }) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO admins (email, password_hash, plain_password, full_name)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(email.toLowerCase(), passwordHash, plainPassword || null, fullName ?? null);
  return findAdminById(info.lastInsertRowid);
}

function findAdminById(id) {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM admins WHERE id = ?`).get(id);
  return normalizeRow(row);
}

function findAdminByEmail(email) {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM admins WHERE email = ?`).get(email.toLowerCase());
  return normalizeRow(row);
}

function listAdmins() {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM admins ORDER BY created_at DESC`)
    .all();
  return rows.map(normalizeRow);
}

function listUsers() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT users.*, admins.email AS created_by_email
       FROM users
       LEFT JOIN admins ON admins.id = users.created_by
       ORDER BY users.created_at DESC`
    )
    .all();
  return rows.map(normalizeRow);
}

function findUserById(id) {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
  return normalizeRow(row);
}

function findUserByEmail(email) {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase());
  return normalizeRow(row);
}

function createUser({ email, passwordHash, fullName, status = 'ACTIVE', createdBy, plainPassword }) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, plain_password, full_name, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(email.toLowerCase(), passwordHash, plainPassword || null, fullName ?? null, status, createdBy ?? null);
  return findUserById(info.lastInsertRowid);
}

function updateUser({ id, email, fullName, status }) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE users
    SET email = COALESCE(?, email),
        full_name = COALESCE(?, full_name),
        status = COALESCE(?, status)
    WHERE id = ?
  `);
  stmt.run(email ? email.toLowerCase() : null, fullName ?? null, status ?? null, id);
  return findUserById(id);
}

function updateUserPassword(id, passwordHash, plainPassword = null) {
  const db = getDb();
  db.prepare(`UPDATE users SET password_hash = ?, plain_password = ? WHERE id = ?`).run(passwordHash, plainPassword, id);
  return findUserById(id);
}

function updateAdmin({ id, email, fullName }) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE admins
    SET email = COALESCE(?, email),
        full_name = COALESCE(?, full_name)
    WHERE id = ?
  `);
  stmt.run(email ? email.toLowerCase() : null, fullName ?? null, id);
  return findAdminById(id);
}

function updateAdminPassword(id, passwordHash, plainPassword = null) {
  const db = getDb();
  db.prepare(`UPDATE admins SET password_hash = ?, plain_password = ? WHERE id = ?`).run(passwordHash, plainPassword, id);
  return findAdminById(id);
}

function deleteAdmin(id) {
  const db = getDb();
  db.prepare(`DELETE FROM admins WHERE id = ?`).run(id);
}

module.exports = {
  createAdmin,
  findAdminById,
  findAdminByEmail,
  listAdmins,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  createUser,
  listUsers,
  findUserById,
  findUserByEmail,
  updateUser,
  updateUserPassword
};
