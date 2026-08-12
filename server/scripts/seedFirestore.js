/**
 * Firestore Property Seeder
 * Writes 50 realistic Kenyan rental/sale properties directly to Firestore.
 * Uses Firebase client SDK — no service account needed.
 *
 * Run: node scripts/seedFirestore.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load client .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../client/.env.local');
try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
} catch {
  dotenv.config({ path: join(__dirname, '../.env') });
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log('🔑 Connecting to Firebase project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Realistic Kenyan property data ──────────────────────────────────────────

const nairobi_areas = [
  { area: 'Westlands', city: 'Nairobi', lat: -1.2676, lng: 36.8011 },
  { area: 'Kilimani', city: 'Nairobi', lat: -1.2915, lng: 36.7844 },
  { area: 'Lavington', city: 'Nairobi', lat: -1.2824, lng: 36.7726 },
  { area: 'Kileleshwa', city: 'Nairobi', lat: -1.2789, lng: 36.7746 },
  { area: 'Parklands', city: 'Nairobi', lat: -1.2579, lng: 36.8189 },
  { area: 'South B', city: 'Nairobi', lat: -1.3056, lng: 36.8267 },
  { area: 'South C', city: 'Nairobi', lat: -1.3123, lng: 36.8156 },
  { area: 'Ruaka', city: 'Nairobi', lat: -1.2083, lng: 36.7819 },
  { area: 'Kahawa West', city: 'Nairobi', lat: -1.1815, lng: 36.9189 },
  { area: 'Embakasi', city: 'Nairobi', lat: -1.3189, lng: 36.9012 },
  { area: 'Donholm', city: 'Nairobi', lat: -1.2975, lng: 36.8912 },
  { area: 'Karen', city: 'Nairobi', lat: -1.3412, lng: 36.7012 },
  { area: 'Runda', city: 'Nairobi', lat: -1.2156, lng: 36.8234 },
  { area: 'Langata', city: 'Nairobi', lat: -1.3589, lng: 36.7456 },
  { area: 'Ngong Road', city: 'Nairobi', lat: -1.3012, lng: 36.7612 },
  { area: 'Nyali', city: 'Mombasa', lat: -4.0234, lng: 39.7012 },
  { area: 'Bamburi', city: 'Mombasa', lat: -3.9756, lng: 39.7234 },
  { area: 'Diani', city: 'Kwale', lat: -4.3189, lng: 39.5712 },
  { area: 'Kisumu CBD', city: 'Kisumu', lat: -0.0917, lng: 34.7680 },
  { area: 'Milimani', city: 'Kisumu', lat: -0.1012, lng: 34.7812 },
  { area: 'Eldoret CBD', city: 'Eldoret', lat: 0.5167, lng: 35.2697 },
  { area: 'Nakuru CBD', city: 'Nakuru', lat: -0.3031, lng: 36.0800 },
  { area: 'Thika Road', city: 'Nairobi', lat: -1.2234, lng: 36.8912 },
  { area: 'Juja', city: 'Kiambu', lat: -1.0789, lng: 37.0156 },
  { area: 'Ruiru', city: 'Kiambu', lat: -1.1456, lng: 36.9612 },
];

const propertyTemplates = [
  // Bedsitters
  { type: 'bedsitter', titleTemplate: 'Modern Bedsitter', beds: 0, baths: 1, listing_type: 'rent', priceRange: [8000, 15000] },
  // 1-beds
  { type: 'apartment', titleTemplate: '1 Bedroom Apartment', beds: 1, baths: 1, listing_type: 'rent', priceRange: [15000, 35000] },
  // 2-beds
  { type: 'apartment', titleTemplate: '2 Bedroom Apartment', beds: 2, baths: 1, listing_type: 'rent', priceRange: [25000, 65000] },
  { type: 'apartment', titleTemplate: '2 Bedroom Furnished Apartment', beds: 2, baths: 2, listing_type: 'rent', priceRange: [35000, 80000], features: ['Furnished', 'WiFi'] },
  // 3-beds
  { type: 'apartment', titleTemplate: '3 Bedroom Apartment', beds: 3, baths: 2, listing_type: 'rent', priceRange: [45000, 120000] },
  { type: 'maisonette', titleTemplate: '3 Bedroom Maisonette', beds: 3, baths: 2, listing_type: 'rent', priceRange: [60000, 150000] },
  // Houses for rent
  { type: 'house', titleTemplate: '4 Bedroom House', beds: 4, baths: 3, listing_type: 'rent', priceRange: [80000, 250000] },
  // For sale
  { type: 'apartment', titleTemplate: '2 Bedroom Apartment for Sale', beds: 2, baths: 2, listing_type: 'sale', priceRange: [4500000, 12000000] },
  { type: 'apartment', titleTemplate: '3 Bedroom Apartment for Sale', beds: 3, baths: 2, listing_type: 'sale', priceRange: [8000000, 25000000] },
  { type: 'house', titleTemplate: '4 Bedroom House for Sale', beds: 4, baths: 3, listing_type: 'sale', priceRange: [15000000, 55000000] },
  { type: 'villa', titleTemplate: '5 Bedroom Villa', beds: 5, baths: 4, listing_type: 'sale', priceRange: [35000000, 120000000] },
];

const amenityPools = [
  ['Parking', 'Security', 'Water'],
  ['Parking', 'Security', 'Water', 'Fibre Internet'],
  ['Parking', 'Security', 'Water', 'Backup Generator'],
  ['Parking', 'Security', 'Water', 'Fibre Internet', 'Gym', 'Swimming Pool'],
  ['Parking', 'Security', 'Water', 'CCTV', 'Borehole'],
  ['Parking', 'Security', 'Water', 'Fibre Internet', 'Elevator'],
  ['Security', 'Water', 'Fibre Internet'],
];

const propertyImages = {
  apartment: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
  ],
  house: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  ],
  maisonette: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
  ],
  bedsitter: [
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
  ],
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(range) {
  const [min, max] = range;
  const step = min < 100000 ? 500 : 50000;
  return Math.round(randomInt(min, max) / step) * step;
}

function generateProperty(index) {
  const location = nairobi_areas[index % nairobi_areas.length];
  const template = propertyTemplates[index % propertyTemplates.length];
  const amenities = amenityPools[index % amenityPools.length];
  const images = propertyImages[template.type] || propertyImages.apartment;
  const price = randomPrice(template.priceRange);

  // Slightly randomise coordinates so pins don't all stack
  const latOffset = (Math.random() - 0.5) * 0.02;
  const lngOffset = (Math.random() - 0.5) * 0.02;

  return {
    title: `${template.titleTemplate} in ${location.area}`,
    price,
    description: `Spacious ${template.titleTemplate.toLowerCase()} located in ${location.area}, ${location.city}. Well maintained with modern finishes. Close to schools, shopping centres and public transport.`,
    bedrooms: template.beds,
    bathrooms: template.baths,
    listing_type: template.listing_type,
    property_type: template.type,
    location: {
      address: `${location.area}`,
      city: location.city,
      area: location.area,
      state: 'Kenya',
      coordinates: {
        lat: location.lat + latOffset,
        lng: location.lng + lngOffset,
      }
    },
    address: location.area,
    city: location.city,
    latitude: location.lat + latOffset,
    longitude: location.lng + lngOffset,
    county: location.city,
    amenities,
    features: [...amenities, ...(template.features || [])],
    images: images.slice(0, 2),
    status: 'available',
    is_featured: index < 6,
    views: randomInt(10, 200),
    days_on_market: randomInt(1, 90),
    agent: {
      name: ['James Kariuki', 'Grace Wanjiku', 'David Mwangi', 'Aisha Hassan', 'Peter Otieno'][index % 5],
      phone: `+254 7${randomInt(10, 99)} ${randomInt(100000, 999999)}`,
      email: 'agent@bumihouse.co.ke',
      avatar: '',
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      reviews: randomInt(2, 48),
    },
    isNearPublicTransport: amenities.includes('Fibre Internet') || index % 3 === 0,
    isWaterIncluded: amenities.includes('Water') || amenities.includes('Borehole'),
    isWifiIncluded: amenities.includes('Fibre Internet'),
    isGatedCommunity: amenities.includes('Security') || amenities.includes('CCTV'),
    isNewlyBuilt: index % 4 === 0,
    hasElevator: amenities.includes('Elevator'),
    hasParking: amenities.includes('Parking'),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🏠 BumiHouse Firestore Seeder\n');

  // Check existing count
  const existing = await getDocs(query(collection(db, 'properties'), limit(5)));
  console.log(`📊 Current properties in Firestore: ${existing.size}+ (showing up to 5)`);

  const TOTAL = 50;
  console.log(`\n📝 Adding ${TOTAL} properties...\n`);

  let added = 0;
  for (let i = 0; i < TOTAL; i++) {
    try {
      const property = generateProperty(i);
      await addDoc(collection(db, 'properties'), {
        ...property,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      added++;
      process.stdout.write(`\r   ✅ ${added}/${TOTAL} — ${property.title}`);
    } catch (err) {
      console.error(`\n   ❌ Failed: ${err.message}`);
    }
  }

  console.log(`\n\n🎉 Done! Added ${added} properties to Firestore collection 'properties'.`);
  console.log('🔄 Refresh your app at http://localhost:5173/properties to see them.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
