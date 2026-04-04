/**
 * Quick Fix for JWT Token Error
 * 
 * Run this in your browser console (F12 > Console tab)
 * to clear invalid tokens and fix the authentication error.
 */

console.log('%c🔧 MuzikaX - JWT Token Fix', 'font-size: 20px; font-weight: bold; color: #FF4D67;');
console.log('');
console.log('Clearing invalid tokens from localStorage...');

// Clear authentication tokens
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');

console.log('✅ Tokens cleared successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Refresh the page (F5 or Ctrl+R)');
console.log('2. Login again with your credentials');
console.log('3. New tokens will be generated with the correct secret');
console.log('');
console.log('ℹ️ Why did this happen?');
console.log('   Your old tokens were created with a different JWT secret.');
console.log('   This is common when environment variables are updated.');
console.log('');
console.log('For more information, see JWT_FIX_SUMMARY.md');
