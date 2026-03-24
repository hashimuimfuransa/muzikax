/**
 * Simple SendGrid API Test
 * This script tests if your SendGrid API key is working correctly
 * 
 * Usage: node test-sendgrid-api.js
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}╔════════════════════════════════════════╗`);
console.log(`║   SendGrid API Connection Test      ║`);
console.log(`╚════════════════════════════════════════╝${colors.reset}\n`);

// Check environment variables
console.log(`${colors.yellow}[1] Checking Environment Variables...${colors.reset}`);
console.log(`API Key exists: ${process.env.SENDGRID_API_KEY ? '✓ Yes' : '✗ No'}`);
console.log(`From Email: ${process.env.SENDGRID_FROM_EMAIL || 'Not set'}`);
console.log(`From Name: ${process.env.SENDGRID_FROM_NAME || 'Not set'}`);

if (!process.env.SENDGRID_API_KEY) {
  console.log(`\n${colors.red}❌ ERROR: SENDGRID_API_KEY not found in .env file${colors.reset}`);
  console.log(`\nPlease add your SendGrid API key to backend/.env:`);
  console.log(`${colors.blue}SENDGRID_API_KEY=SG.your_actual_api_key_here${colors.reset}\n`);
  process.exit(1);
}

if (process.env.SENDGRID_API_KEY === 'SG.your_sendgrid_api_key_here') {
  console.log(`\n${colors.red}❌ ERROR: You need to replace the placeholder API key with your actual SendGrid API key${colors.reset}`);
  console.log(`\nGet your API key from: https://app.sendgrid.com/settings/api_keys`);
  process.exit(1);
}

// Initialize SendGrid
console.log(`\n${colors.yellow}[2] Initializing SendGrid...${colors.reset}`);
try {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log(`${colors.green}✓ SendGrid initialized successfully${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}✗ Failed to initialize SendGrid${colors.reset}`);
  console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Test sending an email
async function testSendEmail() {
  console.log(`\n${colors.yellow}[3] Testing Email Send...${colors.reset}`);
  
  const testEmail = process.env.TEST_EMAIL || process.env.SENDGRID_FROM_EMAIL;
  
  if (!testEmail) {
    console.log(`\n${colors.yellow}⚠️  No test email specified${colors.reset}`);
    console.log(`\nTo test with a specific email, either:`);
    console.log(`1. Add TEST_EMAIL=your@email.com to your .env file`);
    console.log(`2. Or run with: TEST_EMAIL=your@email.com node test-sendgrid-api.js`);
    console.log(`\n${colors.blue}Skipping send test...${colors.reset}\n`);
    return false;
  }
  
  console.log(`Sending test email to: ${colors.blue}${testEmail}${colors.reset}`);
  
  const msg = {
    to: testEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME
    },
    subject: '🎵 SendGrid Test - MuzikaX',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF4D67 0%, #FF6B6B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ SendGrid is Working!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>This is a test email from MuzikaX to verify that our SendGrid integration is working correctly.</p>
            
            <div class="success-box">
              <h2>🎉 Success!</h2>
              <p>If you're reading this, your SendGrid API key is configured correctly and emails are being sent successfully.</p>
            </div>
            
            <p><strong>What's working:</strong></p>
            <ul>
              <li>✓ SendGrid API connection</li>
              <li>✓ Email sending functionality</li>
              <li>✓ HTML email templates</li>
              <li>✓ Sender authentication</li>
            </ul>
            
            <p>You can now use the email notification system for:</p>
            <ul>
              <li>🎵 New track notifications to followers</li>
              <li>🎶 Playlist recommendations</li>
              <li>🔥 Weekly trending songs digest</li>
              <li>🌟 Recommended artists</li>
              <li>🔐 Two-factor authentication OTPs</li>
            </ul>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
            <p>This is an automated test email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      SendGrid Test - MuzikaX
      
      Success! This email confirms that your SendGrid API integration is working correctly.
      
      What's working:
      ✓ SendGrid API connection
      ✓ Email sending functionality
      ✓ Sender authentication
      
      You can now use all email notification features including:
      - New track notifications
      - Playlist recommendations
      - Weekly trending digests
      - Artist recommendations
      - Two-factor authentication OTPs
      
      © ${new Date().getFullYear()} MuzikaX. All rights reserved.
    `
  };
  
  try {
    const response = await sgMail.send(msg);
    console.log(`${colors.green}✓ Email sent successfully!${colors.reset}`);
    console.log(`${colors.green}✓ Message ID: ${response[0].headers['x-message-id']}${colors.reset}`);
    console.log(`${colors.green}✓ Status Code: ${response[0].statusCode}${colors.reset}`);
    
    console.log(`\n${colors.green}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║   🎉 SENDGRID IS WORKING PERFECTLY!   ║${colors.reset}`);
    console.log(`${colors.green}╚════════════════════════════════════════╝${colors.reset}\n`);
    
    console.log(`${colors.blue}Next steps:${colors.reset}`);
    console.log('1. Check your inbox for the test email');
    console.log('2. Look for it in spam folder if not in inbox');
    console.log('3. Your email notification system is ready to use!\n');
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to send email${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    
    if (error.response) {
      console.log(`\n${colors.yellow}SendGrid Error Response:${colors.reset}`);
      console.log(`Status Code: ${error.response.statusCode}`);
      console.log(`Body:`, JSON.stringify(error.response.body, null, 2));
      
      // Common error solutions
      if (error.response.statusCode === 401) {
        console.log(`\n${colors.red}❌ Invalid API Key${colors.reset}`);
        console.log(`Solution: Double-check your SENDGRID_API_KEY in .env file`);
      } else if (error.response.statusCode === 403) {
        console.log(`\n${colors.red}❌ Sender Not Verified${colors.reset}`);
        console.log(`Solution: Verify your sender email in SendGrid dashboard`);
        console.log(`Go to: Settings → Sender Authentication → Verify a Single Sender`);
      } else if (error.response.statusCode === 400) {
        console.log(`\n${colors.red}❌ Bad Request${colors.reset}`);
        console.log(`Solution: Check that FROM_EMAIL is a valid email address`);
      }
    }
    
    return false;
  }
}

// Run the test
testSendEmail()
  .then(success => {
    if (success) {
      console.log(`${colors.green}✅ All tests passed!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`\n${colors.yellow}⚠️  Test completed with issues${colors.reset}`);
      console.log(`${colors.yellow}Check the errors above and update your configuration${colors.reset}\n`);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
    process.exit(1);
  });
