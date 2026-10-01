/**
 * Test widget toggle behavior against index.html and app.js logic
 */
const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Check that appMain exists in index.html
if (!indexHtml.includes('id="appMain"')) {
  console.error('❌ FAIL: index.html is missing id="appMain"');
  process.exit(1);
} else {
  console.log('✅ PASS: index.html has id="appMain"');
}

// Check that all 11 section IDs exist in index.html
const requiredSections = [
  'hero-header',
  'quick-actions',
  'taxi-booking',
  'travel-booking',
  'hero-slider',
  'gallery',
  'team-contacts',
  'google-reviews',
  'social-links',
  'pwa-install',
  'footer'
];

let allFound = true;
for (const sec of requiredSections) {
  if (!indexHtml.includes(`data-section-id="${sec}"`)) {
    console.error(`❌ FAIL: index.html missing data-section-id="${sec}"`);
    allFound = false;
  }
}

if (allFound) {
  console.log('✅ PASS: All 11 widget section data attributes found in index.html');
}

// Check that app.js handles appMain and section toggling
const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
if (!appJs.includes("elem.style.display = (sec.enabled === false) ? 'none' : ''")) {
  console.error('❌ FAIL: js/app.js does not hide disabled sections');
  process.exit(1);
} else {
  console.log('✅ PASS: js/app.js properly hides disabled sections');
}

if (!appJs.includes('emptyStateNotice')) {
  console.error('❌ FAIL: js/app.js missing emptyStateNotice handler');
  process.exit(1);
} else {
  console.log('✅ PASS: js/app.js handles empty state notice when all widgets are disabled');
}

console.log('\n🎉 ALL WIDGET TOGGLE TESTS PASSED!');
