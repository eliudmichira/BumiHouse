import { load } from 'cheerio';
import { fetchHtml } from '../shared/http.js';
import { fetchRenderedHtml } from '../shared/render.js';

const BASE = 'https://jiji.co.ke';

function parseCard($, el) {
  const $card = $(el);
  const link = $card.find('a').attr('href') || '';
  const url = link.startsWith('http') ? link : `${BASE}${link}`;
  const title = $card.find('h3, h4, .title, [class*="title"]').first().text().trim() || null;
  const priceText = $card.find('[class*="price"], .price, .amount, [class*="amount"]').first().text().trim() || null;
  const meta = $card.text();
  const bedsText = meta.match(/(\d+)\s*bed/i)?.[1];
  const bathsText = meta.match(/(\d+)\s*bath/i)?.[1];
  // Get property images (filter out icons/logos)
  const images = [];
  $card.find('img').each((_, img) => {
    const $img = $(img);
    const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy');
    const alt = $img.attr('alt') || '';
    
    // Filter for property photos (not icons/logos)
    if (src && (
      src.includes('pictures-kenya.jijistatic.com') || 
      src.includes('jijistatic.com') ||
      (alt.toLowerCase().includes('photo') && !alt.toLowerCase().includes('icon'))
    )) {
      images.push(src);
    }
  });
  return {
    source: 'jiji',
    sourceId: null,
    url,
    title,
    price: priceText,
    bedrooms: bedsText ? parseInt(bedsText, 10) : null,
    bathrooms: bathsText ? parseInt(bathsText, 10) : null,
    images: images,
    raw: { priceText, html: $card.html() }
  };
}

export async function scrapeJiji({ pages = 1 } = {}) {
  const results = [];
  for (let p = 1; p <= pages; p++) {
    // Try different URL patterns for Jiji
    const urls = [
      `${BASE}/real-estate?page=${p}`,
      `${BASE}/real-estate/houses-for-sale?page=${p}`,
      `${BASE}/real-estate/apartments-for-sale?page=${p}`,
      `${BASE}/real-estate/land-for-sale?page=${p}`
    ];
    
    for (const url of urls) {
      try {
        let html;
        try {
          html = await fetchHtml(url);
        } catch (_) {
          html = await fetchRenderedHtml(url, { waitSelector: 'a' });
        }
        const $ = load(html);
        
        // Try multiple selector patterns for Jiji
        const selectors = [
          '[class*="ad-item"]',
          '[class*="listing"]',
          '[class*="item"]',
          '.ad-item',
          '.listing-item',
          'article',
          '[data-ad-id]'
        ];
        
        let cards = $();
        for (const selector of selectors) {
          cards = $(selector);
          if (cards.length > 0) {
            console.log(`Jiji: Found ${cards.length} cards with selector: ${selector}`);
            break;
          }
        }
        
        cards.each((_, el) => {
          const card = parseCard($, el);
          console.log('Jiji parsed card:', { url: card.url, title: card.title, price: card.price });
          if (card.url && card.title) {
            results.push(card);
          }
        });
        
        // If we found cards, stop trying other URLs
        if (cards.length > 0) break;
        
      } catch (e) {
        console.log(`Jiji failed to scrape ${url}:`, e.message);
        continue;
      }
    }
    
    // Stop early if no results found
    if (results.length === 0) break;
  }
  return results;
}
