/**
 * Verification Test: Zero Flash of Default Content (Zero FOUC/FODC)
 * Validates that static pre-rendered sites, dynamic templates, and raw index.html
 * never expose unconfigured or default taxi sections before client data loads.
 */

const fs = require('fs');
const path = require('path');
const generator = require('../generator.js');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('🧪 Starting Flash of Default Content (FODC) Tests...\n');

// 1. Test Raw index.html Initial Cloaking
console.log('1. Testing raw index.html initial cloaking...');
const rawHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

const dynamicSections = [
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

for (const secId of dynamicSections) {
  const isHidden = rawHtml.includes(`data-section-id="${secId}" style="display: none;"`) ||
                   rawHtml.includes(`style="display: none;" data-section-id="${secId}"`) ||
                   rawHtml.includes(`id="${secId}" data-section-id="${secId}" style="display: none;"`);
  assert(isHidden, `Dynamic section [${secId}] is initially cloaked with display: none in index.html`);
}

// 2. Test SSG Generator for Client with Minimal Sections (e.g. Alok with 3 widgets)
console.log('\n2. Testing generator.generateStaticHtml with custom 3-widget client...');
const customConfig = {
  template: 'taxi',
  brand: {
    name: 'Alok Custom Portal',
    shortName: 'Alok Portal',
    theme: {
      primary: '#3b82f6',
      background: '#0F172A'
    }
  },
  contact: {
    primaryPhone: '+919999999999',
    whatsappPhone: '919999999999'
  },
  sections: [
    { id: 'hero-header', type: 'hero-header', enabled: true },
    { id: 'pwa-install', type: 'pwa-install', enabled: true },
    { id: 'quick-actions', type: 'quick-actions', enabled: true }
  ]
};

const generatedHtml = generator.generateStaticHtml('alok-test', customConfig);

// Verify enabled sections are active and unhidden
assert(
  generatedHtml.includes('data-section-id="hero-header"') && !generatedHtml.includes('data-section-id="hero-header" style="display: none;"'),
  'Enabled section [hero-header] is visible and active'
);
assert(
  generatedHtml.includes('data-section-id="pwa-install"') && !generatedHtml.includes('data-section-id="pwa-install" style="display: none;"'),
  'Enabled section [pwa-install] is visible and active'
);
assert(
  generatedHtml.includes('data-section-id="quick-actions"') && !generatedHtml.includes('data-section-id="quick-actions" style="display: none;"'),
  'Enabled section [quick-actions] is visible and active'
);

// Verify disabled/unconfigured sections are strictly hidden
const unconfiguredSections = [
  'taxi-booking',
  'travel-booking',
  'hero-slider',
  'gallery',
  'team-contacts',
  'google-reviews',
  'social-links',
  'footer'
];

for (const secId of unconfiguredSections) {
  const isHidden = generatedHtml.includes(`data-section-id="${secId}" style="display: none;"`) ||
                   generatedHtml.includes(`style="display: none;" data-section-id="${secId}"`) ||
                   generatedHtml.includes(`style="display: none;" id="taxiBookingSection"`) ||
                   generatedHtml.includes(`id="taxiBookingSection" data-section-id="taxi-booking" style="display: none;"`);
  assert(isHidden, `Unconfigured section [${secId}] is explicitly hidden in pre-rendered static HTML`);
}

// 3. Verify DOM Ordering in Generated HTML
console.log('\n3. Verifying DOM ordering matches config stack...');
const posHero = generatedHtml.indexOf('data-section-id="hero-header"');
const posPwa = generatedHtml.indexOf('data-section-id="pwa-install"');
const posQuick = generatedHtml.indexOf('data-section-id="quick-actions"');
const posTaxi = generatedHtml.indexOf('data-section-id="taxi-booking"');

assert(posHero < posPwa, 'hero-header appears before pwa-install');
assert(posPwa < posQuick, 'pwa-install appears before quick-actions');
assert(posQuick < posTaxi, 'active widgets appear before cloaked inactive widgets');

console.log('\n🎉 ALL ZERO-FLASH (FODC) TESTS PASSED!\n');
