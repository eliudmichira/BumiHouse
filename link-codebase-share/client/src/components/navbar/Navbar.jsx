import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Search, User, LogOut, Sun, Moon, Settings, Heart, Home, MessageCircle, ChevronDown, Shield, BarChart3, Building2, FileText, Users, Crown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Logo from "../Logo";
import useAnalytics from "../../hooks/useAnalytics";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [cityIndex, setCityIndex] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  
  const { currentUser, signOut, getUserRole, isVerifiedAgent } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { trackSearch } = useAnalytics();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Get user role
  const userRole = getUserRole ? getUserRole() : 'user';

  // Search suggestions data
  const locationSuggestions = [
    'Nairobi, Kenya', 'Westlands, Nairobi', 'Kilimani, Nairobi', 'Lavington, Nairobi', 
    'Karen, Nairobi', 'Upperhill, Nairobi', 'Runda, Nairobi', 'Gigiri, Nairobi',
    'Muthaiga, Nairobi', 'Spring Valley, Nairobi', 'Hurlingham, Nairobi', 'Yaya, Nairobi',
    'South B, Nairobi', 'South C, Nairobi', 'Embakasi, Nairobi', 'Donholm, Nairobi',
    'Mombasa, Kenya', 'Kisumu, Kenya', 'Nakuru, Kenya', 'Eldoret, Kenya',
    'Thika, Kenya', 'Nyeri, Kenya', 'Kakamega, Kenya', 'Machakos, Kenya'
  ];

  const propertyTypes = [
    'Apartment', 'House', 'Villa', 'Studio', 'Penthouse', 'Townhouse',
    'Bedsitter', 'Single Room', 'Commercial', 'Office', 'Shop', 'Warehouse'
  ];

  // Handle search input change
  const handleSearchChange = (value, isMobile = false) => {
    const query = value;
    if (isMobile) {
      setMobileSearchQuery(query);
    } else {
      setSearchQuery(query);
    }

    if (query.length > 0) {
      const filtered = [...locationSuggestions, ...propertyTypes].filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSearchSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (query, isMobile = false) => {
    const searchTerm = query || (isMobile ? mobileSearchQuery : searchQuery);
    if (searchTerm.trim()) {
      // Track search event
      trackSearch(searchTerm.trim(), 'navbar_search');
      
      navigate(`/properties?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      if (isMobile) {
        setMobileSearchQuery("");
        setIsMenuOpen(false);
      } else {
        setSearchQuery("");
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion, isMobile = false) => {
    handleSearchSubmit(suggestion, isMobile);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Typing effect for search placeholder
  useEffect(() => {
    const cities = [
      "Nairobi",
      "Mombasa",
      "Kisumu",
      "Nakuru",
      "Eldoret",
      "Thika",
      "Nyali",
      "Kilimani",
      "Westlands"
    ];

    let typingTimer;
    let pauseTimer;

    const current = cities[cityIndex % cities.length];

    if (typingIndex <= current.length) {
      typingTimer = setTimeout(() => {
        setTypedText(current.slice(0, typingIndex));
        setTypingIndex((v) => v + 1);
      }, 100);
    } else {
      pauseTimer = setTimeout(() => {
        setTypingIndex(0);
        setCityIndex((v) => (v + 1) % cities.length);
      }, 1200);
    }

    return () => {
      if (typingTimer) clearTimeout(typingTimer);
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, [typingIndex, cityIndex]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isDark
          ? isScrolled
            ? "bg-[#0a0c19]/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-b border-[rgba(81,250,170,0.15)]"
            : "bg-transparent"
          : isScrolled
          ? "bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-b border-gray-200/50"
          : "bg-transparent"
      } backdrop-blur-xl`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="w-full px-8 lg:px-16">
        <div className="flex items-center justify-between h-20">
          
          {/* Enhanced Left: Logo */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Link to="/" className="group">
                <Logo 
                  className={`group-hover:opacity-80 transition-all duration-300 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  isDark={isDark}
                />
              </Link>
            </motion.div>
          </div>

          {/* Center: Search + Nav */}
          <div className="hidden lg:flex items-center gap-16">
            {/* Enhanced Desktop Search */}
            <motion.div 
              className="w-96" 
              ref={searchRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                className="relative w-full"
                animate={{
                  scale: isSearchFocused ? 1.02 : 1,
                  y: isSearchFocused ? -2 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  animate={{
                    scale: isSearchFocused ? 1.1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Search
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isSearchFocused 
                        ? (isDark ? "text-[#51faaa]" : "text-[#10b981]")
                        : (isDark ? "text-white/60" : "text-gray-400")
                    }`}
                  />
                </motion.div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder={`Search properties in ${typedText}${typedText.length < 1 ? '' : '…'}`}
                  className={`w-full pl-12 pr-6 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#51faaa]/20 focus:border-[#51faaa]/30 transition-all duration-300 hover:shadow-lg ${
                    isDark
                      ? "bg-white/5 border border-white/10 text-white placeholder-white/60 hover:bg-white/10 hover:border-white/20"
                      : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white hover:border-gray-300 hover:shadow-[#10b981]/10"
                  }`}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                
                {/* Enhanced Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div 
                    className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl border backdrop-blur-xl ${
                      isDark 
                        ? 'bg-[#0a0c19]/95 border-white/10' 
                        : 'bg-white/95 border-gray-200'
                    }`}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {searchSuggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full px-4 py-3 text-left transition-all duration-200 ${
                          isDark ? 'text-white hover:text-[#51faaa]' : 'text-gray-700 hover:text-[#51faaa]'
                        } ${index === 0 ? 'rounded-t-xl' : ''} ${index === searchSuggestions.length - 1 ? 'rounded-b-xl' : ''}`}
                        whileHover={{ 
                          backgroundColor: isDark ? 'rgba(81, 250, 170, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          x: 4
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Search className="w-4 h-4 opacity-60" />
                          </motion.div>
                          <span>{suggestion}</span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Enhanced Desktop Nav */}
            <motion.nav 
              className="flex items-center gap-12"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {["Properties", "Agents", "RentaKenya", "Tenant Portal"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    to={item === "Tenant Portal" ? "/tenant-login" : `/desktop/${item.toLowerCase()}`}
                    className={`font-medium transition-all duration-300 relative group ${
                      isDark
                        ? "text-white/80 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <motion.span
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item}
                    </motion.span>
                    <motion.span 
                      className="absolute -bottom-1 left-0 h-0.5 bg-[#51faaa]"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                    {/* Subtle glow effect on hover */}
                    <motion.div
                      className="absolute -bottom-1 left-0 h-0.5 bg-[#51faaa] opacity-0"
                      whileHover={{ 
                        width: "100%",
                        opacity: 0.3,
                        boxShadow: "0 0 8px rgba(81, 250, 170, 0.5)"
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </div>

          {/* Enhanced Right: Auth + Theme */}
          <motion.div 
            className="flex items-center gap-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button
              onClick={toggleTheme}
              className={`relative transition-all duration-300 rounded-full p-2 overflow-hidden ${
                isDark 
                  ? "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 hover:shadow-[0_4px_16px_rgba(251,191,36,0.3)]" 
                  : "text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
              }`}
              whileHover={{ 
                scale: 1.1,
                y: -2
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              aria-label="Toggle theme"
            >
              {/* Subtle background glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-0"
                whileHover={{ 
                  opacity: 0.1,
                  backgroundColor: isDark ? "#fbbf24" : "#6b7280"
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="relative z-10"
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                whileHover={{ scale: 1.1 }}
              >
                {isDark ? (
                  <Sun className="w-6 h-6 drop-shadow-sm" />
                ) : (
                  <Moon className="w-6 h-6 drop-shadow-sm" />
                )}
              </motion.div>
            </motion.button>

            {currentUser ? (
              <motion.div 
                className="relative" 
                ref={profileDropdownRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <motion.button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.02,
                    y: -1
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* User Avatar */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#51faaa]/30 group-hover:border-[#51faaa] transition-colors">
                    {/* Enhanced animated ring border with brand colors */}
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
                    
                    {/* Halo effect around profile image */}
                    <motion.div
                      className="absolute -inset-1.5 rounded-full pointer-events-none opacity-60"
                      style={{ background: "transparent" }}
                      animate={{
                        boxShadow: [
                          "0 0 8px rgba(81, 250, 170, 0.4), 0 0 16px rgba(219, 213, 164, 0.3), 0 0 24px rgba(81, 250, 170, 0.2)",
                          "0 0 10px rgba(219, 213, 164, 0.4), 0 0 20px rgba(81, 250, 170, 0.3), 0 0 30px rgba(219, 213, 164, 0.2)",
                          "0 0 8px rgba(81, 250, 170, 0.4), 0 0 16px rgba(219, 213, 164, 0.3), 0 0 24px rgba(81, 250, 170, 0.2)"
                        ]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
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
                          <span className="text-[#111] font-bold text-lg">
                            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="hidden md:block text-left">
                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      {currentUser.displayName || currentUser.email.split('@')[0]}
                    </p>
                    <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>
                      {currentUser.email}
                    </p>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
                </motion.button>

                {/* Enhanced Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <motion.div 
                    className="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 backdrop-blur-xl"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {/* User Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#51faaa]/30">
                          {currentUser.photoURL ? (
                            <img
                              src={currentUser.photoURL}
                              alt={currentUser.displayName || currentUser.email}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] flex items-center justify-center">
                              <span className="text-[#111] font-bold text-lg">
                                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {currentUser.displayName || currentUser.email.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {/* Role-based navigation */}
                      {userRole === 'admin' ? (
                        // Admin Menu Items
                        <>
                          <motion.div
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              to="/desktop/admin"
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Crown className="w-4 h-4 text-purple-500" />
                              </motion.div>
                              <span>Admin Panel</span>
                            </Link>
                          </motion.div>
                          
                          <motion.div
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              to="/scraping"
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <BarChart3 className="w-4 h-4 text-green-500" />
                              </motion.div>
                              <span>Scraping Dashboard</span>
                            </Link>
                          </motion.div>
                          
                          <Link
                            to="/desktop/admin?section=users"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                            <span>User Management</span>
                          </Link>
                          
                          <Link
                            to="/desktop/admin?section=moderation"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Property Moderation</span>
                          </Link>
                          
                          <Link
                            to="/desktop/admin?section=analytics"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span>Analytics</span>
                          </Link>
                        </>
                      ) : isVerifiedAgent ? (
                        // Agent Menu Items
                        <>
                          <Link
                            to="/desktop/dashboard"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            <span>Agent Dashboard</span>
                          </Link>
                          
                          <Link
                            to="/properties/add"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Building2 className="w-4 h-4" />
                            <span>Add Property</span>
                          </Link>
                          
                          <Link
                            to="/dashboard?section=properties"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Home className="w-4 h-4" />
                            <span>My Properties</span>
                          </Link>
                          
                          <Link
                            to="/dashboard?section=messages"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Inquiries</span>
                          </Link>
                        </>
                      ) : (
                        // Regular User Menu Items
                        <>
                          <Link
                            to="/desktop/dashboard"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Home className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>
                          
                          <Link
                            to="/account?tab=favorites"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span>Favorites</span>
                          </Link>
                          
                          <Link
                            to="/messages"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Messages</span>
                          </Link>
                        </>
                      )}
                      
                      {/* Common Menu Items for all users */}
                      <Link
                        to="/account"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      
                      <Link
                        to="/account?tab=settings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      
                      {/* Agent Verification Request for non-agents */}
                      {!isVerifiedAgent && userRole !== 'admin' && (
                        <Link
                          to="/agent-verification"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>Become an Agent</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    to="/desktop/login" 
                    className={`${isDark ? "text-white/80" : "text-gray-600"} hover:text-[#51faaa] transition-colors duration-300`}
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    y: -2
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Link
                    to="/desktop/register"
                    className="px-5 py-2 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all duration-300 relative overflow-hidden block"
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10">Get Started</span>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-8 py-6 space-y-6">
            {/* Mobile Search */}
            <div className="relative" ref={searchRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`w-5 h-5 ${isDark ? "text-white/60" : "text-gray-400"}`} />
              </div>
              <input
                type="text"
                value={mobileSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value, true)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(null, true)}
                placeholder="Search properties, locations..."
                className={`w-full pl-12 pr-6 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#51faaa]/20 focus:border-[#51faaa]/30 transition-all ${
                  isDark
                    ? "bg-white/5 border border-white/10 text-white placeholder-white/60"
                    : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500"
                }`}
              />
              
              {/* Mobile Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl border transition-all duration-300 z-50 ${
                  isDark 
                    ? 'bg-[#0a0c19] border-white/10' 
                    : 'bg-white border-gray-200'
                }`}>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion, true)}
                      className={`w-full px-4 py-3 text-left hover:bg-[#51faaa]/10 transition-colors ${
                        isDark ? 'text-white hover:text-[#51faaa]' : 'text-gray-700 hover:text-[#51faaa]'
                      } ${index === 0 ? 'rounded-t-xl' : ''} ${index === searchSuggestions.length - 1 ? 'rounded-b-xl' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 opacity-60" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-4">
              {["Properties", "Agents", "RentaKenya", "Tenant Portal"].map((item) => (
                <Link
                  key={item}
                  to={item === "Tenant Portal" ? "/tenant-login" : `/desktop/${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block font-medium transition-colors ${
                    isDark
                      ? "text-white/80 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth */}
            {currentUser ? (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#51faaa]/30">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || currentUser.email}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] flex items-center justify-center">
                        <span className="text-[#111] font-bold text-lg">
                          {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      {currentUser.displayName || currentUser.email.split('@')[0]}
                    </p>
                    <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {/* Role-based navigation for mobile */}
                  {userRole === 'admin' ? (
                    // Admin Mobile Menu Items
                    <>
                      <Link
                        to="/desktop/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Crown className="w-4 h-4 text-purple-500" />
                        <span>Admin Panel</span>
                      </Link>
                      
                      <Link
                        to="/scraping"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-green-500" />
                        <span>Scraping Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/desktop/admin?section=users"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        <span>User Management</span>
                      </Link>
                      
                      <Link
                        to="/desktop/admin?section=moderation"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Property Moderation</span>
                      </Link>
                      
                      <Link
                        to="/desktop/admin?section=analytics"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Analytics</span>
                      </Link>
                    </>
                  ) : isVerifiedAgent ? (
                    // Agent Mobile Menu Items
                    <>
                      <Link
                        to="/desktop/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <span>Agent Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/properties/add"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Add Property</span>
                      </Link>
                      
                      <Link
                        to="/dashboard?section=properties"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Home className="w-4 h-4" />
                        <span>My Properties</span>
                      </Link>
                      
                      <Link
                        to="/dashboard?section=messages"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Inquiries</span>
                      </Link>
                    </>
                  ) : (
                    // Regular User Mobile Menu Items
                    <>
                      <Link
                        to="/desktop/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Home className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/account?tab=favorites"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Favorites</span>
                      </Link>
                      
                      <Link
                        to="/messages"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Messages</span>
                      </Link>
                    </>
                  )}
                  
                  {/* Common Mobile Menu Items for all users */}
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  
                  <Link
                    to="/account?tab=settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  
                  {/* Agent Verification Request for non-agents */}
                  {!isVerifiedAgent && userRole !== 'admin' && (
                    <Link
                      to="/agent-verification"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Become an Agent</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/desktop/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block font-medium ${isDark ? "text-white/80" : "text-gray-600"} hover:text-[#51faaa]`}
                >
                  Sign In
                </Link>
                <Link
                  to="/desktop/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-5 py-3 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
};

export default Navbar;
