import { fetchRenderedHtml } from './scrape/shared/render.js';
import { load } from 'cheerio';

async function inspectHTML() {
  const url = 'https://www.property24.co.ke/for-sale?Page=1';
  console.log('Fetching:', url);
  
  try {
    const html = await fetchRenderedHtml(url, { waitSelector: 'a' });
    const $ = load(html);
    
    // Look for common property listing patterns
    const patterns = [
      'div[class*="property"]',
      'div[class*="listing"]',
      'div[class*="result"]',
      'div[class*="tile"]',
      'div[class*="card"]',
      'div[class*="item"]',
      'section[class*="property"]',
      'article',
      '.property-tile',
      '.listing-tile',
      '.result-tile',
      '.search-result'
    ];
    
    console.log('Looking for property listing patterns...\n');
    
    for (const pattern of patterns) {
      const elements = $(pattern);
      if (elements.length > 0) {
        console.log(`\n=== ${pattern}: ${elements.length} elements ===`);
        
        // Show first few elements
        elements.slice(0, 3).each((i, el) => {
          const $el = $(el);
          console.log(`\nElement ${i + 1}:`);
          console.log('HTML (first 300 chars):', $el.html()?.substring(0, 300));
          
          // Check for key elements
          const links = $el.find('a');
          const images = $el.find('img');
          const headings = $el.find('h1, h2, h3, h4, h5, h6');
          
          console.log(`  Links: ${links.length}, Images: ${images.length}, Headings: ${headings.length}`);
          
          if (links.length > 0) {
            console.log('  First link:', links.first().attr('href'));
          }
          if (headings.length > 0) {
            console.log('  First heading:', headings.first().text().trim());
          }
        });
      }
    }
    
    // Also check for any divs with specific classes that might contain listings
    console.log('\n=== Checking for divs with specific classes ===');
    const allDivs = $('div[class]');
    const classCounts = {};
    
    allDivs.each((i, el) => {
      const className = $(el).attr('class');
      if (className) {
        classCounts[className] = (classCounts[className] || 0) + 1;
      }
    });
    
    // Show classes that appear multiple times (likely listing containers)
    Object.entries(classCounts)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([className, count]) => {
        console.log(`  .${className}: ${count} elements`);
      });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectHTML();
