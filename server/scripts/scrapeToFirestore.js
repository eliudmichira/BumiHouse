/**
 * Scrape BuyRentKenya and push listings directly to Firestore.
 * Bypasses MongoDB entirely — writes straight to the app's live database.
 *
 * Usage:
 *   node scripts/scrapeToFirestore.js              # 3 pages per category (~300 listings)
 *   SCRAPE_PAGES=1 node scripts/scrapeToFirestore.js  # quick test (~100 listings)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { scrapeBuyRentKenya } from './scrape/sites/buyrentkenya.js';

// ─── Load Firebase config from client .env.local ──────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../client/.env.local');
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch (_) {}

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

console.log('🔑 Firebase project:', process.env.VITE_FIREBASE_PROJECT_ID);

// ─── Coordinate lookup table for common Nairobi areas ─────────────────────────
const AREA_COORDS = {
  'lavington': { lat: -1.2824, lng: 36.7726 },
  'kilimani': { lat: -1.2915, lng: 36.7844 },
  'westlands': { lat: -1.2676, lng: 36.8011 },
  'westlands area': { lat: -1.2676, lng: 36.8011 },
  'parklands': { lat: -1.2579, lng: 36.8189 },
  'kileleshwa': { lat: -1.2789, lng: 36.7746 },
  'karen': { lat: -1.3412, lng: 36.7012 },
  'runda': { lat: -1.2156, lng: 36.8234 },
  'muthaiga': { lat: -1.2456, lng: 36.8312 },
  'spring valley': { lat: -1.2534, lng: 36.7812 },
  'gigiri': { lat: -1.2312, lng: 36.8034 },
  'rosslyn': { lat: -1.2234, lng: 36.8156 },
  'general mathenge': { lat: -1.2512, lng: 36.7934 },
  'langata': { lat: -1.3589, lng: 36.7456 },
  'south b': { lat: -1.3056, lng: 36.8267 },
  'south c': { lat: -1.3123, lng: 36.8156 },
  'embakasi': { lat: -1.3189, lng: 36.9012 },
  'donholm': { lat: -1.2975, lng: 36.8912 },
  'upperhill': { lat: -1.2956, lng: 36.8189 },
  'hurlingham': { lat: -1.2934, lng: 36.7956 },
  'adams arcade': { lat: -1.3012, lng: 36.7756 },
  'ngong road': { lat: -1.3012, lng: 36.7612 },
  'ruaka': { lat: -1.2083, lng: 36.7819 },
  'ruiru': { lat: -1.1456, lng: 36.9612 },
  'thika road': { lat: -1.2234, lng: 36.8912 },
  'kahawa west': { lat: -1.1815, lng: 36.9189 },
  'nyali': { lat: -4.0234, lng: 39.7012 },
  'mombasa': { lat: -4.0435, lng: 39.6682 },
  'nairobi': { lat: -1.2921, lng: 36.8219 },
};

function getCoords(listing) {
  const areaKey = (listing.address || listing.city || '').toLowerCase().trim();
  // Try exact match first
  if (AREA_COORDS[areaKey]) {
    const base = AREA_COORDS[areaKey];
    return {
      lat: base.lat + (Math.random() - 0.5) * 0.01,
      lng: base.lng + (Math.random() - 0.5) * 0.01,
    };
  }
  // Try partial match
  for (const [key, coords] of Object.entries(AREA_COORDS)) {
    if (areaKey.includes(key) || key.includes(areaKey)) {
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.01,
        lng: coords.lng + (Math.random() - 0.5) * 0.01,
      };
    }
  }
  // Default to Nairobi with random offset
  return { lat: -1.2921 + (Math.random() - 0.5) * 0.05, lng: 36.8219 + (Math.random() - 0.5) * 0.05 };
}

function toFirestoreProperty(listing) {
  const coords = getCoords(listing);
  return {
    title: listing.title,
    price: listing.price || 0,
    description: `${listing.title}. Located in ${listing.address || listing.city}, ${listing.city || 'Nairobi'}, Kenya.`,
    bedrooms: listing.bedrooms ?? 0,
    bathrooms: listing.bathrooms ?? 1,
    listing_type: listing.listingType || 'rent',
    property_type: listing.propertyType || 'apartment',
    address: listing.address || listing.city || 'Nairobi',
    city: listing.city || 'Nairobi',
    county: listing.city || 'Nairobi',
    latitude: coords.lat,
    longitude: coords.lng,
    location: {
      address: listing.address || listing.city || 'Nairobi',
      city: listing.city || 'Nairobi',
      area: listing.address || listing.city || 'Nairobi',
      state: 'Kenya',
      coordinates: coords,
    },
    images: listing.images || [],
    status: 'available',
    is_featured: false,
    views: Math.floor(Math.random() * 120) + 5,
    source: 'buyrentkenya',
    sourceUrl: listing.url,
    amenities: ['Parking', 'Security', 'Water'],
    agent: {
      name: 'BuyRentKenya Agent',
      phone: '+254 700 000 000',
      email: 'info@buyrentkenya.com',
      avatar: '',
      rating: 0,
      reviews: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function alreadyExists(url) {
  const snap = await getDocs(query(
    collection(db, 'properties'),
    where('sourceUrl', '==', url),
    limit(1)
  ));
  return !snap.empty;
}

async function main() {
  const pages = parseInt(process.env.SCRAPE_PAGES || '2', 10);
  console.log(`\n🕷️  Scraping BuyRentKenya (${pages} pages per category)...\n`);

  const listings = await scrapeBuyRentKenya({ pages });
  console.log(`\n📦 ${listings.length} listings scraped. Pushing to Firestore...\n`);

  let added = 0, skipped = 0, failed = 0;

  for (const listing of listings) {
    try {
      // Skip if already in Firestore
      if (await alreadyExists(listing.url)) {
        skipped++;
        continue;
      }

      const doc = toFirestoreProperty(listing);
      await addDoc(collection(db, 'properties'), doc);
      added++;
      process.stdout.write(`\r  ✅ ${added} added | ⏭️  ${skipped} skipped | ❌ ${failed} failed`);
    } catch (e) {
      failed++;
      // PERMISSION_DENIED — user needs to be signed in or rules need updating
      if (e.message?.includes('PERMISSION_DENIED')) {
        console.error('\n\n❌ PERMISSION_DENIED — Firestore rules block unauthenticated writes.');
        console.error('   Fix: Temporarily update firestore.rules to allow unauthenticated creates,');
        console.error('   deploy with: cd client && npx firebase deploy --only firestore:rules');
        console.error('   Then re-run this script.\n');
        process.exit(1);
      }
    }
  }

  console.log(`\n\n🎉 Done!`);
  console.log(`   ✅ Added: ${added}`);
  console.log(`   ⏭️  Skipped (duplicates): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('\n🔄 Refresh http://localhost:5173/properties to see the new listings.\n');
  process.exit(0);
}

main().catch(e => {
  console.error('❌ Fatal error:', e.message);
  process.exit(1);
});
