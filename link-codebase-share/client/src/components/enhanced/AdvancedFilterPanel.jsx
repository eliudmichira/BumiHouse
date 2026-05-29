import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  SlidersHorizontal, 
  DollarSign, 
  Bed, 
  Bath, 
  Square, 
  Car,
  Wifi,
  Droplets,
  Shield,
  TreePine,
  Building,
  Home,
  Bus,
  ParkingCircle,
  Waves,
  Flame,
  Snowflake,
  AirVent,
  Dog,
  ChefHat,
  Wine,
  Sun,
  Moon,
  Zap,
  Check,
  RotateCcw,
  Sparkles,
  Clock
} from 'lucide-react';

const AdvancedFilterPanel = ({
  filters,
  setFilters,
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters,
  propertyCount = 0
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeSection, setActiveSection] = useState('price');

  const propertyTypes = [
    { id: 'apartment', label: 'Apartment', icon: <Building className="w-4 h-4" /> },
    { id: 'house', label: 'House', icon: <Home className="w-4 h-4" /> },
    { id: 'villa', label: 'Villa', icon: <Home className="w-4 h-4" /> },
    { id: 'land', label: 'Land', icon: <TreePine className="w-4 h-4" /> },
    { id: 'commercial', label: 'Commercial', icon: <Building className="w-4 h-4" /> },
    { id: 'office', label: 'Office', icon: <Building className="w-4 h-4" /> }
  ];

  const amenities = [
    { id: 'wifi', label: 'WiFi/Fibre', icon: <Wifi className="w-4 h-4" /> },
    { id: 'water', label: 'Water/Borehole', icon: <Droplets className="w-4 h-4" /> },
    { id: 'security', label: '24/7 Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'parking', label: 'Parking', icon: <Car className="w-4 h-4" /> },
    { id: 'garden', label: 'Garden', icon: <TreePine className="w-4 h-4" /> },
    { id: 'pool', label: 'Swimming Pool', icon: <Waves className="w-4 h-4" /> },
    { id: 'gym', label: 'Gym/Fitness', icon: <Flame className="w-4 h-4" /> },
    { id: 'ac', label: 'Air Conditioning', icon: <AirVent className="w-4 h-4" /> },
    { id: 'heating', label: 'Heating', icon: <Flame className="w-4 h-4" /> },
    { id: 'petFriendly', label: 'Pet Friendly', icon: <Dog className="w-4 h-4" /> },
    { id: 'kitchen', label: 'Modern Kitchen', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'balcony', label: 'Balcony', icon: <Sun className="w-4 h-4" /> }
  ];

  const locationFeatures = [
    { id: 'nearTransport', label: 'Near Public Transport', icon: <Bus className="w-4 h-4" /> },
    { id: 'nearSchool', label: 'Near Schools', icon: <Building className="w-4 h-4" /> },
    { id: 'nearHospital', label: 'Near Hospital', icon: <Building className="w-4 h-4" /> },
    { id: 'nearMall', label: 'Near Shopping Mall', icon: <Building className="w-4 h-4" /> },
    { id: 'gatedCommunity', label: 'Gated Community', icon: <Shield className="w-4 h-4" /> }
  ];

  const priceRanges = [
    { label: 'Under KES 50,000', min: 0, max: 50000 },
    { label: 'KES 50,000 - 100,000', min: 50000, max: 100000 },
    { label: 'KES 100,000 - 200,000', min: 100000, max: 200000 },
    { label: 'KES 200,000 - 500,000', min: 200000, max: 500000 },
    { label: 'KES 500,000 - 1,000,000', min: 500000, max: 1000000 },
    { label: 'Over KES 1,000,000', min: 1000000, max: null }
  ];

  const updateFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key]?.includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...(prev[key] || []), value]
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onApplyFilters?.(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      minBaths: '',
      homeTypes: [],
      minSqft: '',
      maxSqft: '',
      amenities: [],
      locationFeatures: [],
      isNewlyBuilt: false,
      isRecentlyRenovated: false,
      isFurnished: false,
      isStudentFriendly: false,
      isShortTermLease: false
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onResetFilters?.(resetFilters);
  };

  const filterSections = [
    { id: 'price', label: 'Price Range', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'property', label: 'Property Details', icon: <Home className="w-4 h-4" /> },
    { id: 'amenities', label: 'Amenities', icon: <Zap className="w-4 h-4" /> },
    { id: 'location', label: 'Location Features', icon: <Building className="w-4 h-4" /> },
    { id: 'special', label: 'Special Features', icon: <Sparkles className="w-4 h-4" /> }
  ];

  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      x: '100%', 
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-hidden"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#51faaa] rounded-xl">
                    <SlidersHorizontal className="w-5 h-5 text-[#0a0c19]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Advanced Filters
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {propertyCount.toLocaleString()} properties found
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Section Navigation */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {filterSections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      activeSection === section.id
                        ? 'bg-[#51faaa] text-[#0a0c19]'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {section.icon}
                    <span>{section.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Price Range */}
                  {activeSection === 'price' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Price Range (KES)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Min Price
                            </label>
                            <input
                              type="number"
                              value={localFilters.minPrice || ''}
                              onChange={(e) => updateFilter('minPrice', e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Max Price
                            </label>
                            <input
                              type="number"
                              value={localFilters.maxPrice || ''}
                              onChange={(e) => updateFilter('maxPrice', e.target.value)}
                              placeholder="No limit"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Quick Price Ranges
                        </h4>
                        <div className="space-y-2">
                          {priceRanges.map((range, index) => (
                            <motion.button
                              key={index}
                              onClick={() => {
                                updateFilter('minPrice', range.min);
                                updateFilter('maxPrice', range.max);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <span className="text-gray-700 dark:text-gray-300">{range.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Property Details */}
                  {activeSection === 'property' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Property Type
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {propertyTypes.map((type) => (
                            <motion.button
                              key={type.id}
                              onClick={() => toggleArrayFilter('homeTypes', type.id)}
                              className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 ${
                                localFilters.homeTypes?.includes(type.id)
                                  ? 'border-[#51faaa] bg-[#51faaa]/10 text-[#0a0c19]'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {type.icon}
                              <span className="text-sm font-medium">{type.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Property Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Min Bedrooms
                            </label>
                            <select
                              value={localFilters.minBeds || ''}
                              onChange={(e) => updateFilter('minBeds', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                            >
                              <option value="">Any</option>
                              <option value="1">1+</option>
                              <option value="2">2+</option>
                              <option value="3">3+</option>
                              <option value="4">4+</option>
                              <option value="5">5+</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Min Bathrooms
                            </label>
                            <select
                              value={localFilters.minBaths || ''}
                              onChange={(e) => updateFilter('minBaths', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                            >
                              <option value="">Any</option>
                              <option value="1">1+</option>
                              <option value="2">2+</option>
                              <option value="3">3+</option>
                              <option value="4">4+</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Size (sqft)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <input
                              type="number"
                              value={localFilters.minSqft || ''}
                              onChange={(e) => updateFilter('minSqft', e.target.value)}
                              placeholder="Min size"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={localFilters.maxSqft || ''}
                              onChange={(e) => updateFilter('maxSqft', e.target.value)}
                              placeholder="Max size"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {activeSection === 'amenities' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Amenities
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {amenities.map((amenity) => (
                            <motion.button
                              key={amenity.id}
                              onClick={() => toggleArrayFilter('amenities', amenity.id)}
                              className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 ${
                                localFilters.amenities?.includes(amenity.id)
                                  ? 'border-[#51faaa] bg-[#51faaa]/10 text-[#0a0c19]'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {amenity.icon}
                              <span className="text-sm font-medium">{amenity.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location Features */}
                  {activeSection === 'location' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Location Features
                        </h3>
                        <div className="space-y-3">
                          {locationFeatures.map((feature) => (
                            <motion.button
                              key={feature.id}
                              onClick={() => toggleArrayFilter('locationFeatures', feature.id)}
                              className={`w-full p-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 ${
                                localFilters.locationFeatures?.includes(feature.id)
                                  ? 'border-[#51faaa] bg-[#51faaa]/10 text-[#0a0c19]'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                              whileHover={{ scale: 1.01, x: 4 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              {feature.icon}
                              <span className="font-medium">{feature.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Features */}
                  {activeSection === 'special' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Special Features
                        </h3>
                        <div className="space-y-3">
                          {[
                            { id: 'isNewlyBuilt', label: 'Newly Built', icon: <Sparkles className="w-4 h-4" /> },
                            { id: 'isRecentlyRenovated', label: 'Recently Renovated', icon: <Zap className="w-4 h-4" /> },
                            { id: 'isFurnished', label: 'Furnished', icon: <Home className="w-4 h-4" /> },
                            { id: 'isStudentFriendly', label: 'Student Friendly', icon: <Building className="w-4 h-4" /> },
                            { id: 'isShortTermLease', label: 'Short Term Lease', icon: <Clock className="w-4 h-4" /> }
                          ].map((feature) => (
                            <motion.button
                              key={feature.id}
                              onClick={() => updateFilter(feature.id, !localFilters[feature.id])}
                              className={`w-full p-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 ${
                                localFilters[feature.id]
                                  ? 'border-[#51faaa] bg-[#51faaa]/10 text-[#0a0c19]'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                              whileHover={{ scale: 1.01, x: 4 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              {feature.icon}
                              <span className="font-medium">{feature.label}</span>
                              {localFilters[feature.id] && (
                                <Check className="w-4 h-4 ml-auto" />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex gap-3">
                <motion.button
                  onClick={handleResetFilters}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </motion.button>
                <motion.button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-semibold hover:shadow-lg hover:shadow-[#51faaa]/30 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdvancedFilterPanel;
