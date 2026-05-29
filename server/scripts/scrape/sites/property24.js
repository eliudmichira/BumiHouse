import { load } from 'cheerio';
import { fetchHtml } from '../shared/http.js';
import { fetchRenderedHtml } from '../shared/render.js';

const BASE = 'https://www.property24.co.ke';

function parseCard($, el) {
  const $card = $(el);
  const link = $card.find('a').attr('href') || '';
  const url = link.startsWith('http') ? link : `${BASE}${link}`;
  const title = $card.find('h2, h3, h4, .title, [class*="title"]').first().text().trim() || null;
  const priceText = $card.find('[class*="price"], .p24_price, .amount, [class*="amount"]').first().text().trim() || null;
  const meta = $card.text();
  const bedsText = meta.match(/(\d+)\s*bed/i)?.[1];
  const bathsText = meta.match(/(\d+)\s*bath/i)?.[1];
  const img = $card.find('img').attr('src') || $card.find('img').attr('data-src') || $card.find('img').attr('data-lazy') || null;
  return {
    source: 'property24',
    sourceId: null,
    url,
    title,
    price: priceText,
    bedrooms: bedsText ? parseInt(bedsText, 10) : null,
    bathrooms: bathsText ? parseInt(bathsText, 10) : null,
    images: img ? [img] : [],
    raw: { priceText, html: $card.html() }
  };
}

export async function scrapeProperty24({ pages = 1 } = {}) {
  const results = [];
  for (let p = 1; p <= pages; p++) {
    // Try different URL patterns
    const urls = [
      `${BASE}/for-sale?Page=${p}`,
      `${BASE}/property-for-sale?Page=${p}`,
      `${BASE}/search?type=sale&page=${p}`,
      `${BASE}/listings?type=sale&page=${p}`
    ];
    
    for (const url of urls) {
      try {
        let html;
        try {
          html = await fetchHtml(url);
        } catch (_) {
          html = await fetchRenderedHtml(url, { waitSelector: 'a', waitForNetwork: true });
        }
        const $ = load(html);
        
        // Try multiple selector patterns
        const selectors = [
          '[class*="result"]',
          '.p24_regularTile',
          '[class*="property"]',
          '[class*="listing"]',
          '[class*="tile"]',
          'article',
          '.property-item',
          '.listing-item'
        ];
        
        let cards = $();
        for (const selector of selectors) {
          cards = $(selector);
          if (cards.length > 0) {
            console.log(`Found ${cards.length} cards with selector: ${selector}`);
            break;
          }
        }
        
        cards.each((_, el) => {
          const card = parseCard($, el);
          console.log('Property24 parsed card:', { url: card.url, title: card.title, price: card.price });
          if (card.url && card.title) {
            results.push(card);
          } else {
            console.log('Property24 card rejected - missing URL or title');
          }
        });
        
        // If we found cards, stop trying other URLs
        if (cards.length > 0) break;
        
      } catch (e) {
        console.log(`Failed to scrape ${url}:`, e.message);
        continue;
      }
    }
    
    // Stop early if no results found
    if (results.length === 0) break;
  }
  return results;
}


