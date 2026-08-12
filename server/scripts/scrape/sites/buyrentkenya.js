/**
 * BuyRentKenya Scraper — verified selectors (2026-05)
 *
 * Cards:   .listing-card
 * Title:   h2, h3 (first inside card)
 * Price:   [data-bi-listing-price] attribute on inner div
 * Image:   img first src (full i.roamcdn.net URL)
 * URL:     a[id*="listing-link"] href
 * Beds:    text regex (\d+ [Bb]ed)
 * Baths:   text regex (\d+ [Bb]ath)
 * Location: text element containing ", Nairobi" or city name
 */

import { load } from 'cheerio';
import { fetchHtml } from '../shared/http.js';

const BASE = 'https://www.buyrentkenya.com';

const SEARCH_URLS = [
  { url: `${BASE}/flats-apartments-for-rent`, type: 'rent' },
  { url: `${BASE}/houses-for-rent`, type: 'rent' },
  { url: `${BASE}/bedsitters-for-rent`, type: 'rent' },
  { url: `${BASE}/flats-apartments-for-sale`, type: 'sale' },
  { url: `${BASE}/houses-for-sale`, type: 'sale' },
];

function parseCard($, el, defaultType) {
  const $card = $(el);

  // ID
  const rawId = $card.attr('id') || '';
  const sourceId = rawId.replace('listing-', '').trim();
  if (!sourceId) return null;

  // Price from data attribute
  const priceStr = $card.find('[data-bi-listing-price]').first().attr('data-bi-listing-price');
  const price = priceStr ? parseInt(priceStr, 10) : null;

  // Collect ALL listing photos (i.roamcdn.net thumbs), excluding agency logos.
  // BRK renders 4+ photos per card; previously we kept only the first.
  const images = [];
  $card.find('img[src*="roamcdn"], img[data-src*="roamcdn"]').each((_, im) => {
    const src = $(im).attr('src') || $(im).attr('data-src');
    if (!src) return;
    if (src.includes('agency-thumb')) return; // skip agent/agency avatars
    if (!images.includes(src)) images.push(src);
  });

  // Title from h2/h3
  const title = $card.find('h2, h3').first().text().trim() || null;
  if (!title) return null;

  // URL from listing link
  const linkEl = $card.find('a[id*="listing-link"]').first();
  const href = linkEl.attr('href') || '';
  if (!href || href === 'javascript:void(0);') return null;
  const url = href.startsWith('http') ? href : `${BASE}${href}`;

  // Beds / baths from card text
  const cardText = $card.text().replace(/\s+/g, ' ');
  const bedsMatch = cardText.match(/(\d+)\s*[Bb]ed/);
  const bathsMatch = cardText.match(/(\d+)\s*[Bb]ath/);
  const bedrooms = bedsMatch ? parseInt(bedsMatch[1], 10) : 0;
  const bathrooms = bathsMatch ? parseInt(bathsMatch[1], 10) : null;

  // Location — BRK renders area as a standalone short span
  // e.g. <span>Lavington</span> or <span>Westlands Area</span>
  let address = null, city = 'Nairobi';
  const knownCities = /nairobi|mombasa|kisumu|nakuru|eldoret|kiambu|kajiado|machakos/i;
  $card.find('span').each((_, textEl) => {
    const t = $(textEl).children().length === 0 ? $(textEl).text().trim() : '';
    if (t && t.length > 3 && t.length < 50 && !/bedroom|bathroom|month|KSh|price|\d/i.test(t)) {
      if (!address) {
        address = t;
        if (knownCities.test(t)) city = t;
      }
    }
  });
  // Fallback: extract city from URL slug
  const slugCityMatch = href.match(/-(nairobi|mombasa|kisumu|nakuru|eldoret|kiambu|kajiado)/i);
  if (slugCityMatch) city = slugCityMatch[1].charAt(0).toUpperCase() + slugCityMatch[1].slice(1);

  // Listing type from URL
  const listingType = url.includes('for-sale') ? 'sale' : defaultType;

  return {
    source: 'buyrentkenya',
    sourceId,
    url,
    title,
    price,
    bedrooms,
    bathrooms,
    images,
    address: address || city || null,
    city: city || 'Nairobi',
    listingType,
    propertyType: null,
    raw: { cardText: cardText.substring(0, 150) }
  };
}

export async function scrapeBuyRentKenya({ pages = 3 } = {}) {
  const seen = new Set();
  const results = [];

  for (const { url: baseUrl, type } of SEARCH_URLS) {
    for (let p = 1; p <= pages; p++) {
      const url = p === 1 ? baseUrl : `${baseUrl}?page=${p}`;
      try {
        console.log(`[BRK] Fetching: ${url}`);
        const html = await fetchHtml(url);
        const $ = load(html);
        const cards = $('.listing-card');
        console.log(`[BRK] ${cards.length} cards on page ${p}`);

        if (cards.length === 0) break;

        let pageAdded = 0;
        cards.each((_, el) => {
          const listing = parseCard($, el, type);
          if (listing && !seen.has(listing.url)) {
            seen.add(listing.url);
            results.push(listing);
            pageAdded++;
          }
        });

        console.log(`[BRK] Added ${pageAdded} new listings`);
        if (pageAdded === 0) break;

      } catch (e) {
        console.log(`[BRK] Error on ${url}: ${e.message}`);
        break;
      }
    }
  }

  console.log(`[BRK] Total: ${results.length} unique listings`);
  return results;
}
