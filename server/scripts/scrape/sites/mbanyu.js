import puppeteer from 'puppeteer';

/**
 * Robust Scraper for Mbanyu Real Estate (https://mbanyu.com)
 * Extracts property listings for rent and sale via Puppeteer DOM rendering.
 */
export async function scrapeMbanyu({ pages = 1 } = {}) {
  console.log('🚀 Starting Mbanyu scraper via Puppeteer DOM extraction...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const listings = [];
  const seenTitles = new Set();

  try {
    const urls = [
      'https://mbanyu.com',
      'https://mbanyu.com/list-property',
    ];

    for (const url of urls) {
      console.log(`[Mbanyu] 🔍 Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise(r => setTimeout(r, 4000));

      // Scroll down to load all dynamic property cards
      await page.evaluate(async () => {
        await new Promise(resolve => {
          let totalHeight = 0;
          const distance = 300;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight || totalHeight > 6000) {
              clearInterval(timer);
              resolve();
            }
          }, 150);
        });
      });

      await new Promise(r => setTimeout(r, 2000));

      const extracted = await page.evaluate(() => {
        const items = [];
        const cards = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.innerText || '';
          const hasPrice = text.includes('KES') || text.includes('Ksh');
          const hasType = text.includes('For Sale') || text.includes('For Rent');
          return hasPrice && hasType && el.children.length > 2 && el.children.length < 15;
        });

        const processedText = new Set();

        cards.forEach(card => {
          const fullText = card.innerText.trim();
          if (processedText.has(fullText)) return;
          processedText.add(fullText);

          const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

          const img = card.querySelector('img[src*="assets.mbanyu.com"], img[src*="optimized"], img[src*="thumbnails"]');
          const imageUrl = img ? img.src : null;

          const priceLine = lines.find(l => l.includes('KES') || l.includes('Ksh'));
          const priceNum = priceLine ? parseInt(priceLine.replace(/[^0-9]/g, ''), 10) : 0;

          const headerLine = lines.find(l => l.includes('|')) || lines[0] || '';

          let beds = 0;
          let baths = 0;
          lines.forEach((line, idx) => {
            if (line.toLowerCase().includes('bed')) {
              const prev = lines[idx - 1];
              beds = parseInt(prev || line, 10) || 0;
            }
            if (line.toLowerCase().includes('ba')) {
              const prev = lines[idx - 1];
              baths = parseInt(prev || line, 10) || 0;
            }
          });

          const isRent = fullText.toLowerCase().includes('rent');
          const listingType = isRent ? 'rent' : 'sale';

          const parts = headerLine.split('|').map(p => p.trim());
          const rawPropType = parts[0] || 'Property';
          const area = parts[2] || parts[1] || 'Nairobi';

          let propertyType = 'apartment';
          const typeLower = rawPropType.toLowerCase();
          if (typeLower.includes('mansion') || typeLower.includes('villa')) propertyType = 'villa';
          else if (typeLower.includes('house') || typeLower.includes('bungalow') || typeLower.includes('townhouse') || typeLower.includes('penthouse')) propertyType = 'house';
          else if (typeLower.includes('plot') || typeLower.includes('land')) propertyType = 'plot';

          if (priceNum > 0 && imageUrl) {
            items.push({
              title: `${rawPropType} in ${area}`,
              price: priceNum,
              bedrooms: beds,
              bathrooms: baths,
              area: area.length > 20 ? 'Nairobi' : area,
              listingType,
              propertyType,
              images: [imageUrl],
              rawHeader: headerLine,
            });
          }
        });

        return items;
      });

      for (const item of extracted) {
        const key = `${item.title}_${item.price}`;
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          listings.push(item);
        }
      }
    }

    console.log(`[Mbanyu] ✅ Extracted ${listings.length} unique properties.`);
    return listings;
  } finally {
    await browser.close().catch(() => {});
  }
}
