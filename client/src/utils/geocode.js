/**
 * Address geocoding with a free OpenStreetMap (Nominatim) fallback.
 *
 * Primary path: Google Maps Geocoding API (VITE_GOOGLE_MAPS_API_KEY).
 * Fallback:     Nominatim (https://nominatim.openstreetmap.org) — free, no key.
 *
 * Nominatim usage policy (https://operations.osmfoundation.org/policies/nominatim/):
 * max ~1 request/second, identify yourself via a valid Referer/User-Agent,
 * no heavy/bulk use. This module serializes fallback calls and enforces a
 * minimum interval, so the fallback stays within policy even when callers
 * fire concurrent requests (e.g. HomeScreen's batch geocoding).
 */

const GOOGLE_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_MIN_INTERVAL_MS = 1100; // ~1 req/sec policy

let lastNominatimAt = 0;
let nominatimChain = Promise.resolve();

/**
 * Geocode with the Google Maps Geocoding API (Kenya-biased).
 * Resolves to { lat, lng } or null (missing key, network failure, quota,
 * denied, or no results). Abort errors are re-thrown so callers can detect them.
 */
async function geocodeWithGoogle(address, { signal, apiKey } = {}) {
  if (!apiKey) return null;
  const url =
    `${GOOGLE_GEOCODING_URL}?address=${encodeURIComponent(address)}` +
    `&region=ke&components=country:KE&key=${encodeURIComponent(apiKey)}`;
  let res;
  try {
    res = await fetch(url, { signal });
  } catch (error) {
    if (error?.name === 'AbortError' || signal?.aborted) throw error;
    return null; // network failure -> fall back
  }
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data || data.status !== 'OK' || !data.results?.[0]?.geometry?.location) {
    // ZERO_RESULTS / OVER_QUERY_LIMIT / REQUEST_DENIED / ... -> fall back
    return null;
  }
  const loc = data.results[0].geometry.location;
  return { lat: Number(loc.lat), lng: Number(loc.lng) };
}

/**
 * Geocode with OpenStreetMap's free Nominatim service. Calls are serialized
 * and spaced >= 1.1s apart to respect the usage policy. Resolves to
 * { lat, lng } or null (aborts and errors resolve to null).
 */
function geocodeWithNominatim(address, { signal } = {}) {
  const attempt = nominatimChain.then(async () => {
    if (signal?.aborted) return null;
    const elapsed = Date.now() - lastNominatimAt;
    if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
      await new Promise((resolve) => setTimeout(resolve, NOMINATIM_MIN_INTERVAL_MS - elapsed));
    }
    if (signal?.aborted) return null;
    lastNominatimAt = Date.now();

    const url =
      `${NOMINATIM_URL}?format=jsonv2&limit=1&countrycodes=ke` +
      `&accept-language=en&q=${encodeURIComponent(address)}`;
    let res;
    try {
      res = await fetch(url, { signal });
    } catch (error) {
      if (error?.name === 'AbortError' || signal?.aborted) return null;
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const hit = Array.isArray(data) && data[0] && data[0].lat && data[0].lon;
    if (!hit) return null;
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
  });
  // Keep the chain alive even if an attempt rejects, so later calls still run.
  nominatimChain = attempt.catch(() => {});
  return attempt;
}

/**
 * Geocode an address: Google first, then the free OpenStreetMap (Nominatim)
 * fallback whenever Google is unavailable (missing key, quota exceeded,
 * network failure, or no results).
 *
 * Resolves to { lat, lng, source } where source is 'google' | 'nominatim',
 * or null if neither service found anything. Aborts resolve to null.
 */
export async function geocodeAddress(address, { signal, apiKey } = {}) {
  if (!address || typeof address !== 'string') return null;
  const key = apiKey !== undefined ? apiKey : import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const google = await geocodeWithGoogle(address, { signal, apiKey: key });
  if (google) return { ...google, source: 'google' };

  const nominatim = await geocodeWithNominatim(address, { signal });
  if (nominatim) {
    if (import.meta.env.DEV) {
      console.info(`🌍 Geocoded "${address}" via OpenStreetMap (Nominatim)`);
    }
    return { ...nominatim, source: 'nominatim' };
  }
  return null;
}
