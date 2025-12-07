// Simple entry point that directly requires the compiled server
try {
  // Try to load the compiled server.js first
  require('./dist/server.js');
} catch (error) {
  console.log('Compiled server not found, starting TypeScript server directly...');
  // If compiled version doesn't exist, run the TypeScript version directly
  require('ts-node/register');
  require('./src/server.ts');
}