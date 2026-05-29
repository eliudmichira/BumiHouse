import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  GoogleMap as GoogleMapComponent,
  LoadScript,
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
  CloudCog
} from 'lucide-react';
import {useProperties} from '../../hooks/useProperties';
import { fetchMarketInsights, formatKes } from '../../services/aiInsights';
import { useNavigate, useLocation} from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// const useNavigate = () => (path, options) => {};
// const useLocation = () => ({ pathname: '/map-view' });
// const location = useLocation;

// Google Maps API Key - fallback to provided key if env is missing
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

// Default map center (Nairobi, Kenya)
const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };
// const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // New York (commented out)

const DEFAULT_ZOOM = 10; // Closer zoom for city view



// Map theme options
// Normalize various coordinate shapes to a consistent { lat, lng } with numeric values
function getNormalizedLatLng(property) {
  if (!property) return null;
  // Common fields
  const rawLat = property.latitude ?? property.lat ?? property.location?.lat ?? property.coordinates?.lat;
  const rawLng = property.longitude ?? property.lng ?? property.location?.lng ?? property.coordinates?.lng;

  let lat = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat;
  let lng = typeof rawLng === 'string' ? parseFloat(rawLng) : rawLng;

  // Some data sources swap order; detect impossible ranges and swap
  if (typeof lat === 'number' && typeof lng === 'number') {
    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
      const temp = lat;
      lat = lng;
      lng = temp;
    }
  }

  if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
    return { lat, lng };
  }
  return null;
}
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
                                 {property.virtual_tour && (
                   <span className="px-4 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                     <Video className="w-4 h-4" /> Virtual Tour
                   </span>
                 )}
                 {property.open_house && (
                   <span className="px-4 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-full text-sm font-semibold shadow-lg">
                     Open House: {property.open_house}
                   </span>
                 )}
                {property.is_price_reduced && (
                  <span className="px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-full text-sm font-semibold shadow-lg">
                    Price Drop
                  </span>
                )}
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
                       ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] shadow-lg shadow-[#51faaa]/20'
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
                                     <div className="bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 dark:from-[#51faaa]/30 dark:to-[#dbd5a4]/30 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300">
                     <Bed className="h-8 w-8 mx-auto mb-2 text-[#51faaa] dark:text-[#51faaa]" />
                     <p className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{property?.bedrooms}</p>
                   </div>
                   <div className="bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 dark:from-[#51faaa]/30 dark:to-[#dbd5a4]/30 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300">
                     <Bath className="h-8 w-8 mx-auto mb-2 text-[#51faaa] dark:text-[#51faaa]" />
                     <p className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{property?.bathrooms}</p>
                   </div>
                   <div className="bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 dark:from-[#51faaa]/30 dark:to-[#dbd5a4]/30 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300">
                     <Square className="h-8 w-8 mx-auto mb-2 text-[#51faaa] dark:text-[#51faaa]" />
                     <p className="text-sm text-gray-600 dark:text-gray-400">Square Feet</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{property.area?. toLocaleString()}</p>
                   </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300">
                    <Home className="h-8 w-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{property?.property_type}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this home</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    This {String(property.property_type || property.type || 'home').toLowerCase()} features {property.bedrooms || 0} bedrooms and {property.bathrooms || 0} bathrooms
                    across {Number(property.area || 0).toLocaleString()} square feet of living space{property.year_built || property.yearBuilt ? `. Built in ${property.year_built || property.yearBuilt}` : ''}. 
                    It offers modern amenities and thoughtful design throughout.
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
                                                 <div className="w-10 h-10 bg-[#51faaa]/20 dark:bg-[#51faaa]/30 rounded-lg flex items-center justify-center">
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
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{property.neighborhood}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Located in the desirable {property.neighborhood} area of {property.city}, this property offers excellent 
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
                       <Coffee className="w-4 h-4 text-[#51faaa]" />
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
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
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
                        <p className="text-gray-600 dark:text-gray-400">{property.agent}</p>
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
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <textarea
                        rows={4}
                        placeholder="Message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({...prev, message: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
              <button className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-[#51faaa] text-[#0a0c19] dark:text-white font-semibold rounded-xl hover:border-[#dbd5a4] hover:text-[#51faaa] dark:hover:text-[#51faaa] transition-all duration-300 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Agent
              </button>
            </div>
            <div className="flex gap-3">
              <button className="w-12 h-12 bg-white dark:bg-gray-800 border border-[#51faaa] rounded-xl flex items-center justify-center hover:border-[#dbd5a4] hover:text-[#51faaa] transition-all duration-300">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 bg-white dark:bg-gray-800 border border-[#51faaa] rounded-xl flex items-center justify-center hover:border-[#dbd5a4] hover:text-[#51faaa] transition-all duration-300">
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
function MarketInsights({ location, propertyCount }) {
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
      <h3 className={`text-xl font-bold mb-2 flex items-center gap-3 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        <div className="w-10 h-10 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center shadow-lg shadow-[#51faaa]/20">
          <TrendingUp className="h-5 w-5 text-[#0a0c19]" />
        </div>
        {location} Market Insights
      </h3>

      {loading && (
        <p className={isDark ? 'text-white/70' : 'text-gray-700'}>Generating local market data…</p>
      )}

      {!loading && insights && (
        <>
          {insights.summary && (
            <p className={`mb-4 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{insights.summary}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300 border ${
              isDark 
                ? 'bg-[#10121e]/80 border-[#51faaa]/10' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Average Rent</p>
              {rent?.avg_range?.min != null && rent?.avg_range?.max != null ? (
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatKes(rent?.avg_range?.min)} - {formatKes(rent?.avg_range?.max)}
                </p>
              ) : (
                <p className={`${isDark ? 'text-white/60' : 'text-gray-500'}`}>—</p>
              )}
              <div className={`text-xs mt-2 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
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

            <div className={`backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300 border ${
              isDark 
                ? 'bg-[#10121e]/80 border-[#51faaa]/10' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Plot Prices</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ksh 2.5M – 7M
              </p>
              <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>(1/8 acre)</p>
            </div>

            <div className={`backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300 border ${
              isDark 
                ? 'bg-[#10121e]/80 border-[#51faaa]/10' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Active Listings</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{propertyCount}</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>homes</p>
            </div>

            <div className={`backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300 border ${
              isDark 
                ? 'bg-[#10121e]/80 border-[#51faaa]/10' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Hotspot Areas</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{insights.hotspots?.length ?? 0} Areas</p>
              {insights.hotspots?.length ? (
                <p className={`text-sm mt-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{insights.hotspots.slice(0, 6).join(', ')}</p>
              ) : null}
            </div>
          </div>

          <div className={`mt-4 grid grid-cols-2 gap-4`}>
            <div className={`backdrop-blur-sm rounded-xl p-4 border ${isDark ? 'bg-[#10121e]/80 border-[#51faaa]/10' : 'bg-white/80 border-gray-200'}`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Vacancy Rate</p>
              <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
  const { isDark } = useTheme();
  
  const locationSuggestions = [
    // Nairobi areas
    'Nairobi, Kenya', 'Westlands, Nairobi', 'Kilimani, Nairobi', 'Lavington, Nairobi', 
    'Karen, Nairobi', 'Upperhill, Nairobi', 'Runda, Nairobi', 'Gigiri, Nairobi',
    'Muthaiga, Nairobi', 'Spring Valley, Nairobi', 'Hurlingham, Nairobi', 'Yaya, Nairobi',
    'South B, Nairobi', 'South C, Nairobi', 'Embakasi, Nairobi', 'Donholm, Nairobi',
    // Other Kenyan cities
    'Mombasa, Kenya', 'Kisumu, Kenya', 'Nakuru, Kenya', 'Eldoret, Kenya',
    'Thika, Kenya', 'Nyeri, Kenya', 'Kakamega, Kenya', 'Machakos, Kenya'
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    setSavedSearches(saved);
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const filtered = locationSuggestions.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
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
        async (position) => {
          const location = {
            latitude: Number(position.coords.latitude),
            longitude: Number(position.coords.longitude),
            accuracy: position.coords.accuracy
          };
          setUserLocation(location);
          onLocationSelect && onLocationSelect(location);
          setLocationLoading(false);

          const msg = `Location detected: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} (±${Math.round(location.accuracy)}m)`;
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg';
          notification.textContent = msg;
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3500);
        },
        async (error) => {
          console.error('Geolocation error:', error);
          // Fallback: coarse IP-based geolocation
          try {
            const res = await fetch('https://ipapi.co/json/');
            const ipData = await res.json();
            if (ipData && ipData.latitude && ipData.longitude) {
              const location = { latitude: Number(ipData.latitude), longitude: Number(ipData.longitude), accuracy: 5000 };
              setUserLocation(location);
              onLocationSelect && onLocationSelect(location);
              const notification = document.createElement('div');
              notification.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg';
              notification.textContent = `Approximate location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
              document.body.appendChild(notification);
              setTimeout(() => notification.remove(), 3500);
            } else {
              throw new Error('IP geolocation failed');
            }
          } catch (e) {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
            notification.textContent = 'Unable to get your location. Please search manually.';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
          } finally {
            setLocationLoading(false);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
      <div className={`relative rounded-2xl shadow-lg border-2 transition-all duration-500 ${
        isFocused 
          ? 'border-[#51faaa] shadow-xl shadow-[#51faaa]/20' 
          : isDark 
            ? 'bg-[#10121e] border-white/10' 
            : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center p-0">
          <div className="flex-1 flex items-center">
            <Search className={`w-5 h-5 ml-4 transition-colors ${
              isFocused ? 'text-[#51faaa]' : isDark ? 'text-white/60' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by location, address, or ZIP"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className={`flex-1 px-4 py-3 text-base bg-transparent border-none focus:outline-none transition-colors duration-500 ${
                isDark 
                  ? 'placeholder-white/60 text-white' 
                  : 'placeholder-gray-500 text-gray-900'
              }`}
            />
          </div>
          
          <div className="flex items-center gap-2 pr-2">
            <button className={`px-4 py-2 text-sm transition-colors ${
              isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              For Sale
            </button>
            <div className={`w-px h-6 ${
              isDark ? 'bg-white/20' : 'bg-gray-300'
            }`} />
            <button
              onClick={getUserLocation}
              disabled={locationLoading}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                userLocation 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : isDark 
                    ? 'text-white/60 hover:text-white hover:bg-white/5' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } ${locationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MapPin className="w-4 h-4" />
              {locationLoading ? 'Getting location...' : userLocation ? 'Location Found' : 'Use my location'}
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                showFilters 
                  ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] shadow-lg shadow-[#51faaa]/20' 
                  : isDark 
                    ? 'text-white/60 hover:text-white hover:bg-white/5' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={handleSaveSearch}
              className="px-4 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
            >
              Save Search
            </button>
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border overflow-hidden z-50 transition-colors duration-500 ${
            isDark 
              ? 'bg-[#10121e] border-white/10' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left group ${
                    isDark 
                      ? 'hover:bg-white/5' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-[#51faaa] transition-colors ${
                    isDark ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <MapPin className={`w-4 h-4 group-hover:text-[#111] transition-colors ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    isDark ? 'text-white/80' : 'text-gray-700'
                  }`}>{suggestion}</span>
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
  const { isDark } = useTheme();
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
      className={`group rounded-2xl shadow-lg overflow-hidden transition-all duration-500 cursor-pointer ${
        isHighlighted 
          ? 'ring-2 ring-[#51faaa] shadow-2xl shadow-[#51faaa]/20 scale-[1.02]' 
          : 'hover:shadow-2xl hover:scale-[1.01]'
      } ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row'} ${
        isDark 
          ? 'bg-[#10121e] border border-white/10' 
          : 'bg-white border border-gray-100'
      }`}
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
          <div className={`absolute inset-0 animate-pulse ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`} />
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
          {property.virtual_tour && (
            <span className="px-3 py-1.5 bg-[#51faaa]/90 backdrop-blur-sm text-[#0a0c19] rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <Video className="w-3 h-3" />
              Virtual Tour
            </span>
          )}
          {property.is_new && (
            <span className="px-3 py-1.5 bg-[#dbd5a4]/90 backdrop-blur-sm text-[#0a0c19] rounded-full text-xs font-semibold shadow-lg">
              New
            </span>
          )}
          {property.is_price_reduced && (
            <span className="px-3 py-1.5 bg-[#feffff]/90 backdrop-blur-sm text-[#0a0c19] rounded-full text-xs font-semibold shadow-lg">
              Price Drop
            </span>
          )}
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
            <p className={`font-bold ${viewMode === 'grid' ? 'text-2xl' : 'text-xl'} ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {formatPrice(property.price)}
            </p>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              ${property.pricePerSqft || Math.round(property.price / property.area)}/sqft
            </p>
          </div>
          <button className={`interactive-element p-1.5 rounded-lg transition-colors ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
          }`}>
            <MoreHorizontal className={`w-5 h-5 ${
              isDark ? 'text-white/60' : 'text-gray-500'
            }`} />
          </button>
        </div>
        
        <div className={`flex items-center gap-4 mb-3 ${viewMode === 'list' ? 'flex-wrap' : ''}`}>
          <span className={`flex items-center gap-1.5 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Bed className="w-4 h-4" />
            <strong className={isDark ? 'text-white' : 'text-gray-900'}>{property.bedrooms}</strong> beds
          </span>
          <span className={`flex items-center gap-1.5 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Bath className="w-4 h-4" />
            <strong className={isDark ? 'text-white' : 'text-gray-900'}>{property.bathrooms}</strong> baths
          </span>
          <span className={`flex items-center gap-1.5 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Square className="w-4 h-4" />
            <strong className={isDark ? 'text-white' : 'text-gray-900'}>{property.area?.toLocaleString()}</strong> sqft
          </span>
        </div>
        
        <p className={`font-medium ${viewMode === 'grid' ? 'mb-3' : 'mb-2'} ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>{property.address}</p>
        
        <div className={`flex items-center justify-between ${
          viewMode === 'grid' 
            ? `pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}` 
            : ''
        }`}>
          <p className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Listed by {property.agent}
          </p>
          {property.days_on_market <= 7 && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              isDark 
                ? 'bg-blue-900/30 text-blue-300' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {property.days_on_market}d ago
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Map Component with Real Google Maps
function EnhancedMap({ propertyData,
   highlightedProperty, onMarkerHover,
   onPropertySelect, drawnBounds,
    setDrawnBounds, mapTheme,
     setMapTheme }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [map, setMap] = useState(null);
  const [showSchools, setShowSchools] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  // const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  // const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  
// Inside List Page component
const location = useLocation();

const [mapCenter, setMapCenter] = useState(location.state?.mapCenter || DEFAULT_CENTER);
const [mapZoom, setMapZoom] = useState(location.state?.mapZoom || DEFAULT_ZOOM);
  const navigate = useNavigate();

  const handlePropertyClick = () => {
    navigate(`/property/${selectedProperty.id}`, {
      state: {
        from: '/map-view',
        mapCenter,
        mapZoom
      }
    });
  };

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    
    // Fit bounds to show all properties if available
    if (propertyData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let added = 0;
      propertyData.forEach((property) => {
        const { lat, lng } = getNormalizedLatLng(property) || {};
        if (typeof lat === 'number' && typeof lng === 'number') {
          bounds.extend({ lat, lng });
          added++;
        }
      });
      if (added > 0) {
        mapInstance.fitBounds(bounds);
      }
    }
 
  }, [propertyData,setMapCenter,setMapZoom]);

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
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === '') {
      return null; // This will use the default Google Maps marker
    }
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="${isHighlighted ? '#3B82F6' : '#EF4444'}" stroke="white" stroke-width="2"/>
          <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">$${(property.price / 1000).toFixed(0)}k</text>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20)
    };
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
    if (map && propertyData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      propertyData.forEach(property => {
        bounds.extend({ lat: property.latitude, lng: property.longitude });
      });
      map.fitBounds(bounds);
    }
  };

  return (
    <div className="relative h-full bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden">
      {/* API Key Warning */}
      {(!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">Google Maps API key not configured</span>
          </div>
        </div>
      )}
      
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMapComponent
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={getMapOptions}
        >
          {/* Property markers with clustering */}
          <MarkerClusterer>
            {(clusterer) => {
              return (
                <>
                  {propertyData.map((property) => {
                    const coords = getNormalizedLatLng(property);
                    if (!coords) return null;
                    const { lat, lng } = coords;
                    return (
                      <Marker
                        key={property.id}
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
              position={{ lat: selectedProperty.latitude, lng: selectedProperty.longitude }}
              onCloseClick={() => setSelectedProperty(null)}
            >
              <div className="p-4 max-w-xs">
                <img
                  src={selectedProperty.images[0]}
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
                </div>
                                 <button
                   // onClick={() => onPropertySelect && onPropertySelect(selectedProperty)}
                   onClick={ handlePropertyClick }
                   className="w-full px-4 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-lg hover:shadow-lg transition-colors text-sm font-medium"
                 >
                   View Details
                 </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMapComponent>
      </LoadScript>
      
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
                 ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] shadow-lg shadow-[#51faaa]/20' 
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
                 ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] shadow-lg shadow-[#51faaa]/20' 
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
                 ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] shadow-lg shadow-[#51faaa]/20' 
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
                   ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] shadow-lg shadow-[#51faaa]/20'
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
      <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
        <Home className="w-5 h-5" />
        <span className="font-semibold">{propertyData.length} properties</span>
      </div>

             {/* Drawing Mode Indicator */}
       {drawingMode && (
         <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] px-4 py-2 rounded-xl shadow-lg">
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
      hasVirtualTour: false,
      hasOpenHouse: false,
      isPriceReduced: false,
      isNew: false,
      petFriendly: false,
      hasParking: false
    });
  };

  const homeTypes = ['House', 'Condo', 'Townhouse', 'Apartment', 'Multi-family', 'Land'];
  const features = [
    'Updated Kitchen', 'Hardwood Floors', 'Central Air', 'Fireplace', 
    'Smart Home', 'Energy Efficient', 'Pool', 'Garage', 'Waterfront',
    'Mountain View', 'City View', 'Pet Friendly', 'Balcony', 'Patio'
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

        {/* Quick Toggles */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quick Filters</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.hasVirtualTour}
                onChange={(e) => handleFilterChange('hasVirtualTour', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]" 
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
                <Video className="w-4 h-4" /> Virtual Tour Available
              </span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.hasOpenHouse}
                onChange={(e) => handleFilterChange('hasOpenHouse', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]" 
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">Open House Scheduled</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.isPriceReduced}
                onChange={(e) => handleFilterChange('isPriceReduced', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]" 
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">Price Reduced</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.isNew}
                onChange={(e) => handleFilterChange('isNew', e.target.checked)}
                className="mr-2 rounded border-gray-300 dark:border-gray-700 text-[#51faaa] focus:ring-[#51faaa]" 
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">New Listings</span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Price Range</label>
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
              <option value="1">1+ beds</option>
              <option value="2">2+ beds</option>
              <option value="3">3+ beds</option>
              <option value="4">4+ beds</option>
              <option value="5">5+ beds</option>
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

        {/* Apply Filters Button */}
        <button className="w-full bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 transition-all duration-300">
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// Quick Filters Component
const QuickFilters = React.memo(({ filters, setFilters }) => {
  const quickFilters = [
    { label: 'New Listings', key: 'isNew', value: true, icon: Sparkles },
    { label: 'Price Reduced', key: 'isPriceReduced', value: true, icon: TrendingDown },
    { label: 'Virtual Tour', key: 'hasVirtualTour', value: true, icon: Video },
    { label: 'Open House', key: 'hasOpenHouse', value: true, icon: Calendar },
    { label: 'Pet Friendly', key: 'petFriendly', value: true, icon: Heart },
    { label: 'Parking', key: 'hasParking', value: true, icon: Car }
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {quickFilters.map((filter, index) => (
        <button
          key={index}
          onClick={() => setFilters(prev => ({ ...prev, [filter.key]: !prev[filter.key] }))}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
            filters[filter.key]
              ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-[#51faaa] hover:border-[#dbd5a4] hover:text-[#51faaa] dark:hover:text-[#51faaa]'
          }`}
        >
          <filter.icon className="w-4 h-4" />
          {filter.label}
        </button>
      ))}
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
    hasVirtualTour: false,
    hasOpenHouse: false,
    isPriceReduced: false,
    isNew: false,
    petFriendly: false,
    hasParking: false
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
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);


  
  const { currentUser, toggleFavorite, isFavorite } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  let {data:properties, isError} = useProperties()
  // Load property data
  useEffect(() => {
    const loadProperties = async () => {
      if (!properties) {
        return;
      }
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPropertyData(properties);
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
      filtered = filtered.filter(property => 
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.zipCode.includes(searchQuery)
      );
    }

    // Apply all filters
    if (filters.minPrice) filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice));
    if (filters.maxPrice) filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice));
    if (filters.minBeds) filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.minBeds));
    if (filters.minBaths) filtered = filtered.filter(p => p.bathrooms >= parseInt(filters.minBaths));
    if (filters.homeTypes.length > 0) filtered = filtered.filter(p => filters.homeTypes.includes(p.property_type));
    if (filters.hasVirtualTour) filtered = filtered.filter(p => p.virtual_tour);
    if (filters.hasOpenHouse) filtered = filtered.filter(p => p.open_house);
    if (filters.isPriceReduced) filtered = filtered.filter(p => p.is_price_reduced);
    if (filters.isNew) filtered = filtered.filter(p => p.is_new);
    if (filters.petFriendly) filtered = filtered.filter(p => p.petFriendly);
    if (filters.hasParking) filtered = filtered.filter(p => p.hasParking);

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      // case 'beds':
      //   filtered.sort((a, b) => b.bedrooms - a.bedrooms);
      //   break;
      case 'sqft':
        filtered.sort((a, b) => b.area - a.area);
        break;
      default:
        filtered.sort((a, b) => a.days_on_market - b.days_on_market);
    }

    setFilteredData(filtered);
  }, [propertyData, searchQuery, filters, sortBy]);

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
    <div className={`min-h-screen transition-colors duration-500 mb-8 pt-20 ${
      isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b sticky top-20 z-40 backdrop-blur-xl transition-colors duration-500 ${
        isDark 
          ? 'bg-[#10121e]/95 border-[rgba(81,250,170,0.1)]' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-4">
            <div className="flex-1 w-full max-w-3xl">
              <EnhancedSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                propertyCount={filteredData.length}
                filters={filters}
                setFilters={setFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
              />
            </div>
            
            <div className={`flex items-center rounded-xl p-1 transition-colors duration-500 ${
              isDark ? 'bg-white/5' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => {
                  setViewMode('grid');
                  }}
                className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] shadow-lg text-[#111]'
                    : isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setViewMode('list');
                  }}
                className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] shadow-lg text-[#111]'
                    : isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className={`text-xl lg:text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {searchQuery || 'New York'} Real Estate
              </h1>
              <p className={`${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>
                {filteredData.length} homes available
              </p>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#51faaa] w-full sm:w-auto transition-colors duration-500 ${
                isDark 
                  ? 'bg-[#10121e] border-white/10 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price (Low to High)</option>
              <option value="price_high">Price (High to Low)</option>
              <option value="beds">Most Bedrooms</option>
              <option value="sqft">Largest</option>
            </select>
          </div>

          <QuickFilters filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-280px)] lg:h-[calc(100vh-280px)] md:h-[calc(100vh-320px)]">
        <FiltersSidebar 
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          onClose={() => setShowFilters(false)}
        />

        <div className="flex-1">
          <EnhancedMap
            propertyData={filteredData}
            highlightedProperty={highlightedProperty}
            onMarkerHover={handlePropertyHover}
            onPropertySelect={handlePropertySelect}
            drawnBounds={drawnBounds}
            setDrawnBounds={setDrawnBounds}
            mapTheme={mapTheme}
            setMapTheme={setMapTheme}
          />
        </div>

        <div className={`w-full lg:w-2/5 border-l overflow-y-auto transition-colors duration-500 ${
          isDark 
            ? 'bg-[#10121e] border-[rgba(81,250,170,0.1)]' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-4">
            <MarketInsights location={searchQuery || 'New York'} propertyCount={filteredData.length} />
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