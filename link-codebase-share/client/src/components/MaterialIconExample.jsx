import React from 'react';
import MaterialIcon from './MaterialIcon';

const MaterialIconExample = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Material Icons Examples
      </h2>
      
      {/* Basic Icons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Basic Icons (Outlined)
        </h3>
        <div className="flex flex-wrap gap-4">
          <MaterialIcon icon="home" size={24} className="text-blue-500" />
          <MaterialIcon icon="search" size={24} className="text-green-500" />
          <MaterialIcon icon="favorite" size={24} className="text-red-500" />
          <MaterialIcon icon="settings" size={24} className="text-purple-500" />
          <MaterialIcon icon="notifications" size={24} className="text-orange-500" />
        </div>
      </div>

      {/* Different Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Different Variants
        </h3>
        <div className="flex flex-wrap gap-4">
          <MaterialIcon icon="home" variant="filled" size={24} className="text-blue-500" />
          <MaterialIcon icon="home" variant="outlined" size={24} className="text-blue-500" />
          <MaterialIcon icon="home" variant="rounded" size={24} className="text-blue-500" />
          <MaterialIcon icon="home" variant="sharp" size={24} className="text-blue-500" />
          <MaterialIcon icon="home" variant="twoTone" size={24} className="text-blue-500" />
        </div>
      </div>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Different Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <MaterialIcon icon="star" size={16} className="text-yellow-500" />
          <MaterialIcon icon="star" size={24} className="text-yellow-500" />
          <MaterialIcon icon="star" size={32} className="text-yellow-500" />
          <MaterialIcon icon="star" size={48} className="text-yellow-500" />
          <MaterialIcon icon="star" size={64} className="text-yellow-500" />
        </div>
      </div>

      {/* Interactive Icons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Interactive Icons
        </h3>
        <div className="flex flex-wrap gap-4">
          <MaterialIcon 
            icon="favorite_border" 
            size={32} 
            className="text-red-500 cursor-pointer hover:text-red-700 transition-colors" 
            onClick={() => alert('Heart clicked!')}
          />
          <MaterialIcon 
            icon="thumb_up" 
            size={32} 
            className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors" 
            onClick={() => alert('Thumbs up clicked!')}
          />
          <MaterialIcon 
            icon="share" 
            size={32} 
            className="text-green-500 cursor-pointer hover:text-green-700 transition-colors" 
            onClick={() => alert('Share clicked!')}
          />
        </div>
      </div>

      {/* Material Symbols (Newer) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Material Symbols (Newer Version)
        </h3>
        <div className="flex flex-wrap gap-4">
          <MaterialIcon icon="home" variant="symbols" size={24} className="text-indigo-500" />
          <MaterialIcon icon="search" variant="symbols" size={24} className="text-indigo-500" />
          <MaterialIcon icon="favorite" variant="symbols" size={24} className="text-indigo-500" />
          <MaterialIcon icon="settings" variant="symbols" size={24} className="text-indigo-500" />
          <MaterialIcon icon="notifications" variant="symbols" size={24} className="text-indigo-500" />
        </div>
      </div>

      {/* Common Real Estate Icons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Common Real Estate Icons
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MaterialIcon icon="home" size={32} className="text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Home</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MaterialIcon icon="apartment" size={32} className="text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Apartment</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MaterialIcon icon="location_on" size={32} className="text-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Location</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MaterialIcon icon="bed" size={32} className="text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Bedroom</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MaterialIcon icon="bathroom" size={32} className="text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Bathroom</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MaterialIcon icon="square_foot" size={32} className="text-teal-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Square Foot</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MaterialIcon icon="local_parking" size={32} className="text-indigo-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Parking</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MaterialIcon icon="wifi" size={32} className="text-cyan-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">WiFi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialIconExample;
