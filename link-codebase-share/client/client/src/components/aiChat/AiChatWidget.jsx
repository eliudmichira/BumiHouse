import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Search, 
  DollarSign, 
  MapPin, 
  Phone, 
  Calendar,
  Loader2,
  Sparkles
} from 'lucide-react';
import { sendChatMessage, quickResponses } from '../../services/aiChat';
import { getPropertyRecommendations, getNeighborhoodInsights, getInvestmentAnalysis } from '../../services/aiRecommendations';
import './AiChatWidget.scss';

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState({
    userType: 'buyer',
    location: 'Kenya',
    propertyType: 'any'
  });
  
  const [userPreferences, setUserPreferences] = useState({
    budget: { min: 0, max: 10000000 },
    location: 'Nairobi',
    propertyType: 'any',
    bedrooms: 'any',
    bathrooms: 'any',
    amenities: [],
    lifestyle: '',
    commute: '',
    family: false
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          type: 'ai',
          text: quickResponses.greeting,
          timestamp: new Date().toISOString(),
          suggestedActions: ['search_properties', 'get_recommendations', 'pricing_help', 'neighborhood_insights']
        }
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(message, { ...userContext, ...userPreferences });
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.text,
        timestamp: response.timestamp,
        suggestedActions: response.suggestedActions || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        suggestedActions: ['retry']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    let message = '';
    
    switch (action) {
      case 'search_properties':
        message = "I'd like to search for properties. Can you help me find a home?";
        break;
      case 'pricing_help':
        message = "What are the current property prices in Kenya? I need pricing guidance.";
        break;
      case 'agent_help':
        message = "I'd like to connect with a real estate agent. Can you help?";
        break;
      case 'location_info':
        message = "Tell me about different neighborhoods and areas in Kenya.";
        break;
      case 'schedule_viewing':
        message = "How can I schedule a property viewing?";
        break;
      case 'market_insights':
        message = "What are the current market trends and insights?";
        break;
      case 'get_recommendations':
        await handleGetRecommendations();
        return;
      case 'neighborhood_insights':
        await handleNeighborhoodInsights();
        return;
      case 'investment_analysis':
        await handleInvestmentAnalysis();
        return;
      default:
        message = "I need help with property search and information.";
    }

    handleSendMessage(message);
  };

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    
    try {
      const recommendations = await getPropertyRecommendations(userPreferences);
      
      const recommendationMessage = {
        id: Date.now(),
        type: 'ai',
        text: `Based on your preferences, here are my recommendations:\n\n${recommendations.reasoning}\n\nConfidence: ${recommendations.confidence}%`,
        timestamp: new Date().toISOString(),
        suggestedActions: ['search_properties', 'location_info', 'pricing_help'],
        recommendations: recommendations.recommendations
      };

      setMessages(prev => [...prev, recommendationMessage]);
    } catch (error) {
      console.error('Recommendation error:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        text: "I'm having trouble generating recommendations right now. Please try again.",
        timestamp: new Date().toISOString(),
        suggestedActions: ['retry']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNeighborhoodInsights = async () => {
    setIsLoading(true);
    
    try {
      const insights = await getNeighborhoodInsights(userPreferences.location);
      
      const insightsMessage = {
        id: Date.now(),
        type: 'ai',
        text: `Here's what I know about ${userPreferences.location}:\n\n${insights.overview}\n\nSafety: ${insights.safety}\nTransport: ${insights.transport}`,
        timestamp: new Date().toISOString(),
        suggestedActions: ['search_properties', 'get_recommendations', 'pricing_help'],
        neighborhoodInsights: insights
      };

      setMessages(prev => [...prev, insightsMessage]);
    } catch (error) {
      console.error('Neighborhood insights error:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        text: "I'm having trouble getting neighborhood information right now.",
        timestamp: new Date().toISOString(),
        suggestedActions: ['retry']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestmentAnalysis = async () => {
    setIsLoading(true);
    
    try {
      // For demo purposes, using a sample property
      const sampleProperty = {
        price: 5000000,
        location: userPreferences.location,
        bedrooms: 3,
        bathrooms: 2,
        type: 'apartment',
        area: 120
      };
      
      const analysis = await getInvestmentAnalysis(sampleProperty);
      
      const analysisMessage = {
        id: Date.now(),
        type: 'ai',
        text: `Investment Analysis:\n\n${analysis.analysis}\n\nROI: ${analysis.roi}\nConfidence: ${analysis.confidence}%`,
        timestamp: new Date().toISOString(),
        suggestedActions: ['search_properties', 'get_recommendations', 'pricing_help'],
        investmentAnalysis: analysis
      };

      setMessages(prev => [...prev, analysisMessage]);
    } catch (error) {
      console.error('Investment analysis error:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        text: "I'm having trouble analyzing investment potential right now.",
        timestamp: new Date().toISOString(),
        suggestedActions: ['retry']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea based on content
  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'search_properties':
        return <Search className="w-4 h-4" />;
      case 'pricing_help':
        return <DollarSign className="w-4 h-4" />;
      case 'agent_help':
        return <Phone className="w-4 h-4" />;
      case 'location_info':
        return <MapPin className="w-4 h-4" />;
      case 'schedule_viewing':
        return <Calendar className="w-4 h-4" />;
      case 'market_insights':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'search_properties':
        return 'Search Properties';
      case 'pricing_help':
        return 'Pricing Guide';
      case 'agent_help':
        return 'Contact Agent';
      case 'location_info':
        return 'Location Info';
      case 'schedule_viewing':
        return 'Schedule Viewing';
      case 'market_insights':
        return 'Market Insights';
      case 'get_recommendations':
        return 'Get Recommendations';
      case 'neighborhood_insights':
        return 'Neighborhood Info';
      case 'investment_analysis':
        return 'Investment Analysis';
      default:
        return 'Get Help';
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-chat-toggle"
        aria-label="Open AI Chat Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="ai-chat-toggle-text">AI Assistant</span>
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="ai-chat-widget">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-content">
              <div className="ai-chat-avatar">
                <Bot className="w-6 h-6" />
              </div>
              <div className="ai-chat-info">
                <h3>Hama Estate AI</h3>
                <p>Your Real Estate Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ai-chat-close"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-chat-message ${message.type === 'user' ? 'user' : 'ai'}`}
              >
                <div className="ai-chat-message-avatar">
                  {message.type === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div className="ai-chat-message-content">
                  <div className="ai-chat-message-text">{message.text}</div>
                  
                  {/* Property Recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="ai-chat-recommendations">
                      <h4 className="ai-chat-section-title">Recommended Properties</h4>
                      {message.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="ai-chat-recommendation-item">
                          <div className="ai-chat-recommendation-header">
                            <span className="ai-chat-recommendation-title">{rec.title}</span>
                            <span className="ai-chat-recommendation-score">{rec.match_score}% match</span>
                          </div>
                          <p className="ai-chat-recommendation-reasoning">{rec.reasoning}</p>
                          <div className="ai-chat-recommendation-details">
                            <span className="ai-chat-recommendation-price">{rec.price_range}</span>
                            <span className="ai-chat-recommendation-location">{rec.location_benefits}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Neighborhood Insights */}
                  {message.neighborhoodInsights && (
                    <div className="ai-chat-insights">
                      <h4 className="ai-chat-section-title">Neighborhood Insights</h4>
                      <div className="ai-chat-insights-grid">
                        {message.neighborhoodInsights.amenities && message.neighborhoodInsights.amenities.length > 0 && (
                          <div className="ai-chat-insight-section">
                            <h5>Key Amenities</h5>
                            <ul>
                              {message.neighborhoodInsights.amenities.slice(0, 5).map((amenity, index) => (
                                <li key={index}>{amenity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {message.neighborhoodInsights.pros && message.neighborhoodInsights.pros.length > 0 && (
                          <div className="ai-chat-insight-section">
                            <h5>Pros</h5>
                            <ul>
                              {message.neighborhoodInsights.pros.slice(0, 3).map((pro, index) => (
                                <li key={index}>{pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Investment Analysis */}
                  {message.investmentAnalysis && (
                    <div className="ai-chat-investment">
                      <h4 className="ai-chat-section-title">Investment Analysis</h4>
                      <div className="ai-chat-investment-details">
                        {message.investmentAnalysis.risks && message.investmentAnalysis.risks.length > 0 && (
                          <div className="ai-chat-investment-section">
                            <h5>Risks</h5>
                            <ul>
                              {message.investmentAnalysis.risks.slice(0, 3).map((risk, index) => (
                                <li key={index}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {message.investmentAnalysis.opportunities && message.investmentAnalysis.opportunities.length > 0 && (
                          <div className="ai-chat-investment-section">
                            <h5>Opportunities</h5>
                            <ul>
                              {message.investmentAnalysis.opportunities.slice(0, 3).map((opportunity, index) => (
                                <li key={index}>{opportunity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Suggested Actions */}
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="ai-chat-actions">
                      {message.suggestedActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action)}
                          className="ai-chat-action-btn"
                        >
                          {getActionIcon(action)}
                          <span>{getActionLabel(action)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="ai-chat-message ai">
                <div className="ai-chat-message-avatar">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="ai-chat-message-content">
                  <div className="ai-chat-loading">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-chat-input">
            <div className={`ai-chat-input-container ${isLoading ? 'loading' : ''}`}>
               <textarea
                 ref={inputRef}
                 value={inputMessage}
                 onChange={handleTextareaChange}
                 onKeyPress={handleKeyPress}
                 placeholder="Ask me about properties, pricing, or anything else..."
                 className="ai-chat-textarea"
                 rows={1}
                 disabled={isLoading}
                 style={{ height: '24px' }}
               />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="ai-chat-send-btn"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatWidget;
