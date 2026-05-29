import { fetchHtml } from './scrape/shared/http.js';
import { fetchRenderedHtml } from './scrape/shared/render.js';
import { load } from 'cheerio';

async function debugSite(name, url, selectors) {
  console.log(`\n=== Debugging ${name} ===`);
  console.log(`URL: ${url}`);
  
  try {
    // Try static fetch first
    console.log('Trying static fetch...');
    const staticHtml = await fetchHtml(url);
    const $static = load(staticHtml);
    
    console.log('Static HTML length:', staticHtml.length);
    console.log('Title:', $static('title').text());
    
    // Test selectors on static HTML
    for (const [name, selector] of Object.entries(selectors)) {
      const elements = $static(selector);
      console.log(`${name} (${selector}): ${elements.length} elements`);
      if (elements.length > 0) {
        console.log('  First element HTML:', elements.first().html()?.substring(0, 200));
      }
    }
    
    // Try rendered fetch
    console.log('\nTrying rendered fetch...');
    const renderedHtml = await fetchRenderedHtml(url, { waitSelector: 'a' });
    const $rendered = load(renderedHtml);
    
    console.log('Rendered HTML length:', renderedHtml.length);
    
    // Test selectors on rendered HTML
    for (const [name, selector] of Object.entries(selectors)) {
      const elements = $rendered(selector);
      console.log(`${name} (${selector}): ${elements.length} elements`);
      if (elements.length > 0) {
        console.log('  First element HTML:', elements.first().html()?.substring(0, 200));
      }
    }
    
  } catch (error) {
    console.error(`Error debugging ${name}:`, error.message);
  }
}

async function main() {
  const sites = [
    {
      name: 'BuyRentKenya',
      url: 'https://www.buyrentkenya.com/property-for-sale?sort=latest&page=1',
      selectors: {
        'listing cards': '[class*="listing"], article, .result-list .result-item, .property-card, .listing-card',
        'property links': 'a[href*="/property/"], a[href*="/listing/"]',
        'titles': 'h1, h2, h3, .title, [class*="title"]',
        'prices': '[class*="price"], .price, .amount',
        'images': 'img[src*="property"], img[src*="listing"]'
      }
    },
    {
      name: 'Property24',
      url: 'https://www.property24.co.ke/for-sale?Page=1',
      selectors: {
        'listing cards': '[class*="result"], .p24_regularTile, article, .property-tile, .listing-tile',
        'property links': 'a[href*="/property/"], a[href*="/listing/"]',
        'titles': 'h1, h2, h3, .title, [class*="title"]',
        'prices': '[class*="price"], .p24_price, .amount',
        'images': 'img[src*="property"], img[src*="listing"]'
      }
    }
  ];
  
  for (const site of sites) {
    await debugSite(site.name, site.url, site.selectors);
  }
}

main().catch(console.error);
