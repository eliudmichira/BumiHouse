import React from 'react';
import { motion } from 'framer-motion';

const PropertyCardSkeleton = ({ className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl relative ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

            {/* Image Skeleton */}
            <div className="relative h-48 bg-gray-200/80 dark:bg-gray-700/50 animate-pulse" />

            {/* Content Skeleton */}
            <div className="p-5 space-y-4">
                {/* Price */}
                <div className="h-7 bg-gray-200/80 dark:bg-gray-700/50 rounded-xl w-1/3 animate-pulse" />

                {/* Title */}
                <div className="h-6 bg-gray-200/80 dark:bg-gray-700/50 rounded-lg w-3/4 animate-pulse" />

                {/* Location */}
                <div className="h-4 bg-gray-200/80 dark:bg-gray-700/50 rounded flex items-center gap-2 w-1/2 animate-pulse" />

                <div className="my-4 border-t border-gray-100 dark:border-white/5" />

                {/* Features */}
                <div className="flex gap-4 pt-1">
                    <div className="h-4 bg-gray-200/80 dark:bg-gray-700/50 rounded flex items-center gap-2 w-16 animate-pulse" />
                    <div className="h-4 bg-gray-200/80 dark:bg-gray-700/50 rounded flex items-center gap-2 w-16 animate-pulse" />
                    <div className="h-4 bg-gray-200/80 dark:bg-gray-700/50 rounded flex items-center gap-2 w-16 animate-pulse" />
                </div>
            </div>
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </motion.div>
    );
};

export default PropertyCardSkeleton;
