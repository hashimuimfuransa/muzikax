/**
 * Test Script for Offline Mode and Native App Features
 * Run this in browser console to verify all features work correctly
 */

console.log('🎵 MuzikaX Offline Mode - Feature Verification');
console.log('='.repeat(50));

// Test 1: Check Service Worker Registration
async function testServiceWorker() {
  console.log('\n✅ Test 1: Service Worker Registration');
  
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-muzikax.js');
      if (registration) {
        console.log('✓ Service Worker is active:', registration.scope);
        console.log('  Status:', registration.active?.state || 'activating');
      } else {
        console.log('✗ Service Worker not registered yet');
      }
    } catch (error) {
      console.log('✗ Error checking service worker:', error.message);
    }
  } else {
    console.log('✗ Service Workers not supported in this browser');
  }
}

// Test 2: Check Cache Storage
async function testCacheStorage() {
  console.log('\n✅ Test 2: Cache Storage');
  
  try {
    const cacheNames = await caches.keys();
    console.log('Available caches:', cacheNames);
    
    cacheNames.forEach(async (name) => {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      console.log(`  ${name}: ${keys.length} items cached`);
    });
  } catch (error) {
    console.log('✗ Error checking cache storage:', error.message);
  }
}

// Test 3: Check IndexedDB
async function testIndexedDB() {
  console.log('\n✅ Test 3: IndexedDB Storage');
  
  return new Promise((resolve) => {
    const request = indexedDB.open('MuzikaXOfflineDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      console.log('✓ IndexedDB opened successfully');
      console.log('  Database name:', db.name);
      console.log('  Version:', db.version);
      console.log('  Object stores:', Array.from(db.objectStoreNames));
      
      // Count tracks
      const transaction = db.transaction(['tracks'], 'readonly');
      const store = transaction.objectStore('tracks');
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        console.log('  Downloaded tracks:', countRequest.result);
        resolve(countRequest.result);
      };
      
      countRequest.onerror = () => {
        console.log('  No tracks downloaded yet');
        resolve(0);
      };
    };
    
    request.onerror = () => {
      console.log('✗ IndexedDB not initialized or error:', request.error);
      resolve(0);
    };
    
    request.onupgradeneeded = () => {
      console.log('  IndexedDB needs upgrade - first time use');
    };
  });
}

// Test 4: Check Online/Offline Status
function testNetworkStatus() {
  console.log('\n✅ Test 4: Network Status');
  console.log('  Online:', navigator.onLine ? '✓ Yes' : '✗ No');
  console.log('  User Agent:', navigator.userAgent);
  
  window.addEventListener('online', () => {
    console.log('  🟢 Connection restored!');
  });
  
  window.addEventListener('offline', () => {
    console.log('  🔴 Going offline - offline mode activated');
  });
}

// Test 5: Check Capacitor Native Status
function testCapacitorStatus() {
  console.log('\n✅ Test 5: Capacitor Native App');
  
  const isNative = typeof window !== 'undefined' && 
                   window.capacitor?.isNative === true;
  
  if (isNative) {
    console.log('✓ Running as NATIVE APP');
    console.log('  Platform:', window.Capacitor?.getPlatform?.() || 'unknown');
  } else {
    console.log('ℹ Running as WEB APP / PWA');
    console.log('  To test native features: npx cap run android/ios');
  }
}

// Test 6: Check Storage Quota
async function testStorageQuota() {
  console.log('\n✅ Test 6: Storage Quota');
  
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percent = ((usage / quota) * 100).toFixed(2);
      
      console.log('  Used:', (usage / 1024 / 1024).toFixed(2), 'MB');
      console.log('  Available:', (quota / 1024 / 1024).toFixed(2), 'MB');
      console.log(`  Usage: ${percent}%`);
      
      if (percent > 80) {
        console.log('  ⚠️  Warning: Storage almost full!');
      }
    } catch (error) {
      console.log('✗ Error checking storage quota:', error.message);
    }
  } else {
    console.log('✗ Storage API not supported');
  }
}

// Test 7: Check Manifest
async function testManifest() {
  console.log('\n✅ Test 7: PWA Manifest');
  
  try {
    const response = await fetch('/manifest.json');
    const manifest = await response.json();
    
    console.log('✓ Manifest loaded successfully');
    console.log('  Name:', manifest.name);
    console.log('  Short Name:', manifest.short_name);
    console.log('  Icons:', manifest.icons?.length || 0, 'configured');
    console.log('  Start URL:', manifest.start_url);
    console.log('  Display:', manifest.display);
    
    // Check if app.png is used
    const usesAppPng = manifest.icons?.some(icon => icon.src.includes('app.png'));
    console.log('  App Icon:', usesAppPng ? '✓ Using app.png' : '✗ Not using app.png');
  } catch (error) {
    console.log('✗ Error loading manifest:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running all feature tests...\n');
  
  await testServiceWorker();
  await testCacheStorage();
  await testIndexedDB();
  testNetworkStatus();
  testCapacitorStatus();
  await testStorageQuota();
  await testManifest();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
  console.log('='.repeat(50));
  console.log('\n📱 Next Steps:');
  console.log('1. Download some tracks using the download button');
  console.log('2. Go offline (DevTools > Network > Offline)');
  console.log('3. Try playing downloaded tracks');
  console.log('4. For native app: npx cap sync android && npx cap open android');
  console.log('\n💡 Tip: Check Application tab in DevTools for more details');
}

// Execute tests
runAllTests();
