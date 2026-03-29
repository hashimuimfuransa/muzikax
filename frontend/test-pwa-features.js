/**
 * PWA Features Verification Script
 * Run in browser console to verify all PWA features are working
 */

console.log('🎵 MuzikaX PWA - Feature Verification');
console.log('='.repeat(60));

// Test 1: Check if running as PWA
function testPWAMode() {
  console.log('\n✅ Test 1: PWA Status');
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = window.navigator.standalone === true;
  
  if (isStandalone || isIOSStandalone) {
    console.log('✓ Running as INSTALLED PWA');
    console.log('  Mode:', isStandalone ? 'standalone' : 'iOS standalone');
  } else {
    console.log('ℹ Running in BROWSER mode');
    console.log('  Install PWA for better experience');
  }
  
  return isStandalone || isIOSStandalone;
}

// Test 2: Check App Icon Sizes
async function testAppIcons() {
  console.log('\n✅ Test 2: App Icons Configuration');
  
  try {
    const response = await fetch('/manifest.json');
    const manifest = await response.json();
    
    const icons = manifest.icons || [];
    console.log(`  Total icons configured: ${icons.length}`);
    
    icons.forEach(icon => {
      console.log(`  ✓ ${icon.sizes} - Purpose: ${icon.purpose}`);
    });
    
    // Check for specific sizes
    const has192 = icons.some(i => i.sizes === '192x192');
    const has512 = icons.some(i => i.sizes === '512x512');
    const has1024 = icons.some(i => i.sizes === '1024x1024');
    
    console.log('\n  Icon Summary:');
    console.log(`    192x192: ${has192 ? '✓' : '✗'}`);
    console.log(`    512x512: ${has512 ? '✓' : '✗'}`);
    console.log(`   1024x1024: ${has1024 ? '✓' : '✗'}`);
    
    // Check if using app.png
    const usesAppPng = icons.every(i => i.src.includes('app.png'));
    console.log(`\n  All icons use app.png: ${usesAppPng ? '✓ YES' : '✗ NO'}`);
    
  } catch (error) {
    console.log('✗ Error loading manifest:', error.message);
  }
}

// Test 3: Check Service Worker
async function testServiceWorker() {
  console.log('\n✅ Test 3: Service Worker Status');
  
  if (!('serviceWorker' in navigator)) {
    console.log('✗ Service Workers not supported');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw-muzikax.js');
    
    if (registration) {
      console.log('✓ Service Worker registered');
      console.log('  Scope:', registration.scope);
      console.log('  State:', registration.active?.state || 'activating');
      
      // Check caches
      const cacheNames = await caches.keys();
      console.log('\n  Cache Storage:');
      cacheNames.forEach(async name => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        console.log(`    ${name}: ${keys.length} items`);
      });
      
    } else {
      console.log('ℹ Service Worker not yet registered');
      console.log('  Refresh page or wait...');
    }
  } catch (error) {
    console.log('✗ Service Worker error:', error.message);
  }
}

// Test 4: Check IndexedDB Offline Storage
async function testIndexedDB() {
  console.log('\n✅ Test 4: IndexedDB Offline Storage');
  
  return new Promise((resolve) => {
    const request = indexedDB.open('MuzikaXOfflineDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      console.log('✓ IndexedDB initialized');
      console.log('  Database:', db.name);
      console.log('  Version:', db.version);
      console.log('  Stores:', Array.from(db.objectStoreNames).join(', '));
      
      // Count tracks
      const transaction = db.transaction(['tracks'], 'readonly');
      const store = transaction.objectStore('tracks');
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        console.log(`  Downloaded tracks: ${countRequest.result}`);
        
        if (countRequest.result > 0) {
          console.log('  ✓ Ready for offline playback!');
        } else {
          console.log('  ℹ No tracks downloaded yet');
        }
        
        resolve(countRequest.result);
      };
      
      countRequest.onerror = () => {
        console.log('  ℹ No tracks store available');
        resolve(0);
      };
    };
    
    request.onerror = () => {
      console.log('✗ IndexedDB error:', request.error);
      resolve(0);
    };
    
    request.onupgradeneeded = () => {
      console.log('  ℹ First time use - creating database');
    };
  });
}

// Test 5: Check Install Prompt
function testInstallPrompt() {
  console.log('\n✅ Test 5: PWA Install Prompt');
  
  // Check localStorage
  const hasBeenPrompted = localStorage.getItem('pwaInstallPrompted');
  const lastPromptDate = localStorage.getItem('pwaInstallPromptDate');
  
  if (hasBeenPrompted && lastPromptDate) {
    const daysSince = (Date.now() - parseInt(lastPromptDate)) / (1000 * 60 * 60 * 24);
    console.log(`  Last prompted: ${daysSince.toFixed(1)} days ago`);
    
    if (daysSince < 7) {
      console.log('  ℹ Won\'t show prompt again for', (7 - daysSince).toFixed(1), 'days');
    }
  } else {
    console.log('  ℹ User hasn\'t been prompted yet');
  }
  
  // Check if installable
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('  ✓ Install prompt event available');
    console.log('  ℹ Will show after 30 seconds or user interaction');
  }, { once: true });
}

// Test 6: Check Network Status
function testNetworkStatus() {
  console.log('\n✅ Test 6: Network Status');
  console.log('  Online:', navigator.onLine ? '✓ Yes' : '✗ No');
  
  window.addEventListener('online', () => {
    console.log('  🟢 Connection RESTORED!');
  });
  
  window.addEventListener('offline', () => {
    console.log('  🔴 Going OFFLINE - offline mode active');
  });
}

// Test 7: Check Storage Quota
async function testStorageQuota() {
  console.log('\n✅ Test 7: Storage Quota');
  
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percent = ((usage / quota) * 100).toFixed(2);
      
      console.log('  Used:', (usage / 1024 / 1024).toFixed(2), 'MB');
      console.log('  Available:', (quota / 1024 / 1024).toFixed(2), 'MB');
      console.log(`  Usage: ${percent}%`);
      
      if (percent < 50) {
        console.log('  ✓ Plenty of space available');
      } else if (percent < 80) {
        console.log('  ⚠️  Moderate storage usage');
      } else {
        console.log('  ⚠️  WARNING: Storage almost full!');
      }
      
    } catch (error) {
      console.log('✗ Error checking storage:', error.message);
    }
  } else {
    console.log('✗ Storage API not supported');
  }
}

// Test 8: Check Splash Screen Eligibility
function testSplashScreen() {
  console.log('\n✅ Test 8: Splash Screen Status');
  
  const isNative = typeof window !== 'undefined' && 
                   window.capacitor?.isNative === true;
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  if (isNative) {
    console.log('  ✓ Running as NATIVE APP');
    console.log('  ℹ Capacitor splash screen will show');
  } else if (isPWA) {
    console.log('  ✓ Running as INSTALLED PWA');
    console.log('  ℹ Custom AppLauncher animation will show');
  } else {
    console.log('  ℹ Running in browser - no splash screen');
    console.log('  Tip: Install PWA to see animation');
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running PWA feature tests...\n');
  
  const isPWA = testPWAMode();
  await testAppIcons();
  await testServiceWorker();
  await testIndexedDB();
  testInstallPrompt();
  testNetworkStatus();
  await testStorageQuota();
  testSplashScreen();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ PWA verification complete!');
  console.log('='.repeat(60));
  
  console.log('\n📱 Next Steps:');
  if (!isPWA) {
    console.log('1. Wait 30 seconds for install prompt OR');
    console.log('2. Click browser menu → "Install MuzikaX" OR');
    console.log('3. Use "Add to Home Screen" on mobile');
  }
  console.log('\n💡 To test offline mode:');
  console.log('- DevTools → Network → Select "Offline"');
  console.log('- Try playing downloaded tracks');
  console.log('\n🎯 For best experience:');
  console.log('- Install the PWA');
  console.log('- Download your favorite tracks');
  console.log('- Launch from home screen for full app experience!');
}

// Execute tests
runAllTests();
