// Lightweight Gemini client using fetch. No extra deps required.
// Reads API key from Vite env: VITE_GEMINI_API_KEY



const GEMINI_API_KEY = (import.meta?.env?.VITE_GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

function buildPrompt(area) {
  const region = area && area.trim().length > 0 ? area.trim() : 'Nairobi, Kenya';
  return `You are a Kenyan real estate market analyst. Return CURRENT, realistic, Kenya-specific figures for the area provided.

AREA: ${region}

Return STRICT JSON only, no markdown, matching this schema exactly:
{
  "area": string,                  // canonical area name you used
  "summary": string,               // 1-2 lines summary of the market
  "counts": { "homes": number },  // estimated active listings
  "rent": {
    "currency": "KES",
    "avg_range": { "min": number, "max": number }, // monthly
    "by_type": {
      "1BR": { "min": number, "max": number },
      "2BR": { "min": number, "max": number },
      "3BR": { "min": number, "max": number }
    }
  },
  "bank_rates": {
    "commercial_banks": { "min_pct": number, "max_pct": number, "max_tenor_years": number },
    "saccos": { "min_pct": number, "max_pct": number }
  },
  "hotspots": string[],           // top 3-6 nearby hotspots/estates
  "gov_loans": { "available": boolean, "notes": string }
}

Constraints:
- Use Kenya mortgage context (CBK, SACCOs). If unsure, give conservative ranges.
- Prefer nearby estates/settlements as hotspots (e.g., Westlands, Kilimani, Ruaka, Syokimau, Kitengela, Ngong, etc. when area is Nairobi).
- If data is unavailable, infer from reputable public trends and clearly keep ranges.`;
}

/**
 * Call Gemini to get structured market insights for a Kenyan area
 * @param {string} area
 * @returns {Promise<object>} normalized insights object
 */
export async function fetchMarketInsights(area) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
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
      maxOutputTokens: 800
    }
  };

  const res = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';

  // The model may sometimes wrap JSON in code fences; strip them.
  let cleaned = text
    .replace(/^```(json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  // Find the first complete JSON object by looking for the last closing brace
  const lastBraceIndex = cleaned.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    cleaned = cleaned.substring(0, lastBraceIndex + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  return normalize(parsed);
}

function normalize(obj) {
  const safeNum = (n) => (typeof n === 'number' && isFinite(n) ? n : undefined);

  return {
    area: obj?.area,
    summary: obj?.summary,
    counts: { homes: safeNum(obj?.counts?.homes) },
    rent: obj?.rent
      ? {
          currency: obj?.rent?.currency || 'KES',
          avg_range: {
            min: safeNum(obj?.rent?.avg_range?.min),
            max: safeNum(obj?.rent?.avg_range?.max)
          },
          by_type: {
            '1BR': { min: safeNum(obj?.rent?.by_type?.['1BR']?.min), max: safeNum(obj?.rent?.by_type?.['1BR']?.max) },
            '2BR': { min: safeNum(obj?.rent?.by_type?.['2BR']?.min), max: safeNum(obj?.rent?.by_type?.['2BR']?.max) },
            '3BR': { min: safeNum(obj?.rent?.by_type?.['3BR']?.min), max: safeNum(obj?.rent?.by_type?.['3BR']?.max) }
          }
        }
      : undefined,
    bank_rates: obj?.bank_rates
      ? {
          commercial_banks: {
            min_pct: safeNum(obj?.bank_rates?.commercial_banks?.min_pct),
            max_pct: safeNum(obj?.bank_rates?.commercial_banks?.max_pct),
            max_tenor_years: safeNum(obj?.bank_rates?.commercial_banks?.max_tenor_years)
          },
          saccos: {
            min_pct: safeNum(obj?.bank_rates?.saccos?.min_pct),
            max_pct: safeNum(obj?.bank_rates?.saccos?.max_pct)
          }
        }
      : undefined,
    hotspots: Array.isArray(obj?.hotspots) ? obj.hotspots.slice(0, 6) : undefined,
    gov_loans: obj?.gov_loans
      ? {
          available: typeof obj?.gov_loans?.available === 'boolean' ? obj.gov_loans.available : undefined,
          notes: obj?.gov_loans?.notes
        }
      : undefined
  };
}

export function formatKes(amount) {
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `KSh ${Math.round(amount).toLocaleString()}`;
  }
}


