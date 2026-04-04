/**
 * Test script to verify offline page caching and navigation
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Test if offline.html exists in public directory
const offlineHtmlPath = path.join(__dirname, 'frontend', 'public', 'offline.html');
if (fs.existsSync(offlineHtmlPath)) {
  console.log('✅ offline.html exists in public directory');
} else {
  console.log('❌ offline.html does NOT exist in public directory');
}

// Test if sw-muzikax.js exists
const swPath = path.join(__dirname, 'frontend', 'public', 'sw-muzikax.js');
if (fs.existsSync(swPath)) {
  console.log('✅ sw-muzikax.js exists');
  
  // Check if it contains the offline page caching logic
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes('CACHE_OFFLINE_PAGE')) {
    console.log('✅ Service worker contains offline page caching logic');
  } else {
    console.log('❌ Service worker missing offline page caching logic');
  }
  
  if (swContent.includes('handleNavigationRequest')) {
    console.log('✅ Service worker contains navigation request handler');
  } else {
    console.log('❌ Service worker missing navigation request handler');
  }
} else {
  console.log('❌ sw-muzikax.js does NOT exist');
}

// Test if offline page route exists
const offlinePagePath = path.join(__dirname, 'frontend', 'src', 'app', 'offline', 'page.tsx');
if (fs.existsSync(offlinePagePath)) {
  console.log('✅ Offline page route exists');
  
  // Check if it has static export configuration
  const pageContent = fs.readFileSync(offlinePagePath, 'utf8');
  if (pageContent.includes("export const dynamic = 'force-static'")) {
    console.log('✅ Offline page configured for static export');
  } else {
    console.log('⚠️  Offline page may not be configured for static export');
  }
} else {
  console.log('❌ Offline page route does NOT exist');
}

console.log('\n📝 To test offline functionality:');
console.log('1. Start the dev server: npm run dev');
console.log('2. Open the app in browser');
console.log('3. Open DevTools > Application > Service Workers');
console.log('4. Verify sw-muzikax.js is registered');
console.log('5. Go offline (DevTools > Network > Offline)');
console.log('6. Try navigating to any page - should show offline page');
console.log('7. Check Cache Storage for cached offline page');
