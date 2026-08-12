import puppeteer from 'puppeteer';

/**
 * Fetch many URLs with one shared Puppeteer browser, limited concurrency.
 * Calls onPage(url, html, index) for each successful fetch.
 */
export async function fetchRenderedHtmlBatch(urls, {
  waitSelector = null,
  waitForNetwork = false,
  postLoadDelayMs = 800,
  timeoutMs = 30000,
  concurrency = 3,
  onPage,
  onError,
} = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= urls.length) return;
      const url = urls[i];
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setRequestInterception(true);
        page.on('request', req => {
          if (['image', 'media', 'font'].includes(req.resourceType())) return req.abort();
          req.continue();
        });
        await page.goto(url, {
          waitUntil: waitForNetwork ? 'networkidle2' : 'domcontentloaded',
          timeout: timeoutMs,
        });
        if (waitSelector) {
          await page.waitForSelector(waitSelector, { timeout: timeoutMs }).catch(() => {});
        }
        if (postLoadDelayMs > 0) await new Promise(r => setTimeout(r, postLoadDelayMs));
        const html = await page.content();
        if (onPage) await onPage(url, html, i);
      } catch (e) {
        if (onError) onError(url, e, i);
      } finally {
        if (page) await page.close().catch(() => {});
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  await browser.close().catch(() => {});
}
