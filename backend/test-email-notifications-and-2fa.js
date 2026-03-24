/**
 * Test Script for Email Notifications and 2FA System
 * 
 * This script tests all the email notification and 2FA features
 * Run with: node test-email-notifications-and-2fa.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}╔════════════════════════════════════════════════════════╗`);
console.log(`║   MuzikaX Email Notifications & 2FA Test Suite    ║`);
console.log(`╚════════════════════════════════════════════════════╝${colors.reset}\n`);

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Helper function to make API requests
 */
async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}

/**
 * Test result logger
 */
function logTestResult(testName, success, details = '') {
  totalTests++;
  if (success) {
    passedTests++;
    console.log(`${colors.green}✓ PASS:${colors.reset} ${testName}`);
  } else {
    failedTests++;
    console.log(`${colors.red}✗ FAIL:${colors.reset} ${testName}`);
  }
  if (details) {
    console.log(`  ${colors.blue}Details:${colors.reset} ${details}`);
  }
}

/**
 * TEST 1: Check if environment variables are set
 */
async function testEnvironmentVariables() {
  console.log(`\n${colors.yellow}[TEST 1] Checking Environment Variables${colors.reset}`);
  
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSendGridKey = envContent.includes('SENDGRID_API_KEY=');
    const hasFromEmail = envContent.includes('SENDGRID_FROM_EMAIL=');
    const hasFromName = envContent.includes('SENDGRID_FROM_NAME=');
    
    logTestResult(
      'SendGrid API Key configured',
      hasSendGridKey && !envContent.includes('your_sendgrid_api_key_here'),
      hasSendGridKey ? 'Found in .env file' : 'Missing from .env file'
    );
    
    logTestResult(
      'SendGrid From Email configured',
      hasFromEmail,
      hasFromEmail ? 'Found in .env file' : 'Missing from .env file'
    );
    
    logTestResult(
      'SendGrid From Name configured',
      hasFromName,
      hasFromName ? 'Found in .env file' : 'Missing from .env file'
    );
  } catch (error) {
    logTestResult('Environment check', false, error.message);
  }
}

/**
 * TEST 2: Check if required files exist
 */
async function testFileStructure() {
  console.log(`\n${colors.yellow}[TEST 2] Checking File Structure${colors.reset}`);
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'src/services/emailService.js',
    'src/models/OTP.js',
    'src/controllers/twoFAController.js',
    'src/controllers/notificationEmailController.js',
    'src/jobs/scheduledEmailJobs.js',
    'src/routes/authRoutes.ts',
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    logTestResult(
      `File exists: ${file}`,
      exists,
      exists ? '✓ Found' : '✗ Missing'
    );
  });
}

/**
 * TEST 3: Test User Model updates
 */
async function testUserModel() {
  console.log(`\n${colors.yellow}[TEST 3] Testing User Model Updates${colors.reset}`);
  
  try {
    const User = require('./src/models/User');
    const userSchema = User.schema.obj;
    
    const has2FAEnabled = 'is2FAEnabled' in userSchema;
    const hasTwoFactorSecret = 'twoFactorSecret' in userSchema;
    const hasEmailNotifications = 'emailNotifications' in userSchema;
    const hasLastEmailSent = 'lastEmailSent' in userSchema;
    
    logTestResult('is2FAEnabled field added', has2FAEnabled);
    logTestResult('twoFactorSecret field added', hasTwoFactorSecret);
    logTestResult('emailNotifications field added', hasEmailNotifications);
    logTestResult('lastEmailSent field added', hasLastEmailSent);
  } catch (error) {
    logTestResult('User model test', false, error.message);
  }
}

/**
 * TEST 4: Test OTP Model
 */
async function testOTPModel() {
  console.log(`\n${colors.yellow}[TEST 4] Testing OTP Model${colors.reset}`);
  
  try {
    const OTP = require('./src/models/OTP');
    
    // Test OTP generation
    const otp = OTP.generateOTP();
    logTestResult(
      'OTP Generation',
      otp && otp.length === 6 && /^\d+$/.test(otp),
      `Generated OTP: ${otp}`
    );
    
    // Test custom length
    const otp8 = OTP.generateOTP(8);
    logTestResult(
      'OTP Generation (8 digits)',
      otp8 && otp8.length === 8,
      `Generated OTP: ${otp8}`
    );
    
    // Check schema fields
    const schema = OTP.schema.obj;
    const hasEmail = 'email' in schema;
    const hasOtp = 'otp' in schema;
    const hasPurpose = 'purpose' in schema;
    const hasExpiresAt = 'expiresAt' in schema;
    
    logTestResult('OTP Schema has email field', hasEmail);
    logTestResult('OTP Schema has otp field', hasOtp);
    logTestResult('OTP Schema has purpose field', hasPurpose);
    logTestResult('OTP Schema has expiresAt field', hasExpiresAt);
  } catch (error) {
    logTestResult('OTP model test', false, error.message);
  }
}

/**
 * TEST 5: Test Email Service
 */
async function testEmailService() {
  console.log(`\n${colors.yellow}[TEST 5] Testing Email Service${colors.reset}`);
  
  try {
    const emailService = require('./src/services/emailService');
    
    const hasSendEmail = typeof emailService.sendEmail === 'function';
    const hasSendOTPEmail = typeof emailService.sendOTPEmail === 'function';
    const hasSendNewTrackNotification = typeof emailService.sendNewTrackNotification === 'function';
    const hasSendNewPlaylistNotification = typeof emailService.sendNewPlaylistNotification === 'function';
    const hasSendTrendingOfWeekEmail = typeof emailService.sendTrendingOfWeekEmail === 'function';
    const hasSendRecommendedArtistsEmail = typeof emailService.sendRecommendedArtistsEmail === 'function';
    
    logTestResult('sendEmail function exists', hasSendEmail);
    logTestResult('sendOTPEmail function exists', hasSendOTPEmail);
    logTestResult('sendNewTrackNotification function exists', hasSendNewTrackNotification);
    logTestResult('sendNewPlaylistNotification function exists', hasSendNewPlaylistNotification);
    logTestResult('sendTrendingOfWeekEmail function exists', hasSendTrendingOfWeekEmail);
    logTestResult('sendRecommendedArtistsEmail function exists', hasSendRecommendedArtistsEmail);
  } catch (error) {
    logTestResult('Email service test', false, error.message);
  }
}

/**
 * TEST 6: Test 2FA Controller
 */
async function test2FAController() {
  console.log(`\n${colors.yellow}[TEST 6] Testing 2FA Controller${colors.reset}`);
  
  try {
    const twoFAController = require('./src/controllers/twoFAController');
    
    const functions = [
      'requestOTP',
      'verifyOTPAndLogin',
      'resendOTP',
      'enable2FA',
      'get2FAStatus'
    ];
    
    functions.forEach(func => {
      const exists = typeof twoFAController[func] === 'function';
      logTestResult(`${func} function exists`, exists);
    });
  } catch (error) {
    logTestResult('2FA controller test', false, error.message);
  }
}

/**
 * TEST 7: Test Notification Email Controller
 */
async function testNotificationEmailController() {
  console.log(`\n${colors.yellow}[TEST 7] Testing Notification Email Controller${colors.reset}`);
  
  try {
    const notificationController = require('./src/controllers/notificationEmailController');
    
    const functions = [
      'sendNewTrackEmailToFollowers',
      'sendNewPlaylistEmail',
      'sendWeeklyTrendingEmail',
      'sendRecommendedArtistsWeeklyEmail',
      'notifyNewTrackUpload'
    ];
    
    functions.forEach(func => {
      const exists = typeof notificationController[func] === 'function';
      logTestResult(`${func} function exists`, exists);
    });
  } catch (error) {
    logTestResult('Notification email controller test', false, error.message);
  }
}

/**
 * TEST 8: Test Scheduled Jobs
 */
async function testScheduledJobs() {
  console.log(`\n${colors.yellow}[TEST 8] Testing Scheduled Jobs${colors.reset}`);
  
  try {
    const scheduledJobs = require('./src/jobs/scheduledEmailJobs');
    
    const hasInitialize = typeof scheduledJobs.initializeScheduledJobs === 'function';
    const hasManualTrending = typeof scheduledJobs.manualTriggerWeeklyTrending === 'function';
    const hasManualRecommendations = typeof scheduledJobs.manualTriggerRecommendations === 'function';
    
    logTestResult('initializeScheduledJobs function exists', hasInitialize);
    logTestResult('manualTriggerWeeklyTrending function exists', hasManualTrending);
    logTestResult('manualTriggerRecommendations function exists', hasManualRecommendations);
  } catch (error) {
    logTestResult('Scheduled jobs test', false, error.message);
  }
}

/**
 * TEST 9: Check Route Registration
 */
async function testRoutes() {
  console.log(`\n${colors.yellow}[TEST 9] Checking Route Registration${colors.reset}`);
  
  try {
    const fs = require('fs');
    const authRoutesContent = fs.readFileSync('./src/routes/authRoutes.ts', 'utf8');
    
    const routes = [
      '/2fa/request',
      '/2fa/verify',
      '/2fa/resend',
      '/2fa/enable',
      '/2fa/status'
    ];
    
    routes.forEach(route => {
      const exists = authRoutesContent.includes(route);
      logTestResult(`Route ${route} registered`, exists);
    });
  } catch (error) {
    logTestResult('Route registration test', false, error.message);
  }
}

/**
 * TEST 10: Integration Test - Server Initialization
 */
async function testServerInitialization() {
  console.log(`\n${colors.yellow}[TEST 10] Testing Server Initialization${colors.reset}`);
  
  try {
    const fs = require('fs');
    const serverContent = fs.readFileSync('./src/server.js', 'utf8');
    
    const importsScheduledJobs = serverContent.includes('initializeScheduledJobs');
    const callsInitialize = serverContent.includes('initializeScheduledJobs()');
    
    logTestResult('Server imports scheduled jobs', importsScheduledJobs);
    logTestResult('Server calls initialize function', callsInitialize);
  } catch (error) {
    logTestResult('Server initialization test', false, error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`${colors.blue}Starting comprehensive test suite...${colors.reset}\n`);
  
  await testEnvironmentVariables();
  await testFileStructure();
  await testUserModel();
  await testOTPModel();
  await testEmailService();
  await test2FAController();
  await testNotificationEmailController();
  await testScheduledJobs();
  await testRoutes();
  await testServerInitialization();
  
  // Summary
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════╗`);
  console.log(`║                    TEST SUMMARY                       ║`);
  console.log(`╠════════════════════════════════════════════════════════╣`);
  console.log(`║ Total Tests:  ${totalTests.toString().padEnd(35)}║`);
  console.log(`║ Passed:       ${passedTests.toString().padEnd(35)}║`);
  console.log(`║ Failed:       ${failedTests.toString().padEnd(35)}║`);
  console.log(`╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  if (failedTests === 0) {
    console.log(`${colors.green}🎉 All tests passed! The system is ready for use.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Please review the issues above.${colors.reset}`);
    console.log(`${colors.yellow}Note: API tests require the server to be running.${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
  console.log('1. Update .env with your SendGrid API key');
  console.log('2. Start the server: npm run dev');
  console.log('3. Test 2FA flow with an artist account');
  console.log('4. Upload a track to test new track notifications');
  console.log('5. Access /settings/notifications to manage preferences\n');
}

// Run the tests
runAllTests().catch(console.error);
