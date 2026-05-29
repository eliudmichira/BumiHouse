import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, Share, MessageCircle, X } from 'lucide-react';
import { PropertyMobileCard } from './PropertyMobileNav';

const SwipeablePropertyCard = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onFavorite,
  onShare,
  onMessage,
  isFavorite = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);
  const cardRef = useRef(null);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      if (info.offset.x > 0) {
        // Swipe right - favorite
        setSwipeDirection('right');
        if (onSwipeRight || onFavorite) {
          onFavorite?.();
          onSwipeRight?.();
        }
      } else {
        // Swipe left - share/message
        setSwipeDirection('left');
        if (onSwipeLeft || onShare) {
          onShare?.();
          onSwipeLeft?.();
        }
      }
      
      // Reset after animation
      setTimeout(() => {
        x.set(0);
        setSwipeDirection(null);
      }, 300);
    } else {
      // Snap back
      x.set(0);
    }
    setIsDragging(false);
  };

  return (
    <div className={`relative overflow-hidden min-w-0 ${className}`} ref={cardRef}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        {/* Left Action - Share/Message */}
        <motion.div
          className="flex items-center gap-2"
          style={{ opacity: useTransform(x, [-200, -50, 0], [1, 0.5, 0]) }}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            {onMessage ? (
              <MessageCircle className="w-6 h-6 text-white" />
            ) : (
              <Share className="w-6 h-6 text-white" />
            )}
          </div>
        </motion.div>

        {/* Right Action - Favorite */}
        <motion.div
          className="flex items-center gap-2"
          style={{ opacity: useTransform(x, [0, 50, 200], [0, 0.5, 1]) }}
        >
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
            <Heart className={`w-6 h-6 text-white ${isFavorite ? 'fill-white' : ''}`} />
          </div>
        </motion.div>
      </div>

      {/* Swipeable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, scale }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeablePropertyCard;
