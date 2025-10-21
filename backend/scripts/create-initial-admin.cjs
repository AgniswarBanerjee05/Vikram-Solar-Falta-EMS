#!/usr/bin/env node
/* eslint-disable no-console */
const { getDb } = require('../shared/database');
const {
  findAdminByEmail,
  createAdmin,
  findUserByEmail,
  createUser
} = require('../shared/repositories');
const { hashPassword } = require('../shared/security');

const ADMIN_EMAIL = 'agniswar.banerjee@vikramsolar.com';
const ADMIN_PASSWORD = 'Ab@#$12345';
const ADMIN_NAME = 'Lead Admin';

async function main() {
  getDb();

  const existing = findAdminByEmail(ADMIN_EMAIL);
  let admin = existing;
  if (!admin) {
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    admin = createAdmin({
      email: ADMIN_EMAIL,
      passwordHash,
      fullName: ADMIN_NAME
    });

    console.log('Admin created successfully:');
    console.log({
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      created_at: admin.created_at
    });
  } else {
    console.log(`Admin already exists for ${ADMIN_EMAIL}`);
  }

  const existingUser = findUserByEmail(ADMIN_EMAIL);
  if (!existingUser) {
    const userPasswordHash = await hashPassword(ADMIN_PASSWORD);
    const user = createUser({
      email: ADMIN_EMAIL,
      passwordHash: userPasswordHash,
      fullName: ADMIN_NAME,
      status: 'ACTIVE',
      createdBy: admin.id
    });
    console.log('Linked user account created so the dashboard login works:');
    console.log({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      status: user.status
    });
  } else {
    console.log(`User already exists for ${ADMIN_EMAIL}`);
  }
}

main().catch((error) => {
  console.error('Failed to create initial admin', error);
  process.exitCode = 1;
});
