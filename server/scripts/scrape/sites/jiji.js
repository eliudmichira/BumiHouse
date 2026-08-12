import { load } from 'cheerio';
import { fetchRenderedHtml } from '../shared/render.js';
import { fetchRenderedHtmlBatch } from '../shared/renderBatch.js';

const BASE = 'https://jiji.co.ke';

export const CATEGORIES = {
  rent: { listingType: 'rent', defaultType: 'apartment', url: '/houses-apartments-for-rent' },
  sale: { listingType: 'sale', defaultType: 'apartment', url: '/houses-apartments-for-sale' },
  land: { listingType: 'sale', defaultType: 'land', url: '/land-and-plots-for-sale' },
  commercial_rent: { listingType: 'rent', defaultType: 'commercial', url: '/commercial-property-for-rent' },
};

function parsePrice(str) {
  if (!str) return null;
  const m = String(str).replace(/[,\s]/g, '').match(/(\d{3,})/);
  return m ? parseInt(m[1], 10) : null;
}

function detectPropertyType(title, fallback) {
  const t = (title || '').toLowerCase();
  if (/\bstudio\b/.test(t)) return 'studio';
  if (/\bbungalow\b/.test(t)) return 'bungalow';
  if (/\btownhouse\b/.test(t)) return 'townhouse';
  if (/\bmaisonette\b/.test(t)) return 'maisonette';
  if (/\b(villa|mansion)\b/.test(t)) return 'villa';
  if (/\bapartment\b/.test(t)) return 'apartment';
  if (/\bhouse\b/.test(t)) return 'house';
  if (/\b(plot|land)\b/.test(t)) return 'land';
  if (/\b(office|shop|commercial|warehouse)\b/.test(t)) return 'commercial';
  return fallback;
}

function extractBeds(title) {
  if (!title) return null;
  const m = title.match(/(\d+)\s*(?:bdrm|bed|br|b\/r)/i);
  return m ? parseInt(m[1], 10) : null;
}

function parseListingAnchor($, el) {
  const $a = $(el);
  const href = $a.attr('href') || '';
  if (!href || !href.includes('.html')) return null;
  const url = href.startsWith('http') ? href : `${BASE}${href}`;

  const title = $a.find('.qa-advert-title, .b-advert-title-inner').first().text().trim() || null;
  const priceText = $a.find('.qa-advert-price').first().text().trim() || null;
  const location = $a.find('.b-list-advert__region__text').first().text().trim() || null;
  const description = $a.find('.b-list-advert-base__description-text').first().text().trim() || null;

  // Real listing image: from picture > img / source with pictures-kenya.jijistatic.com
  const images = [];
  $a.find('picture img, picture source').each((_, n) => {
    const $n = $(n);
    const src = $n.attr('src') || ($n.attr('srcset') || '').split(' ')[0];
    if (src && src.includes('pictures-kenya.jijistatic.com')) {
      if (!images.includes(src)) images.push(src);
    }
  });

  // location format: "County, Area" or just "Area"
  let city = null;
  let area = null;
  if (location) {
    const parts = location.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      city = parts[0];
      area = parts[1];
    } else {
      city = parts[0];
      area = parts[0];
    }
  }

  return {
    source: 'jiji',
    url,
    title,
    price: parsePrice(priceText),
    priceRaw: priceText,
    address: area || city,
    city,
    county: city,
    description,
    bedrooms: extractBeds(title),
    images,
  };
}

export async function scrapeJijiCategory(categoryKey, { pages = 1 } = {}) {
  const cat = CATEGORIES[categoryKey];
  if (!cat) throw new Error(`Unknown Jiji category: ${categoryKey}`);

  const results = [];
  const seenUrls = new Set();

  for (let p = 1; p <= pages; p++) {
    const url = `${BASE}${cat.url}${p > 1 ? `?page=${p}` : ''}`;
    console.log(`  📄 ${url}`);

    let html;
    try {
      html = await fetchRenderedHtml(url, {
        waitSelector: 'a.qa-advert-list-item',
        waitForNetwork: true,
        timeoutMs: 45000,
      });
    } catch (e) {
      console.log(`  ⚠️  ${e.message}`);
      continue;
    }

    const $ = load(html);
    const anchors = $('a.qa-advert-list-item');
    console.log(`     ${anchors.length} listing anchors`);

    anchors.each((_, el) => {
      const card = parseListingAnchor($, el);
      if (!card || !card.url || !card.title) return;
      if (seenUrls.has(card.url)) return;
      seenUrls.add(card.url);
      results.push({
        ...card,
        category: categoryKey,
        listingType: cat.listingType,
        propertyType: detectPropertyType(card.title, cat.defaultType),
      });
    });
  }
  return results;
}

function parseDetailHtml(html) {
  const $ = load(html);

  const seller = $('.b-seller-block__name').first().text().trim() || null;
  const sellerYears = $('.b-seller-block__info').first().text().replace(/\s+/g, ' ').trim();

  // Images: dedupe by base id
  const images = [];
  const seenIds = new Set();
  $('img[src*="pictures-kenya.jijistatic.com"]').each((_, el) => {
    const src = $(el).attr('src');
    if (!src) return;
    const idMatch = src.match(/\/(\d+)_/);
    const id = idMatch ? idMatch[1] : src;
    if (seenIds.has(id)) return;
    seenIds.add(id);
    images.push(src);
  });

  // Attributes (key/value pairs)
  const attrs = {};
  $('.b-advert-attribute').each((_, el) => {
    const $el = $(el);
    const value = $el.find('.b-advert-attribute__value').text().trim();
    const key = $el.find('.b-advert-attribute__key').text().trim();
    if (key) attrs[key.toLowerCase()] = value;
  });

  const description = $('.qa-description-text').first().text().trim()
    || $('[class*="description"]').first().text().replace(/\s+/g, ' ').trim()
    || null;

  // Pull bedrooms/bathrooms/area if present in attributes
  const num = (s) => {
    if (!s) return null;
    const m = String(s).match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
  };
  const bedrooms = num(attrs['bedrooms']);
  const bathrooms = num(attrs['bathrooms']) || num(attrs['toilets']);
  const area = num(attrs['property size']) || num(attrs['square meters']) || num(attrs['size']);
  const furnishing = attrs['furnishing'] || null;
  const condition = attrs['condition'] || null;

  return {
    seller,
    sellerYears,
    images,
    description,
    bedrooms,
    bathrooms,
    area,
    furnishing,
    condition,
    attributes: attrs,
  };
}

export async function enrichWithDetails(listings, { concurrency = 4 } = {}) {
  console.log(`\n🔍 Fetching ${listings.length} detail pages (concurrency=${concurrency})...`);
  const byUrl = new Map(listings.map(l => [l.url, l]));
  let done = 0;
  const urls = listings.map(l => l.url);

  await fetchRenderedHtmlBatch(urls, {
    waitSelector: '.b-advert-attribute',
    waitForNetwork: true,
    postLoadDelayMs: 1500,
    timeoutMs: 35000,
    concurrency,
    onPage: (url, html) => {
      const listing = byUrl.get(url);
      if (!listing) return;
      try {
        const det = parseDetailHtml(html);
        // Merge — prefer detail-page values when present
        if (det.images.length) listing.images = det.images;
        if (det.description) listing.description = det.description;
        if (det.bedrooms != null) listing.bedrooms = det.bedrooms;
        if (det.bathrooms != null) listing.bathrooms = det.bathrooms;
        if (det.area != null) listing.area = det.area;
        if (det.seller) listing.seller = det.seller;
        if (det.sellerYears) listing.sellerYears = det.sellerYears;
        if (det.furnishing) listing.furnishing = det.furnishing;
        if (det.condition) listing.condition = det.condition;
        listing.attributes = det.attributes;
      } catch (e) {
        // ignore single-page parse failures
      }
      done++;
      if (done % 5 === 0 || done === urls.length) {
        process.stdout.write(`\r   ${done}/${urls.length} enriched`);
      }
    },
    onError: (url, err) => {
      // don't kill the batch; just log
      console.log(`\n   ⚠️  detail fail: ${err.message?.slice(0,80)}`);
    },
  });
  console.log('');
  return listings;
}

export async function scrapeJiji({ pagesRent = 2, pagesSale = 1, pagesLand = 0, pagesCommercial = 0, withDetails = true, detailConcurrency = 4 } = {}) {
  const all = [];
  if (pagesRent > 0) { console.log(`\n🏠 Rent (${pagesRent} pages)`); all.push(...(await scrapeJijiCategory('rent', { pages: pagesRent }))); }
  if (pagesSale > 0) { console.log(`\n💰 Sale (${pagesSale} pages)`); all.push(...(await scrapeJijiCategory('sale', { pages: pagesSale }))); }
  if (pagesLand > 0) { console.log(`\n🌍 Land (${pagesLand} pages)`); all.push(...(await scrapeJijiCategory('land', { pages: pagesLand }))); }
  if (pagesCommercial > 0) { console.log(`\n🏢 Commercial rent (${pagesCommercial} pages)`); all.push(...(await scrapeJijiCategory('commercial_rent', { pages: pagesCommercial }))); }
  if (withDetails && all.length) await enrichWithDetails(all, { concurrency: detailConcurrency });
  return all;
}
