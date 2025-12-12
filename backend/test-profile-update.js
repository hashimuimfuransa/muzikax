const express = require('express');
const { updateOwnProfile } = require('./src/controllers/userController');

// Create a simple Express app for testing
const app = express();
const port = 3001;

// Middleware to parse JSON
app.use(express.json());

// Mock request and response objects for testing
const mockRequest = {
  user: {
    _id: 'test-user-id',
    role: 'creator'
  },
  body: {
    name: 'Test User',
    email: 'test@example.com'
  }
};

const mockResponse = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.data = data;
    console.log(`Response Status: ${this.statusCode}`);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    return this;
  }
};

// Test the updateOwnProfile function directly
async function testProfileUpdate() {
  console.log('Testing updateOwnProfile function directly...');
  
  try {
    await updateOwnProfile(mockRequest, mockResponse);
    console.log('Profile update test completed');
  } catch (error) {
    console.error('Error in profile update test:', error);
  }
}

// Start the test
testProfileUpdate();