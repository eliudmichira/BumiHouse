import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  variant = 'card',
  count = 1,
  className = '',
  animated = true 
}) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  const Shimmer = () => (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-700/60 to-transparent -skew-x-12"
      variants={animated ? shimmerVariants : {}}
      initial={animated ? 'initial' : false}
      animate={animated ? 'animate' : false}
    />
  );

  const variants = {
    // Property Card Skeleton
    card: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <Shimmer />
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <Shimmer />
            </div>
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 overflow-hidden">
              <Shimmer />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 overflow-hidden">
              <Shimmer />
            </div>
            <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 overflow-hidden">
              <Shimmer />
            </div>
          </div>
        </div>
      </div>
    ),

    // List Item Skeleton
    listItem: (
      <div className="flex items-center space-x-4 p-4">
        <div className="relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <Shimmer />
        </div>
        <div className="flex-1 space-y-2">
          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
            <Shimmer />
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    ),

    // Text Skeleton
    text: (
      <div className="space-y-2">
        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <Shimmer />
        </div>
        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 overflow-hidden">
          <Shimmer />
        </div>
        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 overflow-hidden">
          <Shimmer />
        </div>
      </div>
    ),

    // Dashboard Stats Skeleton
    stats: (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 overflow-hidden">
              <Shimmer />
            </div>
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 overflow-hidden">
              <Shimmer />
            </div>
          </div>
          <div className="relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    ),

    // Table Row Skeleton
    tableRow: (
      <tr className="border-b border-gray-200 dark:border-gray-700">
        {[...Array(4)].map((_, i) => (
          <td key={i} className="px-6 py-4">
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <Shimmer />
            </div>
          </td>
        ))}
      </tr>
    ),

    // Form Input Skeleton
    input: (
      <div className="space-y-2">
        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 overflow-hidden">
          <Shimmer />
        </div>
        <div className="relative h-11 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <Shimmer />
        </div>
      </div>
    ),

    // Button Skeleton
    button: (
      <div className="relative h-11 bg-gray-200 dark:bg-gray-700 rounded-xl w-32 overflow-hidden">
        <Shimmer />
      </div>
    )
  };

  const SkeletonItem = () => (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {variants[variant]}
    </motion.div>
  );

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <SkeletonItem />
        </motion.div>
      ))}
    </>
  );
};

export default SkeletonLoader;
