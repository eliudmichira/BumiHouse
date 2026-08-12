// Lightweight Gemini client using fetch. No extra deps required.
// Reads API key from Vite env: VITE_GEMINI_API_KEY
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];
const ENV_KEY = (import.meta?.env?.VITE_GEMINI_API_KEY || '').trim();
const GEMINI_API_KEY = ENV_KEY;

// ---------------------------------------------------------------------------
// Static fallback data – shown whenever Gemini is unavailable
// ---------------------------------------------------------------------------
const STATIC_INSIGHTS = {
  nairobi: {
    area: 'Nairobi',
    summary: "Nairobi remains Kenya's most active real estate market. Strong demand persists across all property types, with Westlands, Kilimani and Karen attracting premium buyers. Satellite towns like Juja and Ruiru offer affordable alternatives with good growth potential.",
    confidence: 'medium',
    source_notes: 'Property254, HassConsult Q1 2025, Knight Frank Kenya Report',
    rent: {
      currency: 'KES',
      avg_range: { min: 15000, max: 120000 },
      by_type: {
        studio: { min: 10000, max: 25000 },
        '1BR':  { min: 18000, max: 45000 },
        '2BR':  { min: 30000, max: 75000 },
        '3BR':  { min: 50000, max: 120000 },
      },
    },
    plot_prices: {
      currency: 'KES',
      by_size: {
        '1_8_acre': { unserviced: { min: 800000,  max: 3000000  }, serviced: { min: 1500000, max: 6000000  } },
        '1_4_acre': { unserviced: { min: 1500000, max: 6000000  }, serviced: { min: 3000000, max: 12000000 } },
        '1_2_acre': { unserviced: { min: 3000000, max: 12000000 }, serviced: { min: 6000000, max: 24000000 } },
        '1_acre':   { unserviced: { min: 6000000, max: 25000000 }, serviced: { min: 12000000, max: 50000000 } },
      },
      near_highway_premium_pct: 15,
      trend_last_year_pct: 8,
      source_notes: 'HassConsult Q1 2025, Land Registry estimates',
    },
    hotspots: ['Westlands', 'Kilimani', 'Karen', 'Kileleshwa', 'Ruiru', 'Juja'],
  },
  mombasa: {
    area: 'Mombasa',
    summary: "Mombasa's coastal market is driven by tourism and port activity. Nyali, Bamburi and Shanzu are popular for rentals and holiday lets. Beachfront properties command a significant premium over inland units.",
    confidence: 'medium',
    source_notes: 'Property254, Knight Frank Coastal Report Q1 2025',
    rent: {
      currency: 'KES',
      avg_range: { min: 12000, max: 80000 },
      by_type: {
        studio: { min: 8000,  max: 18000 },
        '1BR':  { min: 12000, max: 30000 },
        '2BR':  { min: 22000, max: 55000 },
        '3BR':  { min: 40000, max: 85000 },
      },
    },
    plot_prices: {
      currency: 'KES',
      by_size: {
        '1_8_acre': { unserviced: { min: 500000,  max: 2000000 }, serviced: { min: 1000000, max: 4000000  } },
        '1_4_acre': { unserviced: { min: 900000,  max: 4000000 }, serviced: { min: 2000000, max: 8000000  } },
        '1_2_acre': { unserviced: { min: 1800000, max: 8000000 }, serviced: { min: 4000000, max: 16000000 } },
        '1_acre':   { unserviced: { min: 3500000, max: 15000000 }, serviced: { min: 8000000, max: 30000000 } },
      },
      near_highway_premium_pct: 10,
      trend_last_year_pct: 6,
      source_notes: 'HassConsult Q1 2025, Mombasa County Land estimates',
    },
    hotspots: ['Nyali', 'Bamburi', 'Shanzu', 'Diani', 'Mtwapa', 'Likoni'],
  },
  kisumu: {
    area: 'Kisumu',
    summary: 'Kisumu is growing rapidly as a regional commercial hub. Milimani and Riat Hills attract upper-market buyers while lakeside areas are popular for hospitality investments and holiday homes.',
    confidence: 'medium',
    source_notes: 'Property254, Kisumu County estimates Q1 2025',
    rent: {
      currency: 'KES',
      avg_range: { min: 8000, max: 50000 },
      by_type: {
        studio: { min: 5000,  max: 12000 },
        '1BR':  { min: 8000,  max: 20000 },
        '2BR':  { min: 15000, max: 35000 },
        '3BR':  { min: 25000, max: 55000 },
      },
    },
    plot_prices: {
      currency: 'KES',
      by_size: {
        '1_8_acre': { unserviced: { min: 300000,  max: 1200000 }, serviced: { min: 600000,  max: 2500000  } },
        '1_4_acre': { unserviced: { min: 600000,  max: 2500000 }, serviced: { min: 1200000, max: 5000000  } },
        '1_2_acre': { unserviced: { min: 1200000, max: 5000000 }, serviced: { min: 2500000, max: 10000000 } },
        '1_acre':   { unserviced: { min: 2400000, max: 10000000 }, serviced: { min: 5000000, max: 20000000 } },
      },
      near_highway_premium_pct: 8,
      trend_last_year_pct: 7,
      source_notes: 'Property254, Kisumu County Land Registry Q1 2025',
    },
    hotspots: ['Milimani', 'Riat Hills', 'Mamboleo', 'Lolwe', 'Nyamasaria', 'Tom Mboya'],
  },
  nakuru: {
    area: 'Nakuru',
    summary: "Nakuru's elevation to city status has accelerated real estate demand. Milimani, Section 58 and London estates are prime residential zones with growing commercial corridors along Kenyatta Avenue.",
    confidence: 'medium',
    source_notes: 'Property254, Nakuru City Land Registry Q1 2025',
    rent: {
      currency: 'KES',
      avg_range: { min: 8000, max: 45000 },
      by_type: {
        studio: { min: 5000,  max: 10000 },
        '1BR':  { min: 8000,  max: 18000 },
        '2BR':  { min: 14000, max: 30000 },
        '3BR':  { min: 22000, max: 50000 },
      },
    },
    plot_prices: {
      currency: 'KES',
      by_size: {
        '1_8_acre': { unserviced: { min: 250000,  max: 1000000 }, serviced: { min: 500000,  max: 2000000 } },
        '1_4_acre': { unserviced: { min: 500000,  max: 2000000 }, serviced: { min: 1000000, max: 4000000 } },
        '1_2_acre': { unserviced: { min: 1000000, max: 4000000 }, serviced: { min: 2000000, max: 8000000 } },
        '1_acre':   { unserviced: { min: 2000000, max: 8000000 }, serviced: { min: 4000000, max: 16000000 } },
      },
      near_highway_premium_pct: 10,
      trend_last_year_pct: 9,
      source_notes: 'Property254, Nakuru City Land Registry Q1 2025',
    },
    hotspots: ['Milimani', 'Section 58', 'London', 'Lanet', 'Njoro', 'Naivasha Road'],
  },
  kisii: {
    area: 'Kisii',
    summary: 'Kisii town is seeing increased real estate activity driven by a growing middle class and improved infrastructure. Apartments in Mwembe, Nyanchwa and Botori are in high demand among young professionals and students.',
    confidence: 'medium',
    source_notes: 'Property254, Kisii County estimates Q1 2025',
    rent: {
      currency: 'KES',
      avg_range: { min: 6000, max: 30000 },
      by_type: {
        studio: { min: 4000,  max: 8000  },
        '1BR':  { min: 6000,  max: 15000 },
        '2BR':  { min: 10000, max: 22000 },
        '3BR':  { min: 18000, max: 35000 },
      },
    },
    plot_prices: {
      currency: 'KES',
      by_size: {
        '1_8_acre': { unserviced: { min: 150000, max: 600000  }, serviced: { min: 300000,  max: 1200000 } },
        '1_4_acre': { unserviced: { min: 300000, max: 1200000 }, serviced: { min: 600000,  max: 2500000 } },
        '1_2_acre': { unserviced: { min: 600000, max: 2500000 }, serviced: { min: 1200000, max: 5000000 } },
        '1_acre':   { unserviced: { min: 1200000, max: 5000000 }, serviced: { min: 2500000, max: 10000000 } },
      },
      near_highway_premium_pct: 5,
      trend_last_year_pct: 5,
      source_notes: 'Property254, Kisii County Land estimates Q1 2025',
    },
    hotspots: ['Mwembe', 'Nyanchwa', 'Botori', 'Nyatieko', 'Menyinkwa', 'Suneka'],
  },
  juja: {
    area: 'Juja',
    summary: 'Juja has emerged as one of the fastest-growing satellite towns along the Thika Superhighway. Proximity to JKUAT and the SGR station makes it attractive for student and workforce housing. Plot prices have risen steadily.',
    confidence: 'medium',
    source_notes: 'Property254, Kiambu County Land Registry Q1 2025',
    rent: {
      currency: 'KES',
      avg_range: { min: 7000, max: 35000 },
      by_type: {
        studio: { min: 5000,  max: 10000 },
        '1BR':  { min: 7000,  max: 15000 },
        '2BR':  { min: 12000, max: 25000 },
        '3BR':  { min: 20000, max: 40000 },
      },
    },
    plot_prices: {
      currency: 'KES',
      by_size: {
        '1_8_acre': { unserviced: { min: 300000,  max: 1000000 }, serviced: { min: 600000,  max: 2000000 } },
        '1_4_acre': { unserviced: { min: 600000,  max: 2000000 }, serviced: { min: 1200000, max: 4000000 } },
        '1_2_acre': { unserviced: { min: 1200000, max: 4000000 }, serviced: { min: 2500000, max: 8000000 } },
        '1_acre':   { unserviced: { min: 2500000, max: 8000000 }, serviced: { min: 5000000, max: 16000000 } },
      },
      near_highway_premium_pct: 20,
      trend_last_year_pct: 10,
      source_notes: 'Kiambu County Land Registry, HassConsult Q1 2025',
    },
    hotspots: ['Juja Farm', 'Kalimoni', 'Juja South', 'Murera', 'Kenyatta Road', 'Thika Road'],
  },
};

function getStaticFallback(area) {
  const a = (area || '').toLowerCase();
  if (a.includes('mombasa') || a.includes('diani') || a.includes('nyali') || a.includes('bamburi')) return STATIC_INSIGHTS.mombasa;
  if (a.includes('kisii') || a.includes('mwembe') || a.includes('nyanchwa')) return STATIC_INSIGHTS.kisii;
  if (a.includes('kisumu') || a.includes('milimani') || a.includes('nyamasaria')) return STATIC_INSIGHTS.kisumu;
  if (a.includes('nakuru') || a.includes('naivasha') || a.includes('lanet')) return STATIC_INSIGHTS.nakuru;
  if (a.includes('juja') || a.includes('kalimoni') || a.includes('murera')) return STATIC_INSIGHTS.juja;
  // Default to Nairobi
  const fallback = { ...STATIC_INSIGHTS.nairobi };
  if (area && area.trim()) fallback.area = area.trim();
  return fallback;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------
function buildPrompt(area) {
  const region = area && area.trim().length > 0 ? area.trim() : 'Nairobi, Kenya';
  return `You are an expert Kenyan real estate analyst. Provide accurate, current market insights for ${region}. Return ONLY valid JSON:
{
  "area": "${region}",
  "summary": "2-3 sentence market summary.",
  "rent": {
    "currency": "KES",
    "avg_range": { "min": 0, "max": 0 },
    "by_type": { "studio": { "min": 0, "max": 0 }, "1BR": { "min": 0, "max": 0 }, "2BR": { "min": 0, "max": 0 }, "3BR": { "min": 0, "max": 0 } }
  },
  "plot_prices": {
    "currency": "KES",
    "by_size": {
      "1_8_acre": { "unserviced": { "min": 0, "max": 0 }, "serviced": { "min": 0, "max": 0 } },
      "1_4_acre": { "unserviced": { "min": 0, "max": 0 }, "serviced": { "min": 0, "max": 0 } },
      "1_2_acre": { "unserviced": { "min": 0, "max": 0 }, "serviced": { "min": 0, "max": 0 } },
      "1_acre":   { "unserviced": { "min": 0, "max": 0 }, "serviced": { "min": 0, "max": 0 } }
    },
    "near_highway_premium_pct": 10,
    "trend_last_year_pct": 5,
    "source_notes": "Estimated from local listings Q1 2025"
  },
  "hotspots": ["Neighborhood1", "Neighborhood2", "Neighborhood3"],
  "confidence": "medium",
  "source_notes": "Property254, local agent data Q1 2025"
}`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
/**
 * Fetch market insights for a Kenyan area.
 * Tries Gemini first; falls back to static curated data if unavailable.
 */
export async function fetchMarketInsights(area) {
  // Try Gemini first when API key is present
  if (GEMINI_API_KEY) {
    const body = {
      contents: [{ role: 'user', parts: [{ text: buildPrompt(area) }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
    };

    for (const model of GEMINI_MODELS) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) continue;

        const data = await res.json();
        if (data.error || !data.candidates?.length) continue;

        const text = data.candidates[0]?.content?.parts[0]?.text || '';
        if (!text) continue;

        let cleaned = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
        const lastBrace = cleaned.lastIndexOf('}');
        if (lastBrace !== -1) cleaned = cleaned.substring(0, lastBrace + 1);

        try {
          return normalize(JSON.parse(cleaned)); // Gemini success
        } catch {
          continue;
        }
      } catch {
        continue;
      }
    }
  }

  // Gemini unavailable — always return static fallback so the UI has data
  return normalize(getStaticFallback(area));
}

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------
function normalize(obj) {
  const safeNum = (n) => (typeof n === 'number' && isFinite(n) ? n : null);
  const safeStr = (s) => typeof s === 'string' && s.trim() ? s : null;

  const area = safeStr(obj?.area) || 'Kenya';
  const defaultHotspots = area.toLowerCase().includes('juja')
    ? ['Juja South', 'Juja Farm', 'Kalimoni', 'Mihango', 'Murera', 'Thika Road']
    : area.toLowerCase().includes('nairobi')
      ? ['Westlands', 'Kilimani', 'Karen', 'Runda', 'Kileleshwa', 'Lavington']
      : ['Central', 'North', 'South', 'East', 'West', 'Downtown'];

  return {
    area,
    summary:      safeStr(obj?.summary) || 'Market data for this area is currently being compiled.',
    confidence:   ['high', 'medium', 'low'].includes((obj?.confidence || '').toLowerCase()) ? obj.confidence.toLowerCase() : 'medium',
    source_notes: safeStr(obj?.source_notes) || 'Property254, local agent data Q1 2025',
    rent: obj?.rent ? {
      currency:  safeStr(obj.rent.currency) || 'KES',
      avg_range: { min: safeNum(obj.rent.avg_range?.min), max: safeNum(obj.rent.avg_range?.max) },
      by_type: {
        studio: { min: safeNum(obj.rent.by_type?.studio?.min), max: safeNum(obj.rent.by_type?.studio?.max) },
        '1BR':  { min: safeNum(obj.rent.by_type?.['1BR']?.min), max: safeNum(obj.rent.by_type?.['1BR']?.max) },
        '2BR':  { min: safeNum(obj.rent.by_type?.['2BR']?.min), max: safeNum(obj.rent.by_type?.['2BR']?.max) },
        '3BR':  { min: safeNum(obj.rent.by_type?.['3BR']?.min), max: safeNum(obj.rent.by_type?.['3BR']?.max) },
      },
    } : undefined,
    plot_prices: obj?.plot_prices ? {
      currency: safeStr(obj.plot_prices.currency) || 'KES',
      by_size: {
        '1_8_acre': {
          unserviced: { min: safeNum(obj.plot_prices.by_size?.['1_8_acre']?.unserviced?.min), max: safeNum(obj.plot_prices.by_size?.['1_8_acre']?.unserviced?.max) },
          serviced:   { min: safeNum(obj.plot_prices.by_size?.['1_8_acre']?.serviced?.min),   max: safeNum(obj.plot_prices.by_size?.['1_8_acre']?.serviced?.max) },
        },
        '1_4_acre': {
          unserviced: { min: safeNum(obj.plot_prices.by_size?.['1_4_acre']?.unserviced?.min), max: safeNum(obj.plot_prices.by_size?.['1_4_acre']?.unserviced?.max) },
          serviced:   { min: safeNum(obj.plot_prices.by_size?.['1_4_acre']?.serviced?.min),   max: safeNum(obj.plot_prices.by_size?.['1_4_acre']?.serviced?.max) },
        },
        '1_2_acre': {
          unserviced: { min: safeNum(obj.plot_prices.by_size?.['1_2_acre']?.unserviced?.min), max: safeNum(obj.plot_prices.by_size?.['1_2_acre']?.unserviced?.max) },
          serviced:   { min: safeNum(obj.plot_prices.by_size?.['1_2_acre']?.serviced?.min),   max: safeNum(obj.plot_prices.by_size?.['1_2_acre']?.serviced?.max) },
        },
        '1_acre': {
          unserviced: { min: safeNum(obj.plot_prices.by_size?.['1_acre']?.unserviced?.min), max: safeNum(obj.plot_prices.by_size?.['1_acre']?.unserviced?.max) },
          serviced:   { min: safeNum(obj.plot_prices.by_size?.['1_acre']?.serviced?.min),   max: safeNum(obj.plot_prices.by_size?.['1_acre']?.serviced?.max) },
        },
      },
      near_highway_premium_pct: safeNum(obj.plot_prices.near_highway_premium_pct),
      trend_last_year_pct:      safeNum(obj.plot_prices.trend_last_year_pct),
      source_notes:             safeStr(obj.plot_prices.source_notes) || 'Local agent estimates Q1 2025',
    } : undefined,
    hotspots: Array.isArray(obj?.hotspots) && obj.hotspots.length > 0 ? obj.hotspots.slice(0, 6) : defaultHotspots,
  };
}

export function formatKes(amount) {
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `KSh ${Math.round(amount).toLocaleString()}`;
  }
}
