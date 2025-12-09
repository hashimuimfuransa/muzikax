const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Compile TypeScript files
console.log('Compiling TypeScript files...');

try {
  // Compile all files
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('Compilation completed successfully');
} catch (error) {
  console.error('Compilation failed:', error.message);
  process.exit(1);
}

console.log('Build process completed');