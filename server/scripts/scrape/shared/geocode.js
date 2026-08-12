import axios from 'axios';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const UA = 'BumihouseScraper/1.0 (contact: michmichira@gmail.com)';

const cache = new Map();
let cachePath = null;

export function initGeocodeCache(filePath) {
  cachePath = filePath;
  if (existsSync(filePath)) {
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      for (const [k, v] of Object.entries(data)) cache.set(k, v);
      console.log(`📍 Geocode cache loaded: ${cache.size} entries`);
    } catch (_) {}
  }
}

function persist() {
  if (!cachePath) return;
  const obj = Object.fromEntries(cache.entries());
  writeFileSync(cachePath, JSON.stringify(obj, null, 2));
}

let lastReqAt = 0;
async function rateLimitedFetch(query) {
  // Nominatim usage policy: max 1 req/sec
  const wait = 1100 - (Date.now() - lastReqAt);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastReqAt = Date.now();
  const res = await axios.get(NOMINATIM, {
    params: { q: query, format: 'json', limit: 1, countrycodes: 'ke' },
    headers: { 'User-Agent': UA, 'Accept-Language': 'en' },
    timeout: 15000,
  });
  return res.data;
}

export async function geocode(query) {
  const key = query.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key);
  try {
    const data = await rateLimitedFetch(query);
    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0];
      const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
      cache.set(key, coords);
      persist();
      return coords;
    }
  } catch (e) {
    console.log(`   ⚠️  geocode "${query}" failed: ${e.message}`);
  }
  cache.set(key, null);
  persist();
  return null;
}

export function geocodeStats() {
  let hits = 0, misses = 0;
  for (const v of cache.values()) (v ? hits++ : misses++);
  return { cached: cache.size, hits, misses };
}
