import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Plus, 
  User, 
  Menu, 
  X, 
  MapPin, 
  Heart, 
  MessageCircle,
  Settings,
  LogOut,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  ArrowLeft,
  Filter,
  Map,
  Star,
  TrendingUp,
  Calendar,
  Bookmark,
  Share2,
  Download,
  Info,
  HelpCircle,
  Shield,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const EnhancedMobileNavigation = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [isVisible, setIsVisible] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New property available', message: 'Check out the latest listings', time: '2m ago', unread: true },
    { id: 2, title: 'Price drop alert', message: 'A property you liked has reduced its price', time: '1h ago', unread: true },
    { id: 3, title: 'Viewing scheduled', message: 'Your property viewing is confirmed for tomorrow', time: '3h ago', unread: false }
  ]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const searchInputRef = useRef(null);

  // Close menu when route changes
  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  // Auto-focus search input
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isSearchOpen]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Enhanced navigation items with badges and animations
  const navItems = [
    { 
      id: 'home',
      icon: Home, 
      label: 'Home', 
      path: '/',
      badge: 0
    },
    { 
      id: 'map',
      icon: Map, 
      label: 'Map', 
      path: '/properties',
      badge: 0
    },
    { 
      id: 'add',
      icon: Plus, 
      label: 'Add', 
      path: '/properties/add',
      badge: 0
    },
    { 
      id: 'profile',
      icon: User, 
      label: 'Profile', 
      path: '/dashboard',
      badge: notifications.filter(n => n.unread).length
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Haptic feedback simulation
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleNavClick = (item) => {
    triggerHaptic();
    setActiveTab(item.id);
  };

  return (
    <>
             {/* Enhanced Mobile Bottom Navigation */}
       <motion.div 
         className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden ${
           isDark ? 'bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50' : 'bg-white/95 backdrop-blur-xl border-t border-gray-200/50'
         }`}
         initial={{ y: 100 }}
         animate={{ y: 0 }}
         transition={{ type: "spring", stiffness: 300, damping: 30 }}
       >
         <div className="flex items-center justify-around px-2 py-2 pb-safe">
           {/* Home */}
           <motion.div
             whileHover={{ scale: 1.08, y: -2 }}
             whileTap={{ scale: 0.92 }}
           >
             <Link
               to="/"
               onClick={() => handleNavClick(navItems[0])}
               className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                  isActive('/')
                    ? 'bg-gradient-to-br from-[#51faaa] via-[#7ff5c2] to-[#dbd5a4] text-[#0a0c19] shadow-[0_8px_32px_rgba(81,250,170,0.3)] ring-2 ring-[#51faaa]/20 backdrop-blur-sm'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-gray-800/80 hover:to-gray-700/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:ring-1 hover:ring-gray-600/50 backdrop-blur-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br hover:from-gray-100/80 hover:to-gray-200/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:ring-1 hover:ring-gray-300/50 backdrop-blur-sm'
                }`}
             >
                <div className="relative">
                  <Home className="w-6 h-6 mb-1" />
                </div>
               <span className="text-xs font-medium">Home</span>
             </Link>
           </motion.div>
           
           {/* Map */}
                       <motion.div
                         whileHover={{ scale: 1.08, y: -2 }}
                         whileTap={{ scale: 0.92 }}
                       >
              <Link
                to="/desktop/properties"
                onClick={() => handleNavClick(navItems[1])}
                className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                   isActive('/properties')
                     ? 'bg-gradient-to-br from-[#51faaa] via-[#7ff5c2] to-[#dbd5a4] text-[#0a0c19] shadow-[0_8px_32px_rgba(81,250,170,0.3)] ring-2 ring-[#51faaa]/20 backdrop-blur-sm'
                     : isDark
                       ? 'text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-gray-800/80 hover:to-gray-700/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:ring-1 hover:ring-gray-600/50 backdrop-blur-sm'
                       : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br hover:from-gray-100/80 hover:to-gray-200/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:ring-1 hover:ring-gray-300/50 backdrop-blur-sm'
                 }`}
               >
                 <div className="relative">
                   <Map className="w-6 h-6 mb-1" />
                 </div>
                <span className="text-xs font-medium">Map</span>
              </Link>
            </motion.div>
           
           {/* Add Property */}
           <motion.div
             whileHover={{ scale: 1.08, y: -2 }}
             whileTap={{ scale: 0.92 }}
           >
             <Link
               to="/properties/add"
               onClick={() => handleNavClick(navItems[2])}
               className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                  isActive('/properties/add')
                    ? 'bg-gradient-to-br from-[#51faaa] via-[#7ff5c2] to-[#dbd5a4] text-[#0a0c19] shadow-[0_8px_32px_rgba(81,250,170,0.3)] ring-2 ring-[#51faaa]/20 backdrop-blur-sm'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-gray-800/80 hover:to-gray-700/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:ring-1 hover:ring-gray-600/50 backdrop-blur-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br hover:from-gray-100/80 hover:to-gray-200/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:ring-1 hover:ring-gray-300/50 backdrop-blur-sm'
                }`}
             >
                <div className="relative">
                  <Plus className="w-6 h-6 mb-1" />
                </div>
               <span className="text-xs font-medium">Add</span>
             </Link>
           </motion.div>
           
           {/* Profile */}
           <motion.div
             whileHover={{ scale: 1.08, y: -2 }}
             whileTap={{ scale: 0.92 }}
           >
             <Link
               to="/desktop/dashboard"
               onClick={() => handleNavClick(navItems[3])}
               className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                  isActive('/dashboard')
                    ? 'bg-gradient-to-br from-[#51faaa] via-[#7ff5c2] to-[#dbd5a4] text-[#0a0c19] shadow-[0_8px_32px_rgba(81,250,170,0.3)] ring-2 ring-[#51faaa]/20 backdrop-blur-sm'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-gray-800/80 hover:to-gray-700/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:ring-1 hover:ring-gray-600/50 backdrop-blur-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br hover:from-gray-100/80 hover:to-gray-200/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:ring-1 hover:ring-gray-300/50 backdrop-blur-sm'
                }`}
             >
                <div className="relative">
                  <User className="w-6 h-6 mb-1" />
                 {notifications.filter(n => n.unread).length > 0 && (
                   <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                   >
                     <span className="text-xs font-bold text-white">
                       {notifications.filter(n => n.unread).length > 99 ? '99+' : notifications.filter(n => n.unread).length}
                     </span>
                   </motion.div>
                 )}
               </div>
               <span className="text-xs font-medium">Profile</span>
             </Link>
           </motion.div>
         </div>
       </motion.div>

      {/* Enhanced Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-white/95'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div 
              className="relative z-10 flex flex-col h-full"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Enhanced Search Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDark ? 'bg-gray-900/95 backdrop-blur-xl border-gray-700/50' : 'bg-white/95 backdrop-blur-xl border-gray-200/50'
              }`}>
                <motion.button
                  onClick={() => setIsSearchOpen(false)}
                  className={`p-2 rounded-lg ${
                    isDark ? 'text-white hover:bg-gray-800/50' : 'text-gray-600 hover:bg-gray-100/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Search Properties
                </h2>
                <div className="w-10" />
              </div>

              {/* Enhanced Search Form */}
              <div className="flex-1 p-4">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search by location, address, or ZIP"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#51faaa] transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-semibold shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Search Properties
                  </motion.button>
                </form>

                {/* Enhanced Quick Search Suggestions */}
                <div className="mt-6">
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Popular Locations
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'].map((location) => (
                      <motion.button
                        key={location}
                        onClick={() => {
                          setSearchQuery(location);
                          navigate(`/properties?search=${encodeURIComponent(location)}`);
                          setIsSearchOpen(false);
                        }}
                        className={`p-3 rounded-lg text-left transition-colors ${
                          isDark 
                            ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                            : 'bg-gray-100/50 text-gray-700 hover:bg-gray-200/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MapPin className="w-4 h-4 mb-1" />
                        <span className="text-sm font-medium">{location}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Menu Overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-white/95'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div 
              className="relative z-10 flex flex-col h-full"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Enhanced Menu Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDark ? 'bg-gray-900/95 backdrop-blur-xl border-gray-700/50' : 'bg-white/95 backdrop-blur-xl border-gray-200/50'
              }`}>
                <Logo isDark={isDark} />
                <motion.button
                  onClick={() => setIsVisible(false)}
                  className={`p-2 rounded-lg ${
                    isDark ? 'text-white hover:bg-gray-800/50' : 'text-gray-600 hover:bg-gray-100/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Enhanced Menu Content */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {currentUser ? (
                  <>
                    {/* Enhanced User Info */}
                    <motion.div 
                      className={`p-4 rounded-xl ${
                        isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-gray-100/50 backdrop-blur-sm'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-[#0a0c19]" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {currentUser.name || 'User'}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {currentUser.email}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => setShowNotifications(!showNotifications)}
                          className="relative p-2 rounded-lg bg-gray-700/50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Bell className="w-5 h-5 text-white" />
                          {notifications.filter(n => n.unread).length > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {notifications.filter(n => n.unread).length}
                              </span>
                            </div>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Notifications Dropdown */}
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          {notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              className={`p-3 rounded-lg ${
                                isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
                              } ${notification.unread ? 'border-l-4 border-[#51faaa]' : ''}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.unread ? 'bg-[#51faaa]' : 'bg-gray-500'
                                }`} />
                                <div className="flex-1">
                                  <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {notification.title}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {notification.message}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Enhanced Menu Items */}
                    <div className="space-y-2">
                      {[
                        { icon: User, label: 'My Dashboard', path: '/dashboard' },
                        { icon: Heart, label: 'Favorites', path: '/favorites' },
                        { icon: MessageCircle, label: 'Messages', path: '/messages' },
                        { icon: Bookmark, label: 'Saved Searches', path: '/saved-searches' },
                        { icon: TrendingUp, label: 'Market Trends', path: '/trends' },
                        { icon: Calendar, label: 'Viewings', path: '/viewings' },
                        { icon: Map, label: 'Map View', path: '/map' },
                        { icon: Filter, label: 'Advanced Filters', path: '/filters' }
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          <Link
                            to={item.path}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                              isDark 
                                ? 'text-gray-300 hover:bg-gray-800/50' 
                                : 'text-gray-700 hover:bg-gray-100/50'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    {/* Settings Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-4 border-t border-gray-700/50"
                    >
                      <div className="space-y-2">
                        <motion.button
                          onClick={toggleTheme}
                          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                            isDark 
                              ? 'text-gray-300 hover:bg-gray-800/50' 
                              : 'text-gray-700 hover:bg-gray-100/50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                          <span>Toggle Theme</span>
                        </motion.button>
                        
                        <Link
                          to="/settings"
                          className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                            isDark 
                              ? 'text-gray-300 hover:bg-gray-800/50' 
                              : 'text-gray-700 hover:bg-gray-100/50'
                          }`}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </Link>

                        <Link
                          to="/help"
                          className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                            isDark 
                              ? 'text-gray-300 hover:bg-gray-800/50' 
                              : 'text-gray-700 hover:bg-gray-100/50'
                          }`}
                        >
                          <HelpCircle className="w-5 h-5" />
                          <span>Help & Support</span>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </Link>

                        <motion.button
                          onClick={handleLogout}
                          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                            isDark 
                              ? 'text-red-400 hover:bg-red-900/20' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      to="/desktop/login"
                      className="w-full py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-semibold text-center shadow-lg"
                    >
                      Login
                    </Link>
                    <Link
                      to="/desktop/register"
                      className={`w-full py-3 border-2 rounded-xl font-semibold text-center transition-colors ${
                        isDark 
                          ? 'border-gray-700 text-white hover:bg-gray-800' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Register
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedMobileNavigation;