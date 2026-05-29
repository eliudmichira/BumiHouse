import { fetchRenderedHtml } from './scrape/shared/render.js';
import { load } from 'cheerio';

async function testSite() {
  const url = 'https://www.property24.co.ke/for-sale?Page=1';
  console.log('Fetching:', url);
  
  try {
    const html = await fetchRenderedHtml(url, { waitSelector: 'a' });
    const $ = load(html);
    
    console.log('HTML length:', html.length);
    console.log('Title:', $('title').text());
    
    // Look for any elements that might contain property data
    const selectors = [
      '[class*="property"]',
      '[class*="listing"]', 
      '[class*="result"]',
      '[class*="tile"]',
      'article',
      '.card'
    ];
    
    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`\n${selector}: ${elements.length} elements`);
      
      if (elements.length > 0) {
        const first = elements.first();
        console.log('First element HTML (first 500 chars):');
        console.log(first.html()?.substring(0, 500));
        
        // Check for links
        const links = first.find('a');
        console.log(`Links found: ${links.length}`);
        if (links.length > 0) {
          console.log('First link href:', links.first().attr('href'));
        }
        
        // Check for text content
        const text = first.text().trim();
        console.log('Text content (first 200 chars):', text.substring(0, 200));
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSite();
