// Simple test script to check if accessToken is stored in localStorage
console.log('Checking localStorage for accessToken...');

// Simulate browser localStorage (Node.js doesn't have localStorage by default)
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key];
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

// Set a test token
localStorage.setItem('accessToken', 'test-token-12345');

// Retrieve and log the token
const token = localStorage.getItem('accessToken');
console.log('Retrieved token:', token);

if (token) {
  console.log('Token found:', token.length, 'characters');
} else {
  console.log('No token found in localStorage');
}