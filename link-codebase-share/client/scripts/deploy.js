import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const environment = process.env.NODE_ENV || 'production';

console.log(`🚀 Starting Firebase deployment for ${environment}...`);

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Firebase CLI not found. Please install it first:');
  console.error('npm install -g firebase-tools');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('firebase projects:list', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Not logged in to Firebase. Please run:');
  console.error('firebase login');
  process.exit(1);
}

try {
  // Clean previous build
  if (fs.existsSync('dist')) {
    console.log('🧹 Cleaning previous build...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Set environment variables
  process.env.NODE_ENV = environment;
  
  // Build the application
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Copy Firebase configuration files to dist
  console.log('📋 Copying Firebase configuration...');
  if (fs.existsSync('../firebase.json')) {
    fs.copyFileSync('../firebase.json', 'dist/firebase.json');
  }

  // Deploy to Firebase
  console.log('🚀 Deploying to Firebase...');
  
  if (environment === 'production') {
    execSync('firebase deploy --only hosting', { stdio: 'inherit' });
  } else {
    execSync('firebase deploy --only hosting --project staging', { stdio: 'inherit' });
  }

  console.log('✅ Firebase deployment completed successfully!');
  
  // Show deployment info
  console.log('\n📊 Deployment Summary:');
  console.log(`Environment: ${environment}`);
  console.log('Build output: dist/');
  
  const stats = fs.statSync('dist');
  console.log(`Build size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\n🌐 Your app should be live at:');
  console.log('https://your-project-id.web.app');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 