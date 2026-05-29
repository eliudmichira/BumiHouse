import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GoogleMap as GoogleMapComponent,
  useJsApiLoader,
  Marker,
  InfoWindow,
  MarkerClusterer
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
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PropertyMobileCard, 
  PropertyMobileButton 
} from '../../components/mobile/PropertyMobileNav';
import { MobilePage } from '../../components/mobile/PropertyMobileLayout';

// Mobile Property Card Component
const MobilePropertyCard = ({ property, onViewDetails, onToggleFavorite, isFavorite }) => {
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
      case 'apartment': return <Building2 className="w-4 h-4" />;
      case 'house': return <Home className="w-4 h-4" />;
      case 'studio': return <Square className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  return (
    <PropertyMobileCard
      onClick={() => onViewDetails(property)}
      interactive={true}
      variant="glass"
      className="mb-4"
    >
      {/* Image Section */}
      <div className="relative mb-4">
        <div className="relative h-48 w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
          {images[currentImageIndex] && (
            <img
              src={images[currentImageIndex]}
              alt={property.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          )}
          
          {/* Image Navigation Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Favorite Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </motion.button>

          {/* Property Type Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full text-white text-xs">
            {getPropertyTypeIcon(property.type)}
            <span>{property.type || 'Property'}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-3">
        {/* Title and Price */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
              {property.title || property.address}
            </h3>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {(() => {
                  if (property.address) return property.address;
                  if (typeof property.location === 'string') {
                    return property.location;
                  } else if (property.location && typeof property.location === 'object') {
                    return property.location.address || property.location.city || property.location.state || '';
                  }
                  return 'Location not specified';
                })()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#51faaa]">
              {formatPrice(property.price)}
            </p>
            {property.pricePerSqm && (
              <p className="text-xs text-gray-400">
                {formatPrice(property.pricePerSqm)}/sqm
              </p>
            )}
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-gray-400 text-sm">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span>{property.area} sqm</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex items-center gap-2">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-xs text-gray-500">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <PropertyMobileButton
            variant="primary"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(property);
            }}
            className="flex items-center justify-center gap-2"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </PropertyMobileButton>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              // Handle contact action
            }}
            className="p-2 border border-gray-600 rounded-xl hover:bg-gray-700/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Phone className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>
      </div>
    </PropertyMobileCard>
  );
};

// Mobile Property List Component
const MobilePropertyList = () => {
  const { properties, loading, error } = useProperties();
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [favorites, setFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState([]);

  // Filter properties based on search query
  useEffect(() => {
    if (!properties) return;
    
    let filtered = properties;
    
    if (searchQuery) {
      filtered = properties.filter(property => 
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProperties(filtered);
  }, [properties, searchQuery]);

  const handleToggleFavorite = (property) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(property.id)) {
        newFavorites.delete(property.id);
      } else {
        newFavorites.add(property.id);
      }
      return newFavorites;
    });
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
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#51faaa] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Loading properties...</p>
          </div>
        </div>
      </MobilePage>
    );
  }

  if (error) {
    return (
      <MobilePage title="Properties" showSearchButton={true}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Error Loading Properties</h3>
              <p className="text-gray-400 mb-4">{error}</p>
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
      subtitle={`${filteredProperties.length} properties found`}
      showSearchButton={true}
      showNotificationButton={true}
      onSearch={() => setShowFilters(true)}
    >
      {/* Search and Filter Bar */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 p-4 -mx-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#51faaa] focus:ring-1 focus:ring-[#51faaa]/20"
            />
          </div>
          <motion.button
            onClick={handleShowFilters}
            className="p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-[#51faaa] text-[#0a0c19]' 
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <List className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'map' 
                ? 'bg-[#51faaa] text-[#0a0c19]' 
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MapIcon className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="text-sm text-gray-400">
          {filteredProperties.length} properties
        </div>
      </div>

      {/* Properties List */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProperties.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
                    <Home className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Properties Found</h3>
                    <p className="text-gray-400 mb-4">
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
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <MobilePropertyCard
                    key={property.id}
                    property={property}
                    onViewDetails={handleViewDetails}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.has(property.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-96 rounded-xl overflow-hidden"
          >
            <div className="w-full h-full bg-gray-800/50 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <MapIcon className="w-12 h-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Map View</h3>
                  <p className="text-gray-400">Interactive map coming soon</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobilePage>
  );
};

export default MobilePropertyList;
