/**
 * Jiji smoke test — scrape 1 page of rent listings and dump JSON.
 * No Firestore writes, no auth needed.
 *
 *   node scripts/scrapeJijiSmoke.js
 *   PAGES_RENT=2 PAGES_SALE=1 node scripts/scrapeJijiSmoke.js
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { scrapeJiji } from './scrape/sites/jiji.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const pagesRent = parseInt(process.env.PAGES_RENT || '1', 10);
  const pagesSale = parseInt(process.env.PAGES_SALE || '0', 10);
  const pagesLand = parseInt(process.env.PAGES_LAND || '0', 10);
  const pagesCommercial = parseInt(process.env.PAGES_COMMERCIAL || '0', 10);

  console.log('🕷️  Jiji smoke test');
  console.log(`   pages: rent=${pagesRent} sale=${pagesSale} land=${pagesLand} commercial=${pagesCommercial}`);

  const listings = await scrapeJiji({ pagesRent, pagesSale, pagesLand, pagesCommercial });

  const outPath = join(__dirname, '..', 'jiji-scrape.json');
  writeFileSync(outPath, JSON.stringify(listings, null, 2));

  // Stats
  const withImages = listings.filter(l => l.images && l.images.length).length;
  const withPrice = listings.filter(l => l.price).length;
  const withAddress = listings.filter(l => l.address).length;
  const withBeds = listings.filter(l => l.bedrooms != null).length;

  console.log(`\n📊 Scraped ${listings.length} listings`);
  console.log(`   with images:  ${withImages}`);
  console.log(`   with price:   ${withPrice}`);
  console.log(`   with address: ${withAddress}`);
  console.log(`   with beds:    ${withBeds}`);
  console.log(`\n💾 Saved to ${outPath}`);

  if (listings.length > 0) {
    console.log('\n📝 First listing:');
    console.log(JSON.stringify(listings[0], null, 2));
  }
}

main().catch(e => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
