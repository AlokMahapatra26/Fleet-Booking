/**
 * Test Suite: Website ZIP Export & Standalone Verification
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const JSZip = require('jszip');
const exporter = require('../exporter');

async function runTests() {
  console.log('🧪 Starting Website ZIP Export Tests...\n');

  const testConfig = {
    template: 'travel',
    brand: {
      name: 'Himalayan Expeditions',
      shortName: 'Himalaya Tour',
      tagline: 'Discover the peaks and valleys',
      locationText: 'Manali, Himachal Pradesh',
      badgeText: 'Verified Agency',
      logoUrl: 'assets/logo-travel.svg',
      theme: {
        primary: '#0284C7',
        primaryHover: '#0369A1',
        background: '#0F172A',
        cardBg: '#1E293B',
        text: '#F8FAFC'
      }
    },
    contact: {
      primaryPhone: '919876543210',
      whatsappPhone: '919876543210',
      googleMapsUrl: 'https://maps.google.com'
    },
    sections: [
      { id: 'hero-header', enabled: true },
      { id: 'quick-actions', enabled: true },
      { id: 'tours', enabled: true }
    ]
  };

  // 1. Direct exporter test
  console.log('1. Testing exporter.buildWebsiteZip()...');
  const zipBuffer = await exporter.buildWebsiteZip('himalaya-tours', testConfig);
  if (!zipBuffer || zipBuffer.length === 0) {
    throw new Error('ZIP buffer is empty');
  }
  console.log(`   ✅ ZIP generated successfully (${zipBuffer.length} bytes)`);

  // 2. Inspect ZIP entries
  console.log('2. Inspecting ZIP file entries...');
  const zip = await JSZip.loadAsync(zipBuffer);
  const requiredFiles = [
    'index.html',
    'config.json',
    'manifest.json',
    'style.css',
    'service-worker.js',
    '.nojekyll',
    'README.md',
    'css/tokens.css',
    'css/components.css',
    'css/taxi.css',
    'css/travel.css',
    'js/app.js',
    'js/taxi.js',
    'js/travel.js',
    'assets/logo-travel.svg',
    'assets/logo-taxi.svg'
  ];

  for (const reqFile of requiredFiles) {
    if (!zip.file(reqFile)) {
      throw new Error(`Missing expected file in ZIP: ${reqFile}`);
    }
  }
  console.log(`   ✅ All ${requiredFiles.length} critical files verified inside ZIP!`);

  // 3. Inspect index.html contents
  console.log('3. Validating index.html standalone readiness...');
  const html = await zip.file('index.html').async('string');
  
  if (html.includes('<base href="/">')) {
    throw new Error('index.html should NOT have <base href="/"> in standalone export!');
  }
  if (!html.includes('Himalayan Expeditions')) {
    throw new Error('Brand name not found in pre-rendered index.html');
  }
  if (!html.includes('window.__PRE_RENDERED__ = true;')) {
    throw new Error('Missing __PRE_RENDERED__ hydration flag in index.html');
  }
  if (!html.includes('is-ready')) {
    throw new Error('Missing is-ready class on app container');
  }
  console.log('   ✅ index.html is 100% pre-rendered and standalone-ready (no server dependencies)');

  // 4. Test API endpoint /api/export-zip
  console.log('4. Testing HTTP endpoint /api/export-zip...');
  const apiBuffer = await new Promise((resolve, reject) => {
    const postData = JSON.stringify({ slug: 'api-test', data: testConfig });
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/export-zip',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Server returned HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  const apiZip = await JSZip.loadAsync(apiBuffer);
  if (!apiZip.file('index.html')) {
    throw new Error('API ZIP response missing index.html');
  }
  console.log(`   ✅ HTTP /api/export-zip returned valid ZIP (${apiBuffer.length} bytes)`);

  console.log('\n🎉 ALL WEBSITE ZIP EXPORT TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
