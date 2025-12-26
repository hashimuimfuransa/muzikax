// Vercel API entry point with serverless-http
const serverless = require('serverless-http');
const app = require('./src/app');

// Export wrapped app for Vercel serverless functions
module.exports = serverless(app);