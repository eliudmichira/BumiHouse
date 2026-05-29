import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Filter, 
  X, 
  SlidersHorizontal,
  Map,
  Grid,
  List,
  Sun,
  Moon,
  User,
  Heart,
  MessageCircle,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Save,
  Navigation,
  Home,
  Building,
  Car,
  Wifi,
  Droplets,
  Shield,
  Bus,
  ArrowUpDown,
  Star,
  TrendingUp,
  Calendar,
  Bookmark,
  Share2,
  Download,
  Info,
  HelpCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const EnhancedMobileMapNavigation = ({ 
  searchQuery, 
  setSearchQuery, 
  propertyCount, 
  filters, 
  setFilters, 
  showFilters, 
  setShowFilters, 
  onLocationSelect,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  userLocation,
  setUserLocation,
  locationLoading,
  setLocationLoading
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('quick');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const searchInputRef = useRef(null);
  const filterPanelRef = useRef(null);

  // Location suggestions
  const locationSuggestions = [
    'Nairobi, Kenya', 'Westlands, Nairobi', 'Kilimani, Nairobi', 'Lavington, Nairobi', 
    'Karen, Nairobi', 'Upperhill, Nairobi', 'Runda, Nairobi', 'Gigiri, Nairobi',
    'Muthaiga, Nairobi', 'Spring Valley, Nairobi', 'Hurlingham, Nairobi', 'Yaya, Nairobi',
    'South B, Nairobi', 'South C, Nairobi', 'Embakasi, Nairobi', 'Donholm, Nairobi',
    'Mombasa, Kenya', 'Kisumu, Kenya', 'Nakuru, Kenya', 'Eldoret, Kenya',
    'Thika, Kenya', 'Nyeri, Kenya', 'Kakamega, Kenya', 'Machakos, Kenya'
  ];

  // Quick filters
  const quickFilters = [
    { key: 'isNearPublicTransport', label: 'Transit', icon: Bus, emoji: '🚐' },
    { key: 'isWaterIncluded', label: 'Water/Borehole', icon: Droplets, emoji: '💧' },
    { key: 'isWifiIncluded', label: 'Fibre Internet', icon: Wifi, emoji: '🌐' },
    { key: 'isGatedCommunity', label: 'Secure', icon: Shield, emoji: '🔒' },
    { key: 'isNewlyBuilt', label: 'Modern', icon: Building, emoji: '🏗' },
    { key: 'hasElevator', label: 'Elevator', icon: ArrowUpDown, emoji: '🛗' },
    { key: 'hasParking', label: 'Parking', icon: Car, emoji: '🚗' }
  ];

  // Advanced filters
  const advancedFilters = [
    { key: 'isServicedApartment', label: 'Serviced Apartment' },
    { key: 'isFurnished', label: 'Furnished' },
    { key: 'isStudentFriendly', label: 'Student Friendly' },
    { key: 'isShortTermLease', label: 'Short Term Lease' },
    { key: 'isRecentlyRenovated', label: 'Recently Renovated' }
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    setSavedSearches(saved);
  }, []);

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const searchTerm = value.toLowerCase().trim();
      const filtered = locationSuggestions.filter(loc => 
        loc.toLowerCase().includes(searchTerm)
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle location detection
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
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  };

  // Handle filter toggle
  const toggleFilter = (filterKey) => {
    setFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  // Handle save search
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
  };

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setIsFilterPanelOpen(false);
      }
    };

    if (isFilterPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterPanelOpen]);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
        <div className="px-4 py-3">
          {/* Top Row - Logo and Controls */}
          <div className="flex items-center justify-between mb-3">
            {/* Logo */}
            <div className="flex items-center">
              <a className="flex items-center gap-2 group" href="/">
                <div className="w-9 h-9 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center shadow-lg shadow-[#51faaa]/25 group-hover:shadow-xl group-hover:shadow-[#51faaa]/40 transition-all duration-300">
                  <span className="text-[#111] text-sm font-bold">H</span>
                </div>
                <span className={`text-lg font-bold tracking-tight transition-colors ${
                  isDark 
                    ? 'text-white group-hover:text-[#51faaa]' 
                    : 'text-gray-900 group-hover:text-[#51faaa]'
                }`}>
                  Hama Estate
                </span>
              </a>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className={`relative transition-all duration-300 rounded-full p-2 ${
                  isDark 
                    ? "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 hover:shadow-[0_4px_16px_rgba(251,191,36,0.3)]" 
                    : "text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.div
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 drop-shadow-sm" />
                  ) : (
                    <Moon className="w-5 h-5 drop-shadow-sm" />
                  )}
                </motion.div>
              </motion.button>

              {/* Profile */}
              {currentUser ? (
                <div className="relative">
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#51faaa]/30">
                      {/* Animated ring border */}
                      <motion.div
                        className="absolute -inset-1 rounded-full"
                        animate={{
                          rotate: [0, 360]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        style={{
                          background: "conic-gradient(from 0deg, #51faaa, #dbd5a4, #51faaa)",
                          mask: "radial-gradient(circle, transparent 55%, black 72%)",
                          WebkitMask: "radial-gradient(circle, transparent 55%, black 72%)"
                        }}
                      />
                      
                      {/* Profile image */}
                      <div className="relative z-10 w-full h-full rounded-full overflow-hidden">
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt={currentUser.displayName || currentUser.email}
                            className="w-full h-full object-cover rounded-full select-none"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] flex items-center justify-center">
                            <span className="text-[#111] font-bold text-sm">
                              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <a href="/login" className="px-4 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-[#51faaa]/30 transition-all duration-300">
                  Sign In
                </a>
              )}
            </div>
          </div>

          {/* Search Bar Row */}
          <div className="relative">
            <div className={`relative bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 transition-all duration-300 ${
              isFocused ? 'border-[#51faaa] shadow-xl shadow-[#51faaa]/20' : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center p-2">
                <div className="flex-1 flex items-center">
                  <Search className={`w-4 h-4 ml-3 transition-colors ${
                    isFocused ? 'text-[#51faaa]' : 'text-gray-400'
                  }`} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by location, address, or ZIP"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => {
                      setIsFocused(true);
                      setIsSearchExpanded(true);
                    }}
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
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 pr-2">
                  <button
                    onClick={getUserLocation}
                    disabled={locationLoading}
                    className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                      userLocation 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } ${locationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isFilterPanelOpen 
                        ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Suggestions */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
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
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Grid className="w-3 h-3" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <List className="w-3 h-3" />
              List
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
            {quickFilters.slice(0, 3).map((filter) => (
              <button
                key={filter.key}
                onClick={() => toggleFilter(filter.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  filters[filter.key]
                    ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <filter.icon className="w-3 h-3" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Filter Panel */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              ref={filterPanelRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-b-3xl shadow-2xl max-h-[80vh] overflow-hidden"
            >
              {/* Filter Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
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
                    }}
                    className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveFilterTab('quick')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeFilterTab === 'quick'
                      ? 'text-[#51faaa] border-b-2 border-[#51faaa]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Quick Filters
                </button>
                <button
                  onClick={() => setActiveFilterTab('advanced')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeFilterTab === 'advanced'
                      ? 'text-[#51faaa] border-b-2 border-[#51faaa]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Advanced
                </button>
              </div>

              {/* Filter Content */}
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {activeFilterTab === 'quick' ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Filters</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {quickFilters.map((filter) => (
                        <motion.button
                          key={filter.key}
                          onClick={() => toggleFilter(filter.key)}
                          className={`p-3 rounded-xl text-left transition-all duration-300 ${
                            filters[filter.key]
                              ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <filter.icon className="w-4 h-4" />
                            <span className="text-lg">{filter.emoji}</span>
                          </div>
                          <span className="text-sm font-medium">{filter.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Advanced Filters</h3>
                    
                    {/* Price Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min Price"
                          value={filters.minPrice}
                          onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa]"
                        />
                        <input
                          type="number"
                          placeholder="Max Price"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa]"
                        />
                      </div>
                    </div>

                    {/* Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Bedrooms</label>
                        <select
                          value={filters.minBeds}
                          onChange={(e) => setFilters(prev => ({ ...prev, minBeds: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa]"
                        >
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                          <option value="5">5+</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Bathrooms</label>
                        <select
                          value={filters.minBaths}
                          onChange={(e) => setFilters(prev => ({ ...prev, minBaths: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa]"
                        >
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                        </select>
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Features</label>
                      <div className="space-y-2">
                        {advancedFilters.map((filter) => (
                          <label key={filter.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <input
                              type="checkbox"
                              checked={filters[filter.key]}
                              onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.checked }))}
                              className="w-4 h-4 text-[#51faaa] border-gray-300 rounded focus:ring-[#51faaa]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{filter.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsFilterPanelOpen(false);
                      setShowFilters(true);
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-medium hover:shadow-lg hover:shadow-[#51faaa]/30 transition-all duration-300"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedMobileMapNavigation;
