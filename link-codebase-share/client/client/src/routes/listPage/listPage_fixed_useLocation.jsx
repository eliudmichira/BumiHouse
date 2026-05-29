import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  CloudCog, Bus, ArrowUpDown
} from 'lucide-react';
import {useProperties} from '../../hooks/useProperties';
import { fetchMarketInsights, formatKes } from '../../services/aiInsights';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';


// Using real auth context

// const useNavigate = () => (path, options) => {};
import { useLocation } from 'react-router-dom';
import EnhancedMobileMapNavigation from '../../components/EnhancedMobileMapNavigation';

// Google Maps API Key - fallback to provided key if env is missing
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
const HAS_GOOGLE_MAPS_KEY = Boolean(GOOGLE_MAPS_API_KEY);

// Keep libraries array stable to avoid unnecessary reloads
const MAP_LIBRARIES = ['places', 'drawing'];

// Debug: Log the API key to see what's being loaded
console.log('Environment variable VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
console.log('GOOGLE_MAPS_API_KEY being used:', HAS_GOOGLE_MAPS_KEY ? '[set]' : '[missing]');
console.log('HAS_GOOGLE_MAPS_KEY:', HAS_GOOGLE_MAPS_KEY);

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

// Enhanced Quick View Modal
function QuickViewModal({ property, isOpen, onClose, onFavoriteToggle, isFavorite }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
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
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-6xl sm:w-full animate-modal-slide-up max-h-[90vh] overflow-y-auto">
          {/* Image Gallery */}
          <div className="relative h-96 lg:h-[500px] overflow-hidden group">
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % property.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="flex gap-2">
                {/* Removed unwanted badges: Virtual Tour, Open House, Price Reduced */}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onFavoriteToggle(property)}
                  className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
                    isFavorite 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                      : 'bg-white/20 text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30'
                  }`}
                >
                  <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h2 className="text-4xl font-bold mb-2">{formatPrice(property.price)}</h2>
              <p className="text-xl opacity-90 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {property.address}
              </p>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1 p-2">
              {[
                { id: 'overview', label: 'Overview', icon: Home },
                { id: 'features', label: 'Features', icon: Star },
                { id: 'location', label: 'Location', icon: MapPin },
                { id: 'contact', label: 'Contact', icon: MessageCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-[#51faaa]/20 to-[#51faaa]/30 dark:from-[#51faaa]/20 dark:to-[#51faaa]/30 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300">
                    <Bed className="h-8 w-8 mx-auto mb-2 text-[#51faaa] dark:text-[#51faaa]" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{property?.bedrooms}</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#dbd5a4]/20 to-[#dbd5a4]/30 dark:from-[#dbd5a4]/20 dark:to-[#dbd5a4]/30 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300">
                    <Bath className="h-8 w-8 mx-auto mb-2 text-[#dbd5a4] dark:text-[#dbd5a4]" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{property?.bathrooms}</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/30 dark:from-[#51faaa]/20 dark:to-[#dbd5a4]/30 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300">
                    <Square className="h-8 w-8 mx-auto mb-2 text-[#51faaa] dark:text-[#51faaa]" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Square Feet</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{property.area?. toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#dbd5a4]/20 to-[#51faaa]/30 dark:from-[#dbd5a4]/20 dark:to-[#51faaa]/30 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300">
                    <Home className="h-8 w-8 mx-auto mb-2 text-[#dbd5a4] dark:text-[#dbd5a4]" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{property?.property_type}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this home</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    This beautiful {property?.property_type?.toLowerCase()} features {property.bedrooms} bedrooms and {property.bathrooms} bathrooms 
                    across {property?.area?.toLocaleString()} square feet of living space. Built in {property.year_built}, this property 
                    offers modern amenities and thoughtful design throughout.
                  </p>
                </div>
              </div>
            )}


            {/* features */}

            {activeTab === 'features' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Features & Amenities</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.features.map((feature, index) => {
                    const getFeatureIcon = (feature) => {
                      if (feature.includes('Kitchen')) return ChefHat;
                      if (feature.includes('Floor')) return Home;
                      if (feature.includes('Air')) return AirVent;
                      if (feature.includes('Fireplace')) return Flame;
                      if (feature.includes('Smart')) return Zap;
                      if (feature.includes('Energy')) return TreePine;
                      if (feature.includes('Pool')) return Droplets;
                      return Check;
                    };
                    const IconComponent = getFeatureIcon(feature);
                    
                    return (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
                      >
                        <div className="w-10 h-10 bg-[#51faaa]/20 dark:bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-[#51faaa] dark:text-[#51faaa]" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Location & Neighborhood</h3>
                
                <div className="bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{property?.neighborhood.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Located in the desirable {property?.neighborhood.name} area of {property?.city}, this property offers excellent 
                    access to schools, shopping, dining, and transportation.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-[#51faaa]" />
                      <span>Great Schools Nearby</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#51faaa]" />
                      <span>Easy Highway Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-[#dbd5a4]" />
                      <span>Restaurants & Shopping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trees className="w-4 h-4 text-[#51faaa]" />
                      <span>Parks & Recreation</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Agent</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-[#51faaa]/10 to-[#dbd5a4]/10 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={property.listing_agent.photo}
                        alt={property.listing_agent.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {property.listing_agent.name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">{property.agent.name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <a
                        href={`tel:${property.listing_agent.phone}`}
                        className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <Phone className="w-5 h-5 text-[#51faaa]" />
                        <span className="font-medium">{property.listing_agent.phone}</span>
                      </a>
                      <a
                        href={`mailto:${property.listing_agent.email}`}
                        className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <Mail className="w-5 h-5 text-[#51faaa]" />
                        <span className="font-medium">{property.listing_agent.email}</span>
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({...prev, name: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <textarea
                        rows={4}
                        placeholder="Message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({...prev, message: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleContactSubmit}
                        className="w-full bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 transition-all duration-300"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 dark:bg-gray-700 px-8 py-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/property/${property.id}`)}
                className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 transition-all duration-300 flex items-center gap-2 group"
              >
                View Full Details
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:border-[#51faaa] hover:text-[#51faaa] dark:hover:text-[#51faaa] transition-all duration-300 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Agent
              </button>
            </div>
            <div className="flex gap-3">
              <button className="w-12 h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center hover:border-[#51faaa] hover:text-[#51faaa] transition-all duration-300">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center hover:border-[#51faaa] hover:text-[#51faaa] transition-all duration-300">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
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

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchMarketInsights(location);
        if (!active) return;
        setInsights({ ...data, counts: { homes: propertyCount } });
      } catch (e) {
        if (!active) return;
        setError(e?.message || 'Failed to load insights');
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

  return (
    <div className={`rounded-2xl p-6 mb-6 border backdrop-blur-xl transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-[#0a0c19] via-[#10121e] to-[#0a0c19] border-[#51faaa]/20' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center shadow-lg shadow-[#51faaa]/20">
            <TrendingUp className="h-5 w-5 text-[#0a0c19]" />
          </div>
          {location} Market Insights
        </h3>
        <div className="text-right">
          <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchQuery || 'Nairobi'} Real Estate</h4>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>{propertyCount} homes available</p>
        </div>
      </div>

      {loading && (
        <p className={isDark ? 'text-white/70' : 'text-gray-700'}>Generating local market data…</p>
      )}

      {!loading && insights && (
        <>
          {insights.summary && (
            <p className={`mb-4 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{insights.summary}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className={`backdrop-blur-sm rounded-lg p-2.5 hover:shadow-md transition-all duration-300 border ${
              isDark ? 'bg-[#10121e]/80 border-[#51faaa]/10' : 'bg-white/80 border-gray-200'
            }`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Home className="w-3.5 h-3.5 text-[#51faaa]" />
                <p className={`text-xs font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Average Rent</p>
              </div>
              {rent?.avg_range?.min != null && rent?.avg_range?.max != null ? (
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatKes(rent?.avg_range?.min)} - {formatKes(rent?.avg_range?.max)}
                </p>
              ) : (
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>—</p>
              )}
              <div className={`text-xs mt-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
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
            </div>

            <div className={`backdrop-blur-sm rounded-lg p-2.5 hover:shadow-md transition-all duration-300 border ${
              isDark ? 'bg-[#10121e]/80 border-[#51faaa]/10' : 'bg-white/80 border-gray-200'
            }`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#51faaa]" />
                <p className={`text-xs font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Plot Prices</p>
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ksh 2.5M – 7M
              </p>
              <p className={`text-xs ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>(1/8 acre)</p>
            </div>

            <div className={`backdrop-blur-sm rounded-lg p-2.5 hover:shadow-md transition-all duration-300 border ${
              isDark ? 'bg-[#10121e]/80 border-[#51faaa]/10' : 'bg-white/80 border-gray-200'
            }`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#51faaa]" />
                <p className={`text-xs font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Hotspot Areas</p>
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{insights?.hotspots?.length ?? 0} Areas</p>
              {insights?.hotspots?.length ? (
                <div className={`text-xs ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                  {insights.hotspots.slice(0, 3).join(', ')}
                </div>
              ) : null}
            </div>

            <div className={`backdrop-blur-sm rounded-lg p-2.5 hover:shadow-md transition-all duration-300 border ${
              isDark ? 'bg-[#10121e]/80 border-[#51faaa]/10' : 'bg-white/80 border-gray-200'
            }`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Info className="w-3.5 h-3.5 text-[#51faaa]" />
                <p className={`text-xs font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Vacancy Rate</p>
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Higher during school breaks (~20%)
              </p>
            </div>
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
          notification.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg';
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
    <div className="w-full">
      <div className={`relative bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 transition-all duration-300 ${
        isFocused ? 'border-[#51faaa] shadow-xl shadow-[#51faaa]/20' : 'border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center p-2">
          <div className="flex-1 flex items-center">
            <Search className={`w-4 h-4 ml-3 transition-colors ${
              isFocused ? 'text-[#51faaa]' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by location, address, or ZIP"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="flex-1 px-3 py-2 text-sm bg-transparent border-none focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
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
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${
                userLocation 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${locationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MapPin className="w-3 h-3" />
              {locationLoading ? 'Getting location...' : userLocation ? 'Location Found' : 'Use my location'}
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${
                showFilters 
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

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-[#51faaa]/20 dark:bg-[#51faaa]/20 rounded-lg flex items-center justify-center group-hover:bg-[#51faaa] transition-colors">
                    <MapPin className="w-4 h-4 text-[#51faaa] dark:text-[#51faaa] group-hover:text-[#0a0c19]" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Property Card
function PropertyCard({ property, isHighlighted, onMouseEnter, onMouseLeave, onMarkerHover, onQuickView, viewMode = 'list' }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, toggleFavorite, isFavorite } = useAuth();
  const cardRef = useRef(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div 
      ref={cardRef}
      className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 cursor-pointer ${
        isHighlighted 
          ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20 scale-[1.02]' 
          : 'hover:shadow-2xl hover:scale-[1.01]'
      } ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row'}`}
      onMouseEnter={() => {
        onMouseEnter && onMouseEnter(property.id);
        onMarkerHover && onMarkerHover(property.id);
      }}
      onMouseLeave={() => {
        onMouseLeave && onMouseLeave();
        onMarkerHover && onMarkerHover(null);
      }}
      onClick={(e) => {
        
          navigate(`/property/${property.id}`, {state: {property}});
          // console.log(property.id)
        
      }}
    >
      <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-64' : 'h-32 w-48 flex-shrink-0'}`}>
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <img 
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          onLoad={() => setIsImageLoading(false)}
          style={{ opacity: isImageLoading ? 0 : 1 }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {/* Removed unwanted badges: Virtual Tour, New Listings, Price Reduced */}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(property);
            }}
            className="interactive-element w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
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
            className={`interactive-element w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isSaved 
                ? 'bg-red-500 text-white hover:scale-110' 
                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white hover:scale-110'
            }`}
          >
            <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {/* Image Navigation */}
        {property.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`interactive-element w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'w-6 bg-white' : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className={`${viewMode === 'grid' ? 'p-5' : 'p-4 flex-1'}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className={`font-bold text-gray-900 dark:text-white ${viewMode === 'grid' ? 'text-2xl' : 'text-xl'}`}>
              {formatPrice(property.price)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ${property.pricePerSqft || Math.round(property.price / property.area)}/sqft
            </p>
          </div>
          <button className="interactive-element p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className={`flex items-center gap-4 mb-3 ${viewMode === 'list' ? 'flex-wrap' : ''}`}>
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Bed className="w-4 h-4" />
            <strong className="text-gray-900 dark:text-white">{property.bedrooms}</strong> beds
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Bath className="w-4 h-4" />
            <strong className="text-gray-900 dark:text-white">{property.bathrooms}</strong> baths
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Square className="w-4 h-4" />
            <strong className="text-gray-900 dark:text-white">{property.area?.toLocaleString()}</strong> sqft
          </span>
        </div>
        
        <p className={`text-gray-700 dark:text-gray-300 font-medium ${viewMode === 'grid' ? 'mb-3' : 'mb-2'}`}>{property.address}</p>
        
        <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'pt-3 border-t border-gray-100 dark:border-gray-700' : ''}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Listed by {property.agent.name}
          </p>
          {property.days_on_market <= 7 && (
            <span className="px-2.5 py-1 bg-[#51faaa]/20 dark:bg-[#51faaa]/20 text-[#51faaa] dark:text-[#51faaa] rounded-full text-xs font-semibold">
              {property.days_on_market}d ago
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Map Component with Real Google Maps
function EnhancedMap({ propertyData, highlightedProperty, onMarkerHover, onPropertySelect, drawnBounds, setDrawnBounds, mapTheme, setMapTheme, mapCenter, setMapCenter, mapZoom, setMapZoom }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [map, setMap] = useState(null);
  const [showSchools, setShowSchools] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [mapsApiError, setMapsApiError] = useState(false);
  const navigate = useNavigate();

  // Ensure this component can safely check if the Google Maps API is available
  const mapsReady = typeof window !== 'undefined' && !!(window.google && window.google.maps);
  const canInstantiateMap = typeof window !== 'undefined' && !!(window.google && window.google.maps && typeof window.google.maps.Map === 'function');

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    
    // Fit bounds to show all properties if available
    if (propertyData && propertyData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
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
    setMap(null);
  }, []);

  const mapContainerStyle = { width: '100%', height: '100%'  };

  // Get map options based on theme
  const getMapOptions = useMemo(() => {
    const baseOptions = {
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false
    };

    if (mapTheme === 'satellite') {
      baseOptions.mapTypeId = window.google?.maps?.MapTypeId?.SATELLITE;
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
      const bounds = new window.google.maps.LatLngBounds();
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
    <div className="relative h-full bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden">
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
                          📍 {parseFloat(property.latitude).toFixed(4)}, {parseFloat(property.longitude).toFixed(4)}
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
          <MarkerClusterer>
            {(clusterer) => {
              return (
                <>
                        {validProperties.map((property) => {
                          const lat = parseFloat(property.latitude);
                          const lng = parseFloat(property.longitude);
                          
                    return (
                      <Marker
                        key={property.id || property._id || `${lat},${lng}`}
                              position={{ lat, lng }}
                        onClick={() => handleMarkerClick(property)}
                        onMouseOver={() => handleMarkerMouseOver(property)}
                        onMouseOut={handleMarkerMouseOut}
                        icon={createCustomMarker(property, highlightedProperty === property.id)}
                        clusterer={clusterer}
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
                  fillColor: '#3B82F6',
                  fillOpacity: 0.1,
                  strokeColor: '#3B82F6',
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
            >
              <div className="p-4 max-w-xs">
                <img
                      src={selectedProperty.images?.[0] || '/placeholder-property.jpg'}
                  alt={selectedProperty.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  ${selectedProperty.price?.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{selectedProperty.address}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  <span>{selectedProperty.bedrooms} beds</span>
                  <span>{selectedProperty.bathrooms} baths</span>
                  <span>{selectedProperty.area?.toLocaleString()} sqft</span>
                  <span>
                    {Number.isFinite(parseFloat(selectedProperty.latitude)) && Number.isFinite(parseFloat(selectedProperty.longitude))
                      ? `${parseFloat(selectedProperty.latitude).toFixed(6)}, ${parseFloat(selectedProperty.longitude).toFixed(6)}`
                      : ''}
                  </span>
                </div>
                <button
                      onClick={() => navigate(`/property/${selectedProperty.id}`)}
                  className="w-full px-4 py-2 bg-[#51faaa] text-[#0a0c19] rounded-lg hover:bg-[#dbd5a4] transition-colors text-sm font-medium"
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
            className={`p-3 rounded-xl transition-all duration-300 ${
              drawingMode 
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
            className={`p-3 rounded-xl transition-all duration-300 ${
              showSchools 
                ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            title="Schools"
          >
            <School className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowTransit(!showTransit)}
            className={`p-3 rounded-xl transition-all duration-300 mt-1 ${
              showTransit 
                ? 'bg-[#dbd5a4] text-[#0a0c19] shadow-lg shadow-[#dbd5a4]/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            title="Transit"
          >
            <Train className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Style Selector */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex gap-1">
          {[
            { label: 'Default', value: 'default', icon: Layers },
            { label: 'Night', value: 'night', icon: Moon },
            { label: 'Satellite', value: 'satellite', icon: Compass }
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => setMapTheme(theme.value)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                mapTheme === theme.value
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
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
      <div className="absolute bottom-4 left-4 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
        <Home className="w-5 h-5" />
        <span className="font-semibold">{propertyData.length} properties</span>
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
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              onClick={clearAllFilters}
              className="text-[#51faaa] dark:text-[#51faaa] hover:text-[#dbd5a4] dark:hover:text-[#dbd5a4] text-sm font-medium"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Quick Filters - Reduced */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quick Filters</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.isFurnished}
                onChange={(e) => handleFilterChange('isFurnished', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]" 
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
                <Home className="w-4 h-4" /> Furnished
              </span>
            </label>
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
        </div>

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

        {/* Apply Filters Button */}
        <button className="w-full bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 transition-all duration-300">
          Apply Filters
        </button>
      </div>
    </div>
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
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse ${
      viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row'
    }`}>
      <div className={`bg-gray-200 dark:bg-gray-700 ${
        viewMode === 'grid' ? 'h-64' : 'h-32 w-48 flex-shrink-0'
      }`} />
      <div className={`space-y-4 ${viewMode === 'grid' ? 'p-5' : 'p-4 flex-1'}`}>
        <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${
          viewMode === 'grid' ? 'h-8 w-3/4' : 'h-6 w-1/2'
        }`} />
        <div className="flex gap-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
        </div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
      </div>
    </div>
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

// Main MapView Component
export default function MapView() {
  // Google Maps JS loader (must be declared before render usage)
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES
  });
  const mapsReady = isLoaded || (typeof window !== 'undefined' && window.google && window.google.maps);
  useEffect(() => {
    if (loadError) {
      console.error('Google Maps JS API load error:', loadError);
      setMapsApiError?.(true);
    }
  }, [loadError]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
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
  const [propertyData, setPropertyData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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
  const [mapsApiError, setMapsApiError] = useState(false);
  
  const { currentUser, toggleFavorite, isFavorite } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  let {data, isError} = useProperties()
  const properties = data?.properties || []
  
  // Handle URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
  }, [location.search]);
  
  // Debug: Log property data structure
  console.log('Property data from API:', data);
  console.log('Properties array:', properties);
  console.log('Properties with coordinates:', properties.filter(p => p.latitude && p.longitude));
  
  // Simple geocode cache in-memory (and sync with localStorage)
  const geocodeCacheRef = useRef(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('geocodeCache');
      geocodeCacheRef.current = raw ? JSON.parse(raw) : {};
    } catch (_) {
      geocodeCacheRef.current = {};
    }
  }, []);

  const persistGeocodeCache = () => {
    try {
      localStorage.setItem('geocodeCache', JSON.stringify(geocodeCacheRef.current || {}));
    } catch (_) {}
  };

  const buildAddressString = (p) => {
    const parts = [];
    // Support multiple shapes: flat fields or nested location
    const addr = p.address || p.location?.address || '';
    const city = p.city || p.location?.city || '';
    const state = p.state || p.location?.state || '';
    const zip = p.zipCode || p.location?.zipCode || '';
    if (addr) parts.push(addr);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (zip) parts.push(zip);
    return parts.join(', ');
  };

  const geocodeAddress = async (address) => {
    if (!address) return null;
    const cacheKey = address.toLowerCase();
    const cached = geocodeCacheRef.current?.[cacheKey];
    if (cached) return cached;
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
        const loc = data.results[0].geometry.location;
        geocodeCacheRef.current = geocodeCacheRef.current || {};
        geocodeCacheRef.current[cacheKey] = { lat: loc.lat, lng: loc.lng };
        persistGeocodeCache();
        return { lat: loc.lat, lng: loc.lng };
      }
    } catch (_) {}
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
    } catch (_) {}
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Process properties to ensure they have required fields for maps; geocode when missing
        const processedProperties = await Promise.all(properties.map(async (property, index) => {
          // Highest priority: stored coordinates (support nested shapes)
          const rawLat = property.latitude ?? property.lat ?? property.location?.coordinates?.lat;
          const rawLng = property.longitude ?? property.lng ?? property.location?.coordinates?.lng;
          let lat = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat;
          let lng = typeof rawLng === 'string' ? parseFloat(rawLng) : rawLng;

          if (!(Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0)) {
            const addrStr = buildAddressString(property);
            const geo = await geocodeAddress(addrStr);
            if (geo) {
              lat = geo.lat;
              lng = geo.lng;
            }
          }

          if (!(Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0)) {
            // Fallback near Nairobi with tiny offset to avoid overlapping
            lat = -1.2921 + (index * 0.005);
            lng = 36.8219 + (index * 0.005);
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
            days_on_market: property.days_on_market || Math.floor(Math.random() * 30) + 1,
            // Kenyan-focused properties
            isNewlyBuilt: property.isNewlyBuilt || Math.random() > 0.7,
            isRecentlyRenovated: property.isRecentlyRenovated || Math.random() > 0.6,
            isServicedApartment: property.isServicedApartment || Math.random() > 0.5,
            isFurnished: property.isFurnished || Math.random() > 0.4,
            isStudentFriendly: property.isStudentFriendly || Math.random() > 0.3,
            isShortTermLease: property.isShortTermLease || Math.random() > 0.2,
            isNearPublicTransport: property.isNearPublicTransport || Math.random() > 0.8,
            isGatedCommunity: property.isGatedCommunity || Math.random() > 0.6,
            isWaterIncluded: property.isWaterIncluded || Math.random() > 0.5,
            isWifiIncluded: property.isWifiIncluded || Math.random() > 0.4,
            hasElevator: property.hasElevator || Math.random() > 0.3,
            // Location properties
            isNearCBD: property.isNearCBD || Math.random() > 0.3,
            isNearUniversity: property.isNearUniversity || Math.random() > 0.4,
            isNearMajorRoads: property.isNearMajorRoads || Math.random() > 0.7,
            estate: property.estate || ['Kileleshwa', 'Umoja', 'Runda', 'Westlands', 'Kilimani', 'Lavington', 'Karen', 'South B', 'South C', 'Buruburu', 'Donholm', 'Embakasi', 'Ruiru', 'Thika'][Math.floor(Math.random() * 14)]
          };
        }));
        
        console.log('Processed properties:', processedProperties);
        setPropertyData(processedProperties);
        } 
         catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProperties();
  }, [properties]);

  // console.log(mockPropertyData)

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
        
        // Check if any of the searchable fields contain the search term
        return searchableFields.includes(searchTerm) || 
               // Also check for partial matches (words within the search term)
               searchTerm.split(' ').some(word => 
                 word.length > 2 && searchableFields.includes(word)
               );
      });
    }

    // Location-based filtering
    if (userLocation) {
      // Filter properties within a certain radius of user location (e.g., 10km)
      const radius = 10; // km
      filtered = filtered.filter(property => {
        if (!property.latitude || !property.longitude) return false;
        
        const distance = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          property.latitude, property.longitude
        );
        return distance <= radius;
      });
    }

    // Apply all filters
    if (filters.minPrice) filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice));
    if (filters.maxPrice) filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice));
    if (filters.minBeds) filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.minBeds));
    if (filters.minBaths) filtered = filtered.filter(p => p.bathrooms >= parseInt(filters.minBaths));
    if (filters.homeTypes.length > 0) filtered = filtered.filter(p => filters.homeTypes.includes(p.property_type));
    
    // Kenyan-focused filters
    if (filters.isNewlyBuilt) filtered = filtered.filter(p => p.isNewlyBuilt);
    if (filters.isRecentlyRenovated) filtered = filtered.filter(p => p.isRecentlyRenovated);
    if (filters.isServicedApartment) filtered = filtered.filter(p => p.isServicedApartment);
    if (filters.isFurnished) filtered = filtered.filter(p => p.isFurnished);
    if (filters.isStudentFriendly) filtered = filtered.filter(p => p.isStudentFriendly);
    if (filters.isShortTermLease) filtered = filtered.filter(p => p.isShortTermLease);
    if (filters.isNearPublicTransport) filtered = filtered.filter(p => p.isNearPublicTransport);
    if (filters.isGatedCommunity) filtered = filtered.filter(p => p.isGatedCommunity);
    if (filters.isWaterIncluded) filtered = filtered.filter(p => p.isWaterIncluded);
    if (filters.isWifiIncluded) filtered = filtered.filter(p => p.isWifiIncluded);
    if (filters.hasParking) filtered = filtered.filter(p => p.hasParking);
    if (filters.hasElevator) filtered = filtered.filter(p => p.hasElevator);
    
    // Location filters
    if (filters.isNearCBD) filtered = filtered.filter(p => p.isNearCBD);
    if (filters.isNearUniversity) filtered = filtered.filter(p => p.isNearUniversity);
    if (filters.isNearMajorRoads) filtered = filtered.filter(p => p.isNearMajorRoads);
    if (filters.selectedEstate) filtered = filtered.filter(p => p.estate === filters.selectedEstate);

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'sqft':
        filtered.sort((a, b) => b.area - a.area);
        break;
      default:
        filtered.sort((a, b) => a.days_on_market - b.days_on_market);
    }

    setFilteredData(filtered);
  }, [propertyData, searchQuery, filters, sortBy, userLocation]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Handle location selection from search bar
  const handleLocationSelect = (location) => {
    setUserLocation(location);
    setMapCenter({ lat: location.latitude, lng: location.longitude });
    setMapZoom(12); // Zoom in closer for user location
  };

  const handlePropertyHover = useCallback((propertyId) => {
    setHighlightedProperty(propertyId);
  }, []);

  const handlePropertySelect = (property) => {
    // navigate(`/property/${property.id}`);
  };

  const handleQuickView = (property) => {
    setQuickViewProperty(property);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pt-0 overflow-hidden">
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

      {/* Desktop Header Navigation */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90">
        <div className="px-4 lg:px-6 py-2">
          {/* Top Row - Search, Logo, and Navigation */}
          <div className="flex items-center justify-between gap-6 mb-3">
            {/* Left - Search Bar and View Toggle */}
            <div className="flex items-center gap-4 flex-1 max-w-3xl">
              <div className="flex-1 min-w-0">
                <EnhancedSearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  propertyCount={filteredData.length}
                  filters={filters}
                  setFilters={setFilters}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
              
              {/* View Toggle next to search bar */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1 shadow-sm flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 shadow-md text-[#51faaa] dark:text-[#51faaa] font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="text-xs hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow-md text-[#51faaa] dark:text-[#51faaa] font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="text-xs hidden sm:inline">List</span>
                </button>
              </div>
            </div>
            
            {/* Center - Brand Logo */}
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="flex items-center">
                <a className="flex items-center gap-3 group" href="/">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#51faaa]/25 group-hover:shadow-xl group-hover:shadow-[#51faaa]/40 transition-all duration-300">
                    <span className="text-[#111] text-lg font-bold">H</span>
                  </div>
                  <span className={`hidden sm:block text-xl font-bold tracking-tight transition-colors ${
                    isDark 
                      ? 'text-white group-hover:text-[#51faaa]' 
                      : 'text-gray-900 group-hover:text-[#51faaa]'
                  }`}>
                    Hama Estate
                  </span>
                </a>
              </div>
            </div>
            
            {/* Right - Controls Only */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600" />
                )}
              </button>
              
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
                  <a href="/register" className="px-6 py-2.5 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-full text-base font-semibold hover:shadow-lg hover:shadow-[#51faaa]/30 transition-all duration-300">
                    Get Started
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Row - Sort and Quick Filters */}
          <div className="flex items-center justify-between gap-3">
            {/* Left - Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilters(prev => ({ ...prev, isNearPublicTransport: !prev.isNearPublicTransport }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  filters.isNearPublicTransport
                    ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Bus className="w-3 h-3" />
                Transit 🚐
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, isWaterIncluded: !prev.isWaterIncluded }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  filters.isWaterIncluded
                    ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Droplets className="w-3 h-3" />
                Water/Borehole 💧
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, isWifiIncluded: !prev.isWifiIncluded }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  filters.isWifiIncluded
                    ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Wifi className="w-3 h-3" />
                Fibre Internet 🌐
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, isGatedCommunity: !prev.isGatedCommunity }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  filters.isGatedCommunity
                    ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Shield className="w-3 h-3" />
                Secure 🔒
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, isNewlyBuilt: !prev.isNewlyBuilt }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  filters.isNewlyBuilt
                    ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Building className="w-3 h-3" />
                Modern 🏗
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, hasElevator: !prev.hasElevator }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  filters.hasElevator
                    ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ArrowUpDown className="w-3 h-3" />
                Elevator
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, hasParking: !prev.hasParking }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  filters.hasParking
                    ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Car className="w-3 h-3" />
                Parking 🚗
              </button>
            </div>
            
            {/* Right - Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#51faaa] shadow-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price (Low to High)</option>
              <option value="price_high">Price (High to Low)</option>
              <option value="beds">Most Bedrooms</option>
              <option value="sqft">Largest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
        <div className="flex h-[calc(100vh-80px)] pb-6 md:pb-8">
        <FiltersSidebar 
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          onClose={() => setShowFilters(false)}
        />

        <div className="flex-1">
          <ErrorBoundary>
            {!HAS_GOOGLE_MAPS_KEY || mapsApiError ? (
              <FallbackMap
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
          </ErrorBoundary>
        </div>

        <div className="w-full lg:w-2/5 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <MarketInsights location={searchQuery || 'Nairobi'} propertyCount={filteredData.length} searchQuery={searchQuery} />
            
            {/* No Results Message */}
            {filteredData.length === 0 && (searchQuery || userLocation) && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                    <Search className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      No properties found
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Try adjusting your search terms or filters
                    </p>
                  </div>
                </div>
              </div>
            )}
            
    {/* property card */}
            {isLoading ? (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {[1, 2, 3, 4].map(i => (
                  <PropertyCardSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {filteredData.map((property) => (
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
                  
                ))}
              </div>
            )}
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
                      📍 {parseFloat(property.latitude).toFixed(4)}, {parseFloat(property.longitude).toFixed(4)}
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
                src={selectedProperty.images?.[0] || '/placeholder-property.jpg'}
                alt={selectedProperty.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
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