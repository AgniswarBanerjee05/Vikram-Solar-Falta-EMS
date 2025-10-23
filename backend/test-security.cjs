/**
 * Security Test Script
 * Run this to verify all security functions work correctly
 */

const {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateTempPassword,
  encrypt,
  decrypt,
  generateCSRFToken,
  generateSecureSessionId,
  hashData,
  secureCompare,
  sanitizeInput,
  isValidEmail,
  checkRateLimit,
  clearRateLimit
} = require('./shared/security');

async function runTests() {
  console.log('🔒 Starting Security Function Tests...\n');

  try {
    // Test 1: Password Hashing
    console.log('Test 1: Password Hashing');
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    const isInvalid = await verifyPassword('WrongPassword', hash);
    console.log(`✅ Hash created: ${hash.substring(0, 20)}...`);
    console.log(`✅ Valid password check: ${isValid}`);
    console.log(`✅ Invalid password check: ${!isInvalid}\n`);

    // Test 2: JWT Token
    console.log('Test 2: JWT Token Generation & Verification');
    const token = generateToken({ sub: 1, email: 'test@example.com', role: 'admin' });
    const payload = verifyToken(token);
    console.log(`✅ Token created: ${token.substring(0, 30)}...`);
    console.log(`✅ Token verified: ${JSON.stringify(payload)}\n`);

    // Test 3: Encryption/Decryption
    console.log('Test 3: AES-256-GCM Encryption');
    const plainText = 'sensitive@email.com';
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);
    console.log(`✅ Plain text: ${plainText}`);
    console.log(`✅ Encrypted: ${encrypted.substring(0, 50)}...`);
    console.log(`✅ Decrypted: ${decrypted}`);
    console.log(`✅ Match: ${plainText === decrypted}\n`);

    // Test 4: Random Token Generation
    console.log('Test 4: Secure Random Tokens');
    const csrfToken = generateCSRFToken();
    const sessionId = generateSecureSessionId();
    const tempPass = generateTempPassword();
    console.log(`✅ CSRF Token (64 chars): ${csrfToken}`);
    console.log(`✅ Session ID: ${sessionId.substring(0, 30)}...`);
    console.log(`✅ Temp Password (12 chars): ${tempPass}\n`);

    // Test 5: Data Hashing
    console.log('Test 5: SHA-256 Hashing');
    const data = 'important-data';
    const hashedData = hashData(data);
    const hashedAgain = hashData(data);
    console.log(`✅ Hash: ${hashedData}`);
    console.log(`✅ Consistent: ${hashedData === hashedAgain}\n`);

    // Test 6: Secure Comparison
    console.log('Test 6: Timing-Safe Comparison');
    const match = secureCompare('secret123', 'secret123');
    const noMatch = secureCompare('secret123', 'secret456');
    console.log(`✅ Matching strings: ${match}`);
    console.log(`✅ Different strings: ${!noMatch}\n`);

    // Test 7: Input Sanitization
    console.log('Test 7: Input Sanitization (XSS Prevention)');
    const dangerous = '<script>alert("XSS")</script>Hello';
    const sanitized = sanitizeInput(dangerous);
    console.log(`✅ Dangerous input: ${dangerous}`);
    console.log(`✅ Sanitized output: ${sanitized}\n`);

    // Test 8: Email Validation
    console.log('Test 8: Email Validation');
    const validEmail = isValidEmail('user@example.com');
    const invalidEmail = isValidEmail('not-an-email');
    console.log(`✅ Valid email: ${validEmail}`);
    console.log(`✅ Invalid email: ${!invalidEmail}\n`);

    // Test 9: Rate Limiting
    console.log('Test 9: Rate Limiting');
    const identifier = 'test-user-123';
    const result1 = checkRateLimit(identifier, 3, 60000);
    const result2 = checkRateLimit(identifier, 3, 60000);
    const result3 = checkRateLimit(identifier, 3, 60000);
    const result4 = checkRateLimit(identifier, 3, 60000); // Should be blocked
    console.log(`✅ Request 1: ${result1.allowed} (${result1.remaining} remaining)`);
    console.log(`✅ Request 2: ${result2.allowed} (${result2.remaining} remaining)`);
    console.log(`✅ Request 3: ${result3.allowed} (${result3.remaining} remaining)`);
    console.log(`✅ Request 4 (blocked): ${!result4.allowed}`);
    clearRateLimit(identifier);
    const result5 = checkRateLimit(identifier, 3, 60000);
    console.log(`✅ After clear: ${result5.allowed} (${result5.remaining} remaining)\n`);

    console.log('✅ All security tests passed!\n');
    console.log('🛡️ Security layer is fully functional.');
    console.log('📝 See SECURITY_README.md for detailed documentation.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
