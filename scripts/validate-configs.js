/**
 * Configuration Validator
 * Validates all client config files in configs/ and root config.json
 * Checks required fields, template types, and asset paths.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIGS_DIR = path.join(ROOT_DIR, 'configs');

let errorCount = 0;
let passCount = 0;

function validateConfig(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);

    // 1. Template
    if (data.template && !['taxi', 'travel'].includes(data.template)) {
      console.error(`❌ [${relativePath}] Invalid template "${data.template}". Must be "taxi" or "travel".`);
      errorCount++;
      return;
    }

    // 2. Brand
    if (!data.brand || !data.brand.name) {
      console.error(`❌ [${relativePath}] Missing required "brand.name" property.`);
      errorCount++;
      return;
    }

    // 3. Contact
    if (!data.contact || !data.contact.primaryPhone || !data.contact.whatsappPhone) {
      console.error(`❌ [${relativePath}] Missing required contact fields ("primaryPhone", "whatsappPhone").`);
      errorCount++;
      return;
    }

    // 4. Logo Asset check (if local relative path)
    if (data.brand.logoUrl && !data.brand.logoUrl.startsWith('http') && !data.brand.logoUrl.startsWith('data:')) {
      const cleanPath = data.brand.logoUrl.replace(/^\.\//, '');
      const assetDiskPath = path.join(ROOT_DIR, cleanPath);
      if (!fs.existsSync(assetDiskPath)) {
        console.warn(`⚠️  [${relativePath}] Logo asset not found on disk: "${cleanPath}"`);
      }
    }

    console.log(`✅ [${relativePath}] Passed — "${data.brand.name}" (${data.template || 'taxi'})`);
    passCount++;
  } catch (err) {
    console.error(`❌ [${relativePath}] Syntax/Parse Error:`, err.message);
    errorCount++;
  }
}

console.log(`\n🔍 Validating Client Configurations...\n---------------------------------------------`);

// Validate root config.json
const rootConfig = path.join(ROOT_DIR, 'config.json');
if (fs.existsSync(rootConfig)) {
  validateConfig(rootConfig);
}

// Validate configs/*.json
if (fs.existsSync(CONFIGS_DIR)) {
  const files = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith('.json') && f !== 'schema.json');
  files.forEach(f => validateConfig(path.join(CONFIGS_DIR, f)));
}

console.log(`---------------------------------------------`);
if (errorCount === 0) {
  console.log(`🎉 All ${passCount} configurations are valid!\n`);
  process.exit(0);
} else {
  console.error(`💥 Found ${errorCount} error(s) across configurations.\n`);
  process.exit(1);
}
