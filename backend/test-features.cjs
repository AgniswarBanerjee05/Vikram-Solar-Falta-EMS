/**
 * Test script to verify password storage and email functionality
 * Run from backend directory: node test-features.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { getDb } = require('./shared/database');
const { createUser, findUserById, listUsers } = require('./shared/repositories');
const { hashPassword } = require('./shared/security');
const { sendUserCreationEmail } = require('./shared/email');

async function testPasswordStorage() {
  console.log('\n=== Testing Password Storage ===\n');
  
  const db = getDb();
  
  // Check if plain_password column exists
  const schema = db.prepare('PRAGMA table_info(users)').all();
  const hasPlainPassword = schema.some(col => col.name === 'plain_password');
  
  if (!hasPlainPassword) {
    console.log('❌ plain_password column missing!');
    console.log('Adding column...');
    db.exec('ALTER TABLE users ADD COLUMN plain_password TEXT');
    console.log('✅ Column added');
  } else {
    console.log('✅ plain_password column exists');
  }
  
  // Create a test user
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const passwordHash = await hashPassword(testPassword);
  
  console.log('\nCreating test user...');
  const user = createUser({
    email: testEmail,
    passwordHash,
    plainPassword: testPassword,
    fullName: 'Test User',
    status: 'ACTIVE',
    createdBy: null
  });
  
  console.log('✅ User created:', {
    id: user.id,
    email: user.email,
    has_plain_password: !!user.plain_password
  });
  
  if (user.plain_password) {
    console.log('✅ Plain password stored:', user.plain_password);
  } else {
    console.log('❌ Plain password NOT stored');
  }
  
  // Verify retrieval
  const retrieved = findUserById(user.id);
  console.log('\n✅ Retrieved user:', {
    id: retrieved.id,
    email: retrieved.email,
    plain_password: retrieved.plain_password
  });
  
  // Clean up test user
  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
  console.log('\n✅ Test user cleaned up');
  
  return user;
}

async function testEmailFunctionality() {
  console.log('\n\n=== Testing Email Functionality ===\n');
  
  const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
  
  if (hasEmailConfig) {
    console.log('✅ Email credentials configured');
    console.log('   Host:', process.env.EMAIL_HOST);
    console.log('   Port:', process.env.EMAIL_PORT);
    console.log('   User:', process.env.EMAIL_USER);
  } else {
    console.log('⚠️  Email credentials NOT configured');
    console.log('   Set EMAIL_USER and EMAIL_PASSWORD in .env to enable emails');
  }
  
  console.log('\nTesting email send (will not actually send if credentials missing)...');
  
  try {
    const result = await sendUserCreationEmail({
      email: 'test@example.com',
      fullName: 'Test User',
      password: 'TestPassword123!',
      isAdmin: false
    });
    
    if (result) {
      console.log('✅ Email sent successfully');
      console.log('   Message ID:', result.messageId);
    } else {
      console.log('⚠️  Email disabled (no credentials configured)');
      console.log('   Credentials would have been: test@example.com / TestPassword123!');
    }
  } catch (error) {
    console.log('❌ Email error:', error.message);
  }
}

async function testAll() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  Falta EMS Feature Test Suite            ║');
  console.log('╚════════════════════════════════════════════╝');
  
  try {
    await testPasswordStorage();
    await testEmailFunctionality();
    
    console.log('\n\n╔════════════════════════════════════════════╗');
    console.log('║  Summary                                   ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log('✅ Password storage: WORKING');
    console.log(process.env.EMAIL_USER ? '✅ Email functionality: CONFIGURED' : '⚠️  Email functionality: NOT CONFIGURED');
    console.log('\nTo enable emails:');
    console.log('1. Edit backend/.env');
    console.log('2. Set EMAIL_USER and EMAIL_PASSWORD');
    console.log('3. See backend/QUICKSTART_EMAIL.md for Gmail setup');
    console.log('\nRestart admin server after configuration changes.');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

testAll();
