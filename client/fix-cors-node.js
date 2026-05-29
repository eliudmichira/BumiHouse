const https = require('https');
const fs = require('fs');
const path = require('path');

// CORS configuration
const corsConfig = [
  {
    "origin": [
      "https://dwellmate-285e8.web.app",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ],
    "maxAgeSeconds": 3600
  }
];

console.log('🔧 Firebase Storage CORS Fix Tool');
console.log('=====================================');

// Function to make HTTPS request
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Function to get access token (this is a simplified version)
async function getAccessToken() {
  console.log('❌ This script requires Google Cloud SDK to be installed.');
  console.log('Please install Google Cloud SDK first:');
  console.log('1. Download from: https://cloud.google.com/sdk/docs/install');
  console.log('2. Install and restart your terminal');
  console.log('3. Run: gcloud auth login');
  console.log('4. Run: gcloud config set project dwellmate-285e8');
  console.log('5. Run: gsutil cors set cors.json gs://dwellmate-285e8.firebasestorage.app');
  process.exit(1);
}

// Main function
async function main() {
  try {
    console.log('📋 CORS Configuration:');
    console.log(JSON.stringify(corsConfig, null, 2));
    console.log('');
    
    await getAccessToken();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
