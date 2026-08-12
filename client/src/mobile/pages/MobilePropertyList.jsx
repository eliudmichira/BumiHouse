import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CloudCog, Bus, ArrowUpDown, Droplet, Wifi as WifiIcon
} from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  PropertyMobileCard,
  PropertyMobileButton
} from '../components/PropertyMobileNav';
import { MobilePage } from '../components/PropertyMobileLayout';
import SwipeablePropertyCard from '../components/SwipeablePropertyCard';

// Mobile Property Card Component - theme aware
const MobilePropertyCard = ({ property, onViewDetails, onToggleFavorite, isFavorite, isDark }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = property.images || [property.image] || ['/placeholder-property.jpg'];
  const hasMultipleImages = images.length > 1;

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const location = (() => {
    if (property.address) return property.address;
    if (typeof property.location === 'string') return property.location;
    return property.location?.address || property.location?.city || 'Location available';
  })();

  const status = property.status?.replace(/-/g, ' ');

  return (
    <div
      onClick={() => onViewDetails(property)}
      className={`mb-4 overflow-hidden rounded-2xl border cursor-pointer transition-colors ${
        isDark ? 'bg-gray-900/40 border-white/5' : 'bg-white border-gray-200'
      }`}
    >
      {/* Image */}
      <div className={`relative aspect-[4/3] w-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {images[currentImageIndex] && (
          <img
            src={images[currentImageIndex]}
            alt={property.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        )}

        {/* Top scrim so the badge, heart and dots stay legible on bright photos */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

        {status && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-full ring-1 ring-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#51faaa]" />
              {status}
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(property);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Toggle favorite"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
        </button>

        {hasMultipleImages && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${i === currentImageIndex ? 'w-4 bg-white' : 'w-1 bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className={`text-[22px] font-bold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {formatPrice(property.price)}
        </div>

        <h3 className={`mt-1 text-[14px] font-medium leading-snug line-clamp-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {property.title}
        </h3>

        <div className={`mt-1 flex items-center gap-1 text-[12px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        <div className={`mt-3 pt-3 border-t flex items-center gap-4 text-[12px] font-medium ${isDark ? 'border-white/5 text-gray-400' : 'border-gray-100 text-gray-600'}`}>
          {property.bedrooms != null && (
            <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-[#51faaa]" />{property.bedrooms} bd</span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1.5"><Bath className="w-3.5 h-3.5 text-[#51faaa]" />{property.bathrooms} ba</span>
          )}
          {property.area && (
            <span className="flex items-center gap-1.5"><Square className="w-3.5 h-3.5 text-[#51faaa]" />{property.area.toLocaleString()} sqft</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(property);
          }}
          className="mt-4 w-full h-11 rounded-xl bg-[#51faaa] text-[#0a0c19] text-[13px] font-semibold tracking-wide flex items-center justify-center gap-1.5 shadow-sm shadow-[#51faaa]/20 active:scale-[0.98] transition-transform"
        >
          View details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Mobile Property List Component
const MobilePropertyList = () => {
  const { data, isLoading: loading, isError: error } = useProperties();
  const properties = useMemo(() => data?.properties || [], [data?.properties]);
  const { isDark } = useTheme();
  const { currentUser, toggleFavorite, isFavorite } = useAuth();
  const navigate = useNavigate();

  // Removed map view - only list view is available
  const [favorites, setFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    minBathrooms: '',
    propertyType: '',
    status: ''
  });

  // Read deep-link params (?search=Westlands from the home page Popular Areas,
  // ?propertyType=… from the property-type tiles) so shared links filter the list.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) setSearchQuery(decodeURIComponent(searchParam));
    const typeParam = params.get('propertyType');
    if (typeParam) setFilters((prev) => ({ ...prev, propertyType: typeParam }));
  }, []);

  // Quick status filters (single-select, synced with the Filter sheet's Status dropdown)
  // Values are internal tokens used by the keyword matcher — not the raw Firestore values.
  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'for-sale', label: 'For Sale' },
    { value: 'for-rent', label: 'For Rent' }
  ];

  // Filter properties based on search query and filters - optimized with useMemo
  const filteredProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];

    let filtered = properties;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(p => (p.price || 0) >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => (p.price || 0) <= parseInt(filters.maxPrice));
    }

    // Bedrooms filter
    if (filters.minBedrooms) {
      filtered = filtered.filter(p => (p.bedrooms || 0) >= parseInt(filters.minBedrooms));
    }

    // Bathrooms filter
    if (filters.minBathrooms) {
      filtered = filtered.filter(p => (p.bathrooms || 0) >= parseInt(filters.minBathrooms));
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(p =>
        (p.type || '').toLowerCase() === filters.propertyType.toLowerCase() ||
        (p.propertyType || '').toLowerCase() === filters.propertyType.toLowerCase()
      );
    }

    // Status filter — check BOTH fields since the dataset has two schemas:
    //   Seeded properties:    listing_type = "rent" | "sale",  status = "available"
    //   AddProperty-created:  status = "for-rent" | "for-sale", no listing_type
    if (filters.status) {
      const wantsRent = filters.status.toLowerCase().includes('rent');
      filtered = filtered.filter(p => {
        const s = (p.status || '').toLowerCase();
        const lt = (p.listing_type || '').toLowerCase();
        if (wantsRent) {
          return s.includes('rent') || lt === 'rent';
        } else {
          // For Sale: explicit sale status, OR listing_type=sale, OR generic available with no listing_type
          return s.includes('sale') || lt === 'sale' || (s === 'available' && !lt);
        }
      });
    }

    return filtered;
  }, [properties, searchQuery, filters]);

  const handleToggleFavorite = (property) => {
    if (toggleFavorite) {
      toggleFavorite(property);
    } else {
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(property.id)) {
          newFavorites.delete(property.id);
        } else {
          newFavorites.add(property.id);
        }
        return newFavorites;
      });
    }
  };

  const handleShare = (property) => {
    if (navigator.share) {
      navigator.share({
        title: property.title || property.name,
        text: property.description || '',
        url: `${window.location.origin}/property/${property.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
    }
  };

  const handleMessage = (property) => {
    navigate(`/messages?property=${property.id}`);
  };

  const handleViewDetails = (property) => {
    navigate(`/property/${property.id}`);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddProperty = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/add-property');
  };

  const handleShowFilters = () => {
    setShowFilters(true);
  };

  if (loading) {
    return (
      <MobilePage title="Properties" showSearchButton={true}>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#51faaa] border-t-transparent rounded-full animate-spin" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading properties...</p>
          </div>
        </div>
      </MobilePage>
    );
  }

  if (error) {
    return (
      <MobilePage title="Properties" showSearchButton={true}>
        <div className="flex items-center justify-center min-h-[40vh] px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Error loading properties</h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{error}</p>
              <PropertyMobileButton
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </PropertyMobileButton>
            </div>
          </div>
        </div>
      </MobilePage>
    );
  }

  return (
    <MobilePage
      title="Properties"
      subtitle={`${filteredProperties.length} properties`}
      showSearchButton={true}
      showNotificationButton={false}
      onSearch={() => setShowFilters(true)}
    >
      {/* Mobile-first search & filters - theme aware */}
      <div className={`sticky top-0 z-30 -mx-4 px-4 pt-3 pb-3 mb-3 border-b ${isDark ? 'bg-gray-900/95 backdrop-blur-xl border-white/5' : 'bg-white/95 backdrop-blur-xl border-gray-200'}`}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search location or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 h-10 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#51faaa] ${isDark
                  ? 'bg-gray-800/60 border border-white/10 text-white placeholder-gray-500'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className={`h-10 px-3 rounded-lg shrink-0 flex items-center justify-center gap-1.5 text-[13px] font-medium relative ${Object.values(filters).some(f => f !== '' && f !== false)
                ? 'bg-[#51faaa] text-[#0a0c19]'
                : isDark
                  ? 'bg-gray-800/60 border border-white/10 text-gray-300'
                  : 'bg-gray-50 border border-gray-200 text-gray-700'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Quick status chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {statusFilters.map((filter) => {
              const isActive = (filters.status || '') === filter.value;
              return (
                <button
                  key={filter.value || 'all'}
                  onClick={() => setFilters(prev => ({ ...prev, status: filter.value }))}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${isActive
                    ? 'bg-[#51faaa] border-[#51faaa] text-[#0a0c19]'
                    : isDark
                      ? 'bg-transparent border-white/10 text-gray-400'
                      : 'bg-transparent border-gray-200 text-gray-600'
                    }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Screen-reader live count (visible count lives in the header subtitle) */}
      <span className="sr-only" aria-live="polite">
        {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
      </span>

      {/* Properties List - extra padding for bottom nav; contain overflow */}
      <div className="pb-36 min-w-0 max-w-full">
        {filteredProperties.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh] py-8">
            <div className="flex flex-col items-center gap-4 text-center px-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <Home className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No properties found</h3>
                <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'No properties available at the moment'}
                </p>
                {!searchQuery && (
                  <PropertyMobileButton
                    variant="outline"
                    onClick={handleAddProperty}
                  >
                    Add First Property
                  </PropertyMobileButton>
                )}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProperties.map((property, index) => {
              const isPropertyFavorite = isFavorite ? isFavorite(property.id) : favorites.has(property.id);
              return (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="min-w-0 overflow-hidden"
                >
                  <SwipeablePropertyCard
                    onFavorite={() => handleToggleFavorite(property)}
                    onShare={() => handleShare(property)}
                    onMessage={() => handleMessage(property)}
                    isFavorite={isPropertyFavorite}
                  >
                    <MobilePropertyCard
                      property={property}
                      onViewDetails={handleViewDetails}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={isPropertyFavorite}
                      isDark={isDark}
                    />
                  </SwipeablePropertyCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl max-h-[85vh] overflow-y-auto border-t pb-20 ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'
                }`}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className={`p-1.5 rounded-md ${isDark ? 'active:bg-white/5' : 'active:bg-gray-100'}`}
                  >
                    <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Price range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min (KES)"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                      <input
                        type="number"
                        placeholder="Max (KES)"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                  </div>

                  {/* Bedrooms & Bathrooms */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Min beds</label>
                      <select
                        value={filters.minBedrooms}
                        onChange={(e) => setFilters(prev => ({ ...prev, minBedrooms: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                      >
                        <option value="">Any</option>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num}+</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Min baths</label>
                      <select
                        value={filters.minBathrooms}
                        onChange={(e) => setFilters(prev => ({ ...prev, minBathrooms: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                      >
                        <option value="">Any</option>
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}+</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Property type</label>
                    <select
                      value={filters.propertyType}
                      onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                    >
                      <option value="">All types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                    >
                      <option value="">All status</option>
                      <option value="for-sale">For Sale</option>
                      <option value="for-rent">For Rent</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className={`flex gap-3 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <motion.button
                      onClick={() => {
                        setFilters({
                          minPrice: '',
                          maxPrice: '',
                          minBedrooms: '',
                          minBathrooms: '',
                          propertyType: '',
                          status: ''
                        });
                      }}
                      className={`flex-1 px-4 py-3.5 rounded-xl font-semibold transition-colors ${isDark ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Reset
                    </motion.button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 px-4 py-3.5 bg-[#51faaa] rounded-xl text-[#0a0c19] text-[14px] font-semibold active:opacity-90"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MobilePage>
  );
};

export default memo(MobilePropertyList);
