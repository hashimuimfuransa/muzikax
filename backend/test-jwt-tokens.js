/**
 * JWT Token Test Script
 * 
 * This script helps diagnose JWT token issues by:
 * 1. Checking if JWT secrets are properly configured
 * 2. Generating test tokens
 * 3. Verifying tokens work correctly
 * 
 * Usage: node test-jwt-tokens.js
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('='.repeat(60));
console.log('JWT TOKEN DIAGNOSTIC TEST');
console.log('='.repeat(60));
console.log();

// Check environment variables
console.log('1. Environment Variable Check:');
console.log('   ----------------------------------------');
const accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const accessExpire = process.env.JWT_ACCESS_EXPIRE || '15m';
const refreshExpire = process.env.JWT_REFRESH_EXPIRE || '7d';

console.log(`   JWT_ACCESS_SECRET: ${accessSecret.substring(0, 10)}... (length: ${accessSecret.length})`);
console.log(`   JWT_REFRESH_SECRET: ${refreshSecret.substring(0, 10)}... (length: ${refreshSecret.length})`);
console.log(`   JWT_ACCESS_EXPIRE: ${accessExpire}`);
console.log(`   JWT_REFRESH_EXPIRE: ${refreshExpire}`);
console.log();

// Create a mock user for testing
const mockUser = {
    _id: 'test_user_12345',
    role: 'fan',
    creatorType: null
};

console.log('2. Token Generation Test:');
console.log('   ----------------------------------------');

try {
    // Generate access token
    const accessTokenPayload = {
        id: mockUser._id,
        role: mockUser.role,
        creatorType: mockUser.creatorType
    };
    
    const accessToken = jwt.sign(accessTokenPayload, accessSecret, {
        expiresIn: accessExpire
    });
    
    console.log(`   ✅ Access Token Generated: ${accessToken.substring(0, 50)}...`);
    console.log(`      Payload: ${JSON.stringify(accessTokenPayload)}`);
    console.log();

    // Generate refresh token
    const refreshTokenPayload = {
        id: mockUser._id
    };
    
    const refreshToken = jwt.sign(refreshTokenPayload, refreshSecret, {
        expiresIn: refreshExpire
    });
    
    console.log(`   ✅ Refresh Token Generated: ${refreshToken.substring(0, 50)}...`);
    console.log(`      Payload: ${JSON.stringify(refreshTokenPayload)}`);
    console.log();

    console.log('3. Token Verification Test:');
    console.log('   ----------------------------------------');

    // Verify access token
    try {
        const decodedAccess = jwt.verify(accessToken, accessSecret);
        console.log(`   ✅ Access Token Verified Successfully`);
        console.log(`      Decoded: ${JSON.stringify(decodedAccess)}`);
    } catch (error) {
        console.log(`   ❌ Access Token Verification Failed: ${error.message}`);
    }

    // Verify refresh token
    try {
        const decodedRefresh = jwt.verify(refreshToken, refreshSecret);
        console.log(`   ✅ Refresh Token Verified Successfully`);
        console.log(`      Decoded: ${JSON.stringify(decodedRefresh)}`);
    } catch (error) {
        console.log(`   ❌ Refresh Token Verification Failed: ${error.message}`);
    }

    console.log();
    console.log('4. Cross-Secret Test (Should Fail):');
    console.log('   ----------------------------------------');

    // Try to verify with wrong secret (this should fail)
    try {
        jwt.verify(accessToken, 'wrong_secret');
        console.log(`   ❌ UNEXPECTED: Access token verified with wrong secret!`);
    } catch (error) {
        console.log(`   ✅ EXPECTED: Access token failed verification with wrong secret`);
        console.log(`      Error: ${error.name} - ${error.message}`);
    }

    console.log();
    console.log('='.repeat(60));
    console.log('DIAGNOSTIC COMPLETE');
    console.log('='.repeat(60));
    console.log();
    console.log('SOLUTION FOR "INVALID SIGNATURE" ERROR:');
    console.log('----------------------------------------');
    console.log('If tokens are generating and verifying successfully above, but you\'re');
    console.log('still getting "invalid signature" errors in your application, it means:');
    console.log();
    console.log('1. Old tokens in the browser were generated with a DIFFERENT secret');
    console.log('2. The current .env file has been changed since those tokens were created');
    console.log();
    console.log('TO FIX:');
    console.log('-------');
    console.log('1. Open your browser\'s Developer Tools (F12)');
    console.log('2. Go to Application tab > Local Storage');
    console.log('3. Delete "accessToken" and "refreshToken" keys');
    console.log('4. OR run this command in Console:');
    console.log('   localStorage.clear()');
    console.log('5. Refresh the page and login again');
    console.log();
    console.log('This will generate NEW tokens with the CURRENT secret.');
    console.log();

} catch (error) {
    console.error('❌ FATAL ERROR during token generation:', error);
    console.error('Check that jsonwebtoken is installed: npm install jsonwebtoken');
}
