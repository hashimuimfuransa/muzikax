/**
 * Test 2FA Login Flow for Artists
 * This script tests the complete 2FA authentication flow
 * 
 * Usage: node test-artist-2fa-login.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Test credentials - UPDATE THESE WITH YOUR ARTIST ACCOUNT DETAILS
const TEST_EMAIL = 'muzikaxltd@gmail.com'; // Your artist account email
const TEST_PASSWORD = 'your_password_here'; // Your artist account password

console.log('═══════════════════════════════════════════════════════');
console.log('       Testing Artist 2FA Login Flow                  ');
console.log('═══════════════════════════════════════════════════════\n');

async function testArtistLogin() {
  try {
    console.log('📝 Step 1: Attempting login as artist...');
    console.log(`   Email: ${TEST_EMAIL}`);
    
    // Step 1: Try to login
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response:`, JSON.stringify(loginResponse.data, null, 2));

    // Check if 2FA is required
    if (loginResponse.data.requires2FA) {
      console.log('\n✅ 2FA Required! OTP should be sent to email.');
      console.log('   Next step: Check your email for the OTP code.\n');

      // In a real scenario, user would check their email now
      console.log('⏳ Waiting for you to check your email...');
      console.log('   Please check your inbox at:', TEST_EMAIL);
      console.log('   Look for an email from MuzikaX with subject: "🔐 Your MuzikaX Verification Code"\n');

      // Uncomment and update to test the full flow
      /*
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const otp = await new Promise((resolve) => {
        readline.question('Enter the OTP code you received: ', (answer) => {
          readline.close();
          resolve(answer);
        });
      });

      console.log('\n📝 Step 2: Verifying OTP...');
      const verifyResponse = await axios.post(`${API_URL}/api/auth/2fa/verify`, {
        email: TEST_EMAIL,
        otp: otp,
        password: TEST_PASSWORD
      });

      console.log('   Verify Response:', JSON.stringify(verifyResponse.data, null, 2));

      if (verifyResponse.data.verified && verifyResponse.data.accessToken) {
        console.log('\n🎉 SUCCESS! 2FA login completed!');
        console.log('   Access Token:', verifyResponse.data.accessToken.substring(0, 50) + '...');
        console.log('   User:', verifyResponse.data.name);
      } else {
        console.log('\n❌ Verification failed!');
      }
      */

      return true;
    } else {
      console.log('\n❌ ERROR: 2FA was not required for this artist account!');
      console.log('   This means the fix is not working properly.');
      return false;
    }

  } catch (error) {
    console.error('\n❌ Error during login:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function testFanLogin() {
  console.log('\n───────────────────────────────────────────────────────');
  console.log('Testing Fan Login (should NOT require 2FA)...\n');
  
  try {
    // Use a fan account or different user type
    const fanEmail = 'test@example.com'; // Update with a fan account
    const fanPassword = 'password'; // Update with actual password
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: fanEmail,
      password: fanPassword
    });

    console.log('Fan Login Response:', JSON.stringify(response.data, null, 2));

    if (!response.data.requires2FA && response.data.accessToken) {
      console.log('\n✅ Correct! Fan accounts login directly without 2FA.');
    } else {
      console.log('\n⚠️  Unexpected response for fan account.');
    }
  } catch (error) {
    console.log('Note: Fan test skipped (no test account configured)');
  }
}

// Run the tests
(async () => {
  console.log('Starting 2FA login test...\n');
  
  const artistTestPassed = await testArtistLogin();
  await testFanLogin();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    TEST SUMMARY                        ');
  console.log('═══════════════════════════════════════════════════════');
  
  if (artistTestPassed) {
    console.log('✅ Artist 2FA test: PASSED');
    console.log('   - Login correctly requires OTP verification');
    console.log('   - OTP should have been sent to email');
  } else {
    console.log('❌ Artist 2FA test: FAILED');
    console.log('   - Artist login did not trigger 2FA requirement');
  }
  
  console.log('\nNext Steps:');
  console.log('1. Check your email for the OTP code');
  console.log('2. Manually test the /api/auth/2fa/verify endpoint with the OTP');
  console.log('3. Or uncomment the interactive part of this script\n');
})();
