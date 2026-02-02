/**
 * scripts/update-db.js
 * * This script mines the open-source Datenanfragen.de database to generate
 * a massive, verified list of GDPR targets for the GDPR Tool of alex (Erasure Bureau).
 * * Usage: node scripts/update-db.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REPO_URL = 'https://github.com/datenanfragen/data.git';
const TEMP_DIR = path.join(__dirname, '../_temp_gdpr_data');
const OUTPUT_FILE = path.join(__dirname, '../generated-services.json');

// Category Mapping (Datenanfragen -> Erasure Bureau)
const CATEGORY_MAP = {
  'address_dealer': 'Data Broker',
  'credit_agency': 'Finance',
  'commerce': 'Shopping',
  'finance': 'Finance',
  'insurance': 'Finance',
  'social_media': 'Social',
  'telecommunication': 'Utility',
  'utility': 'Utility',
  'mobility': 'Travel',
  'travel': 'Travel',
  'entertainment': 'Other',
  'tech': 'Utility',
  'education': 'Other',
  'public_body': 'Other'
};

const REGION_MAP = {
  'de': 'DE',
  'us': 'US',
  'gb': 'UK',
  'at': 'EU',
  'ch': 'EU',
  'fr': 'EU',
  'es': 'EU',
  'it': 'EU'
};

function main() {
  console.log('🚀 Starting Database Enrichment Protocol...');

  // 1. Clone/Pull the Repository
  if (fs.existsSync(TEMP_DIR)) {
    console.log('📦 Updating existing data repository...');
    try {
      execSync('git pull', { cwd: TEMP_DIR, stdio: 'inherit' });
    } catch (e) {
      console.log('⚠️ Git pull failed. Re-cloning...');
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      execSync(`git clone ${REPO_URL} ${TEMP_DIR}`, { stdio: 'inherit' });
    }
  } else {
    console.log('📦 Cloning Datenanfragen database (this may take a moment)...');
    execSync(`git clone ${REPO_URL} ${TEMP_DIR}`, { stdio: 'inherit' });
  }

  // 2. Walk through the companies directory
  const companiesDir = path.join(TEMP_DIR, 'companies');
  const services = [];
  const files = getAllFiles(companiesDir);

  console.log(`🔍 Scanning ${files.length} company records...`);

  files.forEach(file => {
    if (!file.endsWith('.json')) return;

    try {
      const content = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(content);

      // CRITICAL: We only want companies where we have a valid email
      if (!data.email) return;

      // Extract metadata
      const relativePath = path.relative(companiesDir, file);
      const pathParts = relativePath.split(path.sep);
      const countryCode = pathParts[0]; // e.g., 'de', 'us'

      // Determine our internal types
      const myRegion = REGION_MAP[countryCode] || 'Global';
      const myCategory = CATEGORY_MAP[data.categories?.[0]] || 'Other';

      // Build the service object
      const service = {
        id: `db-${pathParts.join('-').replace('.json', '')}`, // Unique ID
        name: data.name,
        category: myCategory,
        region: myRegion,
        email: data.email,
        confidence: 'High', // Verified by community
        selected: false,
        status: 'PENDING',
        notes: data.comments ? data.comments.join(' ') : undefined
      };

      // Filter: We specifically want Data Brokers and Ad Tech, or major Shopping/Social
      // Uncomment the line below if you want EVERYTHING (thousands of entries)
      // For now, let's grab everything to give you maximum power.
      services.push(service);

    } catch (e) {
      // Ignore parse errors
    }
  });

  // 3. Dedup and Sort
  const uniqueServices = Array.from(new Map(services.map(s => [s.name, s])).values());

  // Sort by Name
  uniqueServices.sort((a, b) => a.name.localeCompare(b.name));

  // 4. Write Output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueServices, null, 2));

  console.log(`✅ Success! Generated database with ${uniqueServices.length} verified targets.`);
  console.log(`file written to: ${OUTPUT_FILE}`);
}

// Helper: Recursive file search
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

main();