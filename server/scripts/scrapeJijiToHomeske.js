/**
 * Scrape Jiji.co.ke and push listings to the homeske Firestore project.
 * Uses firebase-admin (service account) — bypasses security rules.
 *
 * Usage:
 *   node scripts/scrapeJijiToHomeske.js                  # default: 1 page rent, 0 sale, dry-run=false
 *   DRY_RUN=1 node scripts/scrapeJijiToHomeske.js        # scrape + map but DO NOT write
 *   PAGES_RENT=10 PAGES_SALE=5 node scripts/scrapeJijiToHomeske.js
 */
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { scrapeJiji } from './scrape/sites/jiji.js';
import { geocode, initGeocodeCache, geocodeStats } from './scrape/shared/geocode.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Init Firebase Admin ──────────────────────────────────────────────────────
const saPath = join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});
const db = admin.firestore();
console.log(`🔑 Firestore project: ${serviceAccount.project_id}`);

// ─── Coord lookup (reused from existing scrapeToFirestore.js) ─────────────────
const AREA_COORDS = {
  'lavington': { lat: -1.2824, lng: 36.7726 },
  'kilimani': { lat: -1.2915, lng: 36.7844 },
  'westlands': { lat: -1.2676, lng: 36.8011 },
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
  'ngong': { lat: -1.3540, lng: 36.6552 },
  'ruaka': { lat: -1.2083, lng: 36.7819 },
  'ruiru': { lat: -1.1456, lng: 36.9612 },
  'thika road': { lat: -1.2234, lng: 36.8912 },
  'thika': { lat: -1.0388, lng: 37.0834 },
  'kahawa west': { lat: -1.1815, lng: 36.9189 },
  'kasarani': { lat: -1.2204, lng: 36.8964 },
  'roysambu': { lat: -1.2204, lng: 36.8867 },
  'kitengela': { lat: -1.4738, lng: 36.9572 },
  'ongata rongai': { lat: -1.3958, lng: 36.7456 },
  'kiserian': { lat: -1.4192, lng: 36.6884 },
  'syokimau': { lat: -1.3653, lng: 36.9381 },
  'juja': { lat: -1.1019, lng: 37.0144 },
  'valley arcade': { lat: -1.2924, lng: 36.7780 },
  'nyali': { lat: -4.0234, lng: 39.7012 },
  'mombasa': { lat: -4.0435, lng: 39.6682 },
  'kisumu': { lat: -0.0917, lng: 34.7680 },
  'nakuru': { lat: -0.3031, lng: 36.0800 },
  'eldoret': { lat: 0.5143, lng: 35.2698 },
  'kajiado': { lat: -1.8521, lng: 36.7820 },
  'kiambu': { lat: -1.1714, lng: 36.8356 },
  'nairobi': { lat: -1.2921, lng: 36.8219 },
};

function lookupCoords(s) {
  if (!s) return null;
  const k = s.toLowerCase().trim();
  if (AREA_COORDS[k]) return AREA_COORDS[k];
  for (const [key, coords] of Object.entries(AREA_COORDS)) {
    if (k.includes(key) || key.includes(k)) return coords;
  }
  return null;
}

const NAIROBI_COUNTIES = new Set(['nairobi', 'kiambu', 'kajiado', 'machakos']);

async function resolveCoords(listing) {
  const address = listing.address;
  const city = listing.city;
  const county = listing.county;

  // 1. Curated lookup on the most specific suburb — most accurate for Nairobi-area listings
  const tableHit = lookupCoords(address) || lookupCoords(city);
  if (tableHit) {
    return { lat: tableHit.lat + (Math.random() - 0.5) * 0.006, lng: tableHit.lng + (Math.random() - 0.5) * 0.006 };
  }

  // 2. Nominatim with address + Kenya
  if (address) {
    const g = await geocode(`${address}, Kenya`);
    if (g) return { lat: g.lat, lng: g.lng };
  }

  // 3. Nominatim with city + Kenya — but only if county is OUTSIDE the Nairobi metro area
  //    (otherwise "Kajiado, Kenya" jumps 100km from the real Nairobi suburb)
  if (city && !NAIROBI_COUNTIES.has((county || city).toLowerCase().trim())) {
    const g = await geocode(`${city}, Kenya`);
    if (g) return { lat: g.lat, lng: g.lng };
  }

  // 4. Default — Nairobi center with wider jitter
  return { lat: -1.2921 + (Math.random() - 0.5) * 0.05, lng: 36.8219 + (Math.random() - 0.5) * 0.05 };
}

// ─── Mapping: Jiji → homeske schema ───────────────────────────────────────────
const JIJI_BOT_USER_ID = 'jiji-import';
const JIJI_BOT_AVATAR = '';

function mapAmenities(listing) {
  const out = new Set();
  if (listing.furnishing && listing.furnishing.toLowerCase() === 'furnished') out.add('furnished');
  if (listing.condition && listing.condition.toLowerCase() === 'renovated') out.add('renovated');
  // Defaults — generic, safe
  out.add('reliable-water');
  out.add('secure-compound');
  return [...out];
}

function toHomeskeProperty(listing, coords) {
  const status = listing.listingType === 'rent' ? 'for-rent' : 'for-sale';
  const now = admin.firestore.FieldValue.serverTimestamp();

  return {
    title: listing.title,
    description: listing.description || listing.title,
    price: listing.price || 0,
    bedrooms: listing.bedrooms ?? 0,
    bathrooms: listing.bathrooms ?? 0,
    area: listing.area ?? 0,
    type: listing.propertyType,
    propertyType: listing.propertyType,
    status,
    listing_type: listing.listingType, // 'rent' | 'sale' — used by desktop listPage filter
    county: listing.county || listing.city || 'Nairobi',
    location: {
      address: listing.address || listing.city || 'Nairobi',
      area: listing.address || listing.city || 'Nairobi',
      city: listing.city || 'Nairobi',
      state: 'Kenya',
      coordinates: { lat: coords.lat, lng: coords.lng },
      zipCode: '',
    },
    latitude: coords.lat,
    longitude: coords.lng,
    images: listing.images || [],
    amenities: mapAmenities(listing),
    hasMultipleUnits: false,
    units: [],
    userId: JIJI_BOT_USER_ID,
    agent: {
      id: JIJI_BOT_USER_ID,
      name: listing.seller || 'Jiji Seller',
      email: '',
      phone: '',
      avatar: JIJI_BOT_AVATAR,
    },
    contact: {
      name: listing.seller || 'Jiji Seller',
      email: '',
      phone: '',
      whatsapp: '',
    },
    source: 'jiji',
    sourceUrl: listing.url.split('?')[0],   // strip query for stable dedupe
    rawAttributes: listing.attributes || {},
    views: 0,
    is_featured: false,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Dedupe ───────────────────────────────────────────────────────────────────
async function loadExistingSourceUrls() {
  console.log('🔎 Loading existing jiji sourceUrls for dedupe...');
  const snap = await db.collection('properties').where('source', '==', 'jiji').get();
  const set = new Set();
  snap.forEach(d => {
    const u = d.get('sourceUrl');
    if (u) set.add(u);
  });
  console.log(`   ${set.size} existing jiji listings on homeske`);
  return set;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const dryRun = process.env.DRY_RUN === '1';
  const pagesRent = parseInt(process.env.PAGES_RENT || '1', 10);
  const pagesSale = parseInt(process.env.PAGES_SALE || '0', 10);
  const pagesLand = parseInt(process.env.PAGES_LAND || '0', 10);
  const pagesCommercial = parseInt(process.env.PAGES_COMMERCIAL || '0', 10);

  console.log(`\n🕷️  Scraping Jiji  |  rent=${pagesRent} sale=${pagesSale} land=${pagesLand} commercial=${pagesCommercial}  |  dryRun=${dryRun}`);

  const listings = await scrapeJiji({
    pagesRent, pagesSale, pagesLand, pagesCommercial,
    withDetails: true,
    detailConcurrency: 4,
  });

  console.log(`\n📦 ${listings.length} unique listings scraped`);

  if (listings.length === 0) {
    console.log('Nothing to seed.');
    process.exit(0);
  }

  const existing = dryRun ? new Set() : await loadExistingSourceUrls();
  initGeocodeCache(join(__dirname, '..', 'geocode-cache.json'));

  let added = 0, skipped = 0, failed = 0;
  for (const listing of listings) {
    const stableUrl = listing.url.split('?')[0];
    if (existing.has(stableUrl)) { skipped++; continue; }
    try {
      const coords = await resolveCoords(listing);
      const doc = toHomeskeProperty(listing, coords);
      if (dryRun) {
        added++;
      } else {
        await db.collection('properties').add(doc);
        added++;
        existing.add(stableUrl);
      }
      process.stdout.write(`\r  ✅ ${added} added | ⏭️  ${skipped} skipped | ❌ ${failed} failed`);
    } catch (e) {
      failed++;
      console.error(`\n   ❌ ${listing.url}: ${e.message}`);
    }
  }

  console.log(`\n\n🎉 Done!`);
  console.log(`   ✅ Added:   ${added}${dryRun ? ' (DRY RUN — not written)' : ''}`);
  console.log(`   ⏭️  Skipped: ${skipped} (already in Firestore)`);
  console.log(`   ❌ Failed:  ${failed}`);
  const gs = geocodeStats();
  console.log(`   📍 Geocode: ${gs.hits} resolved, ${gs.misses} unresolved (${gs.cached} cached for next run)`);
  process.exit(0);
}

main().catch(e => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
