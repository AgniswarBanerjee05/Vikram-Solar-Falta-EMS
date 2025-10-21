/**
 * Admin setup script - checks for existing admin and creates one if none exists
 * Runs automatically before starting the admin server
 */

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

async function checkAndCreateAdmin() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Falta EMS - Admin Setup                  ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Initialize database
    const db = getDb();
    
    // Check if any admin exists
    const admins = db.prepare('SELECT * FROM admins').all();
    
    if (admins.length > 0) {
      console.log('✅ Admin account(s) found:', admins.length);
      console.log('   Existing admins:');
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.full_name || 'No name'})`);
      });
      console.log('\n✅ Proceeding to start server...\n');
      rl.close();
      return;
    }

    // No admin exists, prompt to create one
    console.log('⚠️  No admin account found!');
    console.log('   You need at least one admin account to manage the system.\n');
    
    const createNow = await question('Would you like to create an admin account now? (yes/no): ');
    
    if (createNow.toLowerCase() !== 'yes' && createNow.toLowerCase() !== 'y') {
      console.log('\n❌ Admin account creation skipped.');
      console.log('   You will need to create an admin account before using the system.');
      console.log('   Run this script again or use the API endpoint.\n');
      rl.close();
      process.exit(1);
    }

    console.log('\n📝 Creating admin account...\n');

    // Collect admin details
    const email = await question('Admin email: ');
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email address!');
      rl.close();
      process.exit(1);
    }

    const fullName = await question('Full name (optional): ');
    
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

    // Create admin
    const passwordHash = await hashPassword(password);
    const admin = createAdmin({
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim() || null
    });

    console.log('\n✅ Admin account created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.full_name || 'N/A');
    console.log('\n✅ You can now log in with these credentials.\n');
    console.log('✅ Starting server...\n');

    rl.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the check
checkAndCreateAdmin().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
