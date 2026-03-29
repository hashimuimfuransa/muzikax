/**
 * Test Offline Local Player Features
 * Run this in browser console to verify functionality
 */

console.log('🎵 Testing Offline Local Player Features...\n');

// Test 1: Check if offline page exists
console.log('✅ Test 1: Checking offline page...');
fetch('/offline')
  .then(res => {
    if (res.ok) {
      console.log('   ✅ /offline page exists');
    } else {
      console.log('   ❌ /offline page not found');
    }
  })
  .catch(err => console.log('   ❌ Error:', err));

// Test 2: Check service worker
console.log('✅ Test 2: Checking service worker...');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration()
    .then(reg => {
      if (reg) {
        console.log('   ✅ Service Worker registered');
        console.log('   Scope:', reg.scope);
      } else {
        console.log('   ⚠️ Service Worker not registered');
      }
    })
    .catch(err => console.log('   ❌ Error:', err));
} else {
  console.log('   ❌ Service Workers not supported');
}

// Test 3: Check online/offline status
console.log('✅ Test 3: Checking network status...');
console.log('   Online:', navigator.onLine ? '✅ Yes' : '❌ No');
console.log('   Use F12 → Network → "Offline" to test offline mode');

// Test 4: Check File System Access API
console.log('✅ Test 4: Checking modern file picker...');
if (window.showOpenFilePicker) {
  console.log('   ✅ Modern File System Access API supported');
  console.log('   💡 "Select Files" button will work perfectly');
} else {
  console.log('   ⚠️ Modern File Picker not supported');
  console.log('   💡 Will fall back to traditional file input');
}

// Test 5: Check drag & drop support
console.log('✅ Test 5: Checking drag & drop...');
const div = document.createElement('div');
if (typeof div.ondrop !== 'undefined') {
  console.log('   ✅ Drag & drop supported');
  console.log('   💡 You can drag audio files from file explorer');
} else {
  console.log('   ❌ Drag & drop not supported');
}

// Test 6: Check audio format support
console.log('✅ Test 6: Checking audio format support...');
const audio = document.createElement('audio');
const formats = {
  'MP3': 'audio/mpeg',
  'WAV': 'audio/wav',
  'OGG': 'audio/ogg',
  'M4A': 'audio/mp4'
};

Object.entries(formats).forEach(([name, mime]) => {
  const support = audio.canPlayType(mime);
  const icon = support ? '✅' : '⚠️';
  console.log(`   ${icon} ${name}: ${support || 'limited'}`);
});

// Test 7: Check IndexedDB (for offline storage)
console.log('✅ Test 7: Checking IndexedDB...');
if (window.indexedDB) {
  console.log('   ✅ IndexedDB supported - offline tracks can be stored');
} else {
  console.log('   ⚠️ IndexedDB not supported - limited offline storage');
}

// Test 8: Simulate offline redirect
console.log('\n✅ Test 8: Testing offline redirect logic...');
console.log('   To test manually:');
console.log('   1. Press F12 → Network tab');
console.log('   2. Check "Offline" box');
console.log('   3. Wait 2 seconds');
console.log('   4. Should redirect to /offline automatically');

// Test 9: Check current page
console.log('\n✅ Test 9: Current page info...');
console.log('   Path:', window.location.pathname);
console.log('   URL:', window.location.href);

if (window.location.pathname === '/offline') {
  console.log('   🎉 You are on the offline player page!');
  console.log('   💡 Try dragging audio files from your file explorer');
  console.log('   💡 Or click "Select Files" / "Add Files" button');
} else {
  console.log('   💡 Navigate to /offline to test local player');
}

// Quick instructions
console.log('\n📋 Quick Test Instructions:');
console.log('1. Go to /offline page');
console.log('2. Drag MP3/WAV/OGG files from your computer');
console.log('3. Drop anywhere on the page');
console.log('4. First file should auto-play!');
console.log('5. Or use the buttons to select files');

console.log('\n🎵 Test complete! Check results above.\n');
