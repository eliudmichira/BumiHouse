import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, PanInfo } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Mobile-first Bottom Sheet Component
export const BottomSheet = ({ 
  isOpen, 
  onClose, 
  children, 
  snapPoints = [0.3, 0.6, 0.9],
  className = ""
}) => {
  const [currentSnap, setCurrentSnap] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const velocity = info.velocity.y;
    const currentY = info.point.y;
    const windowHeight = window.innerHeight;
    
    let newSnapIndex = currentSnap;
    
    if (velocity > 500) {
      newSnapIndex = Math.max(0, currentSnap - 1);
    } else if (velocity < -500) {
      newSnapIndex = Math.min(snapPoints.length - 1, currentSnap + 1);
    } else {
      const snapPositions = snapPoints.map(snap => (1 - snap) * windowHeight);
      const distances = snapPositions.map(pos => Math.abs(currentY - pos));
      newSnapIndex = distances.indexOf(Math.min(...distances));
    }
    
    if (newSnapIndex === 0 && currentSnap !== 0) {
      onClose?.();
    } else {
      setCurrentSnap(newSnapIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <motion.div
        className={`fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl ${className}`}
        initial={{ y: '100%' }}
        animate={{ 
          y: `${(1 - snapPoints[currentSnap]) * 100}%`,
          transition: isDragging ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: window.innerHeight }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center p-3">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Content */}
        <div className="px-4 pb-safe">
          {children}
        </div>
      </motion.div>
    </>
  );
};

// Pull-to-Refresh Component
export const PullToRefresh = ({ onRefresh, children, threshold = 80 }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { scrollY } = useScroll();

  const handlePullEnd = async (event, info) => {
    if (pullDistance > threshold && scrollY.get() === 0) {
      setIsRefreshing(true);
      await onRefresh?.();
      setIsRefreshing(false);
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const rotateIcon = useTransform(() => pullProgress * 180);

  return (
    <motion.div
      className="relative"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={() => scrollY.get() === 0 && setIsPulling(true)}
      onDrag={(event, info) => {
        if (scrollY.get() === 0 && info.offset.y > 0) {
          setPullDistance(info.offset.y);
        }
      }}
      onDragEnd={handlePullEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
        animate={{
          y: isPulling ? Math.min(pullDistance - 20, 60) : -60,
          opacity: isPulling ? pullProgress : 0
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700">
          <motion.div style={{ rotate: rotateIcon }}>
            {isRefreshing ? (
              <motion.div
                className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary-500" />
            )}
          </motion.div>
        </div>
      </motion.div>
      
      {children}
    </motion.div>
  );
};

// Swipeable Card Component
export const SwipeableCard = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  leftAction,
  rightAction,
  className = ""
}) => {
  const [dragX, setDragX] = useState(0);
  
  const handleDragEnd = (event, info) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      onSwipeRight?.();
    } else if (info.offset.x < -threshold) {
      onSwipeLeft?.();
    }
    
    setDragX(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Actions */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-green-500 flex items-center justify-start pl-6">
          {rightAction}
        </div>
        <div className="flex-1 bg-red-500 flex items-center justify-end pr-6">
          {leftAction}
        </div>
      </div>
      
      {/* Card */}
      <motion.div
        className={`relative bg-white dark:bg-gray-800 ${className}`}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(event, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Haptic Feedback Hook
export const useHapticFeedback = () => {
  const triggerHaptic = (type = 'impact') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        success: [10, 50, 10],
        error: [50, 20, 50],
        impact: [25]
      };
      navigator.vibrate(patterns[type] || patterns.impact);
    }
  };

  return { triggerHaptic };
};

// Smart Status Bar Component
export const SmartStatusBar = ({ transparent = false, style = 'dark' }) => {
  useEffect(() => {
    // Set status bar style for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const metaStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    
    if (metaTheme) {
      metaTheme.content = transparent ? 'transparent' : (style === 'dark' ? '#000000' : '#ffffff');
    }
    
    if (metaStatus) {
      metaStatus.content = style;
    }
  }, [transparent, style]);

  return null;
};

export default {
  BottomSheet,
  PullToRefresh,
  SwipeableCard,
  useHapticFeedback,
  SmartStatusBar
};
