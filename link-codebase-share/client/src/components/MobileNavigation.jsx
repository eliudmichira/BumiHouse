import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMobileDetection } from '../hooks/useMobileDetection';
import Logo from './Logo';

const MobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isMobile } = useMobileDetection(768);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/properties' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: User, label: 'Profile', path: '/dashboard' }
  ];

  // Haptic feedback function
  const hapticLight = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };



  return (
    <>
      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 pb-safe"
      >
        <div className="flex items-center justify-between px-2 py-2">
          {/* Left side nav items */}
          <div className="flex items-center justify-start space-x-2 sm:space-x-3 flex-1 min-w-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={navItems[0].path}
                onClick={hapticLight}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 relative ${
                  isActive(navItems[0].path)
                    ? 'bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] shadow-lg shadow-[#51faaa]/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <navItems[0].icon className="w-6 h-6" />
                <span className="text-xs font-medium mt-1">{navItems[0].label}</span>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={navItems[1].path}
                onClick={hapticLight}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 relative ${
                  isActive(navItems[1].path)
                    ? 'bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] shadow-lg shadow-[#51faaa]/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <navItems[1].icon className="w-6 h-6" />
                <span className="text-xs font-medium mt-1">{navItems[1].label}</span>
              </Link>
            </motion.div>
          </div>
          
          {/* Center Action Button */}
          <div className="flex flex-col items-center justify-center gap-1 mx-2 sm:mx-4">
            <motion.button
              onClick={() => {
                hapticLight();
                navigate('/properties/add');
              }}
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
                    "linear-gradient(45deg, #51faaa, #dbd5a4, #51faaa, #dbd5a4)",
                    "linear-gradient(90deg, #dbd5a4, #51faaa, #dbd5a4, #51faaa)",
                    "linear-gradient(135deg, #51faaa, #dbd5a4, #51faaa, #dbd5a4)",
                    "linear-gradient(180deg, #dbd5a4, #51faaa, #dbd5a4, #51faaa)",
                    "linear-gradient(225deg, #51faaa, #dbd5a4, #51faaa, #dbd5a4)",
                    "linear-gradient(270deg, #dbd5a4, #51faaa, #dbd5a4, #51faaa)",
                    "linear-gradient(315deg, #51faaa, #dbd5a4, #51faaa, #dbd5a4)",
                    "linear-gradient(360deg, #dbd5a4, #51faaa, #dbd5a4, #51faaa)"
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
                  background: "conic-gradient(from 0deg, #51faaa, #dbd5a4, #51faaa)",
                  mask: "radial-gradient(circle, transparent 60%, black 70%)",
                  WebkitMask: "radial-gradient(circle, transparent 60%, black 70%)"
                }}
              />
              
              {/* Halo effect - outer glow */}
              <motion.div
                className="absolute -inset-2 rounded-full pointer-events-none opacity-80"
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(81, 250, 170, 0.5), 0 0 30px rgba(219, 213, 164, 0.35), 0 0 45px rgba(81, 250, 170, 0.25)",
                    "0 0 18px rgba(219, 213, 164, 0.5), 0 0 36px rgba(81, 250, 170, 0.35), 0 0 54px rgba(219, 213, 164, 0.25)",
                    "0 0 15px rgba(81, 250, 170, 0.5), 0 0 30px rgba(219, 213, 164, 0.35), 0 0 45px rgba(81, 250, 170, 0.25)"
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
              Add Property
            </motion.div>
            
            {/* Tooltip for better UX */}
            <motion.div
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300"
              initial={{ y: 10, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3 h-3" />
                <span>Add Property</span>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </motion.div>
          </div>
          
          {/* Right side nav items */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-1 min-w-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={navItems[2].path}
                onClick={hapticLight}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 relative ${
                  isActive(navItems[2].path)
                    ? 'bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] shadow-lg shadow-[#51faaa]/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <navItems[2].icon className="w-6 h-6" />
                <span className="text-xs font-medium mt-1">{navItems[2].label}</span>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={navItems[3].path}
                onClick={hapticLight}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 relative ${
                  isActive(navItems[3].path)
                    ? 'bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] shadow-lg shadow-[#51faaa]/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <navItems[3].icon className="w-6 h-6" />
                <span className="text-xs font-medium mt-1">{navItems[3].label}</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-white/95'}`} />
          <div className="relative z-10 flex flex-col h-full">
            {/* Search Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setIsSearchOpen(false)}
                className={`p-2 rounded-lg ${
                  isDark ? 'text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Search Properties
              </h2>
              <div className="w-10" />
            </div>

            {/* Search Form */}
            <div className="flex-1 p-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search by location, address, or ZIP"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#51faaa] ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                    autoFocus
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-semibold shadow-lg"
                >
                  Search Properties
                </button>
              </form>

              {/* Quick Search Suggestions */}
              <div className="mt-6">
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Popular Locations
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'].map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSearchQuery(location);
                        navigate(`/properties?search=${encodeURIComponent(location)}`);
                        setIsSearchOpen(false);
                      }}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        isDark 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <MapPin className="w-4 h-4 mb-1" />
                      <span className="text-sm font-medium">{location}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-white/95'}`} />
          <div className="relative z-10 flex flex-col h-full">
            {/* Menu Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <Logo isDark={isDark} />
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`p-2 rounded-lg ${
                  isDark ? 'text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 p-4 space-y-4">
              {currentUser ? (
                <>
                  {/* User Info */}
                  <div className={`p-4 rounded-xl ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-[#0a0c19]" />
                      </div>
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {currentUser.name || 'User'}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2">
                    <Link
                      to="/desktop/dashboard"
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span>My Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/favorites"
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Favorites</span>
                    </Link>
                    
                    <Link
                      to="/messages"
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Messages</span>
                    </Link>
                    
                    <button
                      onClick={toggleTheme}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Toggle Theme</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default MobileNavigation;
