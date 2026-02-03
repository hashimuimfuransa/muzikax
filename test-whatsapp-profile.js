// Test script for WhatsApp profile update functionality
const axios = require('axios');

// Test data including WhatsApp contact
const testData = {
  validUpdateWithWhatsApp: {
    name: "Test User With WhatsApp",
    bio: "This is a test bio",
    whatsappContact: "+1234567890"
  },
  
  updateWhatsAppOnly: {
    whatsappContact: "+0987654321"
  },
  
  invalidWhatsApp: {
    whatsappContact: 12345 // Not a string
  }
};

console.log('WhatsApp Profile Update Test');
console.log('===========================');

console.log('\nTest Cases:');
console.log('1. Valid profile update with WhatsApp - Should succeed if token is valid');
console.log('2. Update WhatsApp only - Should succeed');
console.log('3. Invalid WhatsApp format (non-string) - Should return 400 Bad Request');

console.log('\nTo test the actual functionality:');
console.log('1. Start your backend server');
console.log('2. Log in to get a valid JWT token');
console.log('3. Make PUT requests to /api/profile/me with the test data including WhatsApp contact');
console.log('4. Verify the responses match the expected behavior');

console.log('\nExpected Results:');
console.log('- Valid updates with WhatsApp should return 200 OK with updated user data including WhatsApp contact');
console.log('- Invalid WhatsApp data should return 400 Bad Request with "WhatsApp contact must be a string" message');