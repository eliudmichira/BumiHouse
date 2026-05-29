import { fetchRenderedHtml } from './scrape/shared/render.js';
import { load } from 'cheerio';

async function findListings() {
  const url = 'https://www.property24.co.ke/for-sale?Page=1';
  console.log('Fetching:', url);
  
  try {
    const html = await fetchRenderedHtml(url, { waitSelector: 'a' });
    const $ = load(html);
    
    // Look for price patterns (KES, KSh, etc.)
    const pricePatterns = [
      /KSh\s*[\d,]+/gi,
      /KES\s*[\d,]+/gi,
      /K\s*[\d,]+/gi,
      /\$[\d,]+/gi,
      /[\d,]+\s*(million|m|thousand|k)/gi
    ];
    
    console.log('Looking for price patterns...');
    const allText = $('body').text();
    
    for (const pattern of pricePatterns) {
      const matches = allText.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`\nPrice pattern ${pattern}: ${matches.length} matches`);
        console.log('Sample matches:', matches.slice(0, 5));
      }
    }
    
    // Look for property-related keywords
    const propertyKeywords = ['bedroom', 'bathroom', 'bed', 'bath', 'house', 'apartment', 'villa', 'land'];
    console.log('\nLooking for property keywords...');
    
    for (const keyword of propertyKeywords) {
      const regex = new RegExp(keyword, 'gi');
      const matches = allText.match(regex);
      if (matches && matches.length > 0) {
        console.log(`${keyword}: ${matches.length} occurrences`);
      }
    }
    
    // Check if there are any divs that might contain listings by looking for divs with multiple links
    console.log('\nLooking for divs with multiple links (potential listing containers)...');
    $('div').each((i, el) => {
      const $div = $(el);
      const links = $div.find('a');
      if (links.length >= 2) {
        const text = $div.text().trim();
        if (text.length > 50 && text.length < 1000) { // Reasonable size for a listing
          console.log(`\nDiv with ${links.length} links:`);
          console.log('Text preview:', text.substring(0, 200));
          console.log('Links:', links.map((_, link) => $(link).attr('href')).get().slice(0, 3));
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findListings();
