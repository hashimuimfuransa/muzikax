/**
 * Test 2FA Resend Endpoint
 * This script tests the /api/auth/2fa/resend endpoint
 */

require('dotenv').config();
const axios = require('axios');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log(`${colors.cyan}==================================${colors.reset}`);
console.log(`${colors.cyan}2FA Resend Endpoint Test${colors.reset}`);
console.log(`${colors.cyan}==================================\n${colors.reset}`);

// Test email - change this to an actual artist email in your database
const testEmail = process.argv[2] || 'testartist@example.com';

console.log(`${colors.blue}Testing with email:${colors.reset} ${testEmail}\n`);

async function testResendEndpoint() {
  try {
    console.log(`${colors.yellow}Step 1: Requesting initial OTP...${colors.reset}`);
    
    // First, request an initial OTP
    const initialResponse = await axios.post(`${BASE_URL}/api/auth/2fa/request`, {
      email: testEmail
    });

    console.log(`${colors.green}✓ Initial OTP request successful${colors.reset}`);
    console.log(`Response: ${JSON.stringify(initialResponse.data, null, 2)}\n`);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`${colors.yellow}Step 2: Testing resend endpoint...${colors.reset}`);
    
    // Now test the resend endpoint
    const resendResponse = await axios.post(`${BASE_URL}/api/auth/2fa/resend`, {
      email: testEmail
    });

    console.log(`${colors.green}✓ Resend successful${colors.reset}`);
    console.log(`Response: ${JSON.stringify(resendResponse.data, null, 2)}\n`);

    console.log(`${colors.green}✅ All tests passed!${colors.reset}`);
    console.log(`${colors.cyan}Check the email inbox for the verification code.${colors.reset}\n`);
    
  } catch (error) {
    console.log(`${colors.red}❌ Test failed${colors.reset}\n`);
    
    if (error.response) {
      console.log(`${colors.yellow}Error Response:${colors.reset}`);
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}\n`);
      
      // Handle specific error cases
      if (error.response.status === 404) {
        console.log(`${colors.yellow}⚠️  User not found${colors.reset}`);
        console.log(`${colors.blue}Make sure the email belongs to an artist account in your database${colors.reset}\n`);
      } else if (error.response.status === 403) {
        console.log(`${colors.yellow}⚠️  Forbidden - Not an artist account${colors.reset}`);
        console.log(`${colors.blue}The email must belong to a creator with creatorType='artist'${colors.reset}\n`);
      } else if (error.response.status === 500) {
        console.log(`${colors.red}🔴 Server Error - Check server logs for details${colors.reset}`);
        console.log(`${colors.blue}The error details should be logged in the backend console${colors.reset}\n`);
      }
    } else if (error.request) {
      console.log(`${colors.red}❌ No response from server${colors.reset}`);
      console.log(`${colors.yellow}Make sure your backend server is running on ${BASE_URL}${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
    }

    console.log(`${colors.cyan}Troubleshooting steps:${colors.reset}`);
    console.log(`1. Ensure backend server is running: npm run dev (in backend folder)`);
    console.log(`2. Verify the test email exists in your database`);
    console.log(`3. Check that the user has role='creator' and creatorType='artist'`);
    console.log(`4. Review backend logs for detailed error messages\n`);
    
    process.exit(1);
  }
}

// Run the test
testResendEndpoint();
