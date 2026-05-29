import 'dotenv/config';
import PQueue from 'p-queue';
import { scrapeBuyRentKenya } from './scrape/sites/buyrentkenya.js';
import { scrapeProperty24 } from './scrape/sites/property24.js';
import { scrapeJiji } from './scrape/sites/jiji.js';

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
let prisma = null;
async function getPrisma() {
  if (DRY_RUN) return null;
  if (prisma) return prisma;
  const prismaPkg = await import('@prisma/client');
  const { PrismaClient } = prismaPkg;
  prisma = new PrismaClient();
  return prisma;
}

const queue = new PQueue({ concurrency: 3, interval: 1000, intervalCap: 3 });

async function upsertExternal(listing) {
  if (DRY_RUN) {
    return listing; // skip DB in dry-run
  }
  try {
    const client = await getPrisma();
    const result = await client.externalListing.upsert({
      where: { url: listing.url },
      update: {
        title: listing.title ?? undefined,
        price: listing.price ?? undefined,
        bedrooms: listing.bedrooms ?? undefined,
        bathrooms: listing.bathrooms ?? undefined,
        area: listing.area ?? undefined,
        address: listing.address ?? undefined,
        city: listing.city ?? undefined,
        latitude: listing.latitude ?? undefined,
        longitude: listing.longitude ?? undefined,
        images: listing.images ?? [],
        listingType: listing.listingType ?? undefined,
        propertyType: listing.propertyType ?? undefined,
        raw: listing.raw ?? {},
        source: listing.source,
        sourceId: listing.sourceId ?? null,
        normalized: false,
        imported: false
      },
      create: {
        source: listing.source,
        sourceId: listing.sourceId ?? null,
        url: listing.url,
        title: listing.title ?? null,
        price: listing.price ?? null,
        bedrooms: listing.bedrooms ?? null,
        bathrooms: listing.bathrooms ?? null,
        area: listing.area ?? null,
        address: listing.address ?? null,
        city: listing.city ?? null,
        latitude: listing.latitude ?? null,
        longitude: listing.longitude ?? null,
        images: listing.images ?? [],
        listingType: listing.listingType ?? null,
        propertyType: listing.propertyType ?? null,
        raw: listing.raw ?? {},
      }
    });
    return result;
  } catch (err) {
    console.error('Failed saving listing', listing.url, err.message);
    return null;
  }
}

async function run() {
  const since = process.env.SCRAPE_SINCE || null;
  const maxPages = Number(process.env.SCRAPE_PAGES || 2);

  const scrapers = [
    () => scrapeBuyRentKenya({ since, pages: maxPages }),
    () => scrapeProperty24({ since, pages: maxPages }),
    () => scrapeJiji({ since, pages: maxPages })
  ];

  const allListings = [];
  for (const s of scrapers) {
    try {
      const listings = await s();
      allListings.push(...listings);
      console.log(`Fetched ${listings.length} listings.`);
    } catch (e) {
      console.error('Scraper failed', e);
    }
  }

  console.log(`Saving ${allListings.length} listings to ExternalListing...`);
  await Promise.all(allListings.map(l => queue.add(() => upsertExternal(l))));
  console.log('Done.');
  if (DRY_RUN) {
    console.log('Dry-run mode. Sample output:');
    console.log(`Total listings found: ${allListings.length}`);
    allListings.slice(0, 5).forEach((listing, i) => {
      console.log(`\n${i + 1}. ${listing.source.toUpperCase()}:`);
      console.log(`   Title: ${listing.title}`);
      console.log(`   Price: ${listing.price}`);
      console.log(`   URL: ${listing.url}`);
      console.log(`   Bedrooms: ${listing.bedrooms}, Bathrooms: ${listing.bathrooms}`);
    });
  }
}

run()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });


