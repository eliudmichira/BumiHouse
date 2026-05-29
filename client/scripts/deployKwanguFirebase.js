// Deployment script for kwangu Firebase project
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

console.log('🚀 Starting Firebase deployment for kwangu project...');

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is installed');
    return true;
  } catch (error) {
    console.error('❌ Firebase CLI is not installed. Please install it first:');
    console.log('npm install -g firebase-tools');
    return false;
  }
}

// Check if user is logged in to Firebase
function checkFirebaseLogin() {
  try {
    const result = execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is logged in');
    return true;
  } catch (error) {
    console.error('❌ Firebase CLI is not logged in. Please login first:');
    console.log('firebase login');
    return false;
  }
}

// Set the Firebase project
function setFirebaseProject() {
  try {
    execSync('firebase use kwangu-2beb1', { stdio: 'pipe' });
    console.log('✅ Firebase project set to kwangu-2beb1');
    return true;
  } catch (error) {
    console.error('❌ Failed to set Firebase project. Make sure you have access to kwangu-2beb1');
    return false;
  }
}

// Deploy Firestore rules
function deployFirestoreRules() {
  try {
    console.log('📝 Deploying Firestore rules...');
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('✅ Firestore rules deployed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy Firestore rules:', error.message);
    return false;
  }
}

// Deploy Storage rules
function deployStorageRules() {
  try {
    console.log('📝 Deploying Storage rules...');
    execSync('firebase deploy --only storage', { stdio: 'inherit' });
    console.log('✅ Storage rules deployed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy Storage rules:', error.message);
    return false;
  }
}

// Deploy Firestore indexes
function deployFirestoreIndexes() {
  try {
    console.log('📝 Deploying Firestore indexes...');
    execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
    console.log('✅ Firestore indexes deployed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy Firestore indexes:', error.message);
    return false;
  }
}

// Seed the database
async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Import and run the seeding function
    const { seedKwanguFirebase } = await import('./seedKwanguFirebase.js');
    await seedKwanguFirebase();
    
    console.log('✅ Database seeded successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to seed database:', error.message);
    return false;
  }
}

// Main deployment function
async function deployKwanguFirebase() {
  console.log('🎯 Deploying kwangu Firebase project...\n');
  
  // Check prerequisites
  if (!checkFirebaseCLI()) {
    process.exit(1);
  }
  
  if (!checkFirebaseLogin()) {
    process.exit(1);
  }
  
  if (!setFirebaseProject()) {
    process.exit(1);
  }
  
  // Deploy configurations
  const results = {
    firestoreRules: deployFirestoreRules(),
    storageRules: deployStorageRules(),
    firestoreIndexes: deployFirestoreIndexes(),
    databaseSeed: await seedDatabase()
  };
  
  // Summary
  console.log('\n📊 Deployment Summary:');
  console.log(`Firestore Rules: ${results.firestoreRules ? '✅' : '❌'}`);
  console.log(`Storage Rules: ${results.storageRules ? '✅' : '❌'}`);
  console.log(`Firestore Indexes: ${results.firestoreIndexes ? '✅' : '❌'}`);
  console.log(`Database Seed: ${results.databaseSeed ? '✅' : '❌'}`);
  
  const allSuccessful = Object.values(results).every(result => result === true);
  
  if (allSuccessful) {
    console.log('\n🎉 Firebase deployment completed successfully!');
    console.log('\n🔗 Your Firebase project is now ready:');
    console.log('Project ID: kwangu-2beb1');
    console.log('Console: https://console.firebase.google.com/project/kwangu-2beb1');
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@kwangu.com / admin123');
    console.log('Agent: agent@kwangu.com / agent123');
    console.log('User: user@kwangu.com / user123');
  } else {
    console.log('\n⚠️ Some deployments failed. Please check the errors above.');
    process.exit(1);
  }
}

// Export the deployment function
export { deployKwanguFirebase };

// Run deployment if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deployKwanguFirebase();
}
