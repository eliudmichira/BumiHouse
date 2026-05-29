import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  Star, 
  Eye, 
  Phone, 
  MessageCircle,
  Calendar,
  TrendingUp,
  Shield,
  Wifi,
  Droplets,
  TreePine,
  Building,
  Sparkles,
  ChevronRight,
  Clock,
  Users,
  Zap,
  Home
} from 'lucide-react';

const PropertyCard = ({ 
  property, 
  isFavorite = false, 
  onToggleFavorite, 
  onViewDetails,
  onQuickView,
  onShare,
  onContact,
  viewMode = 'grid',
  index = 0,
  isHighlighted = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef(null);

  const images = property.images || [property.image] || ['/placeholder-property.jpg'];
  const hasMultipleImages = images.length > 1;

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const propertyDate = new Date(date);
    const diffTime = Math.abs(now - propertyDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return propertyDate.toLocaleDateString();
  };

  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'apartment':
      case 'flat':
        return <Building className="w-4 h-4" />;
      case 'house':
      case 'villa':
        return <Home className="w-4 h-4" />;
      case 'land':
        return <TreePine className="w-4 h-4" />;
      case 'commercial':
        return <Building className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, delay: 0.2 }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        ref={cardRef}
        className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 ${
          isHighlighted ? 'ring-2 ring-[#51faaa] ring-opacity-50' : ''
        }`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="flex h-48">
          {/* Image Section */}
          <div className="relative w-80 flex-shrink-0">
            <motion.div
              className="relative w-full h-full overflow-hidden"
              variants={imageVariants}
            >
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}
              <img
                src={images[currentImageIndex]}
                alt={property.title || property.address}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
              
              {/* Image Navigation */}
              {hasMultipleImages && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
                  <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-1">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex 
                            ? 'bg-white scale-125' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {property.status && (
                <motion.div
                  className="absolute top-3 left-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.status === 'new' 
                      ? 'bg-green-500 text-white' 
                      : property.status === 'featured'
                      ? 'bg-[#51faaa] text-[#0a0c19]'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {property.status === 'new' ? 'New' : property.status === 'featured' ? 'Featured' : property.status}
                  </span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                className="absolute top-3 right-3 flex flex-col gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(property);
                  }}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart 
                    className={`w-4 h-4 transition-colors duration-300 ${
                      isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-400'
                    }`} 
                  />
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.(property);
                  }}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Content Section */}
          <motion.div
            className="flex-1 p-6 flex flex-col justify-between"
            variants={contentVariants}
          >
            <div>
              {/* Price and Type */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <motion.h3 
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
                    whileHover={{ color: '#51faaa' }}
                    transition={{ duration: 0.2 }}
                  >
                    {formatPrice(property.price)}
                  </motion.h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {getPropertyTypeIcon(property.type)}
                    <span className="capitalize">{property.type || 'Property'}</span>
                    {property.dateAdded && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(property.dateAdded)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {property.rating && (
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {property.rating}
                      </span>
                    </div>
                  )}
                  {property.views && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>{property.views} views</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title and Location */}
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                {property.title || property.address}
              </h4>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm line-clamp-1">
                  {(() => {
                    // Safely extract location string from object or use as string
                    if (property.address) return property.address;
                    if (typeof property.location === 'string') {
                      return property.location;
                    } else if (property.location && typeof property.location === 'object') {
                      return property.location.address || property.location.city || property.location.state || '';
                    }
                    return 'Location not specified';
                  })()}
                </span>
              </div>

              {/* Property Details */}
              <div className="flex items-center gap-6 mb-4">
                {property.bedrooms && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Bed className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Bath className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.bathrooms}</span>
                  </div>
                )}
                {property.sqft && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Square className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.sqft} sqft</span>
                  </div>
                )}
                {property.parking && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Car className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.parking}</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {property.amenities.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400"
                    >
                      {amenity}
                    </span>
                  ))}
                  {property.amenities.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{property.amenities.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => onViewDetails?.(property)}
                className="flex-1 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#51faaa]/30 transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>View Details</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => onContact?.(property)}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
              <motion.button
                onClick={() => onContact?.(property)}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      ref={cardRef}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 ${
        isHighlighted ? 'ring-2 ring-[#51faaa] ring-opacity-50' : ''
      }`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <motion.div
          className="relative w-full h-full"
          variants={imageVariants}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
          <img
            src={images[currentImageIndex]}
            alt={property.title || property.address}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          
          {/* Price Overlay - Bottom Left */}
          <motion.div
            className="absolute bottom-3 left-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-white font-bold text-lg">
                {formatPrice(property.price)}
              </p>
              <p className="text-white/80 text-xs">
                {property.priceType || 'per month'}
              </p>
            </div>
          </motion.div>
          
          {/* Image Navigation */}
          {hasMultipleImages && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
              <div className="absolute bottom-3 right-3 flex gap-1">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status Badge - Top Left */}
          {property.status && (
            <motion.div
              className="absolute top-3 left-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                property.status === 'new' 
                  ? 'bg-green-500 text-white' 
                  : property.status === 'featured'
                  ? 'bg-[#51faaa] text-[#0a0c19]'
                  : 'bg-blue-500 text-white'
              }`}>
                {property.status === 'featured' && <Star className="w-3 h-3 fill-current" />}
                {property.status === 'new' ? 'New' : property.status === 'featured' ? 'Featured' : property.status}
              </span>
            </motion.div>
          )}

          {/* Action Buttons - Top Right */}
          <motion.div
            className="absolute top-3 right-3 flex flex-col gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(property);
              }}
              className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart 
                className={`w-4 h-4 transition-colors duration-300 ${
                  isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-400'
                }`} 
              />
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(property);
              }}
              className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </motion.div>

          {/* Quick View Button - Bottom Right */}
          <motion.div
            className="absolute bottom-3 right-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView?.(property);
              }}
              className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-3 h-3" />
              Quick View
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Content Section */}
      <motion.div
        className="p-5 pb-6"
        variants={contentVariants}
      >
        {/* Title and Location */}
        <div className="mb-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {property.title || property.address}
          </h4>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">
              {(() => {
                // Safely extract location string from object or use as string
                if (property.address) return property.address;
                if (typeof property.location === 'string') {
                  return property.location;
                } else if (property.location && typeof property.location === 'object') {
                  return property.location.address || property.location.city || property.location.state || '';
                }
                return 'Location not specified';
              })()}
            </span>
          </div>
        </div>

        {/* Property Details with Icons */}
        <div className="flex items-center gap-4 mb-3">
          {property.bedrooms && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Bed className="w-4 h-4" />
              <span className="text-sm font-medium">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Bath className="w-4 h-4" />
              <span className="text-sm font-medium">{property.bathrooms}</span>
            </div>
          )}
          {property.sqft && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Square className="w-4 h-4" />
              <span className="text-sm font-medium">{property.sqft}m²</span>
            </div>
          )}
        </div>

        {/* Status and Rating Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {property.views && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="w-3 h-3" />
                <span>{property.views} views</span>
              </div>
            )}
            {property.dateAdded && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(property.dateAdded)}</span>
              </div>
            )}
          </div>
          {property.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {property.rating}
              </span>
            </div>
          )}
        </div>

        {/* Availability Status */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Available Now
            </span>
            {property.daysOnMarket && (
              <span className="text-xs text-gray-500">
                {property.daysOnMarket} days on market
              </span>
            )}
          </div>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-xs text-gray-500">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onViewDetails?.(property)}
            className="flex-1 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] py-2.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#51faaa]/30 transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>View Details</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => onContact?.(property)}
            className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PropertyCard;