// AI Property Recommendations Service
// Uses Gemini API to analyze user preferences and suggest relevant properties

const GEMINI_API_KEY = (import.meta?.env?.VITE_GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Get AI-powered property recommendations based on user preferences
 * @param {object} preferences - User preferences
 * @param {array} availableProperties - Available properties to recommend from
 * @returns {Promise<object>} AI recommendations with reasoning
 */
export async function getPropertyRecommendations(preferences, availableProperties = []) {
  if (!GEMINI_API_KEY) {
    return {
      recommendations: [],
      reasoning: "AI recommendations are currently unavailable.",
      confidence: 0
    };
  }

  try {
    const prompt = buildRecommendationPrompt(preferences, availableProperties);
    
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    };

    const res = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`AI service error: ${res.status}`);
    }

    const data = await res.json();
    const response = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return parseRecommendationResponse(response, availableProperties);

  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return {
      recommendations: [],
      reasoning: "I'm having trouble analyzing your preferences right now. Please try again.",
      confidence: 0
    };
  }
}

function buildRecommendationPrompt(preferences, availableProperties) {
  const {
    budget = { min: 0, max: 10000000 },
    location = 'Nairobi',
    propertyType = 'any',
    bedrooms = 'any',
    bathrooms = 'any',
    amenities = [],
    lifestyle = '',
    commute = '',
    family = false
  } = preferences;

  const propertyContext = availableProperties.length > 0 
    ? `AVAILABLE PROPERTIES: ${JSON.stringify(availableProperties.slice(0, 10))}`
    : '';

  return `You are a Kenyan real estate expert. Analyze the user's preferences and provide personalized property recommendations.

USER PREFERENCES:
- Budget: KSh ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}
- Location: ${location}
- Property Type: ${propertyType}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Amenities: ${amenities.join(', ')}
- Lifestyle: ${lifestyle}
- Commute: ${commute}
- Family: ${family ? 'Yes' : 'No'}

${propertyContext}

INSTRUCTIONS:
1. Analyze the preferences and suggest 3-5 best matches
2. Provide reasoning for each recommendation
3. Consider Kenyan market context and cultural factors
4. Include price ranges and location benefits
5. Suggest alternative areas if needed
6. Provide confidence score (0-100)

Return JSON format:
{
  "recommendations": [
    {
      "id": "string",
      "title": "string",
      "reasoning": "string",
      "price_range": "string",
      "location_benefits": "string",
      "match_score": number
    }
  ],
  "reasoning": "string",
  "confidence": number,
  "alternative_areas": ["string"],
  "tips": ["string"]
}`;
}

function parseRecommendationResponse(response, availableProperties) {
  try {
    // Clean the response
    let cleaned = response
      .replace(/^```(json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    // Find the first complete JSON object
    const lastBraceIndex = cleaned.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      cleaned = cleaned.substring(0, lastBraceIndex + 1);
    }

    const parsed = JSON.parse(cleaned);
    
    return {
      recommendations: parsed.recommendations || [],
      reasoning: parsed.reasoning || "Based on your preferences, here are some recommendations.",
      confidence: parsed.confidence || 70,
      alternativeAreas: parsed.alternative_areas || [],
      tips: parsed.tips || []
    };

  } catch (error) {
    console.error('Failed to parse AI recommendation response:', error);
    return {
      recommendations: [],
      reasoning: "I found some properties that might interest you based on your preferences.",
      confidence: 50,
      alternativeAreas: [],
      tips: []
    };
  }
}

/**
 * Get AI-powered neighborhood insights
 * @param {string} area - Area name
 * @returns {Promise<object>} Neighborhood analysis
 */
export async function getNeighborhoodInsights(area) {
  if (!GEMINI_API_KEY) {
    return {
      insights: "Neighborhood insights are currently unavailable.",
      amenities: [],
      safety: "Information not available",
      transport: "Information not available"
    };
  }

  try {
    const prompt = `You are a Kenyan real estate expert. Provide detailed insights about ${area}, Kenya.

INSTRUCTIONS:
1. Describe the neighborhood character and vibe
2. List key amenities (schools, hospitals, shopping, etc.)
3. Assess safety and security
4. Describe transport options and connectivity
5. Mention any development plans or trends
6. Provide pros and cons

Return JSON format:
{
  "overview": "string",
  "amenities": ["string"],
  "safety": "string",
  "transport": "string",
  "pros": ["string"],
  "cons": ["string"],
  "trends": "string"
}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
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
      throw new Error(`AI service error: ${res.status}`);
    }

    const data = await res.json();
    const response = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return parseNeighborhoodResponse(response);

  } catch (error) {
    console.error('AI Neighborhood Error:', error);
    return {
      overview: `I don't have detailed information about ${area} right now.`,
      amenities: [],
      safety: "Information not available",
      transport: "Information not available",
      pros: [],
      cons: [],
      trends: "Information not available"
    };
  }
}

function parseNeighborhoodResponse(response) {
  try {
    let cleaned = response
      .replace(/^```(json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    const lastBraceIndex = cleaned.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      cleaned = cleaned.substring(0, lastBraceIndex + 1);
    }

    const parsed = JSON.parse(cleaned);
    
    return {
      overview: parsed.overview || "Neighborhood information not available.",
      amenities: parsed.amenities || [],
      safety: parsed.safety || "Safety information not available.",
      transport: parsed.transport || "Transport information not available.",
      pros: parsed.pros || [],
      cons: parsed.cons || [],
      trends: parsed.trends || "Trend information not available."
    };

  } catch (error) {
    console.error('Failed to parse neighborhood response:', error);
    return {
      overview: "I couldn't process the neighborhood information properly.",
      amenities: [],
      safety: "Information not available",
      transport: "Information not available",
      pros: [],
      cons: [],
      trends: "Information not available"
    };
  }
}

/**
 * Get AI-powered investment analysis
 * @param {object} property - Property details
 * @returns {Promise<object>} Investment analysis
 */
export async function getInvestmentAnalysis(property) {
  if (!GEMINI_API_KEY) {
    return {
      analysis: "Investment analysis is currently unavailable.",
      roi: "Information not available",
      risks: [],
      recommendations: []
    };
  }

  try {
    const prompt = `You are a Kenyan real estate investment expert. Analyze this property for investment potential:

PROPERTY DETAILS:
${JSON.stringify(property, null, 2)}

INSTRUCTIONS:
1. Analyze investment potential and ROI
2. Identify risks and opportunities
3. Provide investment recommendations
4. Consider Kenyan market context
5. Suggest optimal holding period

Return JSON format:
{
  "analysis": "string",
  "roi": "string",
  "risks": ["string"],
  "opportunities": ["string"],
  "recommendations": ["string"],
  "holding_period": "string",
  "confidence": number
}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800
      }
    };

    const res = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`AI service error: ${res.status}`);
    }

    const data = await res.json();
    const response = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return parseInvestmentResponse(response);

  } catch (error) {
    console.error('AI Investment Error:', error);
    return {
      analysis: "I'm unable to provide investment analysis at the moment.",
      roi: "Information not available",
      risks: [],
      opportunities: [],
      recommendations: [],
      holdingPeriod: "Information not available",
      confidence: 0
    };
  }
}

function parseInvestmentResponse(response) {
  try {
    let cleaned = response
      .replace(/^```(json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    const lastBraceIndex = cleaned.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      cleaned = cleaned.substring(0, lastBraceIndex + 1);
    }

    const parsed = JSON.parse(cleaned);
    
    return {
      analysis: parsed.analysis || "Investment analysis not available.",
      roi: parsed.roi || "ROI information not available.",
      risks: parsed.risks || [],
      opportunities: parsed.opportunities || [],
      recommendations: parsed.recommendations || [],
      holdingPeriod: parsed.holding_period || "Information not available.",
      confidence: parsed.confidence || 50
    };

  } catch (error) {
    console.error('Failed to parse investment response:', error);
    return {
      analysis: "I couldn't process the investment analysis properly.",
      roi: "Information not available",
      risks: [],
      opportunities: [],
      recommendations: [],
      holdingPeriod: "Information not available",
      confidence: 0
    };
  }
}
