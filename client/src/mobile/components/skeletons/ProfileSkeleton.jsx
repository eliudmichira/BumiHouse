import React from 'react';

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen p-6 pb-32">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3b82f6]/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#06b6d4]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Profile Header Card */}
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl p-6 mb-6 shadow-2xl overflow-hidden mt-6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                <div className="flex items-start gap-4 mb-6">
                    {/* Avatar Skeleton */}
                    <div className="w-24 h-24 rounded-full bg-gray-200/50 dark:bg-gray-700/50 animate-pulse shadow-inner relative overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800" />

                    <div className="flex-1 space-y-4 py-2">
                        {/* Name Skeleton */}
                        <div className="h-7 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl w-3/4 animate-pulse" />
                        {/* Subtitle Skeleton */}
                        <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded-lg w-1/2 animate-pulse" />
                        {/* Badges Skeleton */}
                        <div className="flex gap-2 pt-2">
                            <div className="h-7 bg-gray-200/50 dark:bg-gray-700/50 rounded-full w-24 animate-pulse relative overflow-hidden" />
                            <div className="h-7 bg-gray-200/50 dark:bg-gray-700/50 rounded-full w-20 animate-pulse relative overflow-hidden" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-3 mb-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200/50 dark:bg-gray-800/50 rounded-2xl flex-1 animate-pulse border border-white/20 dark:border-white/5" />
                ))}
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-gray-200/50 dark:border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
                        <div className="w-12 h-12 bg-gray-200/80 dark:bg-gray-700/50 rounded-2xl mb-4 animate-pulse" />
                        <div className="h-8 bg-gray-200/80 dark:bg-gray-700/50 rounded-xl mb-2 w-3/4 animate-pulse" />
                        <div className="h-3 bg-gray-200/80 dark:bg-gray-700/50 rounded max-w-[50%] animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Content List Skeleton */}
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/10 p-4 flex gap-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 0.3}s` }} />
                        <div className="w-16 h-16 rounded-2xl bg-gray-200/80 dark:bg-gray-700/50 animate-pulse" />
                        <div className="flex-1 space-y-3 py-1">
                            <div className="h-5 bg-gray-200/80 dark:bg-gray-700/50 rounded-lg w-full animate-pulse" />
                            <div className="h-4 bg-gray-200/80 dark:bg-gray-700/50 rounded-lg w-2/3 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfileSkeleton;
