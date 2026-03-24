/**
 * Test script for Google Share link conversion
 * Run this in browser console or Node.js to test URL conversion
 */

// Import the conversion function (for Node.js)
// For browser testing, just copy the convertGoogleDriveLink function

function convertGoogleDriveLink(url) {
  // Google Share link format: https://share.google/FILE_ID
  const shareMatch = url.match(/share\.google\/([a-zA-Z0-9_-]+)/);
  if (shareMatch && shareMatch[1]) {
    const fileId = shareMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Google Drive view link format: https://drive.google.com/file/d/FILE_ID/view
  const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/);
  if (viewMatch && viewMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${viewMatch[1]}`;
  }

  // Google Drive open link format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch && openMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }

  // Google Photos share link: https://photos.app.goo.gl/FILE_ID
  const photosMatch = url.match(/photos\.app\.goo\.gl\/([a-zA-Z0-9_-]+)/);
  if (photosMatch && photosMatch[1]) {
    console.log('Google Photos link detected. Please use the direct file ID from Google Drive.');
    return url;
  }

  // Google Drive direct link already
  if (url.includes('drive.google.com') && url.includes('uc?export=view')) {
    return url;
  }

  // Fallback: return original URL
  return url;
}

// Test cases
const testCases = [
  {
    input: 'https://share.google/gBD7GRbO45N6xneGX',
    expected: 'https://drive.google.com/uc?export=view&id=gBD7GRbO45N6xneGX'
  },
  {
    input: 'https://share.google/abc123XYZ',
    expected: 'https://drive.google.com/uc?export=view&id=abc123XYZ'
  },
  {
    input: 'https://drive.google.com/file/d/1a2b3c4d5e6f/view',
    expected: 'https://drive.google.com/uc?export=view&id=1a2b3c4d5e6f'
  },
  {
    input: 'https://drive.google.com/open?id=xyz789',
    expected: 'https://drive.google.com/uc?export=view&id=xyz789'
  },
  {
    input: 'https://drive.google.com/uc?export=view&id=test123',
    expected: 'https://drive.google.com/uc?export=view&id=test123'
  }
];

// Run tests
console.log('🧪 Testing Google Share Link Conversion\n');
console.log('=' .repeat(60));

testCases.forEach((test, index) => {
  const result = convertGoogleDriveLink(test.input);
  const passed = result === test.expected;
  
  console.log(`\nTest ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Input:    ${test.input}`);
  console.log(`Expected: ${test.expected}`);
  console.log(`Got:      ${result}`);
  console.log('-'.repeat(60));
});

console.log('\n✨ All tests completed!\n');

// Example usage with your specific link
console.log('Your Example:');
console.log('Input:  https://share.google/gBD7GRbO45N6xneGX');
console.log('Output:', convertGoogleDriveLink('https://share.google/gBD7GRbO45N6xneGX'));
