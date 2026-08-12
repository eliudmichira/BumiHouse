import React from 'react';
import { Map } from 'lucide-react';

const MapSkeleton = () => {
    return (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {/* Map Pattern Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-4 h-full">
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="border border-gray-300 dark:border-gray-600" />
                    ))}
                </div>
            </div>

            {/* Loading Icon */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="relative">
                    <Map className="w-16 h-16 text-gray-400 dark:text-gray-500 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 border-4 border-gray-300 dark:border-gray-600 border-t-[#51faaa] rounded-full animate-spin" />
                    </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading map...</p>
            </div>
        </div>
    );
};

export default MapSkeleton;
