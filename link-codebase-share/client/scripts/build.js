import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const environment = process.env.NODE_ENV || 'production';

console.log(`🚀 Building for ${environment} environment...`);

// Clean previous build
if (fs.existsSync('dist')) {
  console.log('🧹 Cleaning previous build...');
  fs.rmSync('dist', { recursive: true, force: true });
}

// Set environment variables
process.env.NODE_ENV = environment;
process.env.VITE_API_URL = process.env.VITE_API_URL || 'https://your-api-domain.com/api';

try {
  // Build the application
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Copy environment-specific files
  if (environment === 'production') {
    console.log('📋 Copying production files...');
    if (fs.existsSync('public/_redirects')) {
      fs.copyFileSync('public/_redirects', 'dist/_redirects');
    }
  }
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Build output: dist/');
  
  // Show build stats
  const stats = fs.statSync('dist');
  console.log(`📊 Build size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
