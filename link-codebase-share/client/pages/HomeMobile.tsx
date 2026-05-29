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
  Menu,
  Sun,
  Moon,
  User,
  Heart,
  Filter,
  ChevronRight,
  Plus,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import { useFeaturedProperties } from "../src/hooks/useProperties";
import { formatKes } from "../src/services/aiInsights";

// Pure Mobile App Home Component for Hama Estate
const HomeMobile = () => {
  const { isDark, toggleTheme } = useTheme();
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
  const featuredProperties = (featuredData as any)?.properties || (featuredData as any)?.data || [];

  const stats = [
    { value: "5,000+", label: "Properties", icon: <Home className="w-4 h-4" /> },
    { value: "30", label: "Counties", icon: <MapPin className="w-4 h-4" /> },
    { value: "8,000+", label: "Customers", icon: <User className="w-4 h-4" /> },
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
      {/* Header */}
      <header 
        className="sticky top-0 z-40 border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.2) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#45e695] rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-[#111]" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#51faaa] via-[#45e695] to-[#3dd88a] bg-clip-text text-transparent">
              Hama Estate
            </h1>
              <p className="text-xs text-gray-300">
                Find Your Perfect Home
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className="relative transition-all duration-300 rounded-full p-2 text-gray-300 hover:text-white hover:bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/auth')}
              className="relative transition-all duration-300 rounded-full p-2 text-gray-300 hover:text-white hover:bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {currentUser ? (
                <div className="relative w-12 h-12 rounded-full transition-all duration-300 bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] shadow-lg shadow-[#51faaa]/20">
                  <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{background: "transparent", border: "1.5px solid rgba(0, 0, 0, 0.25)"}}></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] rounded-full"></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] rounded-full"></div>
                  <div className="absolute inset-3 bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] rounded-full opacity-60"></div>
                  <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
                    <span className="text-lg font-bold text-[#111]">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#51faaa] to-[#45e695] px-4 py-8">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Find Your Perfect Home in Kenya</h2>
          <p className="text-lg mb-6 opacity-90">
            Discover premium properties across all 47 counties
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={searchData.location}
                  onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={searchData.propertyType}
                  onChange={(e) => setSearchData(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
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
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
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
                className="w-full bg-gradient-to-r from-[#111] to-[#333] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-5 h-5" />
                Search Properties
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-8">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-[#51faaa] rounded-lg mx-auto mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Property Types */}
      <section className="px-4 py-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Property Types
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {propertyTypes.map((type, index) => (
            <motion.button
              key={type.name}
              onClick={() => handlePropertyTypeClick(type.path)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${type.color} rounded-lg mx-auto mb-3`}>
                {type.icon}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                {type.name}
              </div>
              <div className="text-sm text-[#51faaa] font-medium">
                {type.count}
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Featured Properties
          </h3>
          <button
            onClick={() => navigate('/search')}
            className="text-[#51faaa] font-medium flex items-center gap-1 hover:underline"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {featuredLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#51faaa] animate-spin" />
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="space-y-4">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={getPropertyImage(property)}
                      alt={getPropertyName(property)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {getPropertyName(property)}
                      </h4>
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
                      <div className="text-base font-bold text-[#51faaa]">
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
                          <Home className="w-3 h-3" />
                          {property.bedrooms || property.bedroom}
                        </span>
                      )}
                      {(property.bathrooms || property.bathroom) && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {property.bathrooms || property.bathroom}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleFeaturedPropertyClick(property.id)}
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
        ) : (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No featured properties available at the moment
            </p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="px-4 py-8 bg-gradient-to-r from-[#51faaa] to-[#45e695]">
        <div className="text-center text-white">
          <h3 className="text-xl font-bold mb-3">Ready to Find Your Dream Home?</h3>
          <p className="mb-6 opacity-90">Start your journey today</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={() => navigate('/search')}
              className="bg-white text-[#111] px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Searching
            </motion.button>
            <motion.button
              onClick={() => alert('This would open a call scheduling interface')}
              className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-[#111] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Schedule Call
            </motion.button>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-t border-white/10 pb-safe"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.2) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
        <div className="flex items-center justify-around px-4 py-2">
          {/* Home */}
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-12 h-12 rounded-full transition-all duration-300 bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] shadow-lg shadow-[#51faaa]/20">
              <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{background: "transparent", border: "1.5px solid rgba(0, 0, 0, 0.25)"}}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] rounded-full"></div>
              <div className="absolute inset-3 bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] rounded-full opacity-60"></div>
              <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
                <Home className="w-6 h-6" />
              </div>
            </div>
          </motion.button>
          
          {/* Search */}
          <motion.button
            onClick={() => navigate('/search')}
            className="flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-12 h-12 rounded-full transition-all duration-300 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-lg shadow-[#6B7280]/20">
              <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{background: "transparent", border: "1.5px solid rgba(0, 0, 0, 0.25)"}}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-full"></div>
              <div className="absolute inset-3 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-full opacity-60"></div>
              <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
                <Search className="w-6 h-6" />
              </div>
            </div>
          </motion.button>
          
          {/* Center Action Button */}
          <div className="flex flex-col items-center justify-center gap-1">
            <motion.button
              onClick={() => navigate('/properties/add')}
              className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group focus:outline-none"
              aria-label="Add Property"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  background: [
                    "linear-gradient(45deg, #51faaa, #45e695, #3dd88a, #35ca7f)",
                    "linear-gradient(90deg, #45e695, #3dd88a, #35ca7f, #51faaa)",
                    "linear-gradient(135deg, #3dd88a, #35ca7f, #51faaa, #45e695)",
                    "linear-gradient(180deg, #35ca7f, #51faaa, #45e695, #3dd88a)",
                    "linear-gradient(225deg, #51faaa, #45e695, #3dd88a, #35ca7f)",
                    "linear-gradient(270deg, #45e695, #3dd88a, #35ca7f, #51faaa)",
                    "linear-gradient(315deg, #3dd88a, #35ca7f, #51faaa, #45e695)",
                    "linear-gradient(360deg, #35ca7f, #51faaa, #45e695, #3dd88a)"
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Animated ring border */}
              <motion.div
                className="absolute -inset-1 rounded-full pointer-events-none"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: "conic-gradient(from 0deg, #51faaa, #45e695, #51faaa)",
                  mask: "radial-gradient(circle, transparent 60%, black 70%)",
                  WebkitMask: "radial-gradient(circle, transparent 60%, black 70%)"
                }}
              />
              
              {/* Halo effect - outer glow */}
              <motion.div
                className="absolute -inset-2 rounded-full pointer-events-none opacity-80"
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(81, 250, 170, 0.5), 0 0 30px rgba(69, 230, 149, 0.35), 0 0 45px rgba(61, 216, 138, 0.25)",
                    "0 0 18px rgba(69, 230, 149, 0.5), 0 0 36px rgba(61, 216, 138, 0.35), 0 0 54px rgba(53, 202, 127, 0.25)",
                    "0 0 15px rgba(81, 250, 170, 0.5), 0 0 30px rgba(69, 230, 149, 0.35), 0 0 45px rgba(61, 216, 138, 0.25)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Subtle inner glow */}
              <div
                className="absolute inset-1 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)"
                }}
              />
              
              {/* Icon */}
              <div className="relative z-10">
                <Plus className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </motion.button>
            
            {/* Subtle label */}
            <motion.div
              className="text-xs text-gray-500 dark:text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ y: 5, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
            >
              Add
            </motion.div>
          </div>
          
          {/* Favorites */}
          <motion.button
            onClick={() => navigate('/favorites')}
            className="flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-12 h-12 rounded-full transition-all duration-300 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-lg shadow-[#6B7280]/20">
              <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{background: "transparent", border: "1.5px solid rgba(0, 0, 0, 0.25)"}}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-full"></div>
              <div className="absolute inset-3 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-full opacity-60"></div>
              <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
                <Heart className="w-6 h-6" />
              </div>
            </div>
          </motion.button>
          
          {/* Profile */}
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-12 h-12 rounded-full transition-all duration-300 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-lg shadow-[#6B7280]/20">
              <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{background: "transparent", border: "1.5px solid rgba(0, 0, 0, 0.25)"}}></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-full"></div>
              <div className="absolute inset-3 bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-full opacity-60"></div>
              <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
                <User className="w-6 h-6" />
              </div>
            </div>
          </motion.button>
        </div>
      </motion.nav>
    </motion.div>
  );
};

export default HomeMobile;
