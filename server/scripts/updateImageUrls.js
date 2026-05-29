import admin from 'firebase-admin';
import fs from 'fs';

// Path to the service account key for the destination project
const destCredPath = './creds/dest.json'; // dwellmate-285e8

console.log('🔧 Starting image URL update process...');

// Check if service account file exists
if (!fs.existsSync(destCredPath)) {
  console.error('❌ Service account file not found at:', destCredPath);
  console.log('💡 Please ensure you have the dwellmate-285e8 service account JSON file at:', destCredPath);
  process.exit(1);
}

// Load and initialize Firebase Admin SDK
let destServiceAccount;
try {
  destServiceAccount = JSON.parse(fs.readFileSync(destCredPath, 'utf8'));
  // Normalize private_key
  destServiceAccount.private_key = destServiceAccount.private_key.replace(/\\n/g, '\n');
} catch (error) {
  console.error('❌ Error reading service account file:', error.message);
  process.exit(1);
}

const destApp = admin.initializeApp({
  credential: admin.credential.cert(destServiceAccount),
}, 'destination');

const destDb = destApp.firestore();

async function updateImageUrls() {
  try {
    console.log('\n🔍 Fetching properties collection...');
    
    const propertiesRef = destDb.collection('properties');
    const snapshot = await propertiesRef.get();
    
    if (snapshot.empty) {
      console.log('📝 No properties found in the collection.');
      return;
    }
    
    console.log(`📋 Found ${snapshot.size} properties to update`);
    
    const batch = destDb.batch();
    let updateCount = 0;
    let processedCount = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const docRef = propertiesRef.doc(doc.id);
      let needsUpdate = false;
      const updates = {};
      
      // Update single image field
      if (data.image && typeof data.image === 'string' && data.image.includes('makao-648bd')) {
        updates.image = data.image.replace('makao-648bd.firebasestorage.app', 'dwellmate-285e8.firebasestorage.app');
        needsUpdate = true;
      }
      
      // Update images array
      if (data.images && Array.isArray(data.images)) {
        const updatedImages = data.images.map(img => {
          if (typeof img === 'string' && img.includes('makao-648bd')) {
            return img.replace('makao-648bd.firebasestorage.app', 'dwellmate-285e8.firebasestorage.app');
          }
          return img;
        });
        
        // Check if any images were updated
        const hasChanges = updatedImages.some((img, index) => img !== data.images[index]);
        if (hasChanges) {
          updates.images = updatedImages;
          needsUpdate = true;
        }
      }
      
      // Update photos field (if exists)
      if (data.photos && Array.isArray(data.photos)) {
        const updatedPhotos = data.photos.map(photo => {
          if (typeof photo === 'string' && photo.includes('makao-648bd')) {
            return photo.replace('makao-648bd.firebasestorage.app', 'dwellmate-285e8.firebasestorage.app');
          }
          return photo;
        });
        
        const hasChanges = updatedPhotos.some((photo, index) => photo !== data.photos[index]);
        if (hasChanges) {
          updates.photos = updatedPhotos;
          needsUpdate = true;
        }
      }
      
      // Update gallery field (if exists)
      if (data.gallery && Array.isArray(data.gallery)) {
        const updatedGallery = data.gallery.map(img => {
          if (typeof img === 'string' && img.includes('makao-648bd')) {
            return img.replace('makao-648bd.firebasestorage.app', 'dwellmate-285e8.firebasestorage.app');
          }
          return img;
        });
        
        const hasChanges = updatedGallery.some((img, index) => img !== data.gallery[index]);
        if (hasChanges) {
          updates.gallery = updatedGallery;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        batch.update(docRef, updates);
        updateCount++;
        console.log(`📝 Queued update for property: ${data.title || data.name || doc.id}`);
      }
      
      processedCount++;
      
      // Commit in batches of 500
      if (updateCount > 0 && updateCount % 500 === 0) {
        console.log(`💾 Committing batch of ${updateCount % 500 || 500} updates...`);
        await batch.commit();
        // Start a new batch
        batch = destDb.batch();
      }
    }
    
    // Commit any remaining updates
    if (updateCount % 500 !== 0) {
      console.log(`💾 Committing final batch of ${updateCount % 500} updates...`);
      await batch.commit();
    }
    
    console.log(`\n✅ Image URL update completed!`);
    console.log(`📊 Processed ${processedCount} properties`);
    console.log(`🔄 Updated ${updateCount} properties with new image URLs`);
    console.log(`🎯 Changed storage bucket: makao-648bd → dwellmate-285e8`);
    
  } catch (error) {
    console.error('❌ Error updating image URLs:', error);
    throw error;
  }
}

// Run the update
updateImageUrls()
  .then(() => {
    console.log('\n🎉 Image URL update process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Image URL update process failed:', error);
    process.exit(1);
  });
