import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Plus,
  User,
  Heart,
  MessageCircle,
  Settings,
  LogOut,
  Sparkles,
  LayoutGrid,
  MapPin,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import Logo from '../../components/Logo';
import { auth } from '../../lib/firebase';
import SearchBottomSheet from '../../components/search/SearchBottomSheet';
import { Haptics, ImpactStyle } from '@capacitor/haptics';



const MobileNavigation = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, unreadMessagesCount } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isMobile } = useMobileDetection(768);

  // Close menu when route changes
  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);



  // Handle search from bottom sheet
  const handleSheetSearch = (searchParams) => {
    // Search params handled
    setIsSearchSheetOpen(false);
    // Navigate to properties with query if needed
    if (searchParams.to) {
      navigate(`/search?search=${encodeURIComponent(searchParams.to)}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
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
    { icon: Search, label: 'Explore', path: '/' },
    { icon: LayoutGrid, label: 'Properties', path: '/properties' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/dashboard' }
  ];

  // Haptic feedback function
  const hapticFeedback = async (style = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      // Fallback for non-Capacitor environments
      if ('vibrate' in navigator) {
        navigator.vibrate(style === ImpactStyle.Medium ? 40 : 10);
      }
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Helper to check if search is active (either path or sheet open)
  const isSearchActive = () => isSearchSheetOpen || location.pathname === '/properties';

  return (
    <>
      <SearchBottomSheet
        isOpen={isSearchSheetOpen}
        onClose={() => setIsSearchSheetOpen(false)}
        onSearch={handleSheetSearch}
      />

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed left-0 right-0 mx-auto w-[90%] max-w-[400px] z-50 lg:hidden backdrop-blur-2xl rounded-full shadow-2xl ${isDark
          ? 'bg-gray-900/80 border border-white/10 shadow-black/50'
          : 'bg-white/80 border border-white/40 shadow-gray-300/50'
          }`}
        style={{ bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))' }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-3 h-full">
          {/* Home / Explore */}
          <motion.div
            key={navItems[0].path}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-1"
          >
            <Link
              to={navItems[0].path}
              onClick={() => hapticFeedback(ImpactStyle.Light)}
              className="flex flex-col items-center justify-center"
              aria-label={navItems[0].label}
              aria-current={isActive(navItems[0].path) ? 'page' : undefined}
            >
              <div className={`relative w-12 h-12 rounded-full transition-all duration-300 shadow-lg ${isActive(navItems[0].path)
                ? 'bg-[#3dd88a] shadow-[#3dd88a]/30'
                : isDark
                  ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-[#6B7280]/20'
                  : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db] shadow-gray-200/50'
                }`}>
                <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{ background: "transparent", border: isDark ? "1.5px solid rgba(0, 0, 0, 0.25)" : "1.5px solid rgba(255, 255, 255, 0.5)" }}></div>
                <div className={`absolute inset-2 rounded-full ${isActive(navItems[0].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`absolute inset-2 rounded-full ${isActive(navItems[0].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`absolute inset-3 rounded-full opacity-60 ${isActive(navItems[0].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`relative z-10 flex items-center justify-center w-full h-full ${isActive(navItems[0].path) ? 'text-white' : (isDark ? 'text-white' : 'text-gray-600')
                  }`}>
                  <Search className="w-6 h-6" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Properties */}
          <motion.div
            key={navItems[1].path}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-1"
          >
            <Link
              to={navItems[1].path}
              onClick={() => hapticFeedback(ImpactStyle.Light)}
              className="flex flex-col items-center justify-center"
              aria-label={navItems[1].label}
              aria-current={isActive(navItems[1].path) ? 'page' : undefined}
            >
              <div className={`relative w-12 h-12 rounded-full transition-all duration-300 shadow-lg ${isActive(navItems[1].path)
                ? 'bg-[#3dd88a] shadow-[#3dd88a]/30'
                : isDark
                  ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-[#6B7280]/20'
                  : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db] shadow-gray-200/50'
                }`}>
                <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{ background: "transparent", border: isDark ? "1.5px solid rgba(0, 0, 0, 0.25)" : "1.5px solid rgba(255, 255, 255, 0.5)" }}></div>
                <div className={`absolute inset-2 rounded-full ${isActive(navItems[1].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`absolute inset-2 rounded-full ${isActive(navItems[1].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`absolute inset-3 rounded-full opacity-60 ${isActive(navItems[1].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`relative z-10 flex items-center justify-center w-full h-full ${isActive(navItems[1].path) ? 'text-white' : (isDark ? 'text-white' : 'text-gray-600')
                  }`}>
                  <LayoutGrid className="w-6 h-6" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Center Action Button - Only for Agents & Admins */}
          {currentUser && (currentUser.role === 'agent' || currentUser.role === 'admin') && (
            <div className="flex flex-col items-center justify-center">
              <Link
                to="/properties/add"
                onClick={() => hapticFeedback(ImpactStyle.Medium)}
                className="relative w-13 h-13 rounded-full shadow-2xl hover:shadow-[0_10px_40px_rgba(81,250,170,0.5)] transition-all duration-500 flex items-center justify-center group focus:outline-none overflow-visible"
                aria-label="Add Property"
                data-discover="true"
              >
                {/* Gradient Background with Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-75"
                  style={{
                    background: '#3dd88a'
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: '#3dd88a',
                    boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.4), inset 0 -2px 8px rgba(0,0,0,0.1)'
                  }}
                />

                {/* Jumping Dots Animation Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Dot 3 - Largest, starts first */}
                  <div
                    className="absolute w-14 h-14 rounded-full z-10"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)',
                      animation: 'jumpDot3 3.5s cubic-bezier(0.21, 0.98, 0.6, 0.99) infinite'
                    }}
                  />
                  {/* Dot 2 - Medium */}
                  <div
                    className="absolute w-9 h-9 rounded-full z-20"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.8) 100%)',
                      animation: 'jumpDot2 3.5s cubic-bezier(0.21, 0.98, 0.6, 0.99) infinite'
                    }}
                  />
                  {/* Dot 1 - Smallest, delays longest */}
                  <div
                    className="absolute w-5 h-5 rounded-full z-30"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 100%)',
                      animation: 'jumpDot1 3.5s cubic-bezier(0.21, 0.98, 0.6, 0.99) infinite'
                    }}
                  />
                </div>

                {/* Plus Icon - Always visible on top with subtle animation */}
                <div
                  className="relative z-40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#0a0c19]">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </div>

                {/* Enhanced CSS animations */}
                <style>{`
                  @keyframes jumpDot1 {
                    0%, 75% {
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                      transform: scale(0);
                      opacity: 0;
                    }
                    85% {
                      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
                      transform: scale(1.1);
                      opacity: 1;
                    }
                    100% {
                      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
                      transform: scale(1);
                      opacity: 1;
                    }
                  }

                  @keyframes jumpDot2 {
                    0%, 45% {
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                      transform: scale(0);
                      opacity: 0;
                    }
                    60% {
                      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
                      transform: scale(1.1);
                      opacity: 1;
                    }
                    100% {
                      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
                      transform: scale(1);
                      opacity: 0.9;
                    }
                  }

                  @keyframes jumpDot3 {
                    0%, 15% {
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                      transform: scale(0);
                      opacity: 0;
                    }
                    35% {
                      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
                      transform: scale(1.1);
                      opacity: 1;
                    }
                    100% {
                      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.2);
                      transform: scale(1);
                      opacity: 0.8;
                    }
                  }
                `}</style>
              </Link>
            </div>
          )}

          {/* Messages */}
          <motion.div
            key={navItems[2].path}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-1 relative"
          >
            <Link
              to={navItems[2].path}
              onClick={() => hapticFeedback(ImpactStyle.Light)}
              className="flex flex-col items-center justify-center"
              aria-label={`${navItems[2].label}${unreadMessagesCount > 0 ? `, ${unreadMessagesCount} unread messages` : ''}`}
              aria-current={isActive(navItems[2].path) ? 'page' : undefined}
            >
              <div className={`relative w-12 h-12 rounded-full transition-all duration-300 shadow-lg ${isActive(navItems[2].path)
                ? 'bg-[#3dd88a] shadow-[#3dd88a]/30'
                : isDark
                  ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-[#6B7280]/20'
                  : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db] shadow-gray-200/50'
                }`}>
                <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{ background: "transparent", border: isDark ? "1.5px solid rgba(0, 0, 0, 0.25)" : "1.5px solid rgba(255, 255, 255, 0.5)" }}></div>
                <div className={`absolute inset-2 rounded-full ${isActive(navItems[2].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`absolute inset-2 rounded-full ${isActive(navItems[2].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`absolute inset-3 rounded-full opacity-60 ${isActive(navItems[2].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`relative z-10 flex items-center justify-center w-full h-full ${isActive(navItems[2].path) ? 'text-white' : (isDark ? 'text-white' : 'text-gray-600')
                  }`}>
                  <MessageCircle className="w-6 h-6" />
                </div>
                {/* Notification Badge */}
                {unreadMessagesCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 z-20 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-white dark:border-gray-900"
                  >
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </motion.div>
                )}
              </div>
            </Link>
          </motion.div>

          {/* Profile */}
          <motion.div
            key={navItems[3].path}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-1"
          >
            <Link
              to={navItems[3].path}
              onClick={() => hapticFeedback(ImpactStyle.Light)}
              className="flex flex-col items-center justify-center"
              aria-label={navItems[3].label}
              aria-current={isActive(navItems[3].path) ? 'page' : undefined}
            >
              <div className={`relative w-12 h-12 rounded-full transition-all duration-300 shadow-lg ${isActive(navItems[3].path)
                ? 'bg-[#3dd88a] shadow-[#3dd88a]/30'
                : isDark
                  ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-[#6B7280]/20'
                  : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db] shadow-gray-200/50'
                }`}>
                <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{ background: "transparent", border: isDark ? "1.5px solid rgba(0, 0, 0, 0.25)" : "1.5px solid rgba(255, 255, 255, 0.5)" }}></div>
                <div className={`absolute inset-2 rounded-full ${isActive(navItems[3].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`absolute inset-2 rounded-full ${isActive(navItems[3].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`absolute inset-3 rounded-full opacity-60 ${isActive(navItems[3].path)
                  ? 'bg-[#3dd88a]'
                  : isDark
                    ? 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
                    : 'bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]'
                  }`}></div>
                <div className={`relative z-10 flex items-center justify-center w-full h-full ${isActive(navItems[3].path) ? 'text-white' : (isDark ? 'text-white' : 'text-gray-600')
                  }`}>
                  <User className="w-6 h-6" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-white/95'}`} />
          <div className="relative z-10 flex flex-col h-full">
            {/* Search Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <button
                onClick={() => setIsSearchOpen(false)}
                className={`p-2 rounded-lg ${isDark ? 'text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
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
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  <input
                    type="text"
                    placeholder="Search by location, address, or ZIP"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#3b82f6] ${isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-[#0a0c19] rounded-xl font-semibold shadow-lg"
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
                        navigate(`/search?search=${encodeURIComponent(location)}`);
                        setIsSearchOpen(false);
                      }}
                      className={`p-3 rounded-lg text-left transition-colors ${isDark
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

      {/* Mobile Menu Overlay - Now using shared ExploreMenu */}


    </>
  );
};

export default MobileNavigation;
