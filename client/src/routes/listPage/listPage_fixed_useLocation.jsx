import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GoogleMap as GoogleMapComponent,
  useJsApiLoader,
  Marker,
  InfoWindow,
  MarkerClusterer,
  DrawingManager
} from '@react-google-maps/api';
import {
  Search, MapPin, Home, Building2, Bed, Bath, Heart, Grid, List,
  SlidersHorizontal, ChevronDown, X, Filter, ArrowUp, Share, Phone,
  Mail, Star, TrendingUp, Clock, Eye, Bookmark, Share2, MessageCircle,
  Calendar, ChevronLeft, ChevronRight, Plus, Minus, Camera, Video,
  School, Train, Info, ZoomIn, Expand, Navigation, Map,
  Sparkles, Shield, Zap, ArrowRight, Layers, Compass, RefreshCw,
  DollarSign, Square, Users, Car, Trees, Waves, Coffee,
  Check, MoreHorizontal, TrendingDown, Moon, Mountain, Wifi,
  AirVent, Snowflake, Flame, ParkingCircle, Dog, Droplets,
  ChefHat, Wine, TreePine, Sun, Building, Truck,
  CloudCog, Bus, ArrowUpDown, MapIcon
} from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import { fetchMarketInsights, formatKes } from '../../services/aiInsights';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';


// Using real auth context

// const useNavigate = () => (path, options) => {};
import { useLocation, Link } from 'react-router-dom';
import EnhancedMobileMapNavigation from '../../mobile/components/EnhancedMobileMapNavigation';
import EnhancedPropertyCard from '../../components/enhanced/PropertyCard';
import SmartSearchBar from '../../components/enhanced/SmartSearchBar';
import AdvancedFiltersSidebar from '../../components/enhanced/AdvancedFiltersSidebar';
import Logo from '../../components/Logo';
import EnhancedMapComponent from '../../components/listPage/map';
import CartoFallbackMap from '../../components/GoogleMap/CartoFallbackMap';
import { getPropertyImages, handleImageError } from '../../utils/imageUtils';

// Normalize coordinates to { lat, lng } using global bounds
function getNormalizedLatLng(property) {
  if (!property) return null;
  const rawLat = property.latitude ?? property.lat ?? property.location?.lat ?? property.coordinates?.lat;
  const rawLng = property.longitude ?? property.lng ?? property.location?.lng ?? property.coordinates?.lng;

  let lat = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat;
  let lng = typeof rawLng === 'string' ? parseFloat(rawLng) : rawLng;

  // Detect swapped coordinates
  if (typeof lat === 'number' && typeof lng === 'number') {
    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
      [lat, lng] = [lng, lat];
    }
  }

  if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return { lat, lng };
  }
  return null;
}

// AI Status Component
const AIStatusBar = ({ propertyCount, searchQuery, isAIShowingProperties }) => {
  if (propertyCount === 0) return null;

  return (
    <motion.button
      className="fixed left-4 bottom-4 z-30 px-4 py-2 rounded-full shadow-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur flex items-center gap-2 hover:shadow-xl transition-all"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      title={searchQuery ? `Results for "${searchQuery}"` : 'Properties found'}
      onClick={(e) => { e.stopPropagation(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAIShowingProperties ? 'bg-gradient-to-r from-[#4066ff]/10 to-[#4066ff]/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
        <Sparkles className={`w-3 h-3 ${isAIShowingProperties ? 'text-[#0a0c19]' : 'text-gray-600 dark:text-gray-300'}`} />
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">
        {propertyCount.toLocaleString()} properties
      </span>
      {searchQuery && (
        <span className="hidden sm:inline text-xs text-gray-600 dark:text-gray-400">• "{searchQuery}"</span>
      )}
    </motion.button>
  );
};
import {
  PropertyGridSkeleton,
  MapSkeleton,
  SearchBarSkeleton,
  PropertyLoadingSpinner
} from '../../components/enhanced/PropertyLoadingStates';

// Google Maps API Key - strict in dev, safe fallback in prod
const IS_PROD = import.meta.env.PROD;
const ENV_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
// No hardcoded fallback key: the Maps key must be supplied via VITE_GOOGLE_MAPS_API_KEY in production.
const GOOGLE_MAPS_API_KEY = ENV_KEY;
const HAS_GOOGLE_MAPS_KEY = GOOGLE_MAPS_API_KEY.length > 0;

// Keep libraries array stable to avoid unnecessary reloads
const MAP_LIBRARIES = ['drawing', 'geometry', 'marker', 'places', 'visualization'];

// Debug: Log the API key state
if (!HAS_GOOGLE_MAPS_KEY) {
  console.error('[Maps] VITE_GOOGLE_MAPS_API_KEY is missing. In dev, add it to client/.env.local then restart (npm run dev).');
}

// Enhanced debugging for production
if (import.meta.env.DEV) {
  console.log('Maps key present:', HAS_GOOGLE_MAPS_KEY, 'env mode:', IS_PROD ? 'prod' : 'dev');
  console.log('All env vars (filtered):', Object.keys(import.meta.env || {}));
} else {
  // Production debugging - minimal but informative
  console.log('🗺️ Maps API Key loaded:', HAS_GOOGLE_MAPS_KEY ? 'Yes' : 'No');
  console.log('🌍 Environment:', import.meta.env.MODE);
  console.log('🔗 API URL:', import.meta.env.VITE_API_URL);
  console.log('🔑 Maps Key (first 10 chars):', GOOGLE_MAPS_API_KEY ? GOOGLE_MAPS_API_KEY.substring(0, 10) + '...' : 'MISSING');
}

// Default map center (Nairobi, Kenya)
const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };
// const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // New York (commented out)

const DEFAULT_ZOOM = 10; // Closer zoom for city view


// Map theme options
const mapThemes = {
  default: [],
  night: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ],
  satellite: [
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }]
    }
  ]
};

// Compact Quick View Modal
function QuickViewModal({ property, isOpen, onClose, onFavoriteToggle, isFavorite }) {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me.'
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleContactSubmit = () => {
    // Show success message
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
    notification.textContent = 'Message sent successfully!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);

    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: 'I am interested in this property. Please contact me.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-4xl sm:w-full animate-modal-slide-up max-h-[85vh] overflow-hidden">
          {/* Compact Header with Image and Basic Info */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={getPropertyImages(property)[0]}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e, null, property)}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => onFavoriteToggle(property)}
                className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 text-white hover:bg-red-500'
                  }`}
              >
                <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h2 className="text-2xl font-bold mb-1">{property.title}</h2>
              <p className="text-lg font-semibold mb-1">{formatPrice(property.price)}</p>
              <p className="text-sm opacity-90 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {(() => {
                  const addr = property.address || property.location?.address;
                  if (typeof addr === 'string') return addr;
                  if (typeof addr === 'object' && addr) return addr.address || addr.city || addr.state || 'Location available';
                  return 'Location not specified';
                })()}
              </p>
            </div>
          </div>

          {/* Compact Content - No Tabs */}
          <div className="flex-1 overflow-y-auto">

            {/* Compact Property Details */}
            <div className="p-6 space-y-6">
              {/* Property Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Bed className="h-5 w-5 mx-auto mb-1 text-[#51faaa]" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Bedrooms</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{property?.bedrooms || 'N/A'}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Bath className="h-5 w-5 mx-auto mb-1 text-[#51faaa]" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Bathrooms</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{property?.bathrooms || 'N/A'}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Square className="h-5 w-5 mx-auto mb-1 text-[#51faaa]" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Area</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{property?.area ? `${property.area}m²` : 'N/A'}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Home className="h-5 w-5 mx-auto mb-1 text-[#51faaa]" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Type</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{property?.property_type || 'N/A'}</p>
                </div>
              </div>

              {/* Property Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {property?.description ||
                    `This ${property?.property_type?.toLowerCase() || 'property'} features ${property?.bedrooms || 'N/A'} bedrooms and ${property?.bathrooms || 'N/A'} bathrooms. ${property?.area ? `With ${property.area}m² of living space, ` : ''}this property offers modern amenities and thoughtful design.`
                  }
                </p>
              </div>

              {/* Contact Form */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Contact Agent</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                  />
                  <textarea
                    placeholder="I am interested in this property. Please contact me."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#51faaa] focus:border-transparent resize-none"
                  />
                  <button
                    onClick={handleContactSubmit}
                    className="w-full px-4 py-2 bg-[#51faaa] text-[#0a0c19] font-semibold rounded-lg hover:bg-[#45e695] transition-colors text-sm"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={() => navigate(`/property/${property.id}`)}
              className="px-6 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              View Full Details
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Market Insights Component
function MarketInsights({ location, propertyCount, searchQuery }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchMarketInsights(location);
        if (!active) return;
        if (data) {
          setInsights({ ...data, counts: { homes: propertyCount } });
        } else {
          // Gemini unavailable — show nothing, no error
          setInsights(null);
        }
      } catch (e) {
        if (!active) return;
        // Silently fail — don't show error to user
        setInsights(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [location, propertyCount]);

  const rent = insights?.rent;
  const bank = insights?.bank_rates;
  const plotPrices = insights?.plot_prices;
  const seasonalTrends = insights?.seasonal_trends;

  return (
    <div className={`rounded-xl p-2 md:p-2.5 mb-2 border backdrop-blur-xl transition-colors duration-500 ${isDark
      ? 'bg-gradient-to-br from-[#0a0c19] via-[#10121e] to-[#0a0c19] border-[#51faaa]/20'
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 border-gray-200'
      }`}>
      <div className="flex items-center justify-between mb-1 md:mb-1.5">
        <h3 className={`text-sm md:text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-lg flex items-center justify-center shadow-lg shadow-[#51faaa]/20">
            <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#0a0c19]" />
          </div>
          {location} Market Insights
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <h4 className={`text-xs md:text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchQuery || 'Nairobi'} Real Estate</h4>
            <p className={`text-[10px] md:text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{propertyCount} properties available</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-1 text-[10px] md:text-xs rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            {expanded ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {loading && (
        <p className={isDark ? 'text-white/70' : 'text-gray-700'}>Generating local market data…</p>
      )}

      {!loading && insights && (
        <>
          {expanded && insights.summary && (
            <p className={`mb-2 md:mb-3 text-[12px] md:text-[13px] leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{insights.summary}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-1.5">
            <div className={`backdrop-blur-sm rounded-lg p-2.5 md:p-3 hover:shadow-md transition-all duration-300 border ${isDark ? 'bg-[#10121e]/80 border-[#51faaa]/10' : 'bg-white/80 border-gray-200'
              }`}>
              <div className="flex items-center gap-1 mb-1">
                <Home className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#51faaa]" />
                <p className={`text-[10px] md:text-[11px] font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Average Rent</p>
              </div>
              {rent?.avg_range?.min != null && rent?.avg_range?.max != null ? (
                <p className={`text-[12px] md:text-[13px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatKes(rent?.avg_range?.min)} - {formatKes(rent?.avg_range?.max)}
                </p>
              ) : (
                <p className={`text-[12px] md:text-[13px] ${isDark ? 'text-white/60' : 'text-gray-500'}`}>—</p>
              )}
              {expanded && (
                <div className={`text-[10px] md:text-[11px] mt-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                  {rent?.by_type?.studio?.min != null && rent?.by_type?.studio?.max != null ? (
                    <>Studio: {formatKes(rent?.by_type?.studio?.min)} - {formatKes(rent?.by_type?.studio?.max)}<br /></>
                  ) : null}
                  {rent?.by_type?.['1BR']?.min != null && rent?.by_type?.['1BR']?.max != null ? (
                    <>1BR: {formatKes(rent?.by_type?.['1BR']?.min)} - {formatKes(rent?.by_type?.['1BR']?.max)}<br /></>
                  ) : null}
                  {rent?.by_type?.['2BR']?.min != null && rent?.by_type?.['2BR']?.max != null ? (
                    <>2BR: {formatKes(rent?.by_type?.['2BR']?.min)} - {formatKes(rent?.by_type?.['2BR']?.max)}<br /></>
                  ) : null}
                  {rent?.by_type?.['3BR']?.min != null && rent?.by_type?.['3BR']?.max != null ? (
                    <>3BR: {formatKes(rent?.by_type?.['3BR']?.min)} - {formatKes(rent?.by_type?.['3BR']?.max)}</>
                  ) : null}
                </div>
              )}
            </div>

            <div className={`backdrop-blur-sm rounded-lg p-2.5 md:p-3 hover:shadow-md transition-all duration-300 border ${isDark ? 'bg-[#10121e]/80 border-[#51faaa]/10' : 'bg-white/80 border-gray-200'
              }`}>
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#51faaa]" />
                <p className={`text-[10px] md:text-[11px] font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Plot Prices</p>
              </div>

              {/* Display plot prices in compact table-like format */}
              {(() => {
                const sizes = [
                  { key: '1_8_acre', label: '1/8 acre' },
                  { key: '1_4_acre', label: '1/4 acre' },
                  { key: '1_2_acre', label: '1/2 acre' },
                  { key: '1_acre', label: '1 acre' }
                ];

                const availableSizes = sizes.filter(size =>
                  (plotPrices?.by_size?.[size.key]?.serviced?.min != null && plotPrices?.by_size?.[size.key]?.serviced?.max != null) ||
                  (plotPrices?.by_size?.[size.key]?.unserviced?.min != null && plotPrices?.by_size?.[size.key]?.unserviced?.max != null)
                );

                if (availableSizes.length === 0) {
                  return <p className={`text-[12px] md:text-[13px] ${isDark ? 'text-white/60' : 'text-gray-500'}`}>—</p>;
                }

                // Calculate overall range from all available sizes
                let minPrice = Infinity;
                let maxPrice = 0;

                availableSizes.forEach(size => {
                  const serviced = plotPrices?.by_size?.[size.key]?.serviced;
                  const unserviced = plotPrices?.by_size?.[size.key]?.unserviced;
                  const hasServiced = serviced?.min != null && serviced?.max != null;
                  const hasUnserviced = unserviced?.min != null && unserviced?.max != null;

                  if (hasServiced) {
                    minPrice = Math.min(minPrice, serviced.min);
                    maxPrice = Math.max(maxPrice, serviced.max);
                  } else if (hasUnserviced) {
                    minPrice = Math.min(minPrice, unserviced.min);
                    maxPrice = Math.max(maxPrice, unserviced.max);
                  }
                });

                const formatPriceCompact = (amount) => {
                  if (amount >= 1000000) {
                    return `${(amount / 1000000).toFixed(0)}M`;
                  }
                  return formatKes(amount);
                };

                return (
                  <div>
                    <p className={`text-[12px] md:text-[13px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {minPrice !== Infinity ? `${formatPriceCompact(minPrice)} - ${formatPriceCompact(maxPrice)}` : '—'}
                    </p>
                    <div className={`text-[10px] md:text-[11px] mt-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'} ${expanded ? '' : 'hidden'}`}>
                      {availableSizes.slice(0, 4).map((size, index) => {
                        const serviced = plotPrices?.by_size?.[size.key]?.serviced;
                        const unserviced = plotPrices?.by_size?.[size.key]?.unserviced;
                        const hasServiced = serviced?.min != null && serviced?.max != null;
                        const hasUnserviced = unserviced?.min != null && unserviced?.max != null;

                        return (
                          <div key={size.key}>
                            {size.label}: {hasServiced
                              ? `${formatPriceCompact(serviced.min)} - ${formatPriceCompact(serviced.max)}`
                              : hasUnserviced
                                ? `${formatPriceCompact(unserviced.min)} - ${formatPriceCompact(unserviced.max)}`
                                : '—'
                            }
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {expanded && seasonalTrends?.description && (
                <p className={`text-[10px] md:text-[11px] mt-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                  {seasonalTrends.description}
                </p>
              )}
            </div>

            <div className={`backdrop-blur-sm rounded-lg p-3 hover:shadow-md transition-all duration-300 border ${isDark ? 'bg-[#10121e]/80 border-[#51faaa]/10' : 'bg-white/80 border-gray-200'
              }`}>
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#51faaa]" />
                <p className={`text-xs font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Hotspot Areas</p>
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{insights?.hotspots?.length ?? 0} Areas</p>
              {expanded && insights?.hotspots?.length ? (
                <div className={`text-xs ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                  {insights.hotspots.slice(0, 6).join(', ')}
                </div>
              ) : null}
            </div>

            {/* Market Trends card removed to create more space */}
          </div>
        </>
      )}

      {!loading && error && (
        <p className="text-xs text-red-500 mt-3">{error}</p>
      )}
    </div>
  );
}

// Enhanced Search Bar
function EnhancedSearchBar({ searchQuery, setSearchQuery, propertyCount, filters, setFilters, showFilters, setShowFilters, onLocationSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const locationSuggestions = [
    // Nairobi areas
    'Nairobi, Kenya', 'Westlands, Nairobi', 'Kilimani, Nairobi', 'Lavington, Nairobi',
    'Karen, Nairobi', 'Upperhill, Nairobi', 'Runda, Nairobi', 'Gigiri, Nairobi',
    'Muthaiga, Nairobi', 'Spring Valley, Nairobi', 'Hurlingham, Nairobi', 'Yaya, Nairobi',
    'South B, Nairobi', 'South C, Nairobi', 'Embakasi, Nairobi', 'Donholm, Nairobi',
    'Kileleshwa, Nairobi', 'Adams Arcade, Nairobi', 'Ngong Road, Nairobi', 'Mbagathi, Nairobi',
    'Langata, Nairobi', 'Kibera, Nairobi', 'Kawangware, Nairobi', 'Dagoretti, Nairobi',
    'Westlands, Nairobi', 'Parklands, Nairobi', 'Ngara, Nairobi', 'Pangani, Nairobi',
    'Buruburu, Nairobi', 'Donholm, Nairobi', 'Embakasi, Nairobi', 'Kayole, Nairobi',
    'Umoja, Nairobi', 'Komarock, Nairobi', 'Dandora, Nairobi', 'Ruiru, Nairobi',
    'Juja, Nairobi', 'Thika, Nairobi', 'Kiambu, Nairobi', 'Limuru, Nairobi',

    // Other Kenyan cities and major towns
    'Mombasa, Kenya', 'Kisumu, Kenya', 'Nakuru, Kenya', 'Eldoret, Kenya',
    'Thika, Kenya', 'Nyeri, Kenya', 'Kakamega, Kenya', 'Machakos, Kenya',
    'Kericho, Kenya', 'Kisii, Kenya', 'Embu, Kenya', 'Meru, Kenya',
    'Narok, Kenya', 'Bungoma, Kenya', 'Busia, Kenya', 'Homa Bay, Kenya',
    'Kajiado, Kenya', 'Kiambu, Kenya', 'Kilifi, Kenya', 'Kwale, Kenya',
    'Laikipia, Kenya', 'Lamu, Kenya', 'Makueni, Kenya', 'Mandera, Kenya',
    'Marsabit, Kenya', 'Migori, Kenya', 'Muranga, Kenya', 'Nandi, Kenya',
    'Nyamira, Kenya', 'Nyandarua, Kenya', 'Nyeri, Kenya', 'Samburu, Kenya',
    'Siaya, Kenya', 'Taita Taveta, Kenya', 'Tana River, Kenya', 'Trans Nzoia, Kenya',
    'Turkana, Kenya', 'Uasin Gishu, Kenya', 'Vihiga, Kenya', 'Wajir, Kenya',
    'West Pokot, Kenya',

    // Popular estates and neighborhoods
    'Brookside, Nairobi', 'Loresho, Nairobi', 'Rosslyn, Nairobi', 'Garden Estate, Nairobi',
    'Ridgeways, Nairobi', 'Nyari, Nairobi', 'Kitisuru, Nairobi', 'Muthaiga North, Nairobi',
    'Muthaiga South, Nairobi', 'Gigiri, Nairobi', 'Spring Valley, Nairobi', 'Lavington, Nairobi',
    'Kilimani, Nairobi', 'Adams Arcade, Nairobi', 'Yaya, Nairobi', 'South B, Nairobi',
    'South C, Nairobi', 'Embakasi, Nairobi', 'Donholm, Nairobi', 'Buruburu, Nairobi',
    'Umoja, Nairobi', 'Kayole, Nairobi', 'Komarock, Nairobi', 'Dandora, Nairobi',
    'Ruiru, Nairobi', 'Juja, Nairobi', 'Thika, Nairobi', 'Kiambu, Nairobi',

    // Property types for search
    'Apartment', 'House', 'Villa', 'Studio', 'Penthouse', 'Townhouse',
    'Bedsitter', 'Single Room', 'Commercial', 'Office', 'Shop', 'Warehouse',
    'Serviced Apartment', 'Furnished', 'Unfurnished', 'Gated Community',
    'Student Housing', 'Short Term Lease', 'Long Term Lease'
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    setSavedSearches(saved);
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const searchTerm = value.toLowerCase().trim();

      // Enhanced filtering with better matching
      const filtered = locationSuggestions.filter(loc => {
        const locationLower = loc.toLowerCase();

        // Exact match gets highest priority
        if (locationLower === searchTerm) return true;

        // Starts with search term gets high priority
        if (locationLower.startsWith(searchTerm)) return true;

        // Contains search term
        if (locationLower.includes(searchTerm)) return true;

        // Check if any word in the search term matches
        const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
        return searchWords.some(word => locationLower.includes(word));
      });

      // Sort suggestions by relevance
      const sortedSuggestions = filtered.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();

        // Exact matches first
        if (aLower === searchTerm && bLower !== searchTerm) return -1;
        if (bLower === searchTerm && aLower !== searchTerm) return 1;

        // Starts with search term
        if (aLower.startsWith(searchTerm) && !bLower.startsWith(searchTerm)) return -1;
        if (bLower.startsWith(searchTerm) && !aLower.startsWith(searchTerm)) return 1;

        // Shorter matches first (more specific)
        return aLower.length - bLower.length;
      });

      setSuggestions(sortedSuggestions.slice(0, 10)); // Limit to 10 suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSaveSearch = () => {
    const searchData = {
      id: Date.now(),
      name: `Search in ${searchQuery || 'Nairobi'}`,
      query: searchQuery,
      filters: { ...filters },
      date: new Date().toISOString(),
      count: propertyCount
    };

    const updatedSearches = [...savedSearches, searchData];
    setSavedSearches(updatedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));

    // Show notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
    notification.textContent = 'Search saved successfully!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location);
          onLocationSelect && onLocationSelect(location);
          setLocationLoading(false);

          // Show notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg';
          notification.textContent = 'Location detected! Properties near you will be shown.';
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationLoading(false);

          // Show error notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
          notification.textContent = 'Unable to get your location. Please search manually.';
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        }
      );
    } else {
      setLocationLoading(false);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
      notification.textContent = 'Geolocation not supported by your browser.';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.div
        className={`relative bg-white/95 dark:bg-gray-800/95 rounded-full shadow-lg border-2 backdrop-blur-sm transition-all duration-300 ${isFocused ? 'border-[#51faaa] shadow-xl shadow-[#51faaa]/20' : 'border-gray-200 dark:border-gray-700'
          }`}
        animate={{
          scale: isFocused ? 1.02 : 1,
          y: isFocused ? -2 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center p-2">
          <div className="flex-1 flex items-center">
            <motion.div
              animate={{
                scale: isFocused ? 1.1 : 1,
                rotate: isFocused ? 5 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              <Search className={`w-4 h-4 ml-3 transition-colors ${isFocused ? 'text-[#51faaa]' : 'text-gray-400'
                }`} />
            </motion.div>
            <motion.input
              type="text"
              placeholder="Search by location, address, or ZIP"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="flex-1 px-3 py-2 text-sm bg-transparent border-none focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
              animate={{
                x: isFocused ? 2 : 0
              }}
              transition={{ duration: 0.2 }}
            />
            {searchQuery && (
              <motion.button
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Clear search"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-1.5 pr-2">
            <button className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full">
              For Sale
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
            <button
              onClick={getUserLocation}
              disabled={locationLoading}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${userLocation
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${locationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MapPin className="w-3 h-3" />
              {locationLoading ? 'Getting location...' : userLocation ? 'Location Found' : 'Use my location'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${showFilters
                ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filters
            </button>
            <button
              onClick={handleSaveSearch}
              className="px-3 py-1.5 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-full text-xs font-medium hover:shadow-lg transition-all duration-300"
            >
              Save Search
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 backdrop-blur-xl"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="p-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{
                      x: 4,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.div
                      className="w-8 h-8 bg-[#51faaa]/20 dark:bg-[#51faaa]/20 rounded-lg flex items-center justify-center group-hover:bg-[#51faaa] transition-colors"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MapPin className="w-4 h-4 text-[#51faaa] dark:text-[#51faaa] group-hover:text-[#0a0c19]" />
                    </motion.div>
                    <span className="text-gray-700 dark:text-gray-200 font-medium">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Property Card


function PropertyCard({
  property,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
  onMarkerHover,
  onQuickView,
  viewMode = "list",
}) {
  const [current, setCurrent] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, toggleFavorite, isFavorite } = useAuth();

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const images = getPropertyImages(property);
  const hasMultiple = images.length > 1;

  // --- Navigation ---
  const next = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // --- Swipe ---
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) next();
    if (distance < -50) prev();
  };

  // --- Helpers ---
  const formatPrice = (price) => new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(price);

  // const getAddressString = (property) => {
  //   console.log(property);
  //   const truncate = (str, max = 30) =>
  //     str.length > max ? str.slice(0, max) + "..." : str;

  //   if (typeof property?.location === "string") {
  //     return truncate(property?.location.split(",").slice(1).join(", ").trim());
  //   }

  //   if (property?.location && typeof property.location === "object") {
  //     const { city, state, zipCode } = property.location;
  //     return truncate([city, state, zipCode].filter(Boolean).join(", "));
  //   }

  //   return "Unknown location";
  // };

  const getAddressString = (property) => {
    const truncate = (str, max = 30) =>
      str && str.length > max ? str.slice(0, max) + "..." : (str || '');

    // Case 1: location is a string
    if (typeof property?.location === "string") {
      return truncate(property.location);
    }

    // Case 2: location is an object
    if (property?.location && typeof property.location === "object") {
      const { address, city, area, neighbourhood, state } = property.location;
      const part1 = area || neighbourhood || address || '';
      const part2 = city || state || '';
      if (part1 && part2 && part1.toLowerCase().trim() !== part2.toLowerCase().trim()) {
        return truncate(`${part1}, ${part2}`);
      }
      return truncate(part1 || part2 || '');
    }

    // Case 3: top-level address + city fields (flat structure)
    if (property?.address || property?.city) {
      const part1 = property.address || '';
      const part2 = property.city || '';
      if (part1 && part2 && part1.toLowerCase().trim() !== part2.toLowerCase().trim()) {
        return truncate(`${part1}, ${part2}`);
      }
      return truncate(part1 || part2 || 'Kenya');
    }

    return "Kenya";
  };


  // --- Render ---
  return (

    <motion.div className={`group bg-gray-30 dark:bg-gray-800 rounded-2xl  overflow-hidden transition-all duration-300 cursor-pointer relative ${isHighlighted
      ? 'ring-2 ring-emerald-200 shadow-1xl shadow-emerald-500/20 scale-[1.00]'
      : 'hover:shadow-2xl hover:scale-[1.01]'
      } ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => {
        onMouseEnter && onMouseEnter(property.id);
        onMarkerHover && onMarkerHover(property.id);
      }}
      onMouseLeave={() => {
        onMouseLeave && onMouseLeave();
        onMarkerHover && onMarkerHover(null);
      }}>
      {/* IMAGE SLIDER */}
      <div
        className={`relative overflow-hidden rounded-2xl ${viewMode === 'grid' ? 'h-64' : 'h-32 w-48 flex-shrink-0'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              loading="lazy"
              className="w-full h-full object-cover flex-shrink-0"
              draggable={false}
              onError={(e) => handleImageError(e, null, property)}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {/* Removed unwanted badges: Virtual Tour, New Listings, Price Reduced */}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2   z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(property);
            }}
            className="interactive-element w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex 
            items-center justify-center hover:bg-white hover:scale-103 transition-all duration-300 shadow-lg"
          >
            <ZoomIn className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!currentUser) {
                navigate('/login', { state: { from: location } });
                return;
              }
              setIsSaved(!isSaved);
              toggleFavorite && toggleFavorite(property);
            }}
            className={`interactive-element w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isSaved
              ? 'bg-red-500 text-white hover:scale-103'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white hover:scale-103'
              }`}
          >
            <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(index); ``
              }}
              className={`interactive-element w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === current ? 'w-6 bg-white' : 'bg-white/60 hover:bg-white/80'
                }`}
            />
          ))}
        </div>

        {/* Click Zones */}
        {hasMultiple && (
          <div className="absolute inset-0 flex z-10">
            <div
              className="w-1/2"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            />
            <div
              className="w-1/2"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            />
          </div>
        )}

        {/* Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="w-10 h-10 rounded-full absolute left-4 top-1/3 text-center flex items-center justify-center text-2xl z-20 opacity-80 hover:opacity-100 bg-black/60 text-white"
            >
              ‹
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="w-10 h-10 rounded-full absolute right-4 top-1/3 text-2xl z-20 opacity-80 hover:opacity-100 bg-black/60 text-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* CONTENT */}
      {/* CONTENT */}
      <div
        onClick={() =>
          navigate(`/property/${property.id}`, { state: { property } })
        }
        className={`${viewMode === "grid" ? "pt-2 pl-2" : "pl-4 flex-1"}`}
      >
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-lg font-semibold p-1 text-[#1f3e72] dark:text-white">
              {property.title}
            </p>

            <div className="flex flex-row gap-10">
              {/* PRICE */}
              <div className="bg-orange-100 dark:bg-[#ff922d]/10 p-1 rounded-lg inline-block">
                <p className="text-sm font-semibold text-[#ff922d]">
                  {formatPrice(property.price)}
                </p>
              </div>

              {/* BEDS & BATHS */}
              <div
                className={`flex items-center gap-2 mb-1 ${viewMode === "list" ? "flex-wrap" : ""
                  }`}
              >
                <span className="flex items-center gap-0.5 text-xs text-gray-600 dark:text-gray-400">
                  <Bed className="w-4 h-4" />
                  <span className="text-gray-900 text-xs dark:text-white">
                    {property.bedrooms}
                  </span>{" "}

                </span>

                <span className="flex items-center gap-0.5 text-xs text-gray-600 dark:text-gray-400">
                  <Bath className="w-4 h-4" />
                  <span className="text-gray-900 text-xs dark:text-white">
                    {property.bathrooms}
                  </span>{" "}

                </span>
              </div>
            </div>
          </div>

          {/* (Removed MoreHorizontal to match target styling) */}
        </div>

        {/* ADDRESS */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span
            className={`text-gray-700 dark:text-gray-300 text-sm ${viewMode === "grid" ? "mb-1" : "mb-2"
              }`}
          >
            {getAddressString(property)}
          </span>
        </div>

        {/* FOOTER */}
        <div
          className={`flex items-center justify-between ${viewMode === "grid"
            ? "pt-1 border-t border-gray-100 dark:border-gray-700"
            : ""
            }`}
        >
          <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
            <Eye className="w-3 h-3" />
            <span>{property.views || 0} views</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/property/${property.id}`, { state: { property } });
            }}
            className="text-[#059669] dark:text-[#51faaa] font-medium text-sm hover:text-[#51faaa]/80 dark:hover:text-[#51faaa]/80 transition-colors flex items-center gap-1"
          >
            View Details
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );

}
//   id={`property-card-${property.id}`}
//   ref={cardRef}
//   className={`group bg-gray-30 dark:bg-gray-800 rounded-2xl  overflow-hidden transition-all duration-300 cursor-pointer relative ${isHighlighted
//     ? 'ring-2 ring-emerald-200 shadow-1xl shadow-emerald-500/20 scale-[1.00]'
//     : 'hover:shadow-2xl hover:scale-[1.01]'
//     } ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row'}`}
//   initial={{ opacity: 0, y: 20 }}
//   animate={{ opacity: 1, y: 0 }}
//   transition={{ duration: 0.3, ease: "easeOut" }}
//   whileHover={{
//     y: 0,
//     transition: { duration: 0.3, ease: "easeOut" }
//   }}
//   whileTap={{ scale: 0.98 }}
//   onMouseEnter={() => {
//     onMouseEnter && onMouseEnter(property.id);
//     onMarkerHover && onMarkerHover(property.id);
//   }}
//   onMouseLeave={() => {
//     o nMouseLeave && onMouseLeave();
//     onMarkerHover && onMarkerHover(null);
//   }}
// // onClick={(e) => {

// //   navigate(`/property/${property.id}`, { state: { property } });
// //   // console.log(property.id)

// // }}
// >


//   <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-64' : 'h-32 w-48 flex-shrink-0'}`}>
//     {isImageLoading && (
//       <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
//     )}
//     <img
//       src={(() => {
//         const images = property.images || [];
//         if (images.length === 0) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80';
//         const transformedUrl = images[currentImageIndex];
//         return transformedUrl?.replace('makao-648bd.firebasestorage.app', 'dwellmate-285e8.firebasestorage.app') || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80';
//       })()}
//       alt={property.title}
//       className="w-full rounded-2xl h-60 object-cover shadow-1xl transition-all duration-300 group-hover:scale-110"
//       onLoad={() => setIsImageLoading(false)}
//       onError={(e) => {
//         e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80';
//       }}
//       style={{ opacity: isImageLoading ? 0 : 1 }}
//     />

//     <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

//     {/* Status Badges */}
//     <div className="absolute top-4 left-4 flex flex-wrap gap-2">
//       {/* Removed unwanted badges: Virtual Tour, New Listings, Price Reduced */}
//     </div>

//     {/* Action Buttons */}
//     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onQuickView(property);
//         }}
//         className="interactive-element w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
//       >
//         <ZoomIn className="w-4 h-4 text-gray-700" />
//       </button>
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           if (!currentUser) {
//             navigate('/desktop/login', { state: { from: location } });
//             return;
//           }
//           setIsSaved(!isSaved);
//           toggleFavorite && toggleFavorite(property);
//         }}
//         className={`interactive-element w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isSaved
//           ? 'bg-red-500 text-white hover:scale-110'
//           : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white hover:scale-110'
//           }`}
//       >
//         <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
//       </button>
//     </div>

//     {/* Image Navigation */}
//     {property.images.length > 1 && (
//       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//         {property.images.map((_, index) => (
//           <button
//             key={index}
//             onClick={(e) => {
//               e.stopPropagation();  
//               setCurrentImageIndex(index);
//             }}
//             className={`interactive-element w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'w-6 bg-white' : 'bg-white/60 hover:bg-white/80'
//               }`}
//           />
//         ))}
//       </div>
//     )}
//   </div>

//   <div onClick={(e) => {

//     navigate(`/property/${property.id}`, { state: { property } });
//     // console.log(property.id)

//   }} className={`${viewMode === 'grid' ? 'pt-2 pl-2' : 'pl-4 flex-1'}`}>
//     <div className="flex items-start justify-between mb-1">
//       <div>
//         <p className={`text-base font-semibold p-1 text-[#1f3e72] dark:text-white ${viewMode === 'grid' ? 'text-lg' : 'text-lg'}`}>
//           {property.title}
//         </p>



//         <div className="flex flex-row gap-10">
//           <div className="bg-orange-100 dark:bg-[#ff922d]/10 p-1 rounded-lg inline-block">
//             <p className="text-sm font-semibold text-[#ff922d] dark:text-[#ff922d]">
//               {formatPrice(property.price)}

//               {/* {property.pricePerSqft || Math.round(property.price / property.area)}/sqft */}
//             </p>
//           </div>

//           <div className={`flex items-center gap-2 mb-1 ${viewMode === 'list' ? 'flex-wrap' : ''}`}>
//             <span className="flex items-center gap-0.5 text-xs text-gray-600 dark:text-gray-400">
//               <Bed className="w-4 h-4" />
//               <span className="text-gray-900 text-xs dark:text-white">{property.bedrooms}</span> beds
//             </span>
//             <span className="flex items-center gap-0.5 text-xs text-gray-600 dark:text-gray-400">
//               <Bath className="w-4 h-4" />
//               <span className="text-gray-900 text-xs dark:text-white">{property.bathrooms}</span> baths
//             </span>
//             {/* <span className="flex items-center gap-1 text-xsgray-600 dark:text-gray-400">
//         <Square className="w-4 h-4" />
//         <strong className="text-gray-900 dark:text-white">{property.area?.toLocaleString()}</strong> sqft
//       </span> */}
//           </div>
//         </div>
//       </div>
//       <div>

//       </div>
//       {/* <button className="interactive-element p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//         <MoreHorizontal className="w-5 h-5 text-gray-500" />
//       </button> */}
//     </div>

//     <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
//       <MapPin className="w-4 h-4" />
//       <p className={`text-gray-700  dark:text-gray-300 text-sm ${viewMode === 'grid' ? 'mb-1' : 'mb-2'}`}>{getAddressString(property)}</p>
//     </p>


//     <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'pt-1 border-t border-gray-100 dark:border-gray-700' : ''}`}>
//       <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
//         <Eye className="w-3 h-3" />
//         <span>{property.views || 0} views</span>
//       </div>
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           navigate(`/property/${property.id}`, { state: { property } });
//         }}
//         className="text-[#059669] dark:text-[#51faaa] font-medium text-sm hover:text-[#51faaa]/80 dark:hover:text-[#51faaa]/80 transition-colors flex items-center gap-1"
//       >
//         View Details
//         <ChevronRight className="w-3 h-3" />
//       </button>
//     </div>
//   </div>



// Enhanced Map Component with Real Google Maps
function EnhancedMap({ propertyData, highlightedProperty, onMarkerHover, onPropertySelect, drawnBounds, setDrawnBounds, mapTheme, setMapTheme, mapCenter, setMapCenter, mapZoom, setMapZoom }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [map, setMap] = useState(null);
  const [showSchools, setShowSchools] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [oms, setOms] = useState(null);
  const [visibleProperties, setVisibleProperties] = useState([]);
  const boundsListenerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const normalizedProperties = useMemo(() => {
    const source = Array.isArray(propertyData) ? propertyData : [];
    return source.map((property) => {
      const coords = getNormalizedLatLng(property);
      if (!coords) return null;
      return { ...property, latitude: coords.lat, longitude: coords.lng };
    }).filter(Boolean);
  }, [propertyData]);
  const [mapsApiError, setMapsApiError] = useState(false);
  const navigate = useNavigate();

  // Ensure this component can safely check if the Google Maps API is available
  const mapsReady = typeof window !== 'undefined' && !!(window.google && window.google.maps);
  const canInstantiateMap = typeof window !== 'undefined' && !!(window.google && window.google.maps && typeof window.google.maps.Map === 'function');

  // Add safety check for google object with better error handling
  const safeGoogle = typeof window !== 'undefined' && window.google ? window.google : null;

  // Global error handler for Google Maps API
  useEffect(() => {
    const handleGoogleError = (event) => {
      if (event.message && event.message.includes('google is not defined')) {
        console.warn('Google Maps API not yet loaded, retrying...');
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleGoogleError);

    return () => {
      window.removeEventListener('error', handleGoogleError);
      // Cleanup retry timeout on unmount
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      retryCountRef.current = 0;
    };
  }, []);

  // Track retry attempts to prevent infinite loops
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 5;
  const retryTimeoutRef = useRef(null);

  const onLoad = useCallback(async (mapInstance) => {
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (import.meta.env.DEV) {
      console.log('🗺️ onLoad called with mapInstance:', !!mapInstance, 'retry:', retryCountRef.current);
    }
    setMap(mapInstance);
    try {
      // Wait for Google Maps to be fully loaded. NOTE: do NOT check
      // window.google.maps.Projection here — it's an interface (type), not a
      // runtime property, so it's always undefined and the map would "fail"
      // after retries even though mapInstance is valid and the map loaded fine.
      if (!mapInstance || !window.google || !window.google.maps || !window.google.maps.Map) {
        if (retryCountRef.current >= MAX_RETRIES) {
          if (import.meta.env.DEV) {
            console.error('Google Maps failed to load after', MAX_RETRIES, 'retries');
          }
          return;
        }
        retryCountRef.current += 1;
        if (import.meta.env.DEV) {
          console.warn('Google Maps not fully ready, retrying...', retryCountRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => onLoad(mapInstance), 1000);
        return;
      }

      // Removed invalid check on Projection.prototype.fromLatLngToDivPixel that caused 5-second initialization delay.

      // Reset retry count on success
      retryCountRef.current = 0;

      // Check if we're in production and disable spider if there are issues
      const isProduction = import.meta.env.PROD;
      if (import.meta.env.DEV) console.log('🔍 Environment check - isProduction:', isProduction);

      // Skip OverlappingMarkerSpiderfier in production to avoid errors
      if (isProduction) {
        if (import.meta.env.DEV) console.log('🚫 OverlappingMarkerSpiderfier disabled in production to prevent errors');
        setOms(null);
        if (import.meta.env.DEV) {
          console.log('✅ onLoad completed successfully in production mode');
        }
        return;
      }

      // Only import in development - use dynamic import with error handling
      let OverlappingMarkerSpiderfier;
      try {
        // Add a small delay to ensure Google Maps is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));

        const module = await import('overlapping-marker-spiderfier');
        OverlappingMarkerSpiderfier = module.default;
      } catch (importError) {
        console.warn('⚠️ Failed to import OverlappingMarkerSpiderfier:', importError.message);
        setOms(null);
        return;
      }

      // Ensure the library is properly loaded
      if (!OverlappingMarkerSpiderfier) {
        console.warn('OverlappingMarkerSpiderfier not available');
        return;
      }

      // Wait a bit more for the map to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      // Wrap the spider initialization in a try-catch to handle any remaining errors
      let spider;
      try {
        spider = new OverlappingMarkerSpiderfier(mapInstance, {
          markersWontMove: true,
          markersWontHide: true,
          keepSpiderfied: true,
          nearbyDistance: 1,
          circleSpiralSwitchover: 8
        });
        setOms(spider);
        if (import.meta.env.DEV) {
          console.log('✅ OverlappingMarkerSpiderfier initialized successfully');
        }
      } catch (spiderError) {
        console.warn('⚠️ OverlappingMarkerSpiderfier initialization failed:', spiderError.message);
        // Continue without spider functionality
        setOms(null);
      }
    } catch (e) {
      setOms(null);
    }

    // Debounced bounds-only rendering
    const updateVisible = () => {
      if (!mapInstance) return;
      const bounds = mapInstance.getBounds?.();
      if (!bounds) return;
      const next = (Array.isArray(propertyData) ? propertyData : []).filter((property) => {
        const coords = getNormalizedLatLng(property);
        if (!coords) return false;
        const pos = safeGoogle?.maps?.LatLng ? new safeGoogle.maps.LatLng(coords.lat, coords.lng) : null;
        return bounds.contains(pos);
      });
      setVisibleProperties(next);
    };

    const debouncedUpdate = () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(updateVisible, 150);
    };

    updateVisible();
    boundsListenerRef.current = mapInstance.addListener('bounds_changed', debouncedUpdate);

    // Fit bounds to show all properties if available
    if (propertyData && propertyData.length > 0) {
      const bounds = safeGoogle?.maps?.LatLngBounds ? new safeGoogle.maps.LatLngBounds() : null;
      let validProperties = 0;

      propertyData.forEach(property => {
        const lat = parseFloat(property.latitude);
        const lng = parseFloat(property.longitude);

        if (lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          bounds.extend({ lat, lng });
          validProperties++;
        }
      });

      if (validProperties > 0) {
        mapInstance.fitBounds(bounds);
      }
    }
  }, [propertyData]);

  const onUnmount = useCallback(() => {
    if (boundsListenerRef.current) {
      try { boundsListenerRef.current.remove(); } catch (_) { }
      boundsListenerRef.current = null;
    }
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // Cleanup retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    retryCountRef.current = 0;
    setMap(null);
  }, []);

  // Recompute visible markers on data change
  useEffect(() => {
    if (!map) return;
    const bounds = map.getBounds?.();
    if (!bounds) return;
    const next = (Array.isArray(normalizedProperties) ? normalizedProperties : []).filter((property) => {
      const pos = safeGoogle?.maps?.LatLng ? new safeGoogle.maps.LatLng(property.latitude, property.longitude) : null;
      return bounds.contains(pos);
    });
    setVisibleProperties(next);
  }, [map, normalizedProperties]);

  const mapContainerStyle = { width: '100%', height: '100%' };

  // Get map options based on theme
  const getMapOptions = useMemo(() => {
    const baseOptions = {
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false
    };

    if (mapTheme === 'satellite') {
      baseOptions.mapTypeId = safeGoogle?.maps?.MapTypeId?.SATELLITE;
    } else {
      baseOptions.styles = mapThemes[mapTheme] || mapThemes.default;
    }

    return baseOptions;
  }, [mapTheme]);

  // Custom marker icon
  const createCustomMarker = (property, isHighlighted) => {
    // If API key is not set, use default markers
    return null; // This will use the default Google Maps marker
  };

  const handleMarkerClick = (property) => {
    setSelectedProperty(property);
    onPropertySelect && onPropertySelect(property);

    // Pan map to the selected property so the card is centered
    if (map) {
      map.panTo({
        lat: parseFloat(property.latitude || property.location?.coordinates?.lat),
        lng: parseFloat(property.longitude || property.location?.coordinates?.lng)
      });
      // Optionally adjust zoom to focus nicely on the property
      // map.setZoom(15);
    }
  };

  const handleMarkerMouseOver = (property) => {
    onMarkerHover && onMarkerHover(property.id);
  };

  const handleMarkerMouseOut = () => {
    onMarkerHover && onMarkerHover(null);
  };

  const handleZoomIn = () => {
    if (map) {
      const newZoom = Math.min(map.getZoom() + 1, 20);
      map.setZoom(newZoom);
      setMapZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const newZoom = Math.max(map.getZoom() - 1, 3);
      map.setZoom(newZoom);
      setMapZoom(newZoom);
    }
  };

  const handleCenterMap = () => {
    if (map && propertyData && propertyData.length > 0) {
      const bounds = safeGoogle?.maps?.LatLngBounds ? new safeGoogle.maps.LatLngBounds() : null;
      let validProperties = 0;

      propertyData.forEach(property => {
        const lat = parseFloat(property.latitude);
        const lng = parseFloat(property.longitude);

        if (lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          bounds.extend({ lat, lng });
          validProperties++;
        }
      });

      if (validProperties > 0) {
        map.fitBounds(bounds);
      }
    }
  };

  // Filter valid properties for markers
  const validProperties = useMemo(() => {
    if (!propertyData || !Array.isArray(propertyData)) return [];

    return propertyData.filter(property => {
      const lat = parseFloat(property.latitude);
      const lng = parseFloat(property.longitude);
      return lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
  }, [propertyData]);

  return (
    <div className="relative flex-1 min-w-0 h-[calc(100vh-96px)] bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden">
      {/* API Key Warning */}
      {!HAS_GOOGLE_MAPS_KEY && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">Google Maps API key not configured - showing placeholder</span>
          </div>
        </div>
      )}

      {!HAS_GOOGLE_MAPS_KEY ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="text-center p-8">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Google Maps API Key Required</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please configure your Google Maps API key to view the interactive map.
            </p>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-left text-sm">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Steps to fix:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Enable Maps JavaScript API in Google Cloud Console</li>
                <li>Update API key restrictions to include Maps APIs</li>
                <li>Add your domain to the allowed referrers</li>
              </ol>
            </div>
          </div>
        </div>
      ) : mapsApiError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="text-center p-8">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Maps Temporarily Unavailable</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're having trouble loading the interactive map. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#51faaa] text-[#0a0c19] rounded-lg hover:bg-[#45e595] transition-colors font-medium"
            >
              Refresh Page
            </button>

            {/* Fallback property list */}
            {propertyData && propertyData.length > 0 && (
              <div className="mt-6 text-left">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Available Properties:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {propertyData.slice(0, 5).map((property) => (
                    <div key={property.id} className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-white dark:bg-gray-700 rounded">
                      <div className="font-medium">{property.title || property.address}</div>
                      <div>${property.price?.toLocaleString()}</div>
                      {property.latitude && property.longitude && (
                        <div className="text-gray-500">
                          📍 {property.latitude}, {property.longitude}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        !canInstantiateMap ? (
          <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300">Loading map…</div>
        ) : (
          <div className="w-full h-full">
            <GoogleMapComponent
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={mapZoom}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={getMapOptions}
            >
              {/* Property markers with clustering */}
              {validProperties.length > 0 && (
                <MarkerClusterer
                  options={{
                    maxZoom: 16,
                    gridSize: 60,
                    minimumClusterSize: 2,
                    zoomOnClick: true,
                    averageCenter: true,
                    ignoreHidden: true,
                    calculator: (markers, numStyles) => {
                      const count = markers.length;
                      const index = count < 10 ? 1 : count < 50 ? 2 : 3;
                      const text = count >= 1000 ? `${Math.round(count / 100) / 10}k` : String(count);
                      return { text, index };
                    }
                  }}
                >
                  {(clusterer) => {
                    // Render only the markers inside the current map bounds
                    // (visibleProperties, kept fresh by the bounds_changed
                    // listener in onLoad) instead of all 500+ properties, so
                    // we never build the full Marker set at once — the
                    // clusterer handles the rest as the user pans/zooms.
                    const baseList = Array.isArray(visibleProperties)
                      ? visibleProperties
                      : normalizedProperties;

                    if (normalizedProperties.length === 0) {
                      return null;
                    }

                    return (
                      <>
                        {baseList.map((property, index) => {
                          const coords = getNormalizedLatLng(property);
                          if (!coords) return null;
                          return (
                            <Marker
                              key={property.id || property._id || `${coords.lat},${coords.lng}`}
                              position={{ lat: coords.lat, lng: coords.lng }}
                              onClick={() => handleMarkerClick(property)}
                              onMouseOver={() => handleMarkerMouseOver(property)}
                              onMouseOut={handleMarkerMouseOut}
                              title={property.title || 'Property'}
                              clusterer={clusterer}
                              onLoad={(marker) => {
                                if (oms) { oms.addMarker(marker); }
                              }}
                              onUnmount={(marker) => {
                                if (oms) { try { oms.removeMarker(marker); } catch (_) { } }
                              }}
                            />
                          );
                        })}
                      </>
                    );
                  }}
                </MarkerClusterer>
              )}

              {/* Drawing Manager for boundaries */}
              {drawingMode && (
                <DrawingManager
                  onPolygonComplete={(polygon) => {
                    setDrawnBounds && setDrawnBounds(polygon);
                    setDrawingMode(false);
                  }}
                  options={{
                    drawingControl: false,
                    polygonOptions: {
                      fillColor: '#51faaa',
                      fillOpacity: 0.1,
                      strokeColor: '#51faaa',
                      strokeWeight: 2,
                      clickable: false,
                      editable: true,
                      zIndex: 1
                    }
                  }}
                />
              )}

              {/* Info Window for selected property */}
              {selectedProperty && (
                <InfoWindow
                  position={{
                    lat: parseFloat(selectedProperty.latitude),
                    lng: parseFloat(selectedProperty.longitude)
                  }}
                  onCloseClick={() => setSelectedProperty(null)}
                  options={{
                    pixelOffset: (typeof window !== 'undefined' && window.google && window.google.maps)
                      ? new window.google.maps.Size(0, 400)
                      : undefined,
                    zIndex: 999
                  }}
                >
                  <div className="p-3 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-visible" style={{ zIndex: 1000 }}>
                    <img
                      src={getPropertyImages(selectedProperty)[0]}
                      alt={selectedProperty.title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                      onError={(e) => handleImageError(e, null, selectedProperty)}
                    />
                    <h3 className="text-base font-bold text-gray-900 mb-0 truncate">
                      {typeof selectedProperty.price === 'number' ? `Ksh ${selectedProperty.price.toLocaleString()}` : selectedProperty.price}
                    </h3>
                    <p className="text-xs text-gray-600 mb-0 truncate">{selectedProperty.address}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 mb-2">
                      <span>{selectedProperty.bedrooms} beds</span>
                      <span>{selectedProperty.bathrooms} baths</span>
                      {/* {selectedProperty.area && <span>{selectedProperty.area.toLocaleString()} sqft</span>} */}
                    </div>
                    <button
                      onClick={() => navigate(`/property/${selectedProperty.id}`)}
                      className="w-full px-3 py-1.5 bg-[#51faaa] text-[#0a0c19] rounded-lg hover:bg-[#dbd5a4] transition-colors text-xs font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMapComponent>
          </div>
        )
      )}

      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
          >
            <Plus className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Minus className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        {/* Drawing Tool */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={() => setDrawingMode(!drawingMode)}
            className={`p-3 rounded-xl transition-all duration-300 ${drawingMode
              ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            title="Draw boundary"
          >
            <Map className="w-5 h-5" />
          </button>
        </div>

        {/* Center Map */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={handleCenterMap}
            className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
            title="Center map on properties"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>

        {/* Layer Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={() => setShowSchools(!showSchools)}
            className={`p-3 rounded-xl transition-all duration-300 ${showSchools
              ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            title="Schools"
          >
            <School className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowTransit(!showTransit)}
            className={`p-3 rounded-xl transition-all duration-300 mt-1 ${showTransit
              ? 'bg-[#dbd5a4] text-[#0a0c19] shadow-lg shadow-[#dbd5a4]/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            title="Transit"
          >
            <Train className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Style Selector - bottom-left, stacked above the property-count badge (clear of the zoom rail and Google's top overlays) */}
      <div className="absolute bottom-20 left-6 z-30 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 backdrop-blur">
        <div className="flex gap-1">
          {[
            { label: 'Default', value: 'default', icon: Layers },
            { label: 'Night', value: 'night', icon: Moon },
            { label: 'Satellite', value: 'satellite', icon: Compass }
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => setMapTheme(theme.value)}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs md:text-sm font-medium transition-all duration-300 ${mapTheme === theme.value
                ? 'bg-[#059669] text-[#fff] shadow-lg shadow-[#51faaa]/20'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <theme.icon className="w-4 h-4" />
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Count Badge */}
      <div className="absolute bottom-8 left-6 bg-gradient-to-r from-emerald-500 to-emerald-500 text-[#0a0c19] px-3 py-2 rounded-2xl shadow-lg flex items-center gap-3">
        <Home className="w-5 h-5 text-white" />
        <span className=" text-white">{propertyData.length} properties</span>
      </div>

      {/* Drawing Mode Indicator */}
      {drawingMode && (
        <div className="absolute bottom-4 right-4 bg-[#51faaa] text-[#0a0c19] px-4 py-2 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span className="text-sm font-medium">Click to draw boundary</span>
          </div>
        </div>
      )}
    </div>
  );
}
// { EnhancedMap }
// function EnhancedMap({ propertyData, highlightedProperty, onMarkerHover, onPropertySelect, drawnBounds, setDrawnBounds, mapTheme, setMapTheme, mapCenter, setMapCenter, mapZoom, setMapZoom }) {
//   return (
//     <EnhancedMapComponent
//       propertyData={propertyData}
//       highlightedProperty={highlightedProperty}
//       onMarkerHover={onMarkerHover}
//       onPropertySelect={onPropertySelect}
//       drawnBounds={drawnBounds}
//       setDrawnBounds={setDrawnBounds}
//       mapTheme={mapTheme}
//       setMapTheme={setMapTheme}
//       mapCenter={mapCenter}
//       setMapCenter={setMapCenter}
//       mapZoom={mapZoom}
//       setMapZoom={setMapZoom}
//     />
//   );
// };



// Filters Sidebar
function FiltersSidebar({ filters, setFilters, showFilters, onClose }) {
  if (!showFilters) return null;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      minBaths: '',
      homeTypes: [],
      minSqft: '',
      maxSqft: '',
      minYear: '',
      maxYear: '',
      features: [],
      lotSize: '',
      daysOnMarket: '',
      // Kenyan-focused filters
      isNewlyBuilt: false,
      isRecentlyRenovated: false,
      isServicedApartment: false,
      isFurnished: false,
      isStudentFriendly: false,
      isShortTermLease: false,
      isNearPublicTransport: false,
      isGatedCommunity: false,
      isWaterIncluded: false,
      isWifiIncluded: false,
      hasParking: false,
      hasElevator: false,
      // Location filters
      isNearCBD: false,
      isNearUniversity: false,
      isNearMajorRoads: false,
      selectedEstate: ''
    });
  };

  const homeTypes = ['Apartment', 'Maisonette', 'Bungalow', 'Townhouse', 'Bedsitter / Single Room', 'Shared Housing', 'Land / Plot'];
  const features = [
    '24/7 Security', 'Parking Available', 'Borehole / Water Tank', 'Backup Generator',
    'Balcony', 'Swimming Pool', 'Gym', 'Children\'s Play Area', 'Servant Quarters',
    'Garden', 'Compound', 'Electric Fence', 'CCTV', 'Water Heater'
  ];

  return (
    <motion.div
      className="w-80 bg-white/95 dark:bg-gray-800/95 border-r border-gray-200/50 dark:border-gray-700/50 h-full overflow-y-auto backdrop-blur-xl"
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="p-6">
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <motion.button
              onClick={clearAllFilters}
              className="text-[#51faaa] dark:text-[#51faaa] hover:text-[#dbd5a4] dark:hover:text-[#dbd5a4] text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Clear all
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Quick Filters */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quick Filters</label>
          <div className="space-y-2">
            <motion.label
              className="flex items-center cursor-pointer"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <motion.input
                type="checkbox"
                checked={filters.isFurnished}
                onChange={(e) => handleFilterChange('isFurnished', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]"
                whileTap={{ scale: 0.9 }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Home className="w-4 h-4" />
                </motion.div>
                Furnished
              </span>
            </motion.label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isStudentFriendly}
                onChange={(e) => handleFilterChange('isStudentFriendly', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
                <School className="w-4 h-4" /> Student-Friendly
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isGatedCommunity}
                onChange={(e) => handleFilterChange('isGatedCommunity', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
                <Shield className="w-4 h-4" /> Gated Community
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasParking}
                onChange={(e) => handleFilterChange('hasParking', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
                <Car className="w-4 h-4" /> Parking Available
              </span>
            </label>
          </div>
        </motion.div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Price Range (KES)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa] bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa] bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Beds & Baths */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Beds & Baths</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filters.minBeds}
              onChange={(e) => handleFilterChange('minBeds', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa] bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Any beds</option>
              <option value="0">Single Room (Bedsitter)</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedroom</option>
              <option value="3">3 Bedroom</option>
              <option value="4">4+ Bedroom</option>
            </select>
            <select
              value={filters.minBaths}
              onChange={(e) => handleFilterChange('minBaths', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa] bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Any baths</option>
              <option value="1">1+ baths</option>
              <option value="2">2+ baths</option>
              <option value="3">3+ baths</option>
              <option value="4">4+ baths</option>
            </select>
          </div>
        </div>

        {/* Home Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Home Type</label>
          <div className="space-y-2">
            {homeTypes.map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.homeTypes?.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...(filters.homeTypes || []), type]
                      : (filters.homeTypes || []).filter(t => t !== type);
                    handleFilterChange('homeTypes', newTypes);
                  }}
                  className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Filters */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Location Filters</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isNearCBD}
                onChange={(e) => handleFilterChange('isNearCBD', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">Nairobi CBD</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isNearUniversity}
                onChange={(e) => handleFilterChange('isNearUniversity', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">Near University/College</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isNearMajorRoads}
                onChange={(e) => handleFilterChange('isNearMajorRoads', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">Near Major Roads (Thika Rd, Mombasa Rd, Waiyaki Way, etc.)</span>
            </label>
          </div>
        </div>

        {/* Estate Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Estate Selection</label>
          <select
            value={filters.selectedEstate || ''}
            onChange={(e) => handleFilterChange('selectedEstate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa] bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="">All Estates</option>
            <option value="Kileleshwa">Kileleshwa</option>
            <option value="Umoja">Umoja</option>
            <option value="Runda">Runda</option>
            <option value="Ongata Rongai">Ongata Rongai</option>
            <option value="Westlands">Westlands</option>
            <option value="Kilimani">Kilimani</option>
            <option value="Lavington">Lavington</option>
            <option value="Karen">Karen</option>
            <option value="South B">South B</option>
            <option value="South C">South C</option>
            <option value="Buruburu">Buruburu</option>
            <option value="Donholm">Donholm</option>
            <option value="Embakasi">Embakasi</option>
            <option value="Ruiru">Ruiru</option>
            <option value="Thika">Thika</option>
          </select>
        </div>

        {/* Enhanced Apply Filters Button */}
        <motion.button
          className="w-full bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 transition-all duration-300 relative overflow-hidden"
          whileHover={{
            scale: 1.02,
            y: -2
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative z-10">Apply Filters</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// Quick Filters Component - Now empty since we moved filters to sidebar
const QuickFilters = React.memo(({ filters, setFilters }) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {/* Quick filters moved to sidebar */}
    </div>
  );
});

// Property Card Skeleton
function PropertyCardSkeleton({ viewMode = 'list' }) {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row'
        }`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className={`bg-gray-200 dark:bg-gray-700 ${viewMode === 'grid' ? 'h-64' : 'h-32 w-48 flex-shrink-0'
        }`} />
      <div className={`space-y-4 ${viewMode === 'grid' ? 'p-5' : 'p-4 flex-1'}`}>
        <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${viewMode === 'grid' ? 'h-8 w-3/4' : 'h-6 w-1/2'
          }`} />
        <div className="flex gap-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
        </div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
      </div>
    </motion.div>
  );
}

// Mock property data
// let mockPropertyData = [
//   {
//     id: 1,
//     title: "Beautiful Family Home",
//     price: 179900,
//     pricePerSqft: 137,
//     bedrooms: 2,
//     bathrooms: 2,
//     area: 1308,
//     address: "38 Parklands Dr, Rochester, NY 14616",
//     city: "Rochester",
//     state: "NY",
//     zipCode: "14616",
//     latitude: 43.2081,
//     longitude: -77.6298,
//     images: [
//       "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
//       "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
//       "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"
//     ],
//     listing_type: "House for sale",
//     property_type: "Single Family",
//     days_on_market: 5,
//     agent: "Howard Hanna",
//     listing_agent: {
//       name: "Sarah Johnson",
//       phone: "(585) 555-0123",
//       email: "sarah@howardhanna.com",
//       photo: "https://images.unsplash.com/photo-1494790108755-2616b612b3e5?w=100&h=100&fit=crop&crop=face"
//     },
//     favorite: false,
//     open_house: "Sun 12-1pm (7/21)",
//     year_built: 1995,
//     lot_size: "0.25 acres",
//     garage: 2,
//     features: ["Updated Kitchen", "Hardwood Floors", "Central Air", "Fireplace", "Smart Home", "Energy Efficient"],
//     schools: {
//       elementary: "Lincoln Elementary (8/10)",
//       middle: "Monroe Middle (7/10)",
//       high: "Rochester High (9/10)"
//     },
//     neighborhood: "Park Avenue",
//     walk_score: 78,
//     transit_score: 65,
//     price_history: [
//       { date: "2024-06-01", price: 189900, event: "Listed" },
//       { date: "2024-06-15", price: 179900, event: "Price Drop" }
//     ],
//     virtual_tour: true,
//     is_new: true,
//     is_foreclosure: false,
//     is_price_reduced: true,
//     petFriendly: true,
//     hasParking: true
//   },
//   {
//     id: 2,
//     title: "Modern Luxury Condo",
//     price: 189900,
//     pricePerSqft: 171,
//     bedrooms: 2,
//     bathrooms: 1,
//     area: 1113,
//     address: "66 Gierlach St, Sloan, NY 14212",
//     city: "Sloan",
//     state: "NY",
//     zipCode: "14212",
//     latitude: 42.8864,
//     longitude: -78.8492,
//     images: [
//       "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
//       "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&h=400&fit=crop",
//       "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop"
//     ],
//     listing_type: "Condo for sale",
//     property_type: "Condo",
//     days_on_market: 12,
//     agent: "Howard Hanna WNY Inc",
//     listing_agent: {
//       name: "Michael Chen",
//       phone: "(716) 555-0456",
//       email: "michael@howardhanna.com",
//       photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
//     },
//     favorite: true,
//     open_house: "Sun 1-3pm (7/21)",
//     year_built: 2018,
//     lot_size: "N/A",
//     garage: 1,
//     features: ["Granite Counters", "Stainless Appliances", "In-Unit Laundry", "Balcony", "Pool", "Gym"],
//     schools: {
//       elementary: "Sloan Elementary (6/10)",
//       middle: "Cheektowaga Middle (7/10)",
//       high: "Cheektowaga High (8/10)"
//     },
//     neighborhood: "Village of Sloan",
//     walk_score: 82,
//     transit_score: 70,
//     price_history: [
//       { date: "2024-06-20", price: 189900, event: "Listed" }
//     ],
//     virtual_tour: true,
//     is_new: false,
//     is_foreclosure: false,
//     is_price_reduced: false,
//     petFriendly: false,
//     hasParking: true
//   },
//   {
//     id: 3,
//     title: "Charming Cape Cod",
//     price: 159999,
//     pricePerSqft: 98,
//     bedrooms: 3,
//     bathrooms: 1.5,
//     area: 1632,
//     address: "123 Main St, Buffalo, NY 14201",
//     city: "Buffalo",
//     state: "NY",
//     zipCode: "14201",
//     latitude: 42.8864,
//     longitude: -78.8784,
//     images: [
//       "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop",
//       "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=600&h=400&fit=crop"
//     ],
//     listing_type: "House for sale",
//     property_type: "Single Family",
//     days_on_market: 25,
//     agent: "RE/MAX",
//     listing_agent: {
//       name: "Emily Davis",
//       phone: "(716) 555-0789",
//       email: "emily@remax.com",
//       photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
//     },
//     favorite: false,
//     open_house: null,
//     year_built: 1955,
//     lot_size: "0.15 acres",
//     garage: 1,
//     features: ["Hardwood Floors", "Finished Basement", "Updated Bathroom"],
//     schools: {
//       elementary: "Buffalo Elementary (7/10)",
//       middle: "Buffalo Middle (6/10)",
//       high: "Buffalo High (7/10)"
//     },
//     neighborhood: "Elmwood Village",
//     walk_score: 91,
//     transit_score: 78,
//     price_history: [
//       { date: "2024-05-01", price: 169999, event: "Listed" },
//       { date: "2024-06-10", price: 159999, event: "Price Drop" }
//     ],
//     virtual_tour: false,
//     is_new: false,
//     is_foreclosure: false,
//     is_price_reduced: true,
//     petFriendly: true,
//     hasParking: false
//   }
// ];

// const property_data = mockPropertyData

// Using standard Marker component from @react-google-maps/api

// Main MapView Component
export default function MapView() {
  // Declare state and callbacks BEFORE any usage to avoid TDZ
  const [mapsApiError, setMapsApiError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Alternative Google Maps loading method (referenced by loader onError)
  const loadGoogleMapsAlternative = useCallback(() => {
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps loaded via alternative method');
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${MAP_LIBRARIES.join(',')}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Global callback for alternative loading
    window.initGoogleMaps = () => {
      console.log('✅ Google Maps loaded via alternative callback');
      setMapLoaded(true);
      delete window.initGoogleMaps;
    };

    script.onerror = () => {
      console.error('❌ Alternative Google Maps loading also failed');
      setMapsApiError(true);
    };

    document.head.appendChild(script);
  }, [GOOGLE_MAPS_API_KEY]);

  // Google Maps JS loader with enhanced error handling
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES,
    preventGoogleFontsLoading: true,
    version: 'weekly',
    // Enhanced retry mechanism for production
    retry: true,
    retryDelay: 2000,
    // Add callback for successful load
    onLoad: () => {
      console.log('✅ Google Maps API loaded successfully');
      setMapLoaded(true);
    },
    // Add callback for load errors
    onError: (error) => {
      console.error('❌ Google Maps API failed to load:', error);
      console.error('🔑 API Key being used:', GOOGLE_MAPS_API_KEY ? GOOGLE_MAPS_API_KEY.substring(0, 10) + '...' : 'MISSING');
      console.error('🌍 Environment:', import.meta.env.MODE);
      console.error('🔗 API URL:', import.meta.env.VITE_API_URL);
      setMapsApiError(true);

      // Try alternative loading method
      setTimeout(() => {
        if (!window.google || !window.google.maps) {
          console.warn('⚠️ Attempting alternative Google Maps loading...');
          loadGoogleMapsAlternative();
        }
      }, 3000);
    }
  });

  // Enhanced error logging for production debugging
  useEffect(() => {
    if (loadError) {
      console.error('🚨 Google Maps Load Error Details:', {
        error: loadError,
        apiKey: GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing',
        environment: import.meta.env.MODE,
        apiUrl: import.meta.env.VITE_API_URL,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    }
  }, [loadError]);

  // Safety: if the loader reports loaded and google.maps exists, mark map as loaded
  useEffect(() => {
    if (isLoaded && !mapLoaded && typeof window !== 'undefined' && window.google && window.google.maps) {
      setMapLoaded(true);
    }
  }, [isLoaded, mapLoaded]);

  const mapsReady = isLoaded || (typeof window !== 'undefined' && window.google && window.google.maps) || mapLoaded;

  // All other state variables - moved to top to avoid hooks order violation
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    listingType: 'all', // 'all' | 'rent' | 'sale'
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    minBaths: '',
    homeTypes: [],
    minSqft: '',
    maxSqft: '',
    minYear: '',
    maxYear: '',
    features: [],
    lotSize: '',
    daysOnMarket: '',
    // Kenyan-focused filters
    isNewlyBuilt: false,
    isRecentlyRenovated: false,
    isServicedApartment: false,
    isFurnished: false,
    isStudentFriendly: false,
    isShortTermLease: false,
    isNearPublicTransport: false,
    isGatedCommunity: false,
    isWaterIncluded: false,
    isWifiIncluded: false,
    hasParking: false,
    hasElevator: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState('price');
  const [propertyData, setPropertyData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [visibleCardCount, setVisibleCardCount] = useState(24);
  const sentinelRef = useRef(null);
  // Desktop map drawer — collapsed by default so the full listings page gets
  // the room; toggled via the floating "Show map" button.
  const [showMap, setShowMap] = useState(false);
  // "Map is hidden" hint — shown once on first visit until the user opens the
  // map or dismisses it (persisted so it doesn't nag on later visits).
  const [mapHintDismissed, setMapHintDismissed] = useState(
    () => { try { return localStorage.getItem('bm_map_hint_seen') === '1'; } catch (_) { return false; } }
  );
  const dismissMapHint = () => {
    setMapHintDismissed(true);
    try { localStorage.setItem('bm_map_hint_seen', '1'); } catch (_) { }
  };
  const [highlightedProperty, setHighlightedProperty] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [quickViewProperty, setQuickViewProperty] = useState(null);
  const [drawnBounds, setDrawnBounds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [mapTheme, setMapTheme] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  // Other hooks that need to be at the top
  const { currentUser, toggleFavorite, isFavorite } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  // Simple geocode cache in-memory (and sync with localStorage)
  const geocodeCacheRef = useRef(null);

  // Data fetching hooks - must be at top level
  let { data, isError, isLoading: propertiesLoading } = useProperties()
  const properties = data?.properties || []

  // Enhanced debugging for property data
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Property data from API:', data);
      console.log('Properties array:', properties);
      console.log('Properties with coordinates:', properties.filter(p => p.latitude && p.longitude));
    } else {
      // Production debugging
      console.log('🏠 Property data status:', {
        hasData: !!data,
        propertiesCount: properties.length,
        isLoading: propertiesLoading,
        isError,
        dataStructure: data ? Object.keys(data) : 'No data',
        firstProperty: properties[0] ? Object.keys(properties[0]) : 'No properties'
      });
    }
  }, [data, properties, propertiesLoading, isError]);

  // Add Google Maps event listeners
  useEffect(() => {
    // Listen for Google Maps API loaded event
    const handleGoogleMapsLoaded = () => {
      if (import.meta.env.DEV) {
        console.log('🗺️ Google Maps API loaded, re-rendering components...');
      }
      setMapLoaded(true);
    };

    // Listen for Google Maps API errors
    const handleGoogleMapsError = () => {
      console.warn('⚠️ Google Maps API failed to load, using fallback mode');
      setMapsApiError(true);
    };

    window.addEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
    window.addEventListener('googleMapsError', handleGoogleMapsError);

    return () => {
      window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
      window.removeEventListener('googleMapsError', handleGoogleMapsError);
    };
  }, []);

  // Handle load errors
  useEffect(() => {
    if (loadError) {
      console.error('Google Maps JS API load error:', loadError);
      setMapsApiError(true);
    }
  }, [loadError]);

  // Handle URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
  }, [location.search]);

  // Initialize geocode cache
  useEffect(() => {
    try {
      const raw = localStorage.getItem('geocodeCache');
      geocodeCacheRef.current = raw ? JSON.parse(raw) : {};
    } catch (_) {
      geocodeCacheRef.current = {};
    }
  }, []);

  // Helper functions (moved up to avoid hooks order issues)
  const persistGeocodeCache = () => {
    try {
      localStorage.setItem('geocodeCache', JSON.stringify(geocodeCacheRef.current || {}));
    } catch (_) { }
  };

  const buildAddressString = (p) => {
    const parts = [];
    // Support multiple shapes: flat fields or nested location
    const addr = p.address || p.location?.address || '';
    const city = p.city || p.location?.city || '';
    const state = p.state || p.location?.state || '';
    const zip = p.zipCode || p.location?.zipCode || '';

    // Build more specific address for better geocoding
    if (addr) parts.push(addr);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (zip) parts.push(zip);

    // Always add Kenya for better geocoding accuracy
    if (!parts.includes('Kenya')) {
      parts.push('Kenya');
    }

    return parts.join(', ');
  };

  const geocodeAddress = async (address) => {
    if (!address) return null;
    const cacheKey = address.toLowerCase();
    const cached = geocodeCacheRef.current?.[cacheKey];
    if (cached) return cached;
    try {
      // Use more specific geocoding parameters for better accuracy
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=ke&components=country:KE&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      console.log(`Geocoding response for "${address}":`, {
        status: data.status,
        resultsCount: data.results?.length || 0,
        firstResult: data.results?.[0]?.formatted_address
      });

      if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
        const loc = data.results[0].geometry.location;
        geocodeCacheRef.current = geocodeCacheRef.current || {};
        geocodeCacheRef.current[cacheKey] = { lat: loc.lat, lng: loc.lng };
        persistGeocodeCache();
        return { lat: loc.lat, lng: loc.lng };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  // Extract coordinates from a Google Maps URL if provided
  const parseLatLngFromGoogleMapsUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
      const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
      const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
      const daddrMatch = url.match(/[?&]daddr=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (daddrMatch) return { lat: parseFloat(daddrMatch[1]), lng: parseFloat(daddrMatch[2]) };
    } catch (_) { }
    return null;
  };

  // Load property data
  useEffect(() => {
    const loadProperties = async () => {
      if (!properties) {
        return;
      }
      setIsLoading(true);
      try {

        // Process properties to ensure they have required fields for maps; geocode when missing
        const processedProperties = await Promise.all(properties.map(async (property, index) => {
          // Highest priority: stored coordinates (support nested shapes)
          const rawLat = property.latitude ?? property.lat ?? property.location?.coordinates?.lat;
          const rawLng = property.longitude ?? property.lng ?? property.location?.coordinates?.lng;
          let lat = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat;
          let lng = typeof rawLng === 'string' ? parseFloat(rawLng) : rawLng;

          // Debug logging to see what coordinates we're working with
          console.log(`Property ${property.id || index}:`, {
            title: property.title,
            rawLat, rawLng,
            parsedLat: lat, parsedLng: lng,
            address: property.address,
            city: property.city,
            hasStoredCoords: !!(rawLat && rawLng && rawLat !== 0 && rawLng !== 0)
          });

          // Validate coordinate ranges (Kenya is roughly -4.7 to 4.6 lat, 33.9 to 41.9 lng)
          const isValidKenyanCoordinate = (lat, lng) => {
            return Number.isFinite(lat) && Number.isFinite(lng) &&
              lat >= -5 && lat <= 5 && lng >= 33 && lng <= 42 &&
              lat !== 0 && lng !== 0; // Exclude 0,0 coordinates
          };

          // Only geocode if we don't have valid stored coordinates
          if (!isValidKenyanCoordinate(lat, lng)) {
            if (import.meta.env.DEV) console.log(`Property ${property.id || index}: No valid stored coordinates, attempting geocoding...`);

            // Try multiple geocoding strategies for better precision
            let geo = null;

            // Strategy 1: Try with full address
            const addrStr = buildAddressString(property);
            if (import.meta.env.DEV) console.log(`Geocoding address: "${addrStr}"`);
            geo = await geocodeAddress(addrStr);

            // Strategy 2: If that fails, try with just city + Kenya for more general location
            if (!geo && property.city) {
              const cityStr = `${property.city}, Kenya`;
              if (import.meta.env.DEV) console.log(`Trying city-only geocoding: "${cityStr}"`);
              geo = await geocodeAddress(cityStr);
            }

            if (geo && isValidKenyanCoordinate(geo.lat, geo.lng)) {
              if (import.meta.env.DEV) console.log(`Geocoding successful: ${geo.lat}, ${geo.lng}`);
              lat = geo.lat;
              lng = geo.lng;
            } else {
              if (import.meta.env.DEV) console.log(`Geocoding failed for property ${property.id || index}`);
            }
          } else {
            if (import.meta.env.DEV) console.log(`Property ${property.id || index}: Using stored coordinates ${lat}, ${lng}`);
          }

          if (!isValidKenyanCoordinate(lat, lng)) {
            // Fallback near Nairobi with larger offset to avoid overlapping
            // Use a more spread out pattern to ensure visible separation
            const offsetLat = (index % 10) * 0.02; // 0.02 degrees ≈ 2.2km
            const offsetLng = Math.floor(index / 10) * 0.02;
            lat = -1.2921 + offsetLat;
            lng = 36.8219 + offsetLng;
          }

          return {
            ...property,
            latitude: lat,
            longitude: lng,
            // Ensure other required fields exist with real data or sensible defaults
            images: property.images || [],
            features: property.features || [],
            agent: property.agent || null,
            listing_agent: property.listing_agent || null,
            neighborhood: property.neighborhood || null,
            schools: property.schools || [],
            price_history: property.price_history || [],
            virtual_tour: property.virtual_tour || false,
            is_new: property.is_new || false,
            is_price_reduced: property.is_price_reduced || false,
            petFriendly: property.petFriendly || false,
            hasParking: property.hasParking || false,
            open_house: property.open_house || null,
            days_on_market: property.days_on_market || 0,
            // Kenyan-focused properties
            isNewlyBuilt: property.isNewlyBuilt || false,
            isRecentlyRenovated: property.isRecentlyRenovated || false,
            isServicedApartment: property.isServicedApartment || false,
            isFurnished: property.isFurnished || false,
            isStudentFriendly: property.isStudentFriendly || false,
            isShortTermLease: property.isShortTermLease || false,
            isNearPublicTransport: property.isNearPublicTransport || false,
            isGatedCommunity: property.isGatedCommunity || false,
            isWaterIncluded: property.isWaterIncluded || false,
            isWifiIncluded: property.isWifiIncluded || false,
            hasElevator: property.hasElevator || false,
            // Location properties
            isNearCBD: property.isNearCBD || false,
            isNearUniversity: property.isNearUniversity || false,
            isNearMajorRoads: property.isNearMajorRoads || false,
            estate: property.estate || ''
          };
        }));

        // Handle duplicate coordinates by adding small offsets
        const coordinateMap = {}; // Use plain object instead of Map constructor
        const finalProperties = processedProperties.map((property, index) => {
          const lat = property.latitude;
          const lng = property.longitude;
          const coordKey = `${lat},${lng}`; // Use full precision for grouping

          if (coordinateMap[coordKey]) {
            // This coordinate already exists, add a small offset
            const existingCount = coordinateMap[coordKey];
            coordinateMap[coordKey] = existingCount + 1;

            // Create a small circular offset pattern
            const angle = (existingCount * 2 * Math.PI) / 8; // 8 positions around a circle
            const offsetDistance = 0.0005; // Very small offset (about 50 meters)
            const offsetLat = lat + (offsetDistance * Math.cos(angle));
            const offsetLng = lng + (offsetDistance * Math.sin(angle));

            return {
              ...property,
              latitude: offsetLat,
              longitude: offsetLng,
              originalLatitude: lat, // Keep original for reference
              originalLongitude: lng
            };
          } else {
            coordinateMap[coordKey] = 1;
            return property;
          }
        });

        // Log summary of coordinate sources
        const storedCoords = finalProperties.filter(p => !p.originalLatitude).length;
        const geocodedCoords = finalProperties.filter(p => p.originalLatitude).length;
        const fallbackCoords = finalProperties.filter(p =>
          p.latitude >= -1.3 && p.latitude <= -1.2 && p.longitude >= 36.8 && p.longitude <= 36.9
        ).length;

        if (import.meta.env.DEV) console.log('Coordinate Summary:', {
          total: finalProperties.length,
          storedCoordinates: storedCoords,
          geocodedCoordinates: geocodedCoords,
          fallbackCoordinates: fallbackCoords
        });

        if (import.meta.env.DEV) console.log('Processed properties:', finalProperties);
        setPropertyData(finalProperties);
      }
      catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [properties]);

  // Apply filters
  useEffect(() => {
    let filtered = Array.isArray(propertyData) ? [...propertyData] : []

    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase().trim();

      filtered = filtered.filter(property => {
        // Create a comprehensive search string from all relevant property fields
        const searchableFields = [
          // Basic location fields
          property.address || '',
          property.city || '',
          property.state || '',
          property.zipCode || '',

          // Property description and title
          property.description || '',
          property.title || '',

          // Neighborhood and estate information
          (typeof property.neighborhood === 'string' ? property.neighborhood : property.neighborhood?.name) || '',
          property.estate || '',

          // Location object fields (if property uses nested location structure)
          property.location?.address || '',
          property.location?.city || '',
          property.location?.state || '',
          property.location?.neighborhood || '',
          property.location?.estate || '',

          // Property features and amenities
          Array.isArray(property.features) ? property.features.join(' ') : '',
          Array.isArray(property.amenities) ? property.amenities.join(' ') : '',

          // Property type and listing type
          property.property_type || '',
          property.listing_type || '',
          property.type || '',

          // Additional location-related fields
          property.area_name || '',
          property.district || '',
          property.region || '',
          property.county || '',

          // Agent information (sometimes includes location context)
          property.agent?.name || '',
          property.listing_agent?.name || ''
        ].join(' ').toLowerCase();

        return searchableFields.includes(searchTerm);
      });
    }

    // Apply all other filters
    if (filters.listingType && filters.listingType !== 'all') {
      filtered = filtered.filter(p => {
        const t = String(p.listing_type || p.type || '').toLowerCase();
        const isRent = t === 'rent' || t === 'rental' || t === 'for-rent' || t === 'for rent';
        return filters.listingType === 'rent' ? isRent : !isRent;
      });
    }

    if (filters.minPrice) {
      filtered = filtered.filter(property => {
        const price = parseFloat(property.price) || 0;
        return price >= parseFloat(filters.minPrice);
      });
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(property => {
        const price = parseFloat(property.price) || 0;
        return price <= parseFloat(filters.maxPrice);
      });
    }

    if (filters.minBeds) {
      filtered = filtered.filter(property => {
        const beds = parseInt(property.bedrooms) || 0;
        return beds >= parseInt(filters.minBeds);
      });
    }

    if (filters.minBaths) {
      filtered = filtered.filter(property => {
        const baths = parseInt(property.bathrooms) || 0;
        return baths >= parseInt(filters.minBaths);
      });
    }

    if (filters.homeTypes.length > 0) {
      filtered = filtered.filter(property => {
        const propertyType = property.property_type || property.type || '';
        return filters.homeTypes.some(type =>
          propertyType.toLowerCase().includes(type.toLowerCase())
        );
      });
    }

    if (filters.minSqft) {
      filtered = filtered.filter(property => {
        const sqft = parseFloat(property.square_feet) || 0;
        return sqft >= parseFloat(filters.minSqft);
      });
    }

    if (filters.maxSqft) {
      filtered = filtered.filter(property => {
        const sqft = parseFloat(property.square_feet) || 0;
        return sqft <= parseFloat(filters.maxSqft);
      });
    }

    if (filters.minYear) {
      filtered = filtered.filter(property => {
        const year = parseInt(property.year_built) || 0;
        return year >= parseInt(filters.minYear);
      });
    }

    if (filters.maxYear) {
      filtered = filtered.filter(property => {
        const year = parseInt(property.year_built) || 0;
        return year <= parseInt(filters.maxYear);
      });
    }

    if (filters.features.length > 0) {
      filtered = filtered.filter(property => {
        const propertyFeatures = Array.isArray(property.features) ? property.features : [];
        return filters.features.every(feature =>
          propertyFeatures.some(pf =>
            pf.toLowerCase().includes(feature.toLowerCase())
          )
        );
      });
    }

    if (filters.lotSize) {
      filtered = filtered.filter(property => {
        const lotSize = parseFloat(property.lot_size) || 0;
        return lotSize >= parseFloat(filters.lotSize);
      });
    }

    if (filters.daysOnMarket) {
      filtered = filtered.filter(property => {
        const days = parseInt(property.days_on_market) || 0;
        return days <= parseInt(filters.daysOnMarket);
      });
    }

    // Kenyan-specific filters
    if (filters.isNewlyBuilt) {
      filtered = filtered.filter(property => property.isNewlyBuilt);
    }

    if (filters.isRecentlyRenovated) {
      filtered = filtered.filter(property => property.isRecentlyRenovated);
    }

    if (filters.isServicedApartment) {
      filtered = filtered.filter(property => property.isServicedApartment);
    }

    if (filters.isFurnished) {
      filtered = filtered.filter(property => property.isFurnished);
    }

    if (filters.isStudentFriendly) {
      filtered = filtered.filter(property => property.isStudentFriendly);
    }

    if (filters.isShortTermLease) {
      filtered = filtered.filter(property => property.isShortTermLease);
    }

    if (filters.isNearPublicTransport) {
      filtered = filtered.filter(property => property.isNearPublicTransport);
    }

    if (filters.isGatedCommunity) {
      filtered = filtered.filter(property => property.isGatedCommunity);
    }

    if (filters.isWaterIncluded) {
      filtered = filtered.filter(property => property.isWaterIncluded);
    }

    if (filters.isWifiIncluded) {
      filtered = filtered.filter(property => property.isWifiIncluded);
    }

    if (filters.hasParking) {
      filtered = filtered.filter(property => property.hasParking);
    }

    if (filters.hasElevator) {
      filtered = filtered.filter(property => property.hasElevator);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || b.date_listed || 0) - new Date(a.created_at || a.date_listed || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || a.date_listed || 0) - new Date(b.created_at || b.date_listed || 0));
        break;
      case 'beds':
        filtered.sort((a, b) => (parseInt(b.bedrooms) || 0) - (parseInt(a.bedrooms) || 0));
        break;
      case 'baths':
        filtered.sort((a, b) => (parseInt(b.bathrooms) || 0) - (parseInt(a.bathrooms) || 0));
        break;
      case 'sqft':
        filtered.sort((a, b) => (parseFloat(b.square_feet) || 0) - (parseFloat(a.square_feet) || 0));
        break;
      default:
        break;
    }

    // Rentals first, sales after — stable sort preserves the prior ordering within each group.
    const isRental = (p) => {
      const t = String(p.listing_type || p.type || '').toLowerCase();
      return t === 'rent' || t === 'rental' || t === 'for-rent' || t === 'for rent';
    };
    filtered.sort((a, b) => (isRental(a) ? 0 : 1) - (isRental(b) ? 0 : 1));

    setFilteredData(filtered);
    // Reset list pagination whenever the dataset/filters change
    setVisibleCardCount(24);
  }, [propertyData, searchQuery, filters, sortBy]);

  // Infinite scroll: auto-load the next page of cards when the sentinel at the
  // bottom of the list scrolls into view (instead of requiring a button click).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const scrollRoot = document.getElementById('listings-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && visibleCardCount < filteredData.length) {
          setVisibleCardCount((c) => c + 24);
        }
      },
      { root: scrollRoot, rootMargin: '200px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCardCount, filteredData.length]);

  // Timeout effect to handle Google Maps loading failures
  useEffect(() => {
    if (!isLoaded && !mapsReady && !loadingTimeout) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Google Maps loading timeout - proceeding without map');
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoaded, mapsReady, loadingTimeout]);

  // Event handlers
  const handlePropertyHover = useCallback((propertyId) => {
    setHighlightedProperty(propertyId);
  }, []);

  const handlePropertySelect = (property) => {
    setHighlightedProperty(property.id);
    const element = document.getElementById(`property-card-${property.id}`);
    if (element) {
      // Scroll the card to be centered in the view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Optionally add a brief highlighting effect class by simulating hover if needed,
      // but setHighlightedProperty already adds a highlight styling in PropertyCard.
    }
  };

  const handleQuickView = (property) => {
    setQuickViewProperty(property);
  };

  // Debug logging for map loading (always show in production for debugging)
  if (import.meta.env.DEV) console.log('🔍 Map loading debug:', {
    isLoaded,
    loadError,
    mapsApiError,
    mapLoaded,
    mapsReady,
    hasGoogle: typeof window !== 'undefined' && !!window.google,
    hasGoogleMaps: typeof window !== 'undefined' && !!(window.google && window.google.maps),
    apiKey: GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'MISSING',
    hasApiKey: HAS_GOOGLE_MAPS_KEY
  });

  // Google Maps load errors are handled in the Map Area below (CartoFallbackView),
  // so the surrounding page layout (navbar, filters, insights, listings) still renders.
  // Don't render anything until Google Maps is loaded (unless timeout)
  if (false && !isLoaded && !mapsReady && !loadingTimeout) {
    console.log('⏳ Waiting for Google Maps API to load...');
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Map</h3>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we load the interactive map...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            API Key: {HAS_GOOGLE_MAPS_KEY ? 'Present' : 'Missing'}
          </p>
        </div>
      </div>
    );
  }

  // If timeout occurred, show a fallback UI
  if (false && loadingTimeout && !isLoaded && !mapsReady) {
    console.log('⚠️ Google Maps loading timeout - showing fallback UI');
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Map Loading Timeout</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Google Maps is taking longer than expected to load. You can continue without the map.
          </p>
          <button
            onClick={() => {
              setLoadingTimeout(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => setLoadingTimeout(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Continue Without Map
          </button>
        </div>
      </div>
    );
  }

  // No full-page returns for missing key / Google Maps errors: the Map Area below
  // renders CartoFallbackView so the rest of the custom page UI stays intact.



  // Handle location selection from search bar
  const handleLocationSelect = (location) => {
    setUserLocation(location);
    setMapCenter({ lat: location.latitude, lng: location.longitude });
    setMapZoom(12); // Zoom in closer for user location
  };

  // Fallback mode: Show property list without map if Google Maps fails to load
  if (false && loadingTimeout && !isLoaded && !mapsReady) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
        {/* Enhanced Mobile Navigation */}
        <EnhancedMobileMapNavigation
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          propertyCount={filteredData.length}
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onLocationSelect={handleLocationSelect}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          userLocation={userLocation}
        />

        {/* Fallback Content - Property List Only */}
        <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-96px)]">
          {/* Property List Sidebar */}
          <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Map Unavailable</span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Google Maps is not available. Showing property list only.
                </p>
              </div>

              <div className="space-y-4">
                {filteredData.length > 0 ? (
                  filteredData.map((property, index) => (
                    <div key={property.id || property._id || index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {property.title || property.name || 'Property'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {property.address || 'Address not available'}
                      </p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {property.price ? `$${property.price.toLocaleString()}` : 'Price not available'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No properties found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARTO/OpenStreetMap fallback map */}
          <div className="flex-1 relative min-w-0">
            <CartoFallbackView
              propertyData={filteredData}
              onPropertySelect={handlePropertySelect}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* Enhanced Mobile Navigation */}
      <EnhancedMobileMapNavigation
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        propertyCount={filteredData.length}
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onLocationSelect={handleLocationSelect}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
        locationLoading={locationLoading}
        setLocationLoading={setLocationLoading}
      />

      {/* Enhanced Desktop Header Navigation */}
      <motion.div
        className="hidden lg:block bg-white/95 dark:bg-gray-800/95 border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 backdrop-blur-xl shadow-lg shadow-black/5"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="px-4 lg:px-6 py-2">
          {/* Top Row - Search, Logo, and Navigation */}
          <motion.div
            className="flex items-center justify-between gap-6 mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Left - Search Bar and View Toggle */}
            <div className="flex items-center gap-4 flex-1 max-w-3xl">
              <div className="flex-1 min-w-0">
                <SmartSearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  propertyCount={filteredData.length}
                  filters={filters}
                  onFilterChange={setFilters}
                  showFilters={showFilters}
                  onToggleFilters={() => {
                    setActiveFilterSection('price');
                    setShowFilters(!showFilters);
                  }}
                  onLocationSelect={handleLocationSelect}
                  onSearch={(query) => {
                    setSearchQuery(query);
                    // Trigger search logic here
                  }}
                  suggestions={[
                    'Apartments in Nairobi',
                    'Houses in Mombasa',
                    'Land in Kisumu',
                    'Commercial properties',
                    'Student housing',
                    'Gated communities'
                  ]}
                />
              </div>

              {/* Quick Filter Access Section */}
              <div className="hidden xl:flex items-center gap-2 flex-shrink-0 bg-gray-100/50 dark:bg-gray-700/50 p-1 rounded-full border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
                <button
                  onClick={() => {
                    setActiveFilterSection('price');
                    setShowFilters(true);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm transition-all flex items-center gap-1.5"
                >
                  <DollarSign className="w-3 h-3 text-emerald-500" />
                  Price
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
                <button
                  onClick={() => {
                    setActiveFilterSection('property');
                    setShowFilters(true);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Bed className="w-3 h-3 text-emerald-500" />
                  Beds
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
                <button
                  onClick={() => {
                    setActiveFilterSection('property');
                    setShowFilters(true);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Home className="w-3 h-3 text-emerald-500" />
                  Type
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
              </div>
            </div>

            {/* Enhanced Center - Brand Logo */}
            <motion.div
              className="flex items-center justify-center flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Link className="group" to="/">
                <Logo
                  isDark={isDark}
                  variant="premium"
                  greenStyle="premium"
                  glow="subtle"
                  pulse="hover"
                  className="text-xl sm:text-2xl lg:text-3xl group-hover:opacity-90"
                />
              </Link>
            </motion.div>

            {/* Enhanced Right - Controls Only */}
            <motion.div
              className="flex items-center gap-3 flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              {/* Enhanced Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 relative overflow-hidden backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50"
                whileHover={{
                  scale: 1.1,
                  y: -2
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Subtle background glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0"
                  whileHover={{
                    opacity: 0.1,
                    backgroundColor: isDark ? "#fbbf24" : "#6b7280"
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="relative z-10"
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600" />
                  )}
                </motion.div>
              </motion.button>

              {/* Auth Buttons / Profile */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <a href="/account" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="inline-flex w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#51faaa] to-[#dbd5a4]">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt={currentUser.displayName || currentUser.email} width="40" height="40" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <span className="m-auto font-semibold text-[#111]">{(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[140px] truncate">
                      {currentUser.displayName || currentUser.email}
                    </span>
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <a href="/login" className="px-5 py-2.5 text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#0a0c19] dark:hover:text-[#0a0c19] transition-colors rounded-full hover:bg-[#51faaa]/20 dark:hover:bg-[#51faaa]/30">
                    Sign In
                  </a>
                  <a href="/register" className="px-6 py-2.5 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-full text-base font-semibold hover:shadow-lg hover:shadow-[#51faaa]/30 transition-all duration-300">
                    Get Started
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Bottom Row - Sort and Quick Filters */}
          <div className="flex items-center justify-between gap-3">
            {/* Left - Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilters(prev => ({ ...prev, isNearPublicTransport: !prev.isNearPublicTransport }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${filters.isNearPublicTransport
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <Bus className="w-3 h-3" />
                Transit
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, isWaterIncluded: !prev.isWaterIncluded }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${filters.isWaterIncluded
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <Droplets className="w-3 h-3" />
                Water
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, isWifiIncluded: !prev.isWifiIncluded }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${filters.isWifiIncluded
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <Wifi className="w-3 h-3" />
                Fibre
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, isGatedCommunity: !prev.isGatedCommunity }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${filters.isGatedCommunity
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <Shield className="w-3 h-3" />
                Secure
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, isNewlyBuilt: !prev.isNewlyBuilt }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${filters.isNewlyBuilt
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <Building className="w-3 h-3" />
                Modern
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, hasElevator: !prev.hasElevator }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${filters.hasElevator
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <ArrowUpDown className="w-3 h-3" />
                Elevator
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, hasParking: !prev.hasParking }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${filters.hasParking
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <Car className="w-3 h-3" />
                Parking
              </button>
            </div>

            {/* Right - Listing type toggle + Sort Dropdown (unified group) */}
            <div className="flex items-center shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5 gap-0">
              {[
                { v: 'all', label: 'All' },
                { v: 'rent', label: 'For Rent' },
                { v: 'sale', label: 'For Sale' },
              ].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setFilters(prev => ({ ...prev, listingType: opt.v }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    (filters.listingType || 'all') === opt.v
                      ? 'bg-[#51faaa] text-[#0a0c19] shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {/* thin divider */}
              <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-2 py-1 bg-transparent border-0 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low-High</option>
                <option value="price_high">Price: High-Low</option>
                <option value="beds">Most Beds</option>
                <option value="sqft">Largest</option>
              </select>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Main Content - Fixed Layout (wrapper removed per request) */}
      {/* Conditional Filters Sidebar - Only show when showFilters is true */}
      {showFilters && (
        <>
          <div className="fixed inset-x-0 top-[96px] bottom-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowFilters(false)} />
          <div className="fixed left-0 top-[96px] w-80 h-[calc(100vh-96px)] z-50">
            <AdvancedFiltersSidebar
              filters={filters}
              setFilters={setFilters}
              showFilters={showFilters}
              onClose={() => setShowFilters(false)}
              initialSection={activeFilterSection}
              propertyCount={filteredData.length}
            />
          </div>
        </>
      )}

      {/* Map Area — desktop: hidden by default so the full listings page gets the
          room. Clicking "Show map" morphs into the original split layout (map on
          the left ~48%, list on the right ~52%) as the list animates narrower.
          Mobile: full-screen map when viewMode is 'map'. The map only mounts
          when shown. */}
      <div className={`relative z-0 pointer-events-auto transition-all duration-300 ${viewMode === 'map' ? 'block' : 'hidden'
        } lg:block ${showMap ? 'lg:pr-[52%] xl:pr-[50%] 2xl:pr-[48%]' : 'lg:pr-0'
        }`}>
        <ErrorBoundary>
          {(viewMode === 'map' || showMap) && (
            // Fade the map in as it mounts, synced with the list's 300ms shrink
            // so the full-width -> split morph feels smooth.
            <div className="relative animate-[mapFadeIn_0.4s_ease-out]">
              {/* Collapse back to the full listings page (desktop only) */}
              <button
                onClick={() => setShowMap(false)}
                className="hidden lg:flex absolute top-3 right-3 z-[1200] w-9 h-9 rounded-full bg-gray-900/80 text-white items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
                aria-label="Hide map"
              >
                <X className="w-4 h-4" />
              </button>
              {!HAS_GOOGLE_MAPS_KEY || mapsApiError || !!loadError ? (
                <CartoFallbackView
                  propertyData={filteredData}
                  onPropertySelect={handlePropertySelect}
                />
              ) : (
                <EnhancedMap
                  propertyData={filteredData}
                  highlightedProperty={highlightedProperty}
                  onMarkerHover={handlePropertyHover}
                  onPropertySelect={handlePropertySelect}
                  drawnBounds={drawnBounds}
                  setDrawnBounds={setDrawnBounds}
                  mapTheme={mapTheme}
                  setMapTheme={setMapTheme}
                  mapCenter={mapCenter}
                  setMapCenter={setMapCenter}
                  mapZoom={mapZoom}
                  setMapZoom={setMapZoom}
                />
              )}
            </div>
          )}
        </ErrorBoundary>
      </div>

      {/* Floating map toggle (desktop only) — collapsed by default so the full
          listings page gets the room; opens the original split layout. */}
      <button
        onClick={() => { setShowMap((v) => !v); dismissMapHint(); }}
        className={`hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-5 py-3 rounded-full shadow-xl text-sm font-semibold transition-all duration-300 ${showMap
          ? 'bg-gray-900/80 text-white hover:bg-gray-700'
          : 'bg-gradient-to-r from-[#51faaa] to-emerald-500 text-[#0a0c19] hover:scale-105 hover:shadow-[#51faaa]/30'
          }`}
      >
        {showMap ? <X className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
        <span>{showMap ? 'Hide map' : 'Show map'}</span>
      </button>

      {/* Fixed Listings Container - Only this scrolls. Full width by default;
          shrinks to the original split width when the map is shown. */}
      <div className={`fixed right-0 top-[170px] lg:top-[99px] w-full ${showMap ? 'lg:w-[52%] xl:w-[50%] 2xl:w-[48%]' : 'lg:w-full'} h-[calc(100vh-170px)] lg:h-[calc(100vh-99px)] flex-col bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-20 pointer-events-auto transition-all duration-300 ${viewMode === 'map' ? 'hidden lg:flex' : 'flex'
        }`}>
        {/* Listings Header */}
        <div className="shrink-0 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                className="px-3 py-1.5 rounded-full shadow-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur flex items-center gap-2 hover:shadow-xl transition-all"
                title={searchQuery ? `Results for "${searchQuery}"` : 'Properties found'}
                onClick={() => { try { const el = document.getElementById('listings-scroll'); if (el) el.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { } }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-[#0a0c19]">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                    <path d="M5 3v4"></path>
                    <path d="M19 17v4"></path>
                    <path d="M3 5h4"></path>
                    <path d="M17 19h4"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{filteredData.length} properties</span>
              </button>
              {searchQuery && (
                <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-gray-600/50 truncate">
                  "{searchQuery}"
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center bg-gray-100/80 dark:bg-gray-700/80 rounded-full p-1 shadow-lg backdrop-blur-sm flex-shrink-0 border border-gray-200/50 dark:border-gray-600/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-full transition-all duration-300 flex items-center gap-1 relative overflow-hidden ${viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 shadow-md text-[#059669] dark:text-[#51faaa] font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                  {viewMode === 'grid' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10" />
                  )}
                  <Grid className="w-3 h-3 relative z-10" />
                  <span className="text-[11px] hidden sm:inline relative z-10">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-full transition-all duration-300 flex items-center gap-1 relative overflow-hidden ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 shadow-md text-[#059669] dark:text-[#51faaa] font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                  {viewMode === 'list' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10" />
                  )}
                  <List className="w-3 h-3 relative z-10" />
                  <span className="text-[11px] hidden sm:inline relative z-10">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {!showMap && !mapHintDismissed && (
          <button
            onClick={dismissMapHint}
            className="hidden lg:flex mt-2 w-full items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium bg-emerald-50 dark:bg-[#51faaa]/10 text-emerald-700 dark:text-[#51faaa] border border-emerald-200/60 dark:border-[#51faaa]/20 hover:bg-emerald-100 dark:hover:bg-[#51faaa]/20 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left">Map is hidden — show it to view locations</span>
            <X className="w-3.5 h-3.5 opacity-70 shrink-0" />
          </button>
        )}

        {/* Scrollable Cards */}
        <div id="listings-scroll" className="flex-1 min-h-0 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          {/* Market Insights — lives inside the scroll container so it scrolls
              away with the cards instead of staying pinned */}
          <div className="px-3 pt-3">
            <MarketInsights location={searchQuery || 'Nairobi'} propertyCount={filteredData.length} searchQuery={searchQuery} />
          </div>

          <div className="px-4 lg:px-5 pb-8 pt-3 bg-gray-100 dark:bg-gray-900">
            <div className={`grid gap-4 sm:gap-5 lg:gap-6 ${viewMode === 'grid'
              ? `grid-cols-1 sm:grid-cols-2 ${showMap ? '' : 'lg:grid-cols-3'}`
              : 'grid-cols-1'
              }`}>
              {propertiesLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <PropertyCardSkeleton key={i} viewMode={viewMode} />
                ))
              ) : (
                filteredData.slice(0, visibleCardCount).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isHighlighted={highlightedProperty === property.id}
                    onMouseEnter={handlePropertyHover}
                    onMouseLeave={() => setHighlightedProperty(null)}
                    onMarkerHover={setHoveredMarkerId}
                    onQuickView={handleQuickView}
                    viewMode={viewMode}
                  />
                ))
              )}
            </div>

            {/* Infinite scroll: the sentinel below triggers the IntersectionObserver
                in the effect above to auto-load the next page of cards */}
            {filteredData.length > visibleCardCount && (
              <div ref={sentinelRef} className="flex justify-center py-5" aria-hidden="true">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-transparent animate-spin" />
              </div>
            )}

            {/* Bottom Spacer */}
            <div className="h-12" />
          </div>
        </div>
      </div>


      <QuickViewModal
        property={quickViewProperty}
        isOpen={!!quickViewProperty}
        onClose={() => setQuickViewProperty(null)}
        onFavoriteToggle={toggleFavorite}
        isFavorite={quickViewProperty && isFavorite && isFavorite(quickViewProperty.id)}
      />


      <style>{`
        @keyframes modal-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-modal-slide-up {
          animation: modal-slide-up 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// CARTO/OpenStreetMap fallback view (used when Google Maps is unavailable)
function CartoFallbackView({ propertyData, onPropertySelect }) {
  const navigate = useNavigate();

  const handleSelect = (property) => {
    if (onPropertySelect) onPropertySelect(property);
    const id = property?.id || property?._id;
    if (id) navigate(`/property/${id}`);
  };

  return (
    // Same fixed height as the Google EnhancedMap (h-[calc(100vh-96px)]) so the
    // fallback fills the map area instead of collapsing to zero height.
    <div className="relative w-full h-[calc(100vh-96px)] min-h-[50vh] bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden">
      <CartoFallbackMap
        items={propertyData || []}
        onItemSelect={handleSelect}
        showStyleSelector
        showCountBadge
        count={propertyData?.length || 0}
      />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900/85 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
        OpenStreetMap view · Google Maps unavailable
      </div>
    </div>
  );
}

// Simple Fallback Map Component (when Google Maps API is not available)
function FallbackMap({ propertyData, onPropertySelect }) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    onPropertySelect && onPropertySelect(property);
  };

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Property Locations ({propertyData?.length || 0})
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          📍 Interactive map unavailable
        </div>
      </div>

      <div className="space-y-3 max-h-full overflow-y-auto">
        {propertyData && propertyData.length > 0 ? (
          propertyData.map((property) => (
            <div
              key={property.id}
              onClick={() => handlePropertyClick(property)}
              className="bg-white dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {property.title || property.address || 'Property'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ${property.price?.toLocaleString() || 'Price not available'}
                  </p>
                  {property.latitude && property.longitude && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {property.latitude}, {property.longitude}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {property.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        {property.bedrooms} beds
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3 h-3" />
                        {property.bathrooms} baths
                      </span>
                    )}
                    {property.sqft && (
                      <span className="flex items-center gap-1">
                        <Square className="w-3 h-3" />
                        {property.sqft} sqft
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No properties available</p>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Property Details
                </h3>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <img
                src={getPropertyImages(selectedProperty)[0]}
                alt={selectedProperty.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
                onError={(e) => handleImageError(e, null, selectedProperty)}
              />

              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                ${selectedProperty.price?.toLocaleString()}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {selectedProperty.address}
              </p>

              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                {selectedProperty.bedrooms && (
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {selectedProperty.bedrooms} beds
                  </span>
                )}
                {selectedProperty.bathrooms && (
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {selectedProperty.bathrooms} baths
                  </span>
                )}
                {selectedProperty.sqft && (
                  <span className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    {selectedProperty.sqft} sqft
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedProperty(null);
                  onPropertySelect && onPropertySelect(selectedProperty);
                }}
                className="w-full bg-[#51faaa] text-[#0a0c19] py-2 rounded-lg hover:bg-[#45e595] transition-colors font-medium"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="text-center p-8">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There was an error loading the map. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#51faaa] text-[#0a0c19] rounded-lg hover:bg-[#45e595] transition-colors font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}