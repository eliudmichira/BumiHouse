import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Moon,
  Sun,
  ChevronDown,
  UserCheck,
  Sparkles
} from 'lucide-react';

const FloatingDashboardNav = ({ variant = 'dashboard' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, signOut, getUserRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const userRole = getUserRole ? getUserRole() : 'user';
  const isAdmin = userRole === 'admin';
  const isAgent = userRole === 'agent';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/desktop/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    // Essential items only
    {
      icon: User,
      label: 'Profile',
      action: () => navigate('/desktop/dashboard?section=profile'),
      show: true
    },
    // Admin panel for admins only
    {
      icon: Crown,
      label: 'Admin Panel',
      action: () => navigate('/desktop/admin'),
      show: isAdmin,
      highlight: true
    },
    // Become Agent for regular users
    {
      icon: UserCheck,
      label: 'Become Agent',
      action: () => navigate('/agent-verification'),
      show: !isAdmin && !isAgent,
      highlight: true
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => navigate('/desktop/dashboard?section=settings'),
      show: true
    },
    {
      icon: isDark ? Sun : Moon,
      label: isDark ? 'Light Mode' : 'Dark Mode',
      action: toggleTheme,
      show: true
    }
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <div className="fixed top-6 right-6 z-50" ref={dropdownRef}>
      {/* Google-Level Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-3 px-3 py-2 rounded-full shadow-elevation-4 border transition-all duration-300 overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-r from-gray-800/95 to-gray-900/95 border-gray-700/50 text-white backdrop-blur-xl' 
            : 'bg-gradient-to-r from-white/95 to-gray-50/95 border-white/20 text-gray-900 backdrop-blur-xl'
        }`}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2, type: "spring", stiffness: 300 }
        }}
        whileTap={{ 
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
        animate={{
          boxShadow: isOpen 
            ? "0 25px 50px -12px rgba(81, 250, 170, 0.25)" 
            : "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          animate={{
            x: ['-100%', '200%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "linear"
          }}
        />

        {/* User Avatar */}
        <div className="relative z-10">
          <motion.div 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#51faaa] to-[#4fd69c] p-0.5"
            animate={{
              rotate: isOpen ? 15 : 0
            }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <img 
              src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=51faaa&color=0a0c19`}
              alt={currentUser?.name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          </motion.div>
          {/* Animated Status indicator */}
          <motion.div 
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Animated Dropdown Icon */}
        <motion.div
          animate={{ 
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          transition={{ duration: 0.3, type: "spring" }}
          className="relative z-10"
        >
          <ChevronDown className="w-4 h-4 transition-colors duration-300 group-hover:text-[#51faaa]" />
        </motion.div>
      </motion.button>

      {/* Google-Level Floating Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={`absolute top-full right-0 mt-3 w-80 rounded-3xl shadow-elevation-5 backdrop-blur-2xl border overflow-hidden ${
              isDark 
            ? 'bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-gray-700/30' 
            : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-white/30'
            }`}
            initial={{ 
              opacity: 0, 
              scale: 0.9, 
              y: -10,
              rotateX: -15
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotateX: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              y: -5,
              rotateX: -5
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.2 
            }}
          >
          {/* Elegant Header */}
          <div className={`p-6 bg-gradient-to-r from-[#51faaa]/10 to-[#4fd69c]/10 ${
            isDark ? 'border-b border-gray-700/30' : 'border-b border-gray-200/30'
          }`}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#51faaa] to-[#4fd69c] p-0.5">
                  <img 
                    src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=51faaa&color=0a0c19`}
                    alt={currentUser?.name || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 shadow-sm"></div>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser?.name || 'User'}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentUser?.email}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${
                    isAdmin 
                      ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900/40 dark:to-purple-800/40 dark:text-purple-300'
                      : isAgent
                      ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700/40 dark:to-gray-600/40 dark:text-gray-300'
                  }`}>
                    {isAdmin && '👑'} {isAgent && '🏢'} {userRole}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Google-Level Premium Menu Items */}
          <div className="p-4 space-y-1">
            {visibleItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left group relative overflow-hidden ${
                  item.highlight
                    ? isDark
                      ? 'text-purple-300 bg-gradient-to-r from-purple-900/10 to-purple-800/10'
                      : 'text-purple-700 bg-gradient-to-r from-purple-50/50 to-purple-100/50'
                    : isDark
                    ? 'text-gray-300'
                    : 'text-gray-700'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: item.highlight
                    ? (isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)')
                    : (isDark ? 'rgba(81, 250, 170, 0.1)' : 'rgba(81, 250, 170, 0.05)'),
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
              >
                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                
                <motion.div 
                  className={`p-2 rounded-xl relative z-10 ${
                    item.highlight
                      ? item.label === 'Admin Panel'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-[#51faaa] to-[#4fd69c] text-[#0a0c19]'
                      : isDark
                      ? 'bg-gray-700/50 group-hover:bg-[#51faaa]/20'
                      : 'bg-gray-100 group-hover:bg-[#51faaa]/20'
                  }`}
                  whileHover={{ 
                    rotate: 5,
                    scale: 1.1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon className="w-4 h-4" />
                </motion.div>
                <span className="flex-1 font-medium relative z-10">{item.label}</span>
                
                {item.highlight && (
                  <motion.div
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                  </motion.div>
                )}
              </motion.button>
            ))}

            {/* Elegant Separator */}
            <div className={`my-4 h-px bg-gradient-to-r ${
              isDark 
                ? 'from-transparent via-gray-700 to-transparent' 
                : 'from-transparent via-gray-200 to-transparent'
            }`}></div>

            {/* Google-Level Logout Button */}
            <motion.button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left group relative overflow-hidden ${
                isDark 
                  ? 'text-red-400 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-red-800/20' 
                  : 'text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: visibleItems.length * 0.05 + 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              
              <motion.div 
                className={`p-2 rounded-xl relative z-10 ${
                  isDark ? 'bg-red-900/30 group-hover:bg-red-800/40' : 'bg-red-100 group-hover:bg-red-200'
                }`}
                whileHover={{ 
                  rotate: -5,
                  scale: 1.1
                }}
                transition={{ duration: 0.2 }}
              >
                <LogOut className="w-4 h-4" />
              </motion.div>
              <span className="font-medium relative z-10">Sign Out</span>
            </motion.button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingDashboardNav;
