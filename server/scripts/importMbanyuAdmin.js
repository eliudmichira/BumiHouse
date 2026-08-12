import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { scrapeMbanyu } from './scrape/sites/mbanyu.js';

// Initialize Firebase Admin for Maploti project
const app = initializeApp({
  projectId: 'maploti',
});

const db = getFirestore(app);

const AREA_COORDS = {
  'westlands': { lat: -1.2676, lng: 36.8011 },
  'kilimani': { lat: -1.2915, lng: 36.7844 },
  'lavington': { lat: -1.2824, lng: 36.7726 },
  'karen': { lat: -1.3412, lng: 36.7012 },
  'kileleshwa': { lat: -1.2789, lng: 36.7746 },
  'parklands': { lat: -1.2579, lng: 36.8189 },
  'runda': { lat: -1.2156, lng: 36.8234 },
  'ruiru': { lat: -1.1456, lng: 36.9612 },
  'kiambu': { lat: -1.1714, lng: 36.8356 },
  'mombasa': { lat: -4.0435, lng: 39.6682 },
  'nairobi': { lat: -1.2921, lng: 36.8219 },
};

function resolveCoords(locationStr) {
  const loc = (locationStr || '').toLowerCase();
  for (const [key, coords] of Object.entries(AREA_COORDS)) {
    if (loc.includes(key)) {
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.01,
        lng: coords.lng + (Math.random() - 0.5) * 0.01,
      };
    }
  }
  return {
    lat: -1.2921 + (Math.random() - 0.5) * 0.05,
    lng: 36.8219 + (Math.random() - 0.5) * 0.05,
  };
}

function buildKeywords(title, area, county, propType, listType) {
  const set = new Set([
    county.toLowerCase(),
    area.toLowerCase(),
    propType.toLowerCase(),
    listType.toLowerCase(),
  ]);
  title.toLowerCase().split(/\s+/).forEach(w => {
    if (w.length > 2) set.add(w);
  });
  return Array.from(set);
}

async function main() {
  console.log('🚀 Scraping Mbanyu real estate listings...');

  const rawListings = await scrapeMbanyu({ pages: 1 });
  console.log(`📦 Scraped ${rawListings.length} raw listings.`);

  if (rawListings.length === 0) {
    console.log('⚠️ No listings to import.');
    process.exit(0);
  }

  const listingsRef = db.collection('listings');
  let inserted = 0;
  let skipped = 0;

  for (const item of rawListings) {
    try {
      const snap = await listingsRef.where('title', '==', item.title).get();
      if (!snap.empty) {
        skipped++;
        continue;
      }

      const coords = resolveCoords(item.area);
      const county = 'Nairobi';
      const area = item.area || 'Nairobi';
      const keywords = buildKeywords(item.title, area, county, item.propertyType, item.listingType);

      const docData = {
        title: item.title,
        description: `Verified listing from Mbanyu Real Estate. Premium ${item.bedrooms > 0 ? item.bedrooms + 'BR ' : ''}${item.propertyType} located in ${area}, ${county}.`,
        price: item.price,
        propertyType: item.propertyType,
        listingType: item.listingType,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        sizeSqm: 0,
        amenities: ['wifi', 'water_storage', 'cctv', 'parking', 'backup_generator'],
        images: item.images.length > 0
          ? item.images
          : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
        location: {
          county,
          area,
          address: item.address || area,
          searchKeywords: keywords,
          geoPoint: coords,
        },
        ownerId: 'main_agent',
        featured: Math.random() > 0.6,
        status: 'active',
        views: Math.floor(Math.random() * 90) + 12,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await listingsRef.add(docData);
      inserted++;
      console.log(`  ✅ Inserted [${item.listingType.toUpperCase()}] ${item.title}`);
    } catch (err) {
      console.error(`  ❌ Error inserting "${item.title}":`, err.message);
    }
  }

  console.log(`\n🎉 DONE! Successfully imported ${inserted} listings into Maploti Firestore (Skipped ${skipped} duplicates).`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
