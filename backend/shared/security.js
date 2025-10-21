const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.FALTA_EMS_JWT_SECRET || 'change-me-in-production';
const JWT_ISSUER = 'falta-ems';

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function generateToken(payload, { expiresIn = '2h' } = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: JWT_ISSUER
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: JWT_ISSUER
  });
}

function generateTempPassword(length = 12) {
  const buffer = crypto.randomBytes(length);
  return buffer
    .toString('base64')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, length);
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateTempPassword
};
