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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isDark
          ? isScrolled
            ? "bg-[#0a0c19]/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-b border-[rgba(81,250,170,0.15)]"
            : "bg-transparent"
          : isScrolled
          ? "bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-b border-gray-200/50"
          : "bg-transparent"
      } backdrop-blur-xl`}
    >
      <div className="w-full px-8 lg:px-16">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="group">
              <Logo 
                className={`group-hover:opacity-80 transition-opacity duration-300 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
                isDark={isDark}
              />
            </Link>
          </div>

          {/* Center: Search + Nav */}
          <div className="hidden lg:flex items-center gap-16">
            {/* Desktop Search */}
            <div className="w-96" ref={searchRef}>
              <div
                className={`relative w-full transition-all duration-300 ${
                  isSearchFocused ? "transform scale-105" : ""
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    className={`w-5 h-5 ${
                      isDark ? "text-white/60" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder={`Search properties in ${typedText}${typedText.length < 1 ? '' : '…'}`}
                  className={`w-full pl-12 pr-6 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#51faaa]/20 focus:border-[#51faaa]/30 transition-all ${
                    isDark
                      ? "bg-white/5 border border-white/10 text-white placeholder-white/60"
                      : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500"
                  }`}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl border transition-all duration-300 ${
                    isDark 
                      ? 'bg-[#0a0c19] border-white/10' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
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
            </div>

            {/* Desktop Nav */}
            <nav className="flex items-center gap-12">
              {["Properties", "Agents", "About"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className={`font-medium transition-colors relative group ${
                    isDark
                      ? "text-white/80 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#51faaa] transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Auth + Theme */}
          <div className="flex items-center gap-8">
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
              aria-label="Toggle theme"
            >
              <motion.div
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {isDark ? (
                  <Sun className="w-6 h-6 drop-shadow-sm" />
                ) : (
                  <Moon className="w-6 h-6 drop-shadow-sm" />
                )}
              </motion.div>
            </motion.button>

            {currentUser ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
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
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
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
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Crown className="w-4 h-4 text-purple-500" />
                            <span>Admin Panel</span>
                          </Link>
                          
                          <Link
                            to="/admin?section=users"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                            <span>User Management</span>
                          </Link>
                          
                          <Link
                            to="/admin?section=moderation"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Property Moderation</span>
                          </Link>
                          
                          <Link
                            to="/admin?section=analytics"
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
                            to="/dashboard"
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
                            to="/dashboard"
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
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className={`${isDark ? "text-white/80" : "text-gray-600"} hover:text-[#51faaa]`}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
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
              {["Properties", "Agents", "About"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
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
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Crown className="w-4 h-4 text-purple-500" />
                        <span>Admin Panel</span>
                      </Link>
                      
                      <Link
                        to="/admin?section=users"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        <span>User Management</span>
                      </Link>
                      
                      <Link
                        to="/admin?section=moderation"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Property Moderation</span>
                      </Link>
                      
                      <Link
                        to="/admin?section=analytics"
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
                        to="/dashboard"
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
                        to="/dashboard"
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
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block font-medium ${isDark ? "text-white/80" : "text-gray-600"} hover:text-[#51faaa]`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
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
    </header>
  );
};

export default Navbar;
