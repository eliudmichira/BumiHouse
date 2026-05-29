import React from 'react';
import { motion } from 'framer-motion';

// Simple Google-inspired spinner
export const SimpleSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const colors = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  return (
    <div className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  );
};

// Simple loading dots
export const SimpleLoadingDots = ({ color = 'primary' }) => {
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
            y: [0, -8, 0],
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

export default {
  SimpleSpinner,
  SimpleLoadingDots
};
