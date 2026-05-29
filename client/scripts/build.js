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

// Load environment variables
const envFile = fs.existsSync('.env.production') ? '.env.production' : 'env-dwellmate-updated';
if (fs.existsSync(envFile)) {
  console.log('📋 Loading environment variables from', envFile);
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envLines = envContent.split('\n');

  envLines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key] = value;
        console.log(`✅ Set ${key}=${value.substring(0, 20)}...`);
      }
    }
  });
} else {
  console.log('⚠️ Environment file not found, using defaults');
}

// Set production API URL and ensure all required env vars are set
if (environment === 'production') {
  process.env.VITE_API_URL = process.env.VITE_API_URL || 'https://your-production-api.com/api';

  // Ensure all required environment variables are present
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID',
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_GEMINI_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(key => !process.env[key]);
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please ensure all VITE_ variables are set in your environment');
    process.exit(1);
  }

  console.log('✅ All required environment variables are present');
}

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
