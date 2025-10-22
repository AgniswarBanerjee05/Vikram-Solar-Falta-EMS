const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DEFAULT_DB_PATH = path.join(__dirname, '..', 'data', 'ems.sqlite');

const DB_PATH = process.env.FALTA_EMS_DB_PATH
  ? path.resolve(process.cwd(), process.env.FALTA_EMS_DB_PATH)
  : DEFAULT_DB_PATH;

let connection;

function ensureDatabaseDirectory() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function bootstrapSchema(db) {
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      plain_password TEXT,
      full_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      plain_password TEXT,
      full_name TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes'))
    );

    CREATE TRIGGER IF NOT EXISTS admins_set_updated_at
    AFTER UPDATE ON admins
    FOR EACH ROW
    BEGIN
      UPDATE admins SET updated_at = datetime('now', '+5 hours', '+30 minutes') WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS users_set_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = datetime('now', '+5 hours', '+30 minutes') WHERE id = NEW.id;
    END;
  `);
}

function getDb() {
  if (!connection) {
    ensureDatabaseDirectory();
    connection = new Database(DB_PATH);
    bootstrapSchema(connection);
  }
  return connection;
}

module.exports = {
  getDb,
  DB_PATH
};
