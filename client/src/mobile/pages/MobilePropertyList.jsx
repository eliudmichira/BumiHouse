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

  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'apartment': return <Building2 className="w-3.5 h-3.5" />;
      case 'house': return <Home className="w-3.5 h-3.5" />;
      case 'studio': return <Square className="w-3.5 h-3.5" />;
      default: return <Home className="w-3.5 h-3.5" />;
    }
  };

  return (
    <PropertyMobileCard

      interactive={true}
      variant="glass"
      className={`mb-5 min-w-0 overflow-hidden !rounded-[32px] !p-0 border shadow-sm ${isDark ? 'bg-gray-900/40 border-white/5' : 'bg-white border-gray-100'
        }`}
    >
      {/* Image Section */}
      <div className="relative">
        <div className={`relative h-56 w-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {images[currentImageIndex] && (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              src={images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          )}

          {/* Image Navigation Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Image Navigation Dots (eBay Style) */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 px-4">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 transition-all duration-300 rounded-full ${i === currentImageIndex ? 'w-5 bg-white/90' : 'w-1.5 bg-white/40'
                    }`}
                />
              ))}
            </div>
          )}

          {/* Favorite Button (Floating Glass) */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property);
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 transition-all ${isFavorite ? 'text-red-500 fill-red-500 scale-110' : 'text-white'}`} />
          </motion.button>

          {/* Property Type Badge (Premium Glass) */}
          <div className="absolute top-4 left-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-wider border border-white/20 shadow-lg">
              {getPropertyTypeIcon(property.type)}
              {property.type || 'Property'}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title and Price */}
        <div className="flex flex-col gap-2 mb-5"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col gap-1.5 flex-1 w-0">
              <h3 className={`text-lg font-bold leading-tight tracking-tight line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {property.title}
              </h3>
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <MapPin className="w-3.5 h-3.5 text-[#3b82f6]" />
                </div>
                <span className={`text-[13px] font-medium truncate tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {(() => {
                    if (property.address) return property.address;
                    if (typeof property.location === 'string') return property.location;
                    return property.location?.address || property.location?.city || 'Location available';
                  })()}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Price
              </span>
              <p className={`text-[17px] font-bold  rounded-full p-1
               ${isDark ? '' : 'bg-orange-100'
                } `}>
                <span className={`text-orange-500 ${isDark ? 'text-orange-500' : 'text-orange-500'
                  }`}>{formatPrice(property.price)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Amenities (Floating Chips) */}
        <div className="flex flex-wrap gap-2 mb-1.5">
          {(property.amenities || []).slice(0, 3).map((amenity, idx) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-tight border shadow-sm transition-all ${isDark
                ? 'bg-gray-800/40 border-white/10 text-gray-300'
                : 'bg-white border-gray-200 text-gray-700'
                }`}
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* +X More Amenities */}
        <div className="h-6 mb-5 flex items-center">
          {(property.amenities?.length || 0) > 3 && (
            <span className={`text-[10px] font-bold tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Improved Action Buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(property);
            }}
            className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#3b82f6] via-[#45e89a]
               to-[#3b82f6] bg-[length:200%_auto] hover:bg-right transition-all 
               duration-500 flex items-center justify-center gap-2 font-bold text-[#0a0c19] 
               shadow-[0_8px_20px_-4px_rgba(81,250,170,0.3)] overflow-hidden group"
          >
            {/* Shine animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent 
            via-white/30 to-transparent -translate-x-full group-hover:translate-x-full
             transition-transform duration-1000"  onClick={() => onViewDetails(property)} />
            <span className={`text-[12px] font-bold ${isDark ? 'text-gray-100' : 'text-gray-700'} 
            tracking-widest`}>View Details</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isDark ? 'text-gray-100' :
              'text-gray-700'}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(property);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center border 
              shadow-lg transition-all duration-300 ${isDark
                ? 'bg-gray-800/50 border-white/10 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Phone className="w-4.5 h-4.5" />
          </motion.button>
        </div>
      </div>
    </PropertyMobileCard>
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

  // Quick filter options
  const quickFilters = [
    { key: 'transit', label: 'Transit', icon: Bus, active: false },
    { key: 'water', label: 'Water/Borehole', icon: Droplet, active: false },
    { key: 'wifi', label: 'Fibre Internet', icon: WifiIcon, active: false }
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

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(p =>
        (p.status || '').toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Quick filters
    if (filters.transit) {
      filtered = filtered.filter(p =>
        p.amenities?.some(a =>
          a.toLowerCase().includes('transit') ||
          a.toLowerCase().includes('bus') ||
          a.toLowerCase().includes('transport')
        ) || p.isNearPublicTransport
      );
    }
    if (filters.water) {
      filtered = filtered.filter(p =>
        p.amenities?.some(a =>
          a.toLowerCase().includes('water') ||
          a.toLowerCase().includes('borehole')
        ) || p.isWaterIncluded
      );
    }
    if (filters.wifi) {
      filtered = filtered.filter(p =>
        p.amenities?.some(a =>
          a.toLowerCase().includes('wifi') ||
          a.toLowerCase().includes('internet') ||
          a.toLowerCase().includes('fibre')
        ) || p.hasWifi
      );
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
            <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
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
      <div className={`sticky top-0 z-10 -mx-4 px-5 pt-3 pb-4 mb-4 border-b
       backdrop-blur-3xl shadow-lg transition-all ${isDark ? 'bg-gray-900/80 border-white/5' :
          'bg-white/80 border-gray-100'
        }`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
              <input
                type="text"
                placeholder="Search by location, address, or ZIP"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 h-14 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40 transition-all ${isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm'
                  }`}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(true)}
              className={`w-14 h-14 rounded-2xl shrink-0 transition-all flex items-center justify-center relative ${Object.values(filters).some(f => f !== '' && f !== false)
                ? 'bg-[#3b82f6]/20 border-2 border-[#3b82f6] text-[#3b82f6]'
                : isDark
                  ? 'bg-white/5 border border-white/10 text-gray-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 shadow-sm'
                }`}
            >
              <Filter className="w-5 h-5" />
              {Object.values(filters).some(f => f !== '' && f !== false) && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#3b82f6] rounded-full border-2 border-gray-900 shadow-sm" />
              )}
            </motion.button>
          </div>

          {/* Quick filter chips - horizontal scroll */}
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {quickFilters.map((filter) => (
              <motion.button
                key={filter.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilters(prev => ({ ...prev, [filter.key]: prev[filter.key] ? '' : true }))}
                className={`shrink-0 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm transition-all ${filters[filter.key]
                  ? 'bg-[#3b82f6] border-[#3b82f6] text-gray-900'
                  : isDark
                    ? 'bg-white/5 border-white/5 text-gray-400'
                    : 'bg-white border-gray-200 text-gray-600'
                  }`}
              >
                <filter.icon className="w-3.5 h-3.5" />
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Property count - compact; filter icon in header is primary, no duplicate link */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`} aria-live="polite">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

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
            className="space-y-5"
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
              className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl border-t pb-20 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#3b82f6] to-[#06b6d4] rounded-full" />
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Filters</h2>
                  </div>
                  <motion.button
                    onClick={() => setShowFilters(false)}
                    className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </motion.button>
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
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                      <input
                        type="number"
                        placeholder="Max (KES)"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`}
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
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
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
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
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
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
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
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40 ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
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
                          status: '',
                          transit: '',
                          water: '',
                          wifi: ''
                        });
                      }}
                      className={`flex-1 px-4 py-3.5 rounded-xl font-semibold transition-colors ${isDark ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Reset
                    </motion.button>
                    <motion.button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 px-4 py-3.5 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] rounded-xl text-[#0a0c19] font-semibold shadow-lg shadow-[#3b82f6]/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Apply Filters
                    </motion.button>
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
