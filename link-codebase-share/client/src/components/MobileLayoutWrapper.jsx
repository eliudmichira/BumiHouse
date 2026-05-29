import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Plus, 
  Heart, 
  User,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Mobile Layout Wrapper with Top and Bottom Navigation
const MobileLayoutWrapper = ({ children, title = "Hama Estate", subtitle }) => {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('home');

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path.includes('/properties')) {
      setActiveTab('home');
    } else if (path.includes('/search')) {
      setActiveTab('search');
    } else if (path.includes('/favorites')) {
      setActiveTab('favorites');
    } else if (path.includes('/profile') || path.includes('/dashboard')) {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Header */}
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
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-gray-300">
                  {subtitle}
                </p>
              )}
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
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
            <div className={`relative w-12 h-12 rounded-full transition-all duration-300 shadow-lg ${
              activeTab === 'home' 
                ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] shadow-[#51faaa]/20' 
                : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-[#6B7280]/20'
            }`}>
              <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{background: "transparent", border: "1.5px solid rgba(0, 0, 0, 0.25)"}}></div>
              <div className={`absolute inset-2 rounded-full ${
                activeTab === 'home' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
              <div className={`absolute inset-2 rounded-full ${
                activeTab === 'home' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
              <div className={`absolute inset-3 rounded-full opacity-60 ${
                activeTab === 'home' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
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
            <div className={`relative w-12 h-12 rounded-full transition-all duration-300 shadow-lg ${
              activeTab === 'search' 
                ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] shadow-[#51faaa]/20' 
                : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-[#6B7280]/20'
            }`}>
              <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{background: "transparent", border: "1.5px solid rgba(0, 0, 0, 0.25)"}}></div>
              <div className={`absolute inset-2 rounded-full ${
                activeTab === 'search' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
              <div className={`absolute inset-2 rounded-full ${
                activeTab === 'search' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
              <div className={`absolute inset-3 rounded-full opacity-60 ${
                activeTab === 'search' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
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
            <div className={`relative w-12 h-12 rounded-full transition-all duration-300 shadow-lg ${
              activeTab === 'favorites' 
                ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] shadow-[#51faaa]/20' 
                : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-[#6B7280]/20'
            }`}>
              <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{background: "transparent", border: "1.5px solid rgba(0, 0, 0, 0.25)"}}></div>
              <div className={`absolute inset-2 rounded-full ${
                activeTab === 'favorites' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
              <div className={`absolute inset-2 rounded-full ${
                activeTab === 'favorites' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
              <div className={`absolute inset-3 rounded-full opacity-60 ${
                activeTab === 'favorites' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
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
            <div className={`relative w-12 h-12 rounded-full transition-all duration-300 shadow-lg ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a] shadow-[#51faaa]/20' 
                : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] shadow-[#6B7280]/20'
            }`}>
              <div className="absolute -inset-1 rounded-full pointer-events-none opacity-80" style={{background: "transparent", border: "1.5px solid rgba(0, 0, 0, 0.25)"}}></div>
              <div className={`absolute inset-2 rounded-full ${
                activeTab === 'profile' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
              <div className={`absolute inset-2 rounded-full ${
                activeTab === 'profile' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
              <div className={`absolute inset-3 rounded-full opacity-60 ${
                activeTab === 'profile' 
                  ? 'bg-gradient-to-br from-[#51faaa] via-[#45e695] to-[#3dd88a]' 
                  : 'bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151]'
              }`}></div>
              <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
                <User className="w-6 h-6" />
              </div>
            </div>
          </motion.button>
        </div>
      </motion.nav>
    </div>
  );
};

export default MobileLayoutWrapper;
