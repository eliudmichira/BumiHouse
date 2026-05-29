import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Home, 
  Building, 
  TreePine, 
  Star, 
  Phone, 
  Heart, 
  Filter, 
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
  Grid,
  List,
  Map,
  X,
  Bed,
  Bath,
  Car,
  Wifi,
  Waves,
  Dumbbell,
  Shield,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useTheme } from "../src/context/ThemeContext";
import { useProperties } from "../src/hooks/useProperties";
import { formatKes } from "../src/services/aiInsights";

// Mobile Property Search Results Page
const MobilePropertySearch = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: propertiesData, isLoading, isError, refetch } = useProperties();
  
  // Search filters from URL params
  const location = searchParams.get('location') || '';
  const propertyType = searchParams.get('type') || '';
  const priceRange = searchParams.get('price') || '';
  const searchQuery = searchParams.get('search') || '';

  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    beds: '',
    baths: '',
    amenities: [] as string[]
  });
  const [favorites, setFavorites] = useState(new Set());
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'rating'>('date');

  // Get properties from the API
  const properties = propertiesData?.properties || propertiesData?.data || [];

  // Amenities options
  const amenitiesOptions = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-4 h-4" /> },
    { id: 'parking', label: 'Parking', icon: <Car className="w-4 h-4" /> },
    { id: 'pool', label: 'Pool', icon: <Waves className="w-4 h-4" /> },
    { id: 'gym', label: 'Gym', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'garden', label: 'Garden', icon: <TreePine className="w-4 h-4" /> }
  ];

  // Filter and search properties
  const filteredProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    
    let filtered = [...properties];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(property => 
        property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply location filter
    if (location) {
      filtered = filtered.filter(property => 
        property.location?.toLowerCase().includes(location.toLowerCase()) ||
        property.address?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Apply property type filter
    if (propertyType) {
      filtered = filtered.filter(property => 
        property.type?.toLowerCase() === propertyType.toLowerCase()
      );
    }

    // Apply price filter from URL
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => parseInt(p.replace(/\D/g, '')));
      filtered = filtered.filter(property => {
        const price = parseInt(property.price?.toString().replace(/\D/g, '') || '0');
        if (max) {
          return price >= min && price <= max;
        }
        return price >= min;
      });
    }

    // Apply local filters
    if (filters.priceMin) {
      const min = parseInt(filters.priceMin);
      filtered = filtered.filter(property => 
        parseInt(property.price?.toString().replace(/\D/g, '') || '0') >= min
      );
    }

    if (filters.priceMax) {
      const max = parseInt(filters.priceMax);
      filtered = filtered.filter(property => 
        parseInt(property.price?.toString().replace(/\D/g, '') || '0') <= max
      );
    }

    if (filters.beds) {
      filtered = filtered.filter(property => 
        (property.bedrooms || property.bedroom) >= parseInt(filters.beds)
      );
    }

    if (filters.baths) {
      filtered = filtered.filter(property => 
        (property.bathrooms || property.bathroom) >= parseInt(filters.baths)
      );
    }

    if (filters.amenities.length > 0) {
      filtered = filtered.filter(property => 
        filters.amenities.some(amenity => 
          property.amenities?.includes(amenity) || 
          property.features?.includes(amenity)
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (parseInt(a.price?.toString().replace(/\D/g, '') || '0') - 
                  parseInt(b.price?.toString().replace(/\D/g, '') || '0'));
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'date':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return filtered;
  }, [properties, searchQuery, location, propertyType, priceRange, filters, sortBy]);

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleContactAgent = (propertyName: string) => {
    // In a real app, this would open contact options
    alert(`Contacting agent for ${propertyName}. This would open contact options.`);
  };

  const clearFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      beds: '',
      baths: '',
      amenities: []
    });
  };

  const toggleAmenity = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const formatPrice = (price: any) => {
    if (!price) return 'Price on request';
    if (typeof price === 'string') return price;
    return formatKes(price);
  };

  const getPropertyImage = (property: any) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property.image) {
      return property.image;
    }
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop';
  };

  const getPropertyName = (property: any) => {
    return property.name || property.title || 'Property';
  };

  const getPropertyLocation = (property: any) => {
    if (property.location) {
      // Handle location object with nested properties
      if (typeof property.location === 'object') {
        if (property.location.city) {
          return property.location.city;
        }
        if (property.location.address) {
          return property.location.address;
        }
        // If it's an object but no city/address, try to stringify safely
        return 'Location not specified';
      }
      // Handle string location
      return property.location;
    }
    if (property.address) {
      return property.address;
    }
    return 'Location not specified';
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Properties
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Something went wrong while loading properties
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#45e695] transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex-1 mx-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Results
            </h1>
            {searchQuery && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                "{searchQuery}" • {filteredProperties.length} properties
              </p>
            )}
            {!searchQuery && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredProperties.length} properties found
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-[#51faaa] text-[#111]' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'price' | 'date' | 'rating')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                >
                  <option value="date">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Beds & Baths */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Bedrooms</h3>
                  <select
                    value={filters.beds}
                    onChange={(e) => setFilters(prev => ({ ...prev, beds: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Bathrooms</h3>
                  <select
                    value={filters.baths}
                    onChange={(e) => setFilters(prev => ({ ...prev, baths: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </select>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Amenities</h3>
                <div className="grid grid-cols-3 gap-2">
                  {amenitiesOptions.map((amenity) => (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.amenities.includes(amenity.id)
                          ? 'bg-[#51faaa] text-[#111]'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {amenity.icon}
                      {amenity.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-2 bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#45e695] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <main className="pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#51faaa] animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading properties...</p>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No properties found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#45e695] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-4 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 gap-4' 
              : 'space-y-4'
          }`}>
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex">
                  {/* Property Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={getPropertyImage(property)}
                      alt={getPropertyName(property)}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Property Details */}
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {getPropertyName(property)}
                      </h3>
                      <button
                        onClick={() => toggleFavorite(property.id)}
                        className={`p-1 rounded-full transition-colors ${
                          favorites.has(property.id)
                            ? 'text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(property.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mb-2 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{getPropertyLocation(property)}</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="text-base font-bold text-[#51faaa] dark:text-[#51faaa]">
                        {formatPrice(property.price)}
                      </div>
                      {property.rating && (
                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                            {property.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-2 text-xs text-gray-600 dark:text-gray-400">
                      {(property.bedrooms || property.bedroom) && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          {property.bedrooms || property.bedroom}
                        </span>
                      )}
                      {(property.bathrooms || property.bathroom) && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-3 h-3" />
                          {property.bathrooms || property.bathroom}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePropertyClick(property.id)}
                        className="flex-1 bg-[#51faaa] text-[#111] py-2 rounded-lg text-xs font-medium hover:bg-[#45e695] transition-colors"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleContactAgent(getPropertyName(property))}
                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#51faaa] text-[#111] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
      >
        <Map className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MobilePropertySearch;
