/**
 * Quick admin creation script
 * Run with: node create-admin.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const readline = require('readline');
const { getDb } = require('../shared/database');
const { findAdminByEmail, createAdmin } = require('../shared/repositories');
const { hashPassword } = require('../shared/security');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdminAccount() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Create Admin Account                     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    getDb(); // Initialize database

    const email = await question('Admin email: ');
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email address!');
      rl.close();
      process.exit(1);
    }

    // Check if admin already exists
    const existing = findAdminByEmail(email);
    if (existing) {
      console.log(`\n⚠️  Admin with email ${email} already exists!`);
      const overwrite = await question('Do you want to continue anyway? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
        console.log('❌ Cancelled.');
        rl.close();
        process.exit(0);
      }
    }

    const fullName = await question('Full name: ');
    
    let password = await question('Password (min 8 characters): ');
    if (!password || password.length < 8) {
      console.log('❌ Password must be at least 8 characters!');
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match!');
      rl.close();
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);
    const admin = createAdmin({
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim() || null
    });

    console.log('\n✅ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.full_name || 'N/A');
    console.log('   ID:', admin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ You can now log in with these credentials!\n');

    rl.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdminAccount();
