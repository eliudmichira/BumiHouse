// AI Chat Assistant Service using Gemini API
// Provides intelligent responses for property inquiries and customer support

const GEMINI_API_KEY = (import.meta?.env?.VITE_GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Chat context and conversation history
let conversationHistory = [];

function buildChatPrompt(message, context = {}) {
  const { 
    userType = 'buyer', 
    location = 'Kenya', 
    propertyType = 'any',
    budget = { min: 0, max: 10000000 },
    bedrooms = 'any',
    bathrooms = 'any',
    amenities = [],
    lifestyle = '',
    family = false
  } = context;
  
  return `You are Hama Estate's AI assistant, a helpful and knowledgeable real estate expert in Kenya. You help users find properties, understand the market, and navigate the home buying/renting process.

USER CONTEXT:
- User Type: ${userType}
- Preferred Location: ${location}
- Property Type: ${propertyType}
- Budget: KSh ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Amenities: ${amenities.join(', ') || 'Any'}
- Lifestyle: ${lifestyle || 'Not specified'}
- Family: ${family ? 'Yes' : 'No'}

PLATFORM: Hama Estate (Kenya's premier real estate platform)

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

USER MESSAGE: ${message}

INSTRUCTIONS:
1. Provide helpful, accurate information about Kenyan real estate
2. Be friendly, professional, and culturally appropriate
3. Use the user's preferences to provide personalized advice
4. If asked about specific properties, suggest using the search feature
5. For pricing questions, provide general market ranges based on their budget
6. For legal questions, recommend consulting professionals
7. Keep responses concise but informative
8. Ask follow-up questions to better understand user needs
9. Suggest relevant features like property recommendations, neighborhood insights, or investment analysis
10. If they mention specific areas, provide insights about those neighborhoods

RESPONSE:`;
}

/**
 * Send a message to the AI chat assistant
 * @param {string} message - User's message
 * @param {object} context - Additional context (user type, location, etc.)
 * @returns {Promise<object>} AI response with text and suggested actions
 */
export async function sendChatMessage(message, context = {}) {
  if (!GEMINI_API_KEY) {
    return {
      text: "I'm sorry, the AI assistant is currently unavailable. Please contact our support team for assistance.",
      suggestedActions: ['contact_support']
    };
  }

  try {
    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: buildChatPrompt(message, context) }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
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
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t process your request. Please try again.';

    // Add AI response to history
    conversationHistory.push({ role: 'assistant', content: aiResponse });

    // Keep conversation history manageable (last 10 messages)
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    // Analyze response for suggested actions
    const suggestedActions = analyzeForActions(aiResponse, message);

    return {
      text: aiResponse,
      suggestedActions,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('AI Chat Error:', error);
    return {
      text: "I'm experiencing technical difficulties. Please try again in a moment or contact our support team.",
      suggestedActions: ['contact_support', 'retry']
    };
  }
}

/**
 * Analyze AI response and user message for suggested actions
 */
function analyzeForActions(aiResponse, userMessage) {
  const actions = [];
  const message = (userMessage + ' ' + aiResponse).toLowerCase();

  if (message.includes('search') || message.includes('find') || message.includes('property')) {
    actions.push('search_properties');
  }

  if (message.includes('price') || message.includes('cost') || message.includes('budget')) {
    actions.push('price_guide');
  }

  if (message.includes('location') || message.includes('area') || message.includes('neighborhood')) {
    actions.push('location_info');
  }

  if (message.includes('agent') || message.includes('contact') || message.includes('help')) {
    actions.push('contact_agent');
  }

  if (message.includes('schedule') || message.includes('viewing') || message.includes('visit')) {
    actions.push('schedule_viewing');
  }

  if (message.includes('market') || message.includes('trend') || message.includes('analysis')) {
    actions.push('market_insights');
  }

  return actions;
}

/**
 * Clear conversation history
 */
export function clearChatHistory() {
  conversationHistory = [];
}

/**
 * Get conversation history
 */
export function getChatHistory() {
  return [...conversationHistory];
}

/**
 * Predefined responses for common queries
 */
export const quickResponses = {
  greeting: "Hello! I'm Hama Estate's AI assistant. How can I help you find your dream home today? I can help with property search, recommendations, neighborhood insights, and investment analysis!",
  search_help: "I can help you search for properties! What type of property are you looking for (buy/rent) and in which area?",
  pricing_help: "Property prices in Kenya vary by location. In Nairobi, you can find 1-bedroom apartments from KSh 25,000/month for rent, or KSh 3M+ to buy. Would you like me to search for properties in your budget?",
  agent_help: "I can connect you with our verified agents! They can provide personalized assistance and schedule property viewings. Would you like me to help you find an agent in your preferred area?",
  recommendations: "I can provide personalized property recommendations based on your preferences! Would you like me to analyze your needs and suggest the best properties for you?",
  neighborhood: "I can provide detailed insights about any neighborhood in Kenya! Just tell me which area you're interested in, and I'll share information about amenities, safety, transport, and more.",
  investment: "I can analyze properties for investment potential! I'll look at ROI, market trends, risks, and opportunities to help you make informed investment decisions."
};
