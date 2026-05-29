/**
 * Quick Fix Script for Production Issues
 * Run: node scripts/fixProductionIssues.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing production issues...\n');

// 1. Fix env.example to remove actual API keys
const envExamplePath = path.join(__dirname, '../env.example');
if (fs.existsSync(envExamplePath)) {
  let content = fs.readFileSync(envExamplePath, 'utf8');
  
  // Replace actual API keys with placeholders
  content = content.replace(/AIzaSy[\w-]+/g, 'your_api_key_here');
  content = content.replace(/dwellmate-285e8/g, 'your_project_id');
  content = content.replace(/951413621891/g, 'your_messaging_sender_id');
  content = content.replace(/1:951413621891:web:[\w-]+/g, 'your_app_id');
  content = content.replace(/G-[\w]+/g, 'your_measurement_id');
  
  fs.writeFileSync(envExamplePath, content);
  console.log('✅ Fixed env.example - removed actual API keys');
}

// 2. Check for hardcoded API keys in code
const filesToCheck = [
  '../src/lib/firebase.js',
  '../src/services/aiInsights.js'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check for hardcoded fallback keys
    if (content.includes('PROD_FALLBACK_KEY') || content.includes('AIzaSy')) {
      console.log(`⚠️  Found potential hardcoded keys in ${file}`);
      console.log('   Please review and remove fallback API keys');
    }
  }
});

console.log('\n✅ Production fixes applied!');
console.log('\n📋 Next steps:');
console.log('1. Review and remove any hardcoded API keys');
console.log('2. Ensure all console.log statements are gated with import.meta.env.DEV');
console.log('3. Test production build: npm run build');
console.log('4. Review Firebase security rules');
console.log('5. Set up error tracking (Sentry, LogRocket, etc.)');
