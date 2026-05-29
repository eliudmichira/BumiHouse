import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  Plus, 
  Heart, 
  User,
  MapPin,
  Bell,
  MessageCircle
} from 'lucide-react';

// Mobile Navigation Item Component
export const PropertyMobileNavItem = ({ 
  icon, 
  label, 
  active, 
  onClick, 
  badge,
  hapticFeedback 
}) => {
  const handleClick = () => {
    if (hapticFeedback) {
      hapticFeedback();
    }
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex flex-col items-center justify-center w-16 h-16 rounded-xl
        transition-all duration-200 relative
        ${active 
          ? 'bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] shadow-lg shadow-[#51faaa]/30' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }
      `}
    >
      <div className="relative">
        {icon}
        {badge && badge > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">
              {badge > 99 ? '99+' : badge}
            </span>
          </motion.div>
        )}
      </div>
      <span className="text-xs font-medium mt-1">{label}</span>
    </motion.button>
  );
};

// Center Action Button Component
export const PropertyCenterActionButton = ({ 
  onClick, 
  hapticFeedback,
  label = "Add Property",
  icon = <Plus className="w-8 h-8 text-white drop-shadow-lg" />
}) => {
  const handleClick = () => {
    if (hapticFeedback) {
      hapticFeedback();
    }
    onClick();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1 mx-2 sm:mx-4">
      <motion.button
        onClick={handleClick}
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group focus:outline-none"
        aria-label={label}
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
          {icon}
        </div>
      </motion.button>
      
      {/* Subtle label */}
      <motion.div
        className="text-xs text-gray-500 dark:text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ y: 5, opacity: 0 }}
        whileHover={{ y: 0, opacity: 1 }}
      >
        {label}
      </motion.div>
      
      {/* Tooltip for better UX */}
      <motion.div
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300"
        initial={{ y: 10, opacity: 0 }}
        whileHover={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </motion.div>
    </div>
  );
};

// Main Mobile Bottom Navigation Component
export const PropertyMobileBottomNav = ({ 
  activeTab, 
  onTabChange, 
  hapticFeedback,
  badges = {}
}) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 pb-safe"
    >
      <div className="flex items-center justify-between px-2 py-2">
        {/* Left side nav items */}
        <div className="flex items-center justify-start space-x-2 sm:space-x-3 flex-1 min-w-0">
          <PropertyMobileNavItem
            icon={<Home className="w-6 h-6" />}
            label="Home"
            active={activeTab === 'home'}
            onClick={() => onTabChange('home')}
            hapticFeedback={hapticFeedback}
            badge={badges.home}
          />
          <PropertyMobileNavItem
            icon={<Search className="w-6 h-6" />}
            label="Search"
            active={activeTab === 'search'}
            onClick={() => onTabChange('search')}
            hapticFeedback={hapticFeedback}
            badge={badges.search}
          />
        </div>
        
        {/* Center Action Button */}
        <PropertyCenterActionButton
          onClick={() => onTabChange('add-property')}
          hapticFeedback={hapticFeedback}
          label="Add Property"
          icon={<Plus className="w-8 h-8 text-white drop-shadow-lg" />}
        />
        
        {/* Right side nav items */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-1 min-w-0">
          <PropertyMobileNavItem
            icon={<Heart className="w-6 h-6" />}
            label="Favorites"
            active={activeTab === 'favorites'}
            onClick={() => onTabChange('favorites')}
            hapticFeedback={hapticFeedback}
            badge={badges.favorites}
          />
          <PropertyMobileNavItem
            icon={<User className="w-6 h-6" />}
            label="Profile"
            active={activeTab === 'profile'}
            onClick={() => onTabChange('profile')}
            hapticFeedback={hapticFeedback}
            badge={badges.profile}
          />
        </div>
      </div>
    </motion.nav>
  );
};

// Mobile Header Component
export const PropertyMobileHeader = ({ 
  title, 
  subtitle, 
  leftAction, 
  rightAction,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800',
    transparent: 'bg-transparent',
    glass: 'bg-white/10 backdrop-blur-xl border-b border-white/20'
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-0 z-40 px-4 py-3 ${variantClasses[variant]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {leftAction && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {leftAction}
            </motion.div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {rightAction}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

// Mobile Content Area Component
export const PropertyMobileContent = ({ 
  children, 
  className = '', 
  scrollable = true, 
  padding = 'md' 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`
        flex-1 w-full
        ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </motion.main>
  );
};

// Mobile Card Component
export const PropertyMobileCard = ({ 
  children, 
  className = '', 
  variant = 'default', 
  onClick, 
  interactive = false 
}) => {
  const variantClasses = {
    default: 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
    elevated: 'bg-gray-800 shadow-xl border border-gray-700',
    outlined: 'bg-transparent border-2 border-gray-700'
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
    : '';

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={`
        rounded-2xl p-4 transition-all duration-300
        ${variantClasses[variant]}
        ${interactiveClasses}
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

// Mobile Button Component
export const PropertyMobileButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  disabled = false, 
  loading = false, 
  onClick, 
  className = '' 
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] hover:shadow-lg',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    outline: 'border-2 border-[#51faaa] text-[#51faaa] hover:bg-[#51faaa] hover:text-[#0a0c19]',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        rounded-xl font-semibold transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default PropertyMobileBottomNav;
