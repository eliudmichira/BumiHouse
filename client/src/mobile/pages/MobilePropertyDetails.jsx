import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Share, Heart, Phone, Mail, MessageCircle,
  MapPin, Bed, Bath, Square, Car, Wifi, Shield,
  Star, Eye, Calendar, Camera, Video, ChevronLeft,
  ChevronRight, Plus, Minus, Check, CheckCircle, X,
  Building2, Home, Users, TreePine, Droplets, Flame,
  Snowflake, AirVent, ParkingCircle, Dog, ChefHat,
  Wine, Coffee, Waves, Mountain, Sun, Moon,
  School, TrendingUp, Clock, AlertCircle, Share2, DollarSign,
  Layers, MessageSquare, HelpCircle, Zap, Package
} from 'lucide-react';
import {
  PropertyMobileCard,
  PropertyMobileButton
} from '../components/PropertyMobileNav';
import { MobilePage } from '../components/PropertyMobileLayout';
import { useProperty, useProperties } from '../../hooks/useProperties';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { incrementPropertyView } from '../../lib/propertyViews';
import useAnalytics from '../../hooks/useAnalytics';
import logoPng from '../../assets/logo_padded.png';
import { messagesAPI } from '../../lib/firebaseAPI';
import { reviewsAPI } from '../../lib/reviewsAPI';
import { reportsAPI } from '../../lib/reportsAPI';
import BookingModal from '../../components/modals/BookingModal';
import PropertyMediaTabs from '../../components/PropertyStreetView';
import { handleImageError } from '../../utils/imageUtils';

// ============ ENHANCED PHOTO GALLERY (eBay Style) ============
const MobilePhotoGallery = ({ images = [], title, currentImageIndex, setCurrentImageIndex, property }) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const navigate = useNavigate(); // Added navigate for the back button

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1));
    }
    if (touchStart - touchEnd < -75) {
      setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
    }
  };

  return (
    <div
      className="relative h-[45vh] w-full bg-gray-900"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(images && images.length > 0 && images[currentImageIndex]) ? (
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={images[currentImageIndex]}
          alt={`${title || 'Property'} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => handleImageError(e, null, property)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Camera className="w-16 h-16 text-gray-600" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

      <Helmet>
        <title>{property?.title ? `${property.title} | HomesKE` : 'Property Details | HomesKE'}</title>
        <meta name="description" content={property?.description?.substring(0, 160) || 'View property details on HomesKE'} />
        <meta property="og.title" content={property?.title || 'Property Details'} />
        <meta property="og.description" content={property?.description?.substring(0, 160) || 'View property details on HomesKE'} />
        {property?.images?.[0] && <meta property="og.image" content={property.images[0]} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Thumbnail Strip (eBay Style) */}
      {images && images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 px-2">
            {images.slice(0, 6).map((img, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all shadow-lg ${idx === currentImageIndex
                  ? 'border-[#51faaa] scale-110'
                  : 'border-white/20 opacity-70 backdrop-blur-md'
                  }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </motion.button>
            ))}
            {images.length > 6 && (
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-black/60 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-black">+{images.length - 6}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ KEY SPECIFICATIONS CARD (eBay Style) ============
const KeySpecsCard = ({ property, isDark, formatPrice }) => {
  const specs = [
    { label: 'Property Type', value: property.type, icon: Building2 },
    { label: 'Status', value: property.status?.replace(/-/g, ' '), icon: Package },
    { label: 'Bedrooms', value: property.bedrooms, icon: Bed, show: property.bedrooms > 0 },
    { label: 'Bathrooms', value: property.bathrooms, icon: Bath, show: property.bathrooms > 0 },
    { label: 'Area', value: `${property.area?.toLocaleString()} sqft`, icon: Square, show: property.area > 0 },
    { label: 'Parking', value: property.parking, icon: Car, show: property.parking && property.parking !== '0' },
  ].filter(spec => spec.show !== false);

  return (
    <div className={`border rounded-[32px] overflow-hidden backdrop-blur-xl shadow-sm ${isDark ? 'bg-gray-800/40 border-white/5' : 'bg-white/80 border-gray-100'
      }`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b ${isDark ? 'bg-gray-800/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
        <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
          Key Specifications
        </h3>
      </div>

      {/* Specs Grid */}
      <div className="p-5">
        <div className="space-y-4">
          {specs.map((spec, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between py-1 ${idx !== specs.length - 1 ? 'border-b border-dashed border-gray-500/10' : ''
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <spec.icon className={`w-4 h-4 ${isDark ? 'text-[#51faaa]' : 'text-gray-600'}`} />
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {spec.label}
                </span>
              </div>
              <span className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ SIMILAR PROPERTIES CARD ============
const SimilarPropertyCard = ({ property, isDark, formatPrice, onClick }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-shrink-0 w-[280px] rounded-[32px] overflow-hidden border cursor-pointer transition-all shadow-sm ${isDark
        ? 'bg-gray-800/40 border-white/5 hover:border-[#51faaa]/30 hover:bg-gray-800/60'
        : 'bg-white/80 border-gray-100 hover:border-[#51faaa]/40 hover:shadow-md hover:bg-white'
        }`}
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-800">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&h=300'}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => handleImageError(e, null, property)}
        />
        {/* Status Badge */}
        {property.status && (
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] rounded-full backdrop-blur-md border ${property.status.toLowerCase().includes('rent')
              ? 'bg-emerald-500/80 text-white border-white/20'
              : 'bg-[#51faaa]/80 text-gray-900 border-white/20'
              }`}>
              {property.status.replace(/-/g, ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h4 className={`font-black text-base mb-2 line-clamp-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'
          }`}>
          {property.title}
        </h4>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-4 mb-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-gray-500" />
              <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {property.bedrooms} <span className="text-[10px] font-medium text-gray-500 uppercase">Beds</span>
              </span>
            </div>
          )}
          {property.area > 0 && (
            <div className="flex items-center gap-1.5">
              <Square className="w-3.5 h-3.5 text-gray-500" />
              <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {property.area} <span className="text-[10px] font-medium text-gray-500 uppercase">sqft</span>
              </span>
            </div>
          )}
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between">
          <p className="text-[#51faaa] font-black text-lg tracking-tight">
            {formatPrice(property.price)}
          </p>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <ArrowLeft className="w-4 h-4 text-[#51faaa] rotate-180" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============ AGENT CARD (Centered Contact Style) ============
const MobileAgentCard = ({ agent = {}, propertyId, propertyTitle, propertyImage, propertyPrice, isDark }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!currentUser) {
      navigate('/auth', { state: { from: window.location.pathname } });
      return;
    }

    const agentId = agent.id || agent?.userId || agent?.agentId;
    if (!agentId) return;

    setIsSending(true);
    try {
      const existingConversations = await messagesAPI.getConversations(currentUser.id);
      let conversationId = null;

      for (const conv of existingConversations.conversations) {
        if (conv.participants && conv.participants.includes(agentId)) {
          conversationId = conv.id;
          break;
        }
      }

      if (!conversationId) {
        conversationId = await messagesAPI.createConversation([currentUser.id, agentId], propertyId);
      }

      const initialMessage = {
        senderId: currentUser.id,
        text: `Hi ${agent.name || 'there'}! I'm interested in "${propertyTitle || 'your property'}". Is it still available?`,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      await messagesAPI.sendMessage(conversationId, initialMessage);
      navigate('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`border rounded-[32px] overflow-hidden backdrop-blur-xl shadow-sm ${isDark ? 'bg-gray-800/40 border-white/5' : 'bg-white/80 border-gray-100'
      }`}>
      {/* Centered Agent Info */}
      <div className="px-6 pt-8 pb-4 flex flex-col items-center text-center">
        {/* Large Circle Avatar */}
        <div
          className="relative cursor-pointer mb-4"
          onClick={() => {
            const agentId = agent.id || agent?.userId || agent?.agentId;
            if (agentId) navigate(`/agent/${agentId}`);
          }}
        >
          <div className={`w-24 h-24 rounded-full overflow-hidden border-3 ${isDark ? 'border-[#51faaa]/40' : 'border-[#51faaa]/50'
            }`}>
            {!imageError && (agent.avatar || agent.photo || agent.image) ? (
              <img
                src={agent.avatar || agent.photo || agent.image}
                alt={agent.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#51faaa]/15 text-[#51faaa] font-bold text-3xl">
                {(agent.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Agent Name */}
        <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'
          }`}>
          {agent.name || 'Property Agent'}
        </h3>

        {/* Email */}
        {agent.email && (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {agent.email}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6 space-y-3">
        {/* Call Button (Green Filled) */}
        {agent.phone && (
          <motion.a
            href={`tel:${agent.phone}`}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#51faaa] to-[#45e89a] text-gray-900 font-bold text-sm shadow-lg"
          >
            <Phone className="w-5 h-5" />
            <span>{agent.phone}</span>
          </motion.a>
        )}

        {/* Send Message Button (Outline) */}
        <motion.button
          onClick={handleSendMessage}
          disabled={isSending}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 font-bold text-sm transition-all disabled:opacity-50 ${isDark
            ? 'border-[#51faaa]/30 text-[#51faaa] hover:bg-[#51faaa]/10'
            : 'border-[#51faaa]/40 text-[#51faaa] hover:bg-[#51faaa]/5'
            }`}
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-[#51faaa] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </motion.button>

        {/* Send Email Button (Outline) */}
        {agent.email && (
          <motion.a
            href={`mailto:${agent.email}?subject=${encodeURIComponent(`Inquiry about ${propertyTitle || 'your property'}`)}`}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 font-bold text-sm transition-all ${isDark
              ? 'border-[#51faaa]/30 text-[#51faaa] hover:bg-[#51faaa]/10'
              : 'border-[#51faaa]/40 text-[#51faaa] hover:bg-[#51faaa]/5'
              }`}
          >
            <Mail className="w-5 h-5" />
            <span>Send Email</span>
          </motion.a>
        )}

        {/* Book Viewing Button (Filled) */}
        <motion.button
          onClick={() => setIsBookingOpen(true)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#51faaa] text-gray-900 font-bold text-sm shadow-lg"
        >
          <Calendar className="w-5 h-5" />
          <span>Book Viewing</span>
        </motion.button>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        property={{ 
          id: propertyId, 
          title: propertyTitle, 
          images: propertyImage ? [propertyImage] : [],
          price: propertyPrice
        }}
        agent={agent}
      />
    </div>
  );
};

// ============ LOCATION CARD (Desktop Style Embedding) ============
const MobileLocationCard = ({ property, isDark }) => {
  // Match desktop's safeProperty data path: property.location.coordinates.lat/lng
  const lat = property.location?.coordinates?.lat ?? property.latitude ?? property.lat;
  const lng = property.location?.coordinates?.lng ?? property.longitude ?? property.lng;
  const address = property.location?.address || property.address;

  // Create embeddable map URL (no API key required)
  const hasCoords = Number.isFinite(parseFloat(lat)) &&
    Number.isFinite(parseFloat(lng)) &&
    parseFloat(lat) !== 0 &&
    parseFloat(lng) !== 0;

  const qParam = hasCoords
    ? `${parseFloat(lat)},${parseFloat(lng)}`
    : encodeURIComponent(address || 'Nairobi, Kenya');

  // Construct Google Maps Embed URL (same as desktop)
  const mapEmbedSrc = `https://www.google.com/maps?q=${qParam}&z=14&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${qParam}`;

  const addressText = typeof address === 'string'
    ? address
    : (address?.address || address?.city || 'Location available');

  return (
    <div className={`border rounded-[32px] overflow-hidden backdrop-blur-xl shadow-sm ${isDark ? 'bg-gray-800/40 border-white/5' : 'bg-white/80 border-gray-100'
      }`}>
      {/* Header with inline address */}
      <div className={`px-5 py-4 border-b ${isDark ? 'bg-gray-800/20 border-white/5' : 'bg-gray-50/50 border-gray-100'
        }`}>
        <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
          Location
        </h3>
        {address && (
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="w-4 h-4 text-[#51faaa] flex-shrink-0" />
            <span className={`text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {addressText}
            </span>
          </div>
        )}
      </div>

      {/* Full-bleed map with floating CTA */}
      <div className="relative w-full h-72 bg-gray-100">
        <iframe
          title="Property Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapEmbedSrc}
          className="absolute inset-0"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none flex justify-end">
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-gray-900 text-[11px] font-black uppercase tracking-[0.1em] shadow-lg active:scale-95 transition-transform"
          >
            <MapPin className="w-3.5 h-3.5 text-[#51faaa]" />
            Open In Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

// ============ STICKY ACTION BAR ============
const StickyActionBar = ({ agent, propertyId, propertyTitle, propertyPrice, propertyImage, isDark, formatPrice, showPrice = true }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!currentUser) {
      navigate('/auth', { state: { from: window.location.pathname } });
      return;
    }

    const agentId = agent.id || agent?.userId || agent?.agentId;
    if (!agentId) return;

    setIsSending(true);
    try {
      const existingConversations = await messagesAPI.getConversations(currentUser.id);
      let conversationId = null;

      for (const conv of existingConversations.conversations) {
        if (conv.participants && conv.participants.includes(agentId)) {
          conversationId = conv.id;
          break;
        }
      }

      if (!conversationId) {
        conversationId = await messagesAPI.createConversation([currentUser.id, agentId], propertyId);
      }

      const initialMessage = {
        senderId: currentUser.id,
        text: `Hi ${agent.name || 'there'}! I'm interested in "${propertyTitle}". Is it still available?`,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      await messagesAPI.sendMessage(conversationId, initialMessage);
      navigate('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 left-4 right-4 z-[100]"
    >
      <div className={`relative overflow-hidden rounded-full border backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${isDark ? 'bg-gray-900/80 border-white/10' : 'bg-white/80 border-gray-200'
        }`}>
        {/* Subtle inner glow and glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

        <div className="px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Price & Labels — only when the main price card is scrolled off */}
          <AnimatePresence>
            {showPrice && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 pl-2 overflow-hidden"
              >
                <div className="flex flex-col">
                  <span className={`text-[10px] uppercase tracking-[0.12em] font-bold mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                    Price
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#51faaa] tracking-tight">
                      {formatPrice(propertyPrice).split(' ')[1]}
                    </span>
                    <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatPrice(propertyPrice).split(' ')[0]}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Row */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={isSending}
              className="flex-1 h-14 rounded-full bg-gradient-to-r from-[#51faaa] to-[#45e89a] flex items-center justify-center gap-2 font-black text-gray-900 shadow-[0_8px_20px_rgba(81,250,170,0.3)] disabled:opacity-50 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Shine animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {isSending ? (
                <div className="w-5 h-5 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">Inquiry</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsBookingOpen(true)}
              className={`h-14 w-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isDark
                ? 'bg-[#51faaa]/10 border-[#51faaa]/30 text-[#51faaa] hover:bg-[#51faaa]/20'
                : 'bg-emerald-50 border-emerald-200 text-[#51faaa] hover:bg-emerald-100'
                }`}
            >
              <Calendar className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => window.open(`tel:${agent.phone || ''}`)}
              className={`h-14 w-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isDark
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 shadow-lg'
                : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100 shadow-md'
                }`}
            >
              <Phone className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        property={{ 
          id: propertyId, 
          title: propertyTitle, 
          images: propertyImage ? [propertyImage] : [],
          price: propertyPrice
        }}
        agent={agent}
      />

      {/* Safe Area Spacer */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </motion.div>,
    document.body
  );
};

// ============ REVIEWS SECTION (Enhanced with Inline Form) ============
const ReviewsSection = ({ property, isDark, propertyId }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch reviews from Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      if (propertyId) {
        try {
          const fetched = await reviewsAPI.getReviews(propertyId);
          setReviews(fetched);
        } catch (err) {
          console.error('Error loading reviews:', err);
        } finally {
          setLoadingReviews(false);
        }
      }
    };
    fetchReviews();
  }, [propertyId]);

  // Handle write review button click
  const handleWriteReview = () => {
    if (!currentUser) {
      if (confirm('You must be logged in to write a review. Would you like to log in now?')) {
        navigate('/auth', { state: { from: window.location.pathname } });
      }
      return;
    }
    setIsWritingReview(true);
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!rating || !reviewText.trim()) {
      alert('Please provide both a rating and a review.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        userId: currentUser.id || currentUser.uid,
        userName: currentUser.displayName || currentUser.name || 'Anonymous',
        userAvatar: currentUser.photoURL || currentUser.avatar || null,
        rating: rating,
        text: reviewText.trim(),
      };

      const saved = await reviewsAPI.addReview(propertyId, reviewData);
      setReviews([{ ...reviewData, ...saved, createdAt: new Date().toISOString(), helpful: 0 }, ...reviews]);

      // Reset form
      setRating(0);
      setReviewText('');
      setIsWritingReview(false);
      alert('Review posted! Thank you for sharing your experience.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Could not post your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = ({ value, onChange, readonly = false }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHoveredRating(star)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
          whileHover={!readonly ? { scale: 1.2 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`w-6 h-6 transition-all ${(readonly ? star <= value : star <= (hoveredRating || value))
              ? 'text-yellow-500 fill-yellow-500'
              : isDark ? 'text-gray-600' : 'text-gray-300'
              }`}
          />
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className={`border rounded-[32px] overflow-hidden backdrop-blur-xl shadow-sm ${isDark ? 'bg-gray-800/40 border-white/5' : 'bg-white/80 border-gray-100'
      }`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b flex justify-between items-center ${isDark ? 'bg-gray-800/20 border-white/5' : 'bg-gray-50/50 border-gray-100'
        }`}>
        <div>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-400'
            }`}>
            Reviews & Feedback
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)}
                </span>
              </div>
              <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>
        {!isWritingReview && (
          <button
            onClick={handleWriteReview}
            className="text-[#51faaa] text-xs font-bold hover:underline"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form (Inline) */}
      {isWritingReview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-gray-200'}`}
        >
          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className={`text-sm font-bold mb-2 block ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                Your Rating *
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            {/* Review Text */}
            <div>
              <label className={`text-sm font-bold mb-2 block ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                Your Review *
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                placeholder="Share your experience with this property..."
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${isDark
                  ? 'bg-gray-900/50 border-white/10 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {reviewText.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitReview}
                disabled={isSubmitting || !rating || !reviewText.trim()}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${isSubmitting || !rating || !reviewText.trim()
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-[#51faaa] text-gray-900 hover:bg-[#45e89a]'
                  }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span>Posting...</span>
                  </div>
                ) : (
                  'Post Review'
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsWritingReview(false);
                  setRating(0);
                  setReviewText('');
                }}
                disabled={isSubmitting}
                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${isDark
                  ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      {loadingReviews ? (
        <div className="p-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#51faaa] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length > 0 ? (
        <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-200'}`}>
          {reviews.map((review) => (
            <div key={review.id} className="p-4">
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#51faaa]/20 flex items-center justify-center">
                      <span className="text-[#51faaa] font-bold text-sm">
                        {(review.userName || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                      {review.userName}
                    </h4>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <StarRating value={review.rating} onChange={() => { }} readonly />

                  <p className={`text-sm mt-2 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {review.text}
                  </p>

                  {/* Helpful Button */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => reviewsAPI.markHelpful(propertyId, review.id)}
                      className={`text-xs flex items-center gap-1 transition-colors ${isDark
                        ? 'text-gray-500 hover:text-[#51faaa]'
                        : 'text-gray-400 hover:text-[#51faaa]'
                        }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Helpful ({review.helpful || 0})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        !isWritingReview && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#51faaa]/10 mx-auto mb-3 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#51faaa]" />
            </div>
            <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Reviews Yet
            </h4>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Be the first to share your experience with this property.
            </p>
            <PropertyMobileButton
              variant="outline"
              size="sm"
              className="mx-auto"
              onClick={handleWriteReview}
            >
              Write First Review
            </PropertyMobileButton>
          </div>
        )
      )}
    </div>
  );
};

// ============ MINI FOOTER ============
const MiniFooter = ({ property, isDark }) => {
  return (
    <div className={`mt-12 pt-8 pb-4 border-t border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        {/* Actions */}
        <div className="flex items-center gap-6">
          <ReportButton propertyId={property.id} propertyTitle={property.title} isDark={isDark} />
        </div>

        {/* Brand & Copyright */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={logoPng}
              alt="HomesKE Logo"
              className="h-12 w-auto object-contain drop-shadow-md"
            />
          </div>
          <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            © {new Date().getFullYear()} HomesKE. All rights reserved.
          </p>
        </div>

        {/* Metadata & Disclaimer */}
        <div className="space-y-2">
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Listing ID: <span className="font-mono">{property.id?.substring(0, 8).toUpperCase() || 'N/A'}</span>
          </p>
          <p className={`text-[10px] leading-relaxed max-w-xs mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Information is deemed reliable but not guaranteed. HomesKE relies on agents and property owners for accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
const MobilePropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: propertyData, isLoading: loading, isError: error } = useProperty(id);
  const { data: allPropertiesData } = useProperties(); // For similar properties
  const { currentUser, toggleFavorite, isFavorite } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Overview');
  const priceRef = useRef(null);
  const [priceInView, setPriceInView] = useState(true);

  // Handle tab change with scroll to top
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Smooth scroll to tabs section
    setTimeout(() => {
      document.querySelector('[class*="sticky top"]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 50);
  };
  const { trackPropertyView } = useAnalytics();
  const { isDark } = useTheme();

  const property = propertyData;

  useEffect(() => {
    if (property) {
      trackPropertyView(property);
      incrementPropertyView(id);
    }
  }, [property, id, trackPropertyView]);

  // Show the price in the sticky bar only once the main price card scrolls off-screen.
  // When the price card isn't mounted (Reviews/Inquiry tabs), fall back to showing it.
  useEffect(() => {
    const el = priceRef.current;
    if (!el) {
      setPriceInView(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setPriceInView(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeTab, property]);

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get similar properties
  const getSimilarProperties = () => {
    if (!property || !allPropertiesData?.properties) return [];

    return allPropertiesData.properties
      .filter(p =>
        p.id !== property.id && // Not the current property
        p.type === property.type && // Same type
        Math.abs(p.price - property.price) < property.price * 0.5 // Within 50% price range
      )
      .slice(0, 10); // Limit to 10
  };

  const similarProperties = getSimilarProperties();

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      if (confirm('You must be logged in to save favorites. Would you like to log in now?')) {
        navigate('/auth', { state: { from: window.location.pathname } });
      }
      return;
    }

    if (property && toggleFavorite) {
      try {
        await toggleFavorite(property);
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    }
  };

  const isPropertyFavorite = property && isFavorite ? isFavorite(property.id) : false;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(window.location.href);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatAmenityLabel = (amenity) => {
    if (!amenity) return '';
    const name = typeof amenity === 'string' ? amenity : amenity.name;
    return name.split(/[-_ ]/).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getAmenityIcon = (amenity) => {
    const name = (typeof amenity === 'string' ? amenity : amenity.name).toLowerCase();
    const iconMap = {
      'swimming pool': Waves,
      'pool': Waves,
      'gym': Users,
      'fitness': Users,
      'parking': Car,
      'security': Shield,
      'garden': TreePine,
      'wifi': Wifi,
      'internet': Wifi,
      'air conditioning': AirVent,
      'heating': Flame,
      'pet friendly': Dog,
      'kitchen': ChefHat,
      'balcony': Sun,
      'water': Droplets,
      'elevator': Building2,
      'furnished': Home
    };

    const IconComponent = iconMap[name] || Check;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <MobilePage title="Property Details" showBackButton={true}>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-[#51faaa]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#51faaa] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading property details...
            </p>
          </div>
        </div>
      </MobilePage>
    );
  }

  if (error || (!loading && !property)) {
    return (
      <MobilePage title="Property Details" showBackButton={true}>
        <div className="flex items-center justify-center h-[70vh] px-6">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {error ? 'Error Loading Property' : 'Property Not Found'}
              </h3>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {error?.message || 'This property does not exist or has been removed'}
              </p>
              <PropertyMobileButton
                variant="outline"
                onClick={() => navigate('/properties')}
                className="min-w-[160px]"
              >
                Browse Properties
              </PropertyMobileButton>
            </div>
          </div>
        </div>
      </MobilePage>
    );
  }

  return (
    <MobilePage
      title={property.title}
      showBackButton={true}
      showBottomNav={false}
      showHeader={true}
      padding="none"
      rightAction={
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleShare}
            className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800/70' : 'hover:bg-gray-100'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
          </motion.button>
          <motion.button
            onClick={handleToggleFavorite}
            className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800/70' : 'hover:bg-gray-100'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart className={`w-5 h-5 transition-all ${isPropertyFavorite
              ? 'text-red-500 fill-red-500'
              : isDark ? 'text-white' : 'text-gray-900'
              }`} />
          </motion.button>
        </div>
      }
    >
      {/* ============ PHOTO GALLERY ============ */}
      <div className="px-3 pt-3">
        <PropertyMediaTabs
          property={property}
          heightClass="h-[45vh]"
          variant="mobile"
        >
          <div className="relative w-full h-full">
            <MobilePhotoGallery
              images={property.images}
              title={property.title}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              property={property}
            />
          </div>
        </PropertyMediaTabs>
      </div>

      {/* ============ TABS NAVIGATION ============ */}
      <div className={`sticky top-[0px] z-[40] transition-colors duration-200 border-b backdrop-blur-md ${isDark ? 'bg-gray-900/80 border-white/5' : 'bg-white/80 border-gray-200'
        }`}>
        <div className="flex items-center justify-around px-2">
          {[
            { name: 'Overview', icon: Home },
            { name: 'Reviews', icon: MessageSquare },
            { name: 'Inquiry', icon: HelpCircle }
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabChange(tab.name)}
              className={`relative py-4 px-2 flex flex-col items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab.name
                ? 'text-[#51faaa]'
                : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
              {activeTab === tab.name && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#51faaa]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ============ MAIN CONTENT (eBay STYLE LAYOUT) ============ */}
      <div className="px-5 py-8 space-y-8 pb-56 min-h-[60vh]">

        {/* ============ OVERVIEW TAB ============ */}
        {activeTab === 'Overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Title, Location & Price (buy-box) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {property.type && (
                  <span className="px-3 py-1 bg-[#51faaa]/15 text-[#51faaa] text-[10px] font-bold uppercase tracking-[0.12em] rounded-full border border-[#51faaa]/20">
                    {property.type}
                  </span>
                )}
                {property.status && (
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] rounded-full border ${property.status.toLowerCase().includes('rent')
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400/20'
                    : 'bg-[#51faaa]/15 text-[#51faaa] border-[#51faaa]/20'
                    }`}>
                    {property.status.replace(/-/g, ' ')}
                  </span>
                )}
              </div>

              <h1 className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                {property.title}
              </h1>

              {property.address && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <MapPin className="w-4 h-4 text-[#51faaa] flex-shrink-0" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {typeof property.address === 'string' ? property.address : (property.address?.address || property.address?.city || 'Location available')}
                  </span>
                </div>
              )}

              {/* Price — flat, hairline-separated */}
              <div ref={priceRef} className={`mt-5 pt-5 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] uppercase tracking-[0.18em] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Price
                  </span>
                  {property.views && (
                    <>
                      <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>•</span>
                      <div className="flex items-center gap-1">
                        <Eye className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {property.views} views
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-[34px] font-black text-[#51faaa] tracking-tight leading-none">
                    {formatPrice(property.price)}
                  </p>
                  {property.area > 0 && (
                    <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                      {formatPrice(Math.round(property.price / property.area))}
                      <span className="font-medium opacity-70"> / sqft</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Row (bordered tiles) */}
            {(property.bedrooms > 0 || property.bathrooms > 0 || property.area > 0) && (
              <div className="flex gap-3">
                {[
                  { label: 'Beds', value: property.bedrooms, icon: Bed, show: property.bedrooms > 0 },
                  { label: 'Baths', value: property.bathrooms, icon: Bath, show: property.bathrooms > 0 },
                  { label: 'Sq Ft', value: property.area?.toLocaleString(), icon: Square, show: property.area > 0 },
                ].filter(s => s.show).map((stat, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'
                      }`}
                  >
                    <stat.icon className={`w-5 h-5 mb-2 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                    <span className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* One-line summary */}
            {property.description && (
              <p className={`text-[15px] leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {property.description.length > 150
                  ? `${property.description.slice(0, 150).trim()}…`
                  : property.description}
              </p>
            )}

            {/* Reassurance bullets */}
            <div className="space-y-2.5">
              {[
                property.agent?.verified ? 'Listing agent verified' : 'Listed by a registered agent',
                'Identity & contact details checked',
                'Secure in-app inquiries & viewings',
              ].map((line, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#51faaa] flex-shrink-0" />
                  <span className={`text-[13px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {line}
                  </span>
                </div>
              ))}
            </div>

            {/* Key Specifications */}
            <KeySpecsCard property={property} isDark={isDark} formatPrice={formatPrice} />

            {/* Description Section */}
            {property.description && (
              <div className={`border rounded-[32px] overflow-hidden backdrop-blur-xl shadow-sm ${isDark ? 'bg-gray-800/40 border-white/5' : 'bg-white/80 border-gray-100'
                }`}>
                <div className={`px-5 py-4 border-b ${isDark ? 'bg-gray-800/20 border-white/5' : 'bg-gray-50/50 border-gray-100'
                  }`}>
                  <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                    Property Description
                  </h3>
                </div>
                <div className="p-5">
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {property.description}
                  </p>
                </div>
              </div>
            )}

            {/* Unit Configurations (if multi-unit) */}
            {property.hasMultipleUnits && property.units && property.units.length > 0 && (
              <div className={`border rounded-[32px] overflow-hidden backdrop-blur-xl shadow-sm ${isDark ? 'bg-gray-800/40 border-white/5' : 'bg-white/80 border-gray-100'
                }`}>
                <div className={`px-5 py-4 border-b ${isDark ? 'bg-gray-800/20 border-white/5' : 'bg-gray-50/50 border-gray-100'
                  }`}>
                  <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                    Available Units ({property.units.length})
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {property.units.map((unit, index) => (
                    <div
                      key={unit.id}
                      className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50/50 border-gray-100 hover:bg-gray-100/50'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0">
                          <h4 className={`font-black text-base mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                            {unit.name}
                          </h4>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${Number(unit.unitsAvailable) > 0
                            ? 'bg-[#51faaa]/10 text-[#51faaa]'
                            : 'bg-red-500/10 text-red-500'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${Number(unit.unitsAvailable) > 0 ? 'bg-[#51faaa]' : 'bg-red-500'
                              }`} />
                            {Number(unit.unitsAvailable) > 0
                              ? `${unit.unitsAvailable} Available`
                              : 'Fully Occupied'
                            }
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[#51faaa] font-black text-lg tracking-tight">
                            {formatPrice(unit.price)}
                          </p>
                          {unit.rentPeriod && (
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              per {unit.rentPeriod}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                            <Bed className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {unit.bedrooms} <span className="text-[10px] font-medium text-gray-500 uppercase">Beds</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                            <Bath className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {unit.bathrooms} <span className="text-[10px] font-medium text-gray-500 uppercase">Baths</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                            <Square className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {unit.area} <span className="text-[10px] font-medium text-gray-500 uppercase">sqft</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities & Features */}
            {property.amenities?.length > 0 && (
              <div className={`border rounded-[32px] overflow-hidden backdrop-blur-xl shadow-sm ${isDark ? 'bg-gray-800/40 border-white/5' : 'bg-white/80 border-gray-100'
                }`}>
                <div className={`px-5 py-4 border-b ${isDark ? 'bg-gray-800/20 border-white/5' : 'bg-gray-50/50 border-gray-100'
                  }`}>
                  <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                    Amenities & Features ({property.amenities.length})
                  </h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    {property.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <div className="text-[#51faaa]">
                            {getAmenityIcon(amenity)}
                          </div>
                        </div>
                        <span className={`text-xs font-bold leading-tight ${isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {formatAmenityLabel(amenity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Map Location (Desktop Style Embedding) */}
            <MobileLocationCard property={property} isDark={isDark} />

            {/* ============ SIMILAR PROPERTIES (eBay "People also viewed") ============ */}
            {similarProperties.length > 0 && (
              <div className="mt-8 pt-8 pt-4 border-t border-dashed border-gray-500/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col gap-1">
                    <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Similar Properties
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Handpicked recommendations
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/properties')}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border-2 transition-all ${isDark
                      ? 'border-[#51faaa]/20 text-[#51faaa] hover:bg-[#51faaa]/10'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    View all
                  </motion.button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
                  {similarProperties.map((similarProp) => (
                    <SimilarPropertyCard
                      key={similarProp.id}
                      property={similarProp}
                      isDark={isDark}
                      formatPrice={formatPrice}
                      onClick={() => {
                        navigate(`/property/${similarProp.id}`);
                        window.scrollTo(0, 0);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ============ REVIEWS TAB ============ */}
        {activeTab === 'Reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ReviewsSection property={property} isDark={isDark} propertyId={id} />
          </motion.div>
        )}

        {/* ============ INQUIRY TAB ============ */}
        {activeTab === 'Inquiry' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <MobileAgentCard 
              agent={property.agent} 
              propertyId={id} 
              propertyTitle={property.title} 
              propertyImage={property.images?.[0]}
              propertyPrice={property.price}
              isDark={isDark} 
            />
          </motion.div>
        )}

        {/* Global Mini Footer */}
        <div className="px-5">
          <MiniFooter property={property} isDark={isDark} />
        </div>

      </div>

      {/* Sticky Action Bar */}
      <StickyActionBar
        agent={property.agent}
        propertyId={id}
        propertyTitle={property.title}
        propertyPrice={property.price}
        propertyImage={property.images?.[0]}
        isDark={isDark}
        formatPrice={formatPrice}
        showPrice={!priceInView}
      />

      {/* Map Modal */}

    </MobilePage>
  );
};

export default MobilePropertyDetails;
// ============ REPORT CONTENT COMPONENT ============
const ReportButton = ({ propertyId, propertyTitle, isDark }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherReason, setOtherReason] = useState('');

  const REASONS = [
    'Inappropriate Content',
    'Spam or Scam',
    'Fake Listing',
    'Incorrect Information',
    'Other'
  ];

  const handleReport = async () => {
    if (!currentUser) {
      navigate('/auth', { state: { from: window.location.pathname } });
      return;
    }

    if (!reason) return;

    setIsSubmitting(true);
    try {
      await reportsAPI.submitReport({
        type: 'property',
        targetId: propertyId,
        targetTitle: propertyTitle,
        reason: reason === 'Other' ? otherReason : reason,
        description: otherReason
      });
      alert('Report submitted. We will review this listing shortly.');
      setShowModal(false);
    } catch (error) {
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mt-8 flex justify-center pb-8 opacity-60 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-red-500'}`}
        >
          <AlertCircle className="w-4 h-4" />
          Report this listing
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white'}`}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Report Listing</h3>

            <div className="space-y-2 mb-4">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${reason === r
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{r}</span>
                    {reason === r && <Check className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>

            {reason === 'Other' && (
              <textarea
                placeholder="Please describe the issue..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className={`w-full p-3 rounded-xl mb-4 text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                rows={3}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={isSubmitting || !reason}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
