#!/usr/bin/env node
/**
 * Database diagnostic script
 * Checks the current state of the database and lists all users and admins
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment
dotenv.config({
  path: process.env.FALTA_EMS_ENV
    ? path.resolve(process.env.FALTA_EMS_ENV)
    : path.resolve(__dirname, '../.env')
});

const { getDb } = require('../shared/database');
const { listUsers, findAdminByEmail } = require('../shared/repositories');

console.log('\n=== FALTA EMS Database Diagnostic ===\n');

try {
  const db = getDb();
  console.log('✓ Database connected successfully\n');

  // Check database file location
  const dbPath = process.env.FALTA_EMS_DB_PATH || path.resolve(__dirname, '../data/falta-ems.db');
  console.log(`Database location: ${dbPath}\n`);

  // List all admins
  console.log('--- ADMIN ACCOUNTS ---');
  const adminQuery = db.prepare('SELECT id, email, full_name, created_at FROM admins').all();
  if (adminQuery.length === 0) {
    console.log('No admin accounts found.');
    console.log('Create an admin using: npm run create-admin\n');
  } else {
    console.log(`Found ${adminQuery.length} admin account(s):\n`);
    adminQuery.forEach((admin, idx) => {
      console.log(`${idx + 1}. ${admin.email}`);
      console.log(`   Name: ${admin.full_name || 'N/A'}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Created: ${admin.created_at || 'N/A'}\n`);
    });
  }

  // List all users
  console.log('--- USER ACCOUNTS ---');
  const users = listUsers();
  if (users.length === 0) {
    console.log('No user accounts found.');
    console.log('Users can be created through the Admin UI\n');
  } else {
    console.log(`Found ${users.length} user account(s):\n`);
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email}`);
      console.log(`   Name: ${user.full_name || 'N/A'}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.created_at || 'N/A'}\n`);
    });
  }

  console.log('=== Diagnostic Complete ===\n');
} catch (error) {
  console.error('ERROR:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
