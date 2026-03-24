/**
 * SendGrid Authentication Test
 * This script tests your SendGrid configuration and helps diagnose issues
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}==================================${colors.reset}`);
console.log(`${colors.cyan}SendGrid Configuration Test${colors.reset}`);
console.log(`${colors.cyan}==================================\n${colors.reset}`);

// Step 1: Check environment variables
console.log(`${colors.blue}Step 1: Checking Environment Variables${colors.reset}`);
console.log(`API Key exists: ${process.env.SENDGRID_API_KEY ? '✓ Yes' : '✗ No'}`);
console.log(`From Email: ${process.env.SENDGRID_FROM_EMAIL || '⚠ Not set'}`);
console.log(`From Name: ${process.env.SENDGRID_FROM_NAME || '⚠ Not set'}\n`);

if (!process.env.SENDGRID_API_KEY) {
  console.log(`${colors.red}❌ ERROR: SENDGRID_API_KEY not found in .env file${colors.reset}`);
  console.log(`${colors.blue}Please add this to your backend/.env file:${colors.reset}`);
  console.log(`${colors.blue}SENDGRID_API_KEY=SG.your_actual_api_key_here${colors.reset}\n`);
  process.exit(1);
}

if (process.env.SENDGRID_API_KEY === 'SG.your_sendgrid_api_key_here') {
  console.log(`${colors.yellow}⚠️  WARNING: You're using the placeholder API key${colors.reset}`);
  console.log(`${colors.blue}Get your actual API key from:${colors.reset}`);
  console.log(`${colors.blue}https://app.sendgrid.com/settings/api_keys${colors.reset}\n`);
  process.exit(1);
}

if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  console.log(`${colors.red}❌ ERROR: API key does not start with "SG."${colors.reset}`);
  console.log(`${colors.yellow}Please check that you copied the correct API key${colors.reset}\n`);
  process.exit(1);
}

console.log(`${colors.green}✓ API key format looks correct\n${colors.reset}`);

// Step 2: Test API key initialization
console.log(`${colors.blue}Step 2: Initializing SendGrid API${colors.reset}`);
try {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log(`${colors.green}✓ SendGrid initialized successfully\n${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}❌ ERROR: Failed to initialize SendGrid${colors.reset}`);
  console.log(`${colors.red}${error.message}${colors.reset}\n`);
  process.exit(1);
}

// Step 3: Test sending an email
console.log(`${colors.blue}Step 3: Testing Email Sending${colors.reset}`);
const testEmail = process.argv[2] || process.env.SENDGRID_FROM_EMAIL;

if (!testEmail) {
  console.log(`${colors.yellow}⚠️  No test email specified${colors.reset}`);
  console.log(`${colors.blue}Usage: node test-sendgrid-auth.js [your-email@example.com]${colors.reset}\n`);
  process.exit(1);
}

console.log(`Sending test email to: ${testEmail}\n`);

const msg = {
  to: testEmail,
  from: {
    email: process.env.SENDGRID_FROM_EMAIL || 'noreply@muzikax.com',
    name: process.env.SENDGRID_FROM_NAME || 'MuzikaX'
  },
  subject: '🧪 SendGrid Test - MuzikaX',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px; }
        .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ SendGrid Test Successful!</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>This is a test email from MuzikaX to verify SendGrid integration.</p>
          
          <div class="success-box">
            <h3 style="margin: 0; color: #28a745;">✓ Authentication Working</h3>
            <p style="margin: 10px 0 0;">Your SendGrid API key is valid and working correctly!</p>
          </div>
          
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Recipient: ${testEmail}</li>
            <li>Purpose: SendGrid Configuration Test</li>
          </ul>
          
          <p>If you received this email, your SendGrid integration is working perfectly! 🎉</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
          <p>This is an automated test message.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    SendGrid Test - MuzikaX
    
    This is a test email from MuzikaX to verify SendGrid integration.
    
    ✓ Authentication Working
    Your SendGrid API key is valid and working correctly!
    
    Test Details:
    - Timestamp: ${new Date().toISOString()}
    - Recipient: ${testEmail}
    - Purpose: SendGrid Configuration Test
    
    If you received this email, your SendGrid integration is working perfectly!
    
    © ${new Date().getFullYear()} MuzikaX. All rights reserved.
  `
};

sgMail.send(msg)
  .then(() => {
    console.log(`${colors.green}✅ SUCCESS! Test email sent successfully${colors.reset}`);
    console.log(`${colors.green}Check your inbox at: ${testEmail}${colors.reset}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`1. Check your email inbox (and spam folder)`);
    console.log(`2. If received, your SendGrid integration is working!`);
    console.log(`3. Try requesting a 2FA code again\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.log(`${colors.red}❌ FAILED: Error sending test email${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}\n`);
    
    if (error.response) {
      console.log(`${colors.yellow}SendGrid Response:${colors.reset}`);
      console.log(`Status Code: ${error.response.statusCode}`);
      console.log(`Body: ${JSON.stringify(error.response.body, null, 2)}\n`);
      
      if (error.response.statusCode === 401 || error.response.statusCode === 403) {
        console.log(`${colors.red}🔑 Authentication Issue Detected:${colors.reset}`);
        console.log(`${colors.yellow}Possible causes:${colors.reset}`);
        console.log(`  1. API key is invalid or expired`);
        console.log(`  2. API key was revoked or regenerated`);
        console.log(`  3. Sender email is not verified in SendGrid`);
        console.log(`  4. API key lacks "Mail Send" permissions\n`);
        
        console.log(`${colors.blue}📋 Solution Steps:${colors.reset}`);
        console.log(`  1. Go to: https://app.sendgrid.com/settings/api_keys`);
        console.log(`  2. Create a NEW API key with "Full Access" or "Mail Send" permission`);
        console.log(`  3. Replace the API key in your backend/.env file`);
        console.log(`  4. Restart your server\n`);
        
        console.log(`${colors.blue}  OR verify sender email:${colors.reset}`);
        console.log(`  1. Go to: https://app.sendgrid.com/settings/sender_auth`);
        console.log(`  2. Verify your sender email address`);
        console.log(`  3. Use the verified email as SENDGRID_FROM_EMAIL\n`);
      } else if (error.response.statusCode === 400) {
        console.log(`${colors.yellow}📧 Validation Error:${colors.reset}`);
        console.log(`${colors.yellow}Possible causes:${colors.reset}`);
        console.log(`  1. Sender email (FROM_EMAIL) is not verified`);
        console.log(`  2. Invalid recipient email address`);
        console.log(`  3. Domain authentication issues\n`);
        
        console.log(`${colors.blue}Solution:${colors.reset}`);
        console.log(`  1. Verify sender email at: https://app.sendgrid.com/settings/sender_auth`);
        console.log(`  2. Or use SendGrid's default sender: noreply@sendgrid.muzikax.com\n`);
      }
    } else {
      console.log(`${colors.yellow}Network/System Error:${colors.reset}`);
      console.log(`Error Code: ${error.code || 'Unknown'}`);
      console.log(`Check your internet connection and firewall settings\n`);
    }
    
    process.exit(1);
  });
