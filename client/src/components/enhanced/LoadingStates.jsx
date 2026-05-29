import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Search, Home, Sparkles } from 'lucide-react';

// Google-inspired spinner
export const GoogleSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    primary: 'text-primary-500',
    white: 'text-white',
    gray: 'text-gray-500'
  };

  return (
    <motion.div
      className={`${sizes[size]} ${colors[color]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );
};

// Material Design 3 loading dots
export const LoadingDots = ({ color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-500',
    gray: 'bg-gray-400',
    white: 'bg-white'
  };

  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${colors[color]}`}
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Progress bar with smooth animation
export const ProgressBar = ({ progress = 0, color = 'primary', height = 'sm' }) => {
  const heights = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colors = {
    primary: 'bg-primary-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500'
  };

  return (
    <div className={`w-full ${heights[height]} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
      <motion.div
        className={`${heights[height]} ${colors[color]} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};

// Full page loading with branded design
export const FullPageLoading = ({ message = "Loading..." }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <motion.div
          className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Home className="w-10 h-10 text-white" />
        </motion.div>

        {/* Loading Animation */}
        <div className="flex justify-center mb-6">
          <LoadingDots color="primary" />
        </div>

        {/* Message */}
        <motion.p
          className="text-gray-600 dark:text-gray-400 text-lg"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
};

// Search loading state
export const SearchLoading = ({ text = "Searching properties..." }) => {
  return (
    <motion.div
      className="flex items-center justify-center gap-3 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Search className="w-6 h-6 text-primary-500" />
      </motion.div>
      <div>
        <p className="text-gray-900 dark:text-white font-medium">{text}</p>
        <div className="flex items-center gap-1 mt-1">
          <Sparkles className="w-3 h-3 text-primary-500" />
          <span className="text-sm text-gray-500">AI-powered search</span>
        </div>
      </div>
    </motion.div>
  );
};

// Button loading state
export const ButtonLoading = ({ children, loading = false, ...props }) => {
  return (
    <motion.button
      {...props}
      disabled={loading || props.disabled}
      whileHover={loading ? {} : { scale: 1.02 }}
      whileTap={loading ? {} : { scale: 0.98 }}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && <GoogleSpinner size="sm" color="white" />}
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
      </div>
    </motion.button>
  );
};

// Card loading placeholder
export const CardLoading = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-elevation-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Image skeleton */}
          <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent -skew-x-12"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 0.2
                }}
              />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 0.4
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent -skew-x-12"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: 0.6
                  }}
                />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent -skew-x-12"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: 0.8
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default {
  GoogleSpinner,
  LoadingDots,
  ProgressBar,
  FullPageLoading,
  SearchLoading,
  ButtonLoading,
  CardLoading
};
