import React from 'react';
import PropertyCardSkeleton from './PropertyCardSkeleton';

const ListSkeleton = ({ count = 6 }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 pt-6">
            {/* Search Bar Skeleton */}
            <div className="mb-6 relative overflow-hidden rounded-full border border-gray-200/50 dark:border-white/10 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <div className="h-14 bg-white/80 dark:bg-white/5 backdrop-blur-xl w-full" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-10 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 animate-pulse rounded-full flex-shrink-0"
                        style={{ width: '100px' }}
                    />
                ))}
            </div>

            {/* Property Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(count)].map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                ))}
            </div>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes shimmer { 100% { transform: translateX(100%); } }
            `}</style>
        </div>
    );
};

export default ListSkeleton;
