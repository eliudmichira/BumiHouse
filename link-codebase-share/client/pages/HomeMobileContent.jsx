import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Search,
  MapPin,
  Home,
  Building,
  TreePine,
  Star,
  Phone,
  TrendingUp,
  Loader2,
  RefreshCw,
  ChevronRight,
  Award,
  Users,
  Shield,
  Sparkles,
  Heart,
  Eye,
  Bed,
  Bath,
  Square
} from "lucide-react";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import { useFeaturedProperties } from "../src/hooks/useProperties";
import { formatKes } from "../src/services/aiInsights";
import heroBg from "../src/images/amani-nation-LTh5pGyvKAM-unsplash.jpg";

// Pure Mobile App Home Content Component for Hama Estate (without navigation)
const HomeMobileContent = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { data: featuredData, isLoading: featuredLoading, isError: featuredError, refetch: refetchFeatured } = useFeaturedProperties(4);
  
  const [searchData, setSearchData] = useState({
    location: '',
    propertyType: '',
    priceRange: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Get featured properties from API
  const featuredProperties = featuredData?.properties || featuredData?.data || [];

  const stats = [
    { value: "5,000+", label: "Properties", icon: <Home className="w-4 h-4" /> },
    { value: "30", label: "Counties", icon: <MapPin className="w-4 h-4" /> },
    { value: "8,000+", label: "Customers", icon: <Building className="w-4 h-4" /> },
    { value: "200+", label: "Agents", icon: <Building className="w-4 h-4" /> }
  ];

  const propertyTypes = [
    { icon: <Building className="w-5 h-5" />, name: "Apartments", count: "2,500+", color: "from-[#51faaa] to-[#45e695]", path: "/search?type=apartment" },
    { icon: <Home className="w-5 h-5" />, name: "Houses", count: "1,800+", color: "from-[#51faaa] to-[#3dd88a]", path: "/search?type=house" },
    { icon: <Building className="w-5 h-5" />, name: "Villas", count: "500+", color: "from-[#51faaa] to-[#35ca7f]", path: "/search?type=villa" },
    { icon: <TreePine className="w-5 h-5" />, name: "Land", count: "200+", color: "from-[#51faaa] to-[#2dbc74]", path: "/search?type=land" }
  ];

  const handleSearch = () => {
    if (searchData.location || searchData.propertyType || searchData.priceRange) {
      const params = new URLSearchParams();
      if (searchData.location) params.append('location', searchData.location);
      if (searchData.propertyType) params.append('type', searchData.propertyType);
      if (searchData.priceRange) params.append('price', searchData.priceRange);
      
      navigate(`/search?${params.toString()}`);
    } else {
      // If no search criteria, just go to search page
      navigate('/search');
    }
  };

  const handlePropertyTypeClick = (path) => {
    navigate(path);
  };

  const handleFeaturedPropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const toggleFavorite = (propertyId) => {
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

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    if (typeof price === 'string') return price;
    return formatKes(price);
  };

  const getPropertyImage = (property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property.image) {
      return property.image;
    }
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
  };

  const getPropertyName = (property) => {
    return property.name || property.title || 'Property';
  };

  const getPropertyLocation = (property) => {
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

  const handleContactAgent = (propertyName) => {
    // In a real app, this would open contact options
    alert(`Contacting agent for ${propertyName}. This would open contact options.`);
  };

  if (featuredError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Featured Properties
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Something went wrong while loading properties
          </p>
          <button
            onClick={() => refetchFeatured()}
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
    <motion.div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Premium Hero Section with Desktop Image */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Find Your Perfect Home in Kenya
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Discover premium properties across all 47 counties
            </p>
          </motion.div>
          
          {/* Premium Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
          >
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter location (e.g., Nairobi, Mombasa)"
                  value={searchData.location}
                  onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={searchData.propertyType}
                  onChange={(e) => setSearchData(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent text-gray-900"
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="land">Land</option>
                </select>
                
                <select
                  value={searchData.priceRange}
                  onChange={(e) => setSearchData(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent text-gray-900"
                >
                  <option value="">Price Range</option>
                  <option value="0-50000">Under Ksh 50,000</option>
                  <option value="50000-100000">Ksh 50,000 - 100,000</option>
                  <option value="100000-200000">Ksh 100,000 - 200,000</option>
                  <option value="200000-500000">Ksh 200,000 - 500,000</option>
                  <option value="500000-1000000">Ksh 500,000 - 1M</option>
                  <option value="1000000-">Over Ksh 1M</option>
                </select>
              </div>
              
              <motion.button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-[#51faaa] to-[#45e695] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-5 h-5" />
                Search Properties
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Stats Section */}
      <section className="px-6 py-12 bg-white dark:bg-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Trusted by Thousands
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join our growing community of satisfied customers
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-600"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#51faaa] to-[#45e695] rounded-2xl mx-auto mb-4 shadow-lg">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Premium Property Types Section */}
      <section className="px-6 py-12 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Explore Property Types
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find the perfect property that matches your lifestyle
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-6">
          {propertyTypes.map((type, index) => (
            <motion.button
              key={type.name}
              onClick={() => handlePropertyTypeClick(type.path)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${type.color} rounded-2xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {type.icon}
              </div>
              <div className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {type.name}
              </div>
              <div className="text-sm text-[#51faaa] font-semibold mb-2">
                {type.count}
              </div>
              <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                <span className="text-xs">Explore</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Premium Featured Properties Section */}
      <section className="px-6 py-12 bg-white dark:bg-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Featured Properties
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Handpicked premium properties just for you
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/search')}
            className="bg-gradient-to-r from-[#51faaa] to-[#45e695] text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
        
        {featuredLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#51faaa] animate-spin" />
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="space-y-6">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex">
                  <div className="w-32 h-32 flex-shrink-0 relative">
                    <img
                      src={getPropertyImage(property)}
                      alt={getPropertyName(property)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleFavorite(property.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                          favorites.has(property.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(property.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                        {getPropertyName(property)}
                      </h4>
                      {property.rating && (
                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                            {property.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{getPropertyLocation(property)}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      {(property.bedrooms || property.bedroom) && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          {property.bedrooms || property.bedroom} beds
                        </span>
                      )}
                      {(property.bathrooms || property.bathroom) && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          {property.bathrooms || property.bathroom} baths
                        </span>
                      )}
                      {property.area && (
                        <span className="flex items-center gap-1">
                          <Square className="w-4 h-4" />
                          {property.area} sqft
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-[#51faaa]">
                        {formatPrice(property.price)}
                      </div>
                      <div className="flex gap-2">
                        <motion.button 
                          onClick={() => handleFeaturedPropertyClick(property.id)}
                          className="bg-gradient-to-r from-[#51faaa] to-[#45e695] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Details
                        </motion.button>
                        <motion.button 
                          onClick={() => handleContactAgent(getPropertyName(property))}
                          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Contact
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No featured properties available at the moment
            </p>
          </div>
        )}
      </section>

      {/* Premium CTA Section */}
      <section className="px-6 py-16 bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-md mx-auto">
              Join thousands of satisfied customers who found their perfect property with us
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
          >
            <motion.button
              onClick={() => navigate('/search')}
              className="bg-white text-[#111] px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
              Start Searching
            </motion.button>
            <motion.button
              onClick={() => alert('This would open a call scheduling interface')}
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-[#111] transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-5 h-5" />
              Schedule Call
            </motion.button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomeMobileContent;
