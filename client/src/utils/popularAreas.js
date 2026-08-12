import { getPropertyImage } from './imageUtils';

/**
 * Group properties into neighborhoods/areas for the Popular Areas section and
 * the area directory.
 *
 * The seeded data keeps neighborhoods in the `address` field (Westlands, Ruiru,
 * Kitengela…) while `city` holds the county (Nairobi, Kiambu…), so grouping is
 * done by address first to surface the local areas users actually search for.
 *
 * Each area is shaped as:
 *   {
 *     name, count, images: [up to maxImages unique photo URLs],
 *     rentCount, saleCount, totalViews, priceSum, pricedCount
 *   }
 */
export function getAreasFromProperties(properties, { maxImages = 3 } = {}) {
  const byArea = new Map();
  (Array.isArray(properties) ? properties : []).forEach((p) => {
    const n = p.neighborhood;
    const area = String(
      p.address ||
        p.location?.address ||
        p.city ||
        p.location?.city ||
        (typeof n === 'string' ? n : n?.name) ||
        ''
    ).trim();
    if (!area) return;

    const key = area.toLowerCase();
    let entry = byArea.get(key);
    if (!entry) {
      entry = { name: area, count: 0, images: [] };
      byArea.set(key, entry);
    }

    entry.count += 1;

    const type = String(p.listing_type || p.type || '').toLowerCase();
    if (type === 'rent' || type === 'rental' || type === 'for-rent' || type === 'for rent') {
      entry.rentCount = (entry.rentCount || 0) + 1;
    } else if (type === 'sale' || type === 'for-sale' || type === 'for sale') {
      entry.saleCount = (entry.saleCount || 0) + 1;
    }

    const views = Number(p.views || p.viewsCount || 0);
    if (Number.isFinite(views) && views > 0) {
      entry.totalViews = (entry.totalViews || 0) + views;
    }

    const price = Number(p.price);
    if (Number.isFinite(price) && price > 0) {
      entry.priceSum = (entry.priceSum || 0) + price;
      entry.pricedCount = (entry.pricedCount || 0) + 1;
    }

    if (entry.images.length < maxImages) {
      const first = getPropertyImage(p);
      if (first && !entry.images.includes(first)) entry.images.push(first);
    }
  });

  return [...byArea.values()].sort((a, b) => b.count - a.count);
}

/**
 * Rank areas by a criterion so the Popular Areas section isn't a static list.
 *   - 'popular'    → most listings
 *   - 'trending'   → most total views (user engagement), ties broken by count
 *   - 'rent'       → most rental listings
 *   - 'sale'       → most sale listings
 *   - 'affordable' → lowest average price (areas with enough priced listings)
 *   - 'premium'    → highest average price
 * Cheap criteria (rent/sale/trending) tie-break with listing count so areas
 * without data for the signal still surface sensibly.
 */
export function rankAreas(areas, criteria = 'popular', { minPriced = 2 } = {}) {
  const list = [...areas];
  const avgPrice = (a) => (a.priceSum || 0) / (a.pricedCount || 1);

  switch (criteria) {
    case 'trending':
      return list.sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0) || b.count - a.count);
    case 'rent':
      return list.sort((a, b) => (b.rentCount || 0) - (a.rentCount || 0) || b.count - a.count);
    case 'sale':
      return list.sort((a, b) => (b.saleCount || 0) - (a.saleCount || 0) || b.count - a.count);
    case 'affordable': {
      const eligible = list.filter((a) => (a.pricedCount || 0) >= minPriced);
      return eligible.sort((a, b) => avgPrice(a) - avgPrice(b) || b.count - a.count);
    }
    case 'premium': {
      const eligible = list.filter((a) => (a.pricedCount || 0) >= minPriced);
      return eligible.sort((a, b) => avgPrice(b) - avgPrice(a) || b.count - a.count);
    }
    default:
      return list.sort((a, b) => b.count - a.count);
  }
}
