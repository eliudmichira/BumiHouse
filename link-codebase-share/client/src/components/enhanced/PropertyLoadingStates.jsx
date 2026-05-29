import React from 'react';
import { motion } from 'framer-motion';

// Enhanced Skeleton Property Card for Grid View
export const PropertyCardSkeleton = ({ index = 0 }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Image Skeleton with shimmer effect */}
      <div className="relative h-64 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut',
            repeatDelay: 0.5
          }}
        />
        {/* Featured badge skeleton */}
        <div className="absolute top-4 left-4 h-6 bg-gradient-to-r from-[#51faaa]/20 to-[#dbd5a4]/20 rounded-full w-20 animate-pulse" />
        {/* Heart icon skeleton */}
        <div className="absolute top-4 right-4 h-8 w-8 bg-white/20 dark:bg-gray-800/20 rounded-full animate-pulse" />
      </div>

      {/* Enhanced Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Price and Type with better styling */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <motion.div 
              className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-36"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          </div>
          <div className="h-5 bg-gradient-to-r from-[#51faaa]/20 to-[#dbd5a4]/20 rounded-full w-16 animate-pulse" />
        </div>

        {/* Enhanced Title */}
        <motion.div 
          className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Enhanced Location with icon skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        </div>

        {/* Enhanced Property Details with icons */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
          </div>
        </div>

        {/* Enhanced Amenities */}
        <div className="flex items-center gap-2">
          <div className="h-7 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 rounded-full w-20 animate-pulse" />
          <div className="h-7 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 rounded-full w-24 animate-pulse" />
          <div className="h-7 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 rounded-full w-16 animate-pulse" />
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-3">
          <motion.div 
            className="flex-1 h-11 bg-gradient-to-r from-[#51faaa]/20 to-[#dbd5a4]/20 rounded-xl"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
          <div className="h-11 w-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-11 w-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Property Card for List View
export const PropertyListCardSkeleton = ({ index = 0 }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: index * 0.1 }
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex h-48">
        {/* Image Skeleton */}
        <div className="relative w-80 flex-shrink-0 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-6 space-y-4">
          {/* Price and Type */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-40 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
          </div>

          {/* Title */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />

          {/* Location */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />

          {/* Property Details */}
          <div className="flex items-center gap-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-14 animate-pulse" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Grid of Skeleton Cards
export const PropertyGridSkeleton = ({ count = 12, viewMode = 'grid' }) => {
  const SkeletonCard = viewMode === 'list' ? PropertyListCardSkeleton : PropertyCardSkeleton;
  
  return (
    <div className={`grid gap-6 ${
      viewMode === 'list' 
        ? 'grid-cols-1' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  );
};

// Map Loading Skeleton
export const MapSkeleton = () => {
  return (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Map Controls Skeleton */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="h-10 w-10 bg-white/80 rounded-lg animate-pulse" />
        <div className="h-10 w-10 bg-white/80 rounded-lg animate-pulse" />
        <div className="h-10 w-10 bg-white/80 rounded-lg animate-pulse" />
      </div>

      {/* Map Center Indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-[#51faaa] rounded-full animate-pulse" />
      </div>
    </div>
  );
};

// Search Bar Skeleton
export const SearchBarSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-4">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

// Filter Panel Skeleton
export const FilterPanelSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
};

// Results Header Skeleton
export const ResultsHeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

// Empty State Skeleton
export const EmptyStateSkeleton = () => {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 animate-pulse" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse" />
    </div>
  );
};

// Loading Spinner with Animation
export const PropertyLoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center py-8">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-[#51faaa] rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

// Shimmer Effect Component
export const ShimmerEffect = ({ className = '' }) => {
  return (
    <motion.div
      className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 ${className}`}
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    />
  );
};

export default {
  PropertyCardSkeleton,
  PropertyListCardSkeleton,
  PropertyGridSkeleton,
  MapSkeleton,
  SearchBarSkeleton,
  FilterPanelSkeleton,
  ResultsHeaderSkeleton,
  EmptyStateSkeleton,
  PropertyLoadingSpinner,
  ShimmerEffect
};
