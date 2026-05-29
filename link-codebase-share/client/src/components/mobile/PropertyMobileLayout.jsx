import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PropertyMobileBottomNav, 
  PropertyMobileHeader, 
  PropertyMobileContent 
} from './PropertyMobileNav';
import { 
  ArrowLeft, 
  Bell, 
  Settings, 
  Menu,
  Search,
  Filter
} from 'lucide-react';

// Haptic feedback hook
const useHapticFeedback = () => {
  const hapticLight = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const hapticMedium = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const hapticHeavy = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  return { hapticLight, hapticMedium, hapticHeavy };
};

// Main Mobile Layout Component
export const PropertyMobileLayout = ({ 
  children, 
  title = "DwellMate",
  subtitle,
  showBackButton = false,
  showSearchButton = false,
  showNotificationButton = false,
  showMenuButton = false,
  onBack,
  onSearch,
  onNotification,
  onMenu,
  className = '',
  headerVariant = 'default'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hapticLight } = useHapticFeedback();
  
  const [activeTab, setActiveTab] = useState('home');
  const [badges, setBadges] = useState({
    home: 0,
    search: 0,
    favorites: 0,
    profile: 0
  });

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/properties') || path === '/') {
      setActiveTab('home');
    } else if (path.includes('/search')) {
      setActiveTab('search');
    } else if (path.includes('/favorites')) {
      setActiveTab('favorites');
    } else if (path.includes('/profile') || path.includes('/dashboard')) {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  // Handle tab changes
  const handleTabChange = (tab) => {
    hapticLight();
    setActiveTab(tab);
    
    switch (tab) {
      case 'home':
        navigate('/properties');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'favorites':
        navigate('/favorites');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'add-property':
        navigate('/add-property');
        break;
      default:
        break;
    }
  };

  // Header actions
  const leftAction = showBackButton ? (
    <motion.button
      onClick={() => {
        hapticLight();
        if (onBack) {
          onBack();
        } else {
          navigate(-1);
        }
      }}
      className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft className="w-5 h-5 text-white" />
    </motion.button>
  ) : showMenuButton ? (
    <motion.button
      onClick={() => {
        hapticLight();
        if (onMenu) onMenu();
      }}
      className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Menu className="w-5 h-5 text-white" />
    </motion.button>
  ) : null;

  const rightAction = (
    <div className="flex items-center space-x-2">
      {showSearchButton && (
        <motion.button
          onClick={() => {
            hapticLight();
            if (onSearch) onSearch();
          }}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search className="w-5 h-5 text-white" />
        </motion.button>
      )}
      {showNotificationButton && (
        <motion.button
          onClick={() => {
            hapticLight();
            if (onNotification) onNotification();
          }}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5 text-white" />
          {badges.profile > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          )}
        </motion.button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black ${className}`}>
      {/* Top Navigation Header */}
      <PropertyMobileHeader
        title={title}
        subtitle={subtitle}
        leftAction={leftAction}
        rightAction={rightAction}
        variant={headerVariant}
      />
      
      {/* Main Content Area */}
      <PropertyMobileContent className="pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </PropertyMobileContent>
      
      {/* Fixed Bottom Navigation */}
      <div className="flex-shrink-0 z-10">
        <PropertyMobileBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hapticFeedback={hapticLight}
          badges={badges}
        />
      </div>
    </div>
  );
};

// Mobile Page Wrapper for easy integration
export const MobilePage = ({ 
  children, 
  title, 
  subtitle,
  showBackButton = false,
  showSearchButton = false,
  showNotificationButton = false,
  showMenuButton = false,
  onBack,
  onSearch,
  onNotification,
  onMenu,
  className = '',
  headerVariant = 'default'
}) => {
  return (
    <PropertyMobileLayout
      title={title}
      subtitle={subtitle}
      showBackButton={showBackButton}
      showSearchButton={showSearchButton}
      showNotificationButton={showNotificationButton}
      showMenuButton={showMenuButton}
      onBack={onBack}
      onSearch={onSearch}
      onNotification={onNotification}
      onMenu={onMenu}
      className={className}
      headerVariant={headerVariant}
    >
      {children}
    </PropertyMobileLayout>
  );
};

export default PropertyMobileLayout;
