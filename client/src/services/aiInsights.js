// Lightweight Gemini client using fetch. No extra deps required.
// Reads API key from Vite env: VITE_GEMINI_API_KEY
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const ENV_KEY = (import.meta?.env?.VITE_GEMINI_API_KEY || '').trim();

// Validate API key - fail gracefully if missing
if (!ENV_KEY) {
  if (import.meta.env.DEV) {
    console.warn('⚠️ VITE_GEMINI_API_KEY is missing. Gemini AI features will be disabled.');
  }
}

const GEMINI_API_KEY = ENV_KEY;

// Professional prompt for better accuracy & useful citations
function buildPrompt(area) {
  const region = area && area.trim().length > 0 ? area.trim() : 'Nairobi, Kenya';
  return `
You are an expert Kenyan real estate analyst. Provide accurate, current market insights for ${region}, focusing on real price trends and hotspot neighborhoods in ${region} only. Always include prices for studios (bed sitters), 1BR, 2BR, and 3BR. Cite rates and trends from government, local property websites, or trusted reports. DO NOT use Nairobi hotspots for other areas.

Return ONLY valid JSON in this format:
{
  "area": "${region}",
  "summary": "Short market summary (2-3 sentences) using real/local data.",
  "rent": {
    "currency": "KES",
    "avg_range": { "min": ..., "max": ...},
    "by_type": {
      "studio": { "min": ..., "max": ... },    // bed sitter studios
      "1BR": { "min": ..., "max": ... },
      "2BR": { "min": ..., "max": ... },
      "3BR": { "min": ..., "max": ... }
    }
  },
  "plot_prices": {
    "currency": "KES",
    "by_size": {
      "1_8_acre": {
        "unserviced": { "min": ..., "max": ... },
        "serviced": { "min": ..., "max": ... }
      },
      "1_4_acre": {
        "unserviced": { "min": ..., "max": ... },
        "serviced": { "min": ..., "max": ... }
      },
      "1_2_acre": {
        "unserviced": { "min": ..., "max": ... },
        "serviced": { "min": ..., "max": ... }
      },
      "1_acre": {
        "unserviced": { "min": ..., "max": ... },
        "serviced": { "min": ..., "max": ... }
      }
    },
    "near_highway_premium_pct": 10, // percentage premium for highway-adjacent plots
    "trend_last_year_pct": 7, // price change last year (%)
    "source_notes": "Agent listings, land registry, Q3 2025 property report"
  },
  "hotspots": ["Area-specific neighborhoods only"], // Only ${region}-area hotspots!
  "confidence": "high | medium | low",     // Data quality rating
  "source_notes": "E.g. Property254 Q3 2025, local website, CBK, estate agent, etc."
}
If data is estimated, ALWAYS say so in 'source_notes'.
`;
}

/**
 * Call Gemini to get structured market insights for a Kenyan area
 * @param {string} area
 * @returns {Promise<object>} normalized insights object
 */
export async function fetchMarketInsights(area) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
  }

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: buildPrompt(area) }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 900
    }
  };

  // Try models in order from most recent/accurate to fallback
  for (const model of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        if (import.meta.env.DEV) {
          const msg = res.status === 403 && /leaked|PERMISSION_DENIED/i.test(errText)
            ? 'Gemini API key invalid or reported as leaked. Set a new VITE_GEMINI_API_KEY in .env.'
            : `Gemini model ${model} failed with status ${res.status}.`;
          console.warn(msg);
        }
        continue;
      }

      const data = await res.json();

      if (data.error || !data.candidates || data.candidates.length === 0) {
        if (import.meta.env.DEV) {
          console.warn(`Gemini model ${model} error or no candidates.`);
        }
        continue;
      }

      // Get the model's text output, preferring code/json blocks or plain text
      const text = data.candidates[0]?.content?.parts[0]?.text
        || data.candidates[0]?.content?.parts[0]?.inlineData?.data
        || '';

      if (!text) {
        if (import.meta.env.DEV) {
          console.warn(`Gemini model ${model} empty output`);
        }
        continue;
      }

      // Remove code fences just in case
      let cleaned = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
      // Clip to most-likely last valid JSON object
      const lastBraceIndex = cleaned.lastIndexOf('}');
      if (lastBraceIndex !== -1) cleaned = cleaned.substring(0, lastBraceIndex + 1);

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
        return normalize(parsed); // success
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error(`Gemini model ${model} - failed to parse JSON:`, { text, cleaned, error: e.message });
        }
        continue;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`Gemini model ${model} network error:`, error.message);
      }
      continue;
    }
  }

  throw new Error('All Gemini models failed to provide a valid, parseable response');
}

function normalize(obj) {
  const safeNum = (n) => (typeof n === 'number' && isFinite(n) ? n : null);
  const safeStr = (s) => typeof s === 'string' && s.trim() ? s : null;

  // Get area-specific default hotspots
  const area = safeStr(obj?.area) || 'Unknown area';
  const defaultHotspots = area.toLowerCase().includes('juja')
    ? ["Juja South", "Juja Farm", "Kalimoni", "Mihango", "Nyacaba", "Thika Road"]
    : area.toLowerCase().includes('nairobi')
      ? ["Westlands", "Kilimani", "Karen", "Runda", "Kileleshwa", "Lavington"]
      : ["Central", "North", "South", "East", "West", "Downtown"];

  return {
    area: safeStr(obj?.area) || 'Unknown area',
    summary: safeStr(obj?.summary) || 'No summary available.',
    confidence: ['high', 'medium', 'low'].includes((obj?.confidence || '').toLowerCase()) ? obj.confidence.toLowerCase() : 'unknown',
    source_notes: safeStr(obj?.source_notes) || 'No source provided.',
    rent: obj?.rent ? {
      currency: safeStr(obj?.rent?.currency) || 'KES',
      avg_range: {
        min: safeNum(obj?.rent?.avg_range?.min),
        max: safeNum(obj?.rent?.avg_range?.max)
      },
      by_type: {
        studio: {
          min: safeNum(obj?.rent?.by_type?.studio?.min),
          max: safeNum(obj?.rent?.by_type?.studio?.max)
        },
        '1BR': {
          min: safeNum(obj?.rent?.by_type?.['1BR']?.min),
          max: safeNum(obj?.rent?.by_type?.['1BR']?.max)
        },
        '2BR': {
          min: safeNum(obj?.rent?.by_type?.['2BR']?.min),
          max: safeNum(obj?.rent?.by_type?.['2BR']?.max)
        },
        '3BR': {
          min: safeNum(obj?.rent?.by_type?.['3BR']?.min),
          max: safeNum(obj?.rent?.by_type?.['3BR']?.max)
        }
      }
    } : undefined,
    plot_prices: obj?.plot_prices ? {
      currency: safeStr(obj?.plot_prices?.currency) || 'KES',
      by_size: {
        '1_8_acre': {
          unserviced: {
            min: safeNum(obj?.plot_prices?.by_size?.['1_8_acre']?.unserviced?.min),
            max: safeNum(obj?.plot_prices?.by_size?.['1_8_acre']?.unserviced?.max)
          },
          serviced: {
            min: safeNum(obj?.plot_prices?.by_size?.['1_8_acre']?.serviced?.min),
            max: safeNum(obj?.plot_prices?.by_size?.['1_8_acre']?.serviced?.max)
          }
        },
        '1_4_acre': {
          unserviced: {
            min: safeNum(obj?.plot_prices?.by_size?.['1_4_acre']?.unserviced?.min),
            max: safeNum(obj?.plot_prices?.by_size?.['1_4_acre']?.unserviced?.max)
          },
          serviced: {
            min: safeNum(obj?.plot_prices?.by_size?.['1_4_acre']?.serviced?.min),
            max: safeNum(obj?.plot_prices?.by_size?.['1_4_acre']?.serviced?.max)
          }
        },
        '1_2_acre': {
          unserviced: {
            min: safeNum(obj?.plot_prices?.by_size?.['1_2_acre']?.unserviced?.min),
            max: safeNum(obj?.plot_prices?.by_size?.['1_2_acre']?.unserviced?.max)
          },
          serviced: {
            min: safeNum(obj?.plot_prices?.by_size?.['1_2_acre']?.serviced?.min),
            max: safeNum(obj?.plot_prices?.by_size?.['1_2_acre']?.serviced?.max)
          }
        },
        '1_acre': {
          unserviced: {
            min: safeNum(obj?.plot_prices?.by_size?.['1_acre']?.unserviced?.min),
            max: safeNum(obj?.plot_prices?.by_size?.['1_acre']?.unserviced?.max)
          },
          serviced: {
            min: safeNum(obj?.plot_prices?.by_size?.['1_acre']?.serviced?.min),
            max: safeNum(obj?.plot_prices?.by_size?.['1_acre']?.serviced?.max)
          }
        }
      },
      near_highway_premium_pct: safeNum(obj?.plot_prices?.near_highway_premium_pct),
      trend_last_year_pct: safeNum(obj?.plot_prices?.trend_last_year_pct),
      source_notes: safeStr(obj?.plot_prices?.source_notes) || 'No source provided.'
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


