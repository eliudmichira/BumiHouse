import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './propertyDetails.scss';
import useAnalytics from '../../hooks/useAnalytics';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Phone, 
  Mail, 
  MapPin, 
  Bed, 
  Bath, 
  Building2, 
  Car, 
  Star, 
  Calendar,
  DollarSign,
  Users,
  Home,
  School,
  TrendingUp,
  Clock,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Star as StarIcon,
  X,
  MessageCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getProperty } from '../../utils/api';
import { useProperty } from '../../hooks/useProperties';
import { messagesAPI } from '../../lib/firebaseAPI';
import { incrementPropertyView } from '../../lib/propertyViews';
import { getPropertyImages, handleImageError } from '../../utils/imageUtils';
import ApartmentVacancyDisplay from '../../components/ApartmentVacancyDisplay';
import { vacancyService } from '../../services/vacancyService';

// Toast notification system
const showToast = (options) => {
  const toast = document.createElement('div');
  toast.className = `fixed top-6 right-6 z-[9999] transform transition-all duration-500 ease-out`;
  
  toast.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl p-5 min-w-[300px] max-w-[400px] ${
      options.type === 'error' 
        ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' 
        : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600'
    } text-white shadow-2xl backdrop-blur-xl border border-white/20">
      <!-- Animated background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]"></div>
      </div>
      
      <!-- Content -->
      <div class="relative flex items-start gap-4">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-sm tracking-wide mb-1">${options.title}</div>
          <div class="text-xs opacity-90 leading-relaxed">${options.message}</div>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div class="h-full bg-white/60 animate-[progress_4s_linear]"></div>
      </div>
    </div>
  `;
  
  // Add custom CSS for progress animation
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initial position (off-screen)
  toast.style.transform = 'translateX(120%) scale(0.8)';
  toast.style.opacity = '0';
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0) scale(1)';
    toast.style.opacity = '1';
  }, 50);
  
  // Animate out
  setTimeout(() => {
    toast.style.transform = 'translateX(120%) scale(0.8)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 500);
  }, 4000);
};

// Photo Gallery Component
function PhotoGallery({ images = [], title }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const { isDark } = useTheme();

  // Get properly formatted images using utility function
  const propertyImages = getPropertyImages({ images });
  
  // Handle image loading errors
  const handleImageLoadError = (imageIndex) => {
    setImageErrors(prev => new Set(prev).add(imageIndex));
  };
  
  // Filter out images that failed to load
  const validImages = propertyImages.filter((_, index) => !imageErrors.has(index));
  
  // Reset current image when valid images change
  useEffect(() => {
    if (currentImage >= validImages.length && validImages.length > 0) {
      setCurrentImage(0);
    }
  }, [validImages.length, currentImage]);

  const nextImage = () => {
    if (validImages.length > 1) {
      setCurrentImage((prev) => (prev + 1) % validImages.length);
    }
  };

  const prevImage = () => {
    if (validImages.length > 1) {
      setCurrentImage((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // If no valid images, show placeholder
  if (validImages.length === 0) {
    return (
      <div className="relative h-96 md:h-[500px] overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {propertyImages.length === 0 ? 'No images available' : 'Images failed to load'}
          </p>
          {propertyImages.length > 0 && (
            <button
              onClick={() => setImageErrors(new Set())}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry Loading Images
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative h-96 md:h-[500px] overflow-hidden rounded-2xl">
                 <img
           src={validImages[currentImage]}
           alt={`${title} - Image ${currentImage + 1}`}
           loading="lazy"
           decoding="async"
           className="w-full h-full object-cover"
           onError={(e) => handleImageError(e, validImages[currentImage])}
         />
        
                 {/* Navigation Arrows - only show if multiple images */}
         {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
                isDark ? 'bg-[#0a0c19]/70 hover:bg-[#0a0c19]/90 text-white' : 'bg-white/80 hover:bg-white text-gray-900'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
                isDark ? 'bg-[#0a0c19]/70 hover:bg-[#0a0c19]/90 text-white' : 'bg-white/80 hover:bg-white text-gray-900'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Counter */}
                         <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm backdrop-blur-sm ${
               isDark ? 'bg-[#0a0c19]/70 text-white' : 'bg-black/50 text-white'
             }`}>
               {currentImage + 1} of {validImages.length}
             </div>
          </>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`absolute bottom-4 right-4 p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
            isDark ? 'bg-[#0a0c19]/70 hover:bg-[#0a0c19]/90 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
          }`}
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

             {/* Thumbnail Gallery */}
       {validImages.length > 1 && (
         <div className="mt-4 flex gap-2 overflow-x-auto">
           {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentImage === index
                  ? 'border-[#51faaa]'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full p-4">
                         <img
               src={validImages[currentImage]}
               alt={`${title} - Fullscreen`}
               loading="eager"
               decoding="async"
               className="max-w-full max-h-full object-contain"
             />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/30 transition-all duration-200"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/30 transition-all duration-200"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Agent Contact Card Component
function AgentContactCard({ agent = {}, propertyId, propertyTitle }) {
  const { isDark } = useTheme();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);

  // Build an SVG avatar when no agent photo is available
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'A';
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p.charAt(0).toUpperCase()).join('') || 'A';
  };

  const buildSvgAvatar = (name) => {
    const initials = getInitials(name);
    const bg = isDark ? '#0a0c19' : '#51faaa';
    const fg = isDark ? '#51faaa' : '#0a0c19';
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
  <rect width="150" height="150" rx="16" fill="${bg}"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="700" fill="${fg}">${initials}</text>
</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const handleSendMessage = async () => {
    console.log('handleSendMessage called with propertyId:', propertyId, 'propertyTitle:', propertyTitle);
    
    if (!currentUser) {
      showToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to send a message to the agent.'
      });
      navigate('/desktop/login', { state: { from: window.location.pathname } });
      return;
    }

    // If agent doesn't have an ID, we'll use the current user as the agent
    // This handles cases where properties were added without proper agent ID
    const agentId = agent.id || agent?.userId || agent?.agentId;
    
    if (!agentId) {
      showToast({
        type: 'error',
        title: 'Agent Not Found',
        message: 'Agent information is not available for this property.'
      });
      return;
    }

    setIsSending(true);

    try {
      // Check if conversation already exists
      const existingConversations = await messagesAPI.getConversations(currentUser.id);
      let conversationId = null;

      // Look for existing conversation with this agent
      for (const conv of existingConversations.conversations) {
        if (conv.participants && conv.participants.includes(agentId)) {
          conversationId = conv.id;
          break;
        }
      }

      // Create new conversation if none exists
      if (!conversationId) {
        console.log('Creating conversation with participants:', [currentUser.id, agentId], 'propertyId:', propertyId);
        conversationId = await messagesAPI.createConversation([currentUser.id, agentId], propertyId);
        console.log('Created conversation with ID:', conversationId);
      }

      // Send initial message
      const initialMessage = {
        senderId: currentUser.id,
        text: `Hi! I'm interested in the property "${propertyTitle}". Could you please provide more information?`,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      await messagesAPI.sendMessage(conversationId, initialMessage);

      showToast({
        type: 'success',
        title: 'Message Sent Successfully!',
        message: `Your message has been sent to ${agent.name || 'the agent'}. You can view your conversations in the Messages section.`
      });

      // Navigate to messages page after a short delay
      setTimeout(() => {
        navigate('/messages');
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: 'error',
        title: 'Failed to Send Message',
        message: 'There was an error sending your message. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCallAgent = () => {
    if (agent.phone) {
      window.location.href = `tel:${agent.phone}`;
    } else {
      showToast({
        type: 'error',
        title: 'Phone Not Available',
        message: 'Phone number is not available for this agent.'
      });
    }
  };

  const handleEmailAgent = () => {
    if (agent.email) {
      window.location.href = `mailto:${agent.email}?subject=Inquiry about ${propertyTitle}`;
    } else {
      showToast({
        type: 'error',
        title: 'Email Not Available',
        message: 'Email address is not available for this agent.'
      });
    }
  };



  return (
    <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border transition-colors duration-300`}>
      <div className="text-center mb-4">
        <img
          src={agent.image || agent.photo || agent.avatar || buildSvgAvatar(agent.name)}
          alt={agent.name || "Agent"}
          className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
        />
        <h3 className={`text-lg font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
          {agent.name || "Contact Agent"}
        </h3>
        <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
          {agent.email || "agent@hamaestate.com"}
        </p>
      </div>
      
      <div className="space-y-3">
        <button 
          onClick={handleCallAgent}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-outfit font-medium transition-all duration-200 ${
            isDark 
              ? 'bg-[#51faaa] text-[#0a0c19] hover:bg-[#45e595]' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Phone className="w-4 h-4" />
          {agent.phone || "+254 700 000 000"}
        </button>
        
        <button 
          onClick={handleSendMessage}
          disabled={isSending}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-outfit font-medium transition-all duration-200 ${
            isSending
              ? 'opacity-50 cursor-not-allowed'
              : isDark 
                ? 'border border-[#51faaa] text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
          }`}
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              Send Message
            </>
          )}
        </button>

        <button 
          onClick={handleEmailAgent}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-outfit font-medium transition-all duration-200 ${
            isDark 
              ? 'border border-[#51faaa] text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
              : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          Send Email
        </button>
      </div>
    </div>
  );
}

// School Ratings Component
function SchoolRatings({ schools = [] }) {
  const { isDark } = useTheme();

  // If no schools data, show placeholder
  if (!Array.isArray(schools) || schools.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className={`text-lg font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Nearby Schools</h3>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
            School information not available for this property.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Nearby Schools</h3>
      {schools.map((school, index) => (
        <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-blue-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{school.name}</h4>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className={`text-sm font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{school.rating}</span>
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{school.distance} miles away</p>
        </div>
      ))}
    </div>
  );
}

// Neighborhood Info Component
function NeighborhoodInfo({ neighborhood = {} }) {
  const { isDark } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Neighborhood</h3>
      <div className={`p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-blue-50'}`}>
        <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
          {neighborhood.description || "Neighborhood information not available for this property."}
        </p>
      </div>
    </div>
  );
}

// Property History Component
function PropertyHistory({ history = [] }) {
  const { isDark } = useTheme();

  // If no history data, show placeholder
  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className={`text-lg font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Property History</h3>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
            Property history not available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Property History</h3>
      {history.map((event, index) => (
        <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-blue-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{event.type}</h4>
            <span className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{event.date}</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{event.description}</p>
        </div>
      ))}
    </div>
  );
}

// Similar Properties Component
function SimilarProperties({ properties = [] }) {
  const { isDark } = useTheme();

  // If no similar properties, don't render
  if (!Array.isArray(properties) || properties.length === 0) {
    return null;
  }

  return (
    <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border transition-colors duration-300`}>
      <h3 className={`text-lg font-outfit font-semibold mb-4 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Similar Properties</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map((property, index) => (
          <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-gray-50'}`}>
            <h4 className={`font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{property.title}</h4>
            <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{property.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Location Card Component
function LocationCard({ latitude, longitude, address }) {
  const { isDark } = useTheme();

  // Create embeddable map URL (no API key required)
  const hasCoords = Number.isFinite(parseFloat(latitude)) && Number.isFinite(parseFloat(longitude));
  const qParam = hasCoords
    ? `${parseFloat(latitude)},${parseFloat(longitude)}`
    : encodeURIComponent(address || 'Nairobi, Kenya');
  const mapEmbedSrc = hasCoords
    ? `https://www.google.com/maps?q=${qParam}&z=14&output=embed`
    : `https://www.google.com/maps?q=${qParam}&z=14&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${qParam}`;

  return (
    <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl border transition-colors duration-300`}>
      <div className={`p-6 border-b ${isDark ? 'border-[rgba(81,250,170,0.1)]' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-outfit font-semibold mb-2 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Location</h3>
        <p className={`px-6 text-sm mb-3 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{address || 'Address not available'}</p>
      </div>

      {/* Map */}
      <div className="w-full h-64">
        <iframe
          title="Property Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapEmbedSrc}
        />
      </div>

      {/* Clickable Link */}
      <div className={`px-6 py-3 border-t text-center ${
        isDark 
          ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)]' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#51faaa] font-outfit font-semibold hover:underline"
        >
          View on Google Maps
        </a>
      </div>
    </div>
  );
}

// Main Property Details Component
function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [property, setProperty] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { isDark } = useTheme();
  const { trackPropertyView } = useAnalytics();

  let {data, isLoading, isError} = useProperty(id)

  // Handle vacancy updates for apartment complexes
  const handleVacancyUpdate = async (propertyId, vacancyData) => {
    try {
      // Call the actual API to update vacancy data
      await vacancyService.updateVacancyData(propertyId, vacancyData);
      
      showToast({
        type: 'success',
        title: 'Vacancy Updated',
        message: 'Apartment vacancy information has been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating vacancy data:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update vacancy information. Please try again.'
      });
    }
  };

  useEffect(() => {
    console.log({ id, isLoading, isError, data });

    if (data) {
      setProperty(data);
      // Track property view for analytics
      trackPropertyView(data);
      // Increment view count in database
      incrementPropertyView(id);
    }
    
  }, [data, id, trackPropertyView]);

  console.log(data)

  if (!property) {
    return (
      <div className={`min-h-screen pt-32 pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`w-16 h-16 ${isDark ? 'bg-[#10121e]' : 'bg-gray-200'} rounded-full mx-auto mb-4 animate-pulse`}></div>
            <div className={isDark ? 'text-[#ccc]' : 'text-gray-500'}>Loading property details...</div>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Safe property data with fallbacks
  const safeProperty = {
    title: property.title || 'Property Title Not Available',
    description: property.description || 'No description available.',
    price: property.price || 0,
    address: property.location?.address || property.address || 'Address not available',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 0,
    lotSize: property.lotSize || null,
    type: property.type || 'Property',
    status: property.status || 'For Sale',
    images: Array.isArray(property.images) ? property.images : [],
    features: Array.isArray(property.features) ? property.features : [],
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    agent: property.agent || {},
    days_on_market: property.days_on_market || 0,
    pricePerSqft: property.area ? Math.round((property.price || 0) / property.area) : 0,
    latitude: property.location?.coordinates?.lat || -1.2921,
    longitude: property.location?.coordinates?.lng || 36.8219,
    schools: property.schools || [],
    neighborhood: property.neighborhood || {},
    property_history: property.property_history || [],
    similar_properties: property.similar_properties || [],
    listing_type: property.listing_type || property.type || 'Residential',
    yearBuilt: property.yearBuilt || null,
    parkingSpaces: property.parking != null ? parseInt(property.parking) : null,
    // Vacancy tracking fields for apartment complexes
    totalUnits: property.totalUnits || 0,
    availableUnits: property.availableUnits || 0,
    unitTypes: property.unitTypes || [],
    nextVacancyDate: property.nextVacancyDate || null,
    waitlistCount: property.waitlistCount || 0,
    averageRent: property.averageRent || 0,
    lastVacancyUpdate: property.lastVacancyUpdate || null,
    vacancyNotes: property.vacancyNotes || '',
  };

  return (
    <div className={`min-h-screen pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}> 

      {/* Header */}
      <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.1)]' : 'bg-white border-gray-200'} border-b sticky top-0 z-20 pt-4`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 transition-colors font-outfit ${
                isDark ? 'text-[#ccc] hover:text-[#51faaa]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Search</span>
            </button>
            <div className="flex items-center gap-3">
              <button className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-[#ccc] hover:text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : isDark 
                      ? 'text-[#ccc] hover:text-red-500 hover:bg-red-500/10' 
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <PhotoGallery images={safeProperty.images} title={safeProperty.title} />

            {/* Property Info */}
            <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border transition-colors duration-300`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className={`text-3xl font-outfit font-bold mb-2 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.title}</h1>
                  <p className={`text-xl mb-4 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{safeProperty.address}</p>
                  <div className={`text-3xl font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{formatPrice(safeProperty.price)}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm mb-1 ${isDark ? 'text-[#ccc]' : 'text-gray-500'}`}>{safeProperty.days_on_market} days on market</div>
                  {(String(safeProperty.type).toLowerCase() !== 'apartment' && safeProperty.pricePerSqft > 0) && (
                    <div className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{formatPrice(safeProperty.pricePerSqft)}/sqft</div>
                  )}
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-blue-50'}`}>
                  <Bed className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-[#51faaa]' : 'text-blue-600'}`} />
                  <div className={`text-xl font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.bedrooms}</div>
                  <div className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Bedrooms</div>
                </div>
                <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-green-50'}`}>
                  <Bath className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-[#51faaa]' : 'text-green-600'}`} />
                  <div className={`text-xl font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.bathrooms}</div>
                  <div className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Bathrooms</div>
                </div>
                <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-purple-50'}`}>
                  <Building2 className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-[#51faaa]' : 'text-purple-600'}`} />
                  <div className={`text-xl font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.area.toLocaleString()}</div>
                  <div className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Sq Ft</div>
                </div>
                <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-orange-50'}`}>
                  <Car className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-[#51faaa]' : 'text-orange-600'}`} />
                  <div className={`text-xl font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.parkingSpaces ?? '—'}</div>
                  <div className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Parking</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className={`text-lg font-outfit font-semibold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Description</h3>
                <p className={`leading-relaxed ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>{safeProperty.description}</p>
              </div>

              {/* Features */}
              {safeProperty.features.length > 0 && (
                <div>
                  <h3 className={`text-lg font-outfit font-semibold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {safeProperty.features.map((feature, index) => (
                      <div key={index} className={`flex items-center gap-2 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                        <div className="w-2 h-2 bg-[#51faaa] rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

                                                       {/* Amenities */}
              {safeProperty.amenities.length > 0 && (
                <div className="mt-6">
                  <h3 className={`text-lg font-outfit font-semibold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {safeProperty.amenities.map((amenity, index) => (
                      <div key={index} className={`flex items-center gap-2 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                        <div className="w-2 h-2 bg-[#51faaa] rounded-full"></div>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Apartment Vacancy Display */}
            {console.log('Vacancy Debug:', {
              property_type: property?.type,
              safeProperty_type: safeProperty.type,
              safeProperty_listing_type: safeProperty.listing_type,
              condition: (property?.type?.toLowerCase() === 'apartment' || safeProperty.listing_type?.toLowerCase() === 'apartment' || safeProperty.type?.toLowerCase() === 'apartment')
            })}
            {(property?.type?.toLowerCase() === 'apartment' || safeProperty.listing_type?.toLowerCase() === 'apartment' || safeProperty.type?.toLowerCase() === 'apartment' || 'apartment' === 'apartment') ? (
              <ApartmentVacancyDisplay 
                property={safeProperty}
                onVacancyUpdate={handleVacancyUpdate}
                isEditable={true}
              />
            ) : (
              <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border transition-colors duration-300`}>
                <div className="text-center">
                  <h3 className={`text-lg font-outfit font-semibold mb-2 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Vacancy Information</h3>
                  <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                    Property type: {safeProperty.type} | Listing type: {safeProperty.listing_type}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                    Vacancy display requires property type or listing type to be "apartment"
                  </p>
                  <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                    Raw property.type: {property?.type || 'undefined'}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                    Condition result: {(property?.type?.toLowerCase() === 'apartment' || safeProperty.listing_type?.toLowerCase() === 'apartment' || safeProperty.type?.toLowerCase() === 'apartment') ? 'TRUE' : 'FALSE'}
                  </p>
                </div>
              </div>
            )}



            {/* Tabs */}
            <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl border transition-colors duration-300`}>
              <div className={`border-b ${isDark ? 'border-[rgba(81,250,170,0.1)]' : 'border-gray-200'}`}>
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: Home },
                    { id: 'schools', label: 'Schools', icon: School },
                    { id: 'neighborhood', label: 'Neighborhood', icon: MapPin },
                    { id: 'history', label: 'History', icon: TrendingUp }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-outfit font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-[#51faaa] text-[#51faaa]'
                          : isDark 
                            ? 'border-transparent text-[#ccc] hover:text-[#51faaa] hover:border-[rgba(81,250,170,0.3)]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-lg font-outfit font-semibold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Property Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Type:</span>
                          <span className={`ml-2 font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.listing_type}</span>
                        </div>
                        {safeProperty.yearBuilt && (
                          <div>
                            <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Year Built:</span>
                            <span className={`ml-2 font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.yearBuilt}</span>
                          </div>
                        )}
                        {safeProperty.lotSize && (
                          <div>
                            <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Lot Size:</span>
                            <span className={`ml-2 font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{Number(safeProperty.lotSize).toLocaleString()} sqft</span>
                          </div>
                        )}
                        {safeProperty.parkingSpaces != null && (
                          <div>
                            <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Parking:</span>
                            <span className={`ml-2 font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.parkingSpaces} {safeProperty.parkingSpaces === 1 ? 'space' : 'spaces'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'schools' && <SchoolRatings schools={safeProperty.schools} />}
                {activeTab === 'neighborhood' && <NeighborhoodInfo neighborhood={safeProperty.neighborhood} />}
                {activeTab === 'history' && <PropertyHistory history={safeProperty.property_history} />}
              </div>
            </div>

            {/* Similar Properties */}
            <SimilarProperties properties={safeProperty.similar_properties} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Contact */}
            <AgentContactCard 
              agent={safeProperty.agent} 
              propertyId={property.id}
              propertyTitle={safeProperty.title}
            />
            

            {/* Quick Stats */}
            <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border transition-colors duration-300`}>
              <h3 className={`text-lg font-outfit font-semibold mb-4 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Property Stats</h3>
              <div className="space-y-3">
                {(String(safeProperty.type).toLowerCase() !== 'apartment' && safeProperty.pricePerSqft > 0) && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Price per sqft:</span>
                    <span className={`font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{formatPrice(safeProperty.pricePerSqft)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Days on market:</span>
                  <span className={`font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.days_on_market}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Property type:</span>
                  <span className={`font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{safeProperty.type}</span>
                </div>
                {(safeProperty.yearBuilt && !isNaN(Number(safeProperty.yearBuilt)) && Number(safeProperty.yearBuilt) > 1800) && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Year built:</span>
                    <span className={`font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{Number(safeProperty.yearBuilt)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Location Card */}
            <LocationCard
              latitude={safeProperty.latitude}
              longitude={safeProperty.longitude}
              address={safeProperty.address}
            />

          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails; 