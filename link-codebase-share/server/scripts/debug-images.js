import { fetchRenderedHtml } from './scrape/shared/render.js';
import { load } from 'cheerio';

async function debugImages() {
  console.log('=== DEBUGGING IMAGE EXTRACTION ===\n');
  
  const url = 'https://jiji.co.ke/real-estate?page=1';
  console.log('Fetching:', url);
  
  try {
    const html = await fetchRenderedHtml(url, { waitSelector: 'a' });
    const $ = load(html);
    
    // Look for listing cards
    const cards = $('[class*="listing"]');
    console.log(`Found ${cards.length} listing cards\n`);
    
    cards.slice(0, 3).each((i, el) => {
      const $card = $(el);
      console.log(`=== CARD ${i + 1} ===`);
      
      // Check for images
      const images = $card.find('img');
      console.log(`Images found: ${images.length}`);
      
      images.each((j, img) => {
        const $img = $(img);
        const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy');
        const alt = $img.attr('alt');
        console.log(`  Image ${j + 1}: ${src}`);
        console.log(`  Alt text: ${alt}`);
      });
      
      // Check for links
      const links = $card.find('a');
      console.log(`Links found: ${links.length}`);
      if (links.length > 0) {
        console.log(`  First link: ${links.first().attr('href')}`);
      }
      
      // Check for title
      const title = $card.find('h3, h4, .title, [class*="title"]').first().text().trim();
      console.log(`Title: ${title || 'No title found'}`);
      
      // Check for price
      const price = $card.find('[class*="price"], .price, .amount').first().text().trim();
      console.log(`Price: ${price || 'No price found'}`);
      
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugImages();
