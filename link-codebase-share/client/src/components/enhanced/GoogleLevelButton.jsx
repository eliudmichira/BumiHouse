import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const GoogleLevelButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  loading = false,
  icon: Icon,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef(null);
  
  // Advanced mouse tracking for ripple effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  
  const variants = {
    primary: {
      base: "bg-gradient-to-r from-[#51faaa] to-[#3fd693] text-white",
      hover: "from-[#3fd693] to-[#51faaa] shadow-[0_8px_32px_rgba(81,250,170,0.3)]",
      active: "scale-[0.98]"
    },
    secondary: {
      base: "bg-white/10 backdrop-blur-xl border border-white/20 text-gray-900 dark:text-white",
      hover: "bg-white/20 border-white/30 shadow-[0_8px_32px_rgba(255,255,255,0.1)]",
      active: "scale-[0.98]"
    },
    ghost: {
      base: "bg-transparent text-gray-700 dark:text-gray-300",
      hover: "bg-gray-100 dark:bg-gray-800/50",
      active: "scale-[0.98]"
    }
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm h-9",
    md: "px-6 py-3 text-base h-11", 
    lg: "px-8 py-4 text-lg h-14",
    xl: "px-12 py-5 text-xl h-16"
  };

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`
        relative overflow-hidden rounded-xl font-semibold transition-all duration-200
        flex items-center justify-center gap-2
        ${variants[variant].base}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      whileHover={{ 
        scale: disabled ? 1 : 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.98,
        transition: { duration: 0.1 }
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-0"
        animate={{
          opacity: isHovered ? 1 : 0,
          background: variant === 'primary' 
            ? 'linear-gradient(135deg, rgba(81,250,170,0.2), rgba(63,214,147,0.2))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Ripple effect */}
      {isPressed && (
        <motion.div
          className="absolute rounded-full bg-white/30"
          style={{
            x: x,
            y: y,
            width: 100,
            height: 100,
            translateX: '-50%',
            translateY: '-50%'
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        animate={{
          x: isHovered ? ['-100%', '200%'] : '-100%'
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 2
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        {loading ? (
          <motion.div 
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : Icon && (
          <motion.div
            animate={{ 
              rotate: isHovered ? 15 : 0,
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-4 h-4" />
          </motion.div>
        )}
        <span>{children}</span>
      </div>
    </motion.button>
  );
};

export default GoogleLevelButton;
