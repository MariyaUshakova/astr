#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Essential ephemeris files to download from GitHub
const files = [
  'seas_18.se1',   // Main ephemeris file (Sun, Moon, planets)
  'semo_18.se1',   // Moon ephemeris
  'sepl_18.se1',   // Pluto ephemeris
  'seas_18.se1m',  // Main ephemeris file (compressed)
  'semo_18.se1m',  // Moon ephemeris (compressed)
  'sepl_18.se1m'   // Pluto ephemeris (compressed)
];

const baseUrl = 'https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/';
const epheDir = './ephe';

// Create ephe directory if it doesn't exist
if (!fs.existsSync(epheDir)) {
  fs.mkdirSync(epheDir, { recursive: true });
  console.log(`Created directory: ${epheDir}`);
}

function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const url = baseUrl + filename;
    const filepath = path.join(epheDir, filename);
    
    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ ${filename} already exists, skipping...`);
      resolve();
      return;
    }
    
    console.log(`Downloading ${filename}...`);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded ${filename}`);
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete the file if there was an error
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadAllFiles() {
  console.log('Starting download of Swiss Ephemeris files from GitHub...\n');
  
  try {
    for (const file of files) {
      await downloadFile(file);
    }
    
    console.log('\n✓ All ephemeris files downloaded successfully!');
    console.log('\nYou can now use the Swiss Ephemeris library in your project.');
    console.log('Run the example with: npm run example');
    
  } catch (error) {
    console.error('\n✗ Error downloading files:', error.message);
    console.log('\nAlternative: You can manually download the files from:');
    console.log('https://github.com/aloistr/swisseph/tree/master/ephe');
    console.log('and place them in the "ephe" directory.');
    console.log('\nOr visit: https://www.astro.com/ftp/swisseph/ephe/');
  }
}

// Run the download
downloadAllFiles();
