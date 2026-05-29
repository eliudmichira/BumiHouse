import puppeteer from 'puppeteer';

export async function fetchRenderedHtml(url, { waitSelector = null, timeoutMs = 30000, waitForNetwork = false } = {}) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setRequestInterception(true);
    page.on('request', req => {
      // Skip images/fonts to speed up
      if (['image','media','font'].includes(req.resourceType())) return req.abort();
      req.continue();
    });
    
    // Wait for network to be idle for dynamic content
    const waitUntil = waitForNetwork ? 'networkidle2' : 'domcontentloaded';
    await page.goto(url, { waitUntil, timeout: timeoutMs });
    
    if (waitSelector) {
      await page.waitForSelector(waitSelector, { timeout: timeoutMs }).catch(() => {});
    } else {
      // Longer settle delay for dynamic content
      await page.waitForTimeout(waitForNetwork ? 3000 : 1500);
    }
    
    const html = await page.content();
    return html;
  } finally {
    await browser.close().catch(() => {});
  }
}


