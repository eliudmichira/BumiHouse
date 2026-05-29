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
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#51faaa] rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-[#111]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Hama Estate
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            
            <button
              onClick={() => navigate('/auth')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {currentUser ? (
                <div className="w-6 h-6 bg-[#51faaa] rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#111]">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
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
              
              <button
                onClick={handleSearch}
                className="w-full bg-[#111] text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search Properties
              </button>
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
              className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105"
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
            <button
              onClick={() => navigate('/search')}
              className="bg-white text-[#111] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Searching
            </button>
            <button
              onClick={() => alert('This would open a call scheduling interface')}
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#111] transition-colors"
            >
              Schedule Call
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 p-2 text-[#51faaa]"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={() => navigate('/search')}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-[#51faaa] transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Search</span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-[#51faaa] transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </motion.div>
  );
};

export default HomeMobile;
