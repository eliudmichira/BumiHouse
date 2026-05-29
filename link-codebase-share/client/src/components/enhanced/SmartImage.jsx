import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, AlertCircle } from 'lucide-react';

const SmartImage = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  placeholder,
  lazy = true,
  quality = 'auto',
  aspectRatio = 'auto',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [currentSrc, setCurrentSrc] = useState(lazy ? placeholder : src);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setCurrentSrc(src);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observerRef.current.observe(imgRef.current);

    return () => observerRef.current?.disconnect();
  }, [lazy, src]);

  // Progressive image loading
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setCurrentSrc(src);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
      onError?.();
    };
    img.src = src;
  }, [isInView, src, fallbackSrc, onLoad, onError]);

  const aspectRatioClasses = {
    'auto': '',
    'square': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
    '2/1': 'aspect-[2/1]'
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${aspectRatioClasses[aspectRatio]} ${className}`}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Shimmer skeleton */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-500/60 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </div>
            <ImageIcon className="w-8 h-8 text-gray-400 z-10" />
          </motion.div>
        )}

        {hasError && !fallbackSrc ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
          >
            <AlertCircle className="w-8 h-8 mb-2" />
            <span className="text-sm">Failed to load</span>
          </motion.div>
        ) : (
          currentSrc && (
            <motion.img
              key="image"
              src={currentSrc}
              alt={alt}
              className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ 
                opacity: isLoading ? 0 : 1,
                scale: 1,
                filter: isLoading ? 'blur(10px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              loading={lazy ? 'lazy' : 'eager'}
              {...props}
            />
          )
        )}
      </AnimatePresence>

      {/* Optional overlay for interactive states */}
      <motion.div
        className="absolute inset-0 bg-black/0 transition-colors duration-300"
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
      />
    </div>
  );
};

export default SmartImage;
