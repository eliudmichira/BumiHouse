import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Phone, 
  MessageCircle,
  Eye,
  Star,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Bookmark,
  Filter,
  Zap,
  Crown,
  Shield,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const EnhancedMobilePropertyCard = ({ 
  property, 
  onFavoriteToggle, 
  isFavorite,
  variant = 'default',
  showActions = true,
  showPrice = true,
  showStatus = true,
  onQuickView,
  onContact,
  onShare
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(isFavorite);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const cardRef = useRef(null);
  const imageRef = useRef(null);

  // Haptic feedback simulation
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Handle image loading
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
  };

  // Image navigation
  const nextImage = () => {
    if (property.images && property.images.length > 1) {
      setImageIndex((prev) => (prev + 1) % property.images.length);
      triggerHaptic();
    }
  };

  const prevImage = () => {
    if (property.images && property.images.length > 1) {
      setImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
      triggerHaptic();
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    triggerHaptic();
    setIsLiked(!isLiked);
    onFavoriteToggle?.(property.id, !isLiked);
  };

  // Handle share
  const handleShare = (e) => {
    e.stopPropagation();
    triggerHaptic();
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href
      });
    } else {
      onShare?.(property);
    }
  };

  // Handle quick view
  const handleQuickView = (e) => {
    e.stopPropagation();
    triggerHaptic();
    onQuickView?.(property);
  };

  // Handle contact
  const handleContact = (e) => {
    e.stopPropagation();
    triggerHaptic();
    onContact?.(property);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format price per sqft
  const formatPricePerSqft = (price, area) => {
    if (!area) return '';
    const pricePerSqft = Math.round(price / area);
    return `$${pricePerSqft}/sqft`;
  };

  // Get property status
  const getPropertyStatus = () => {
    if (property.status === 'sold') return { label: 'Sold', color: 'bg-red-500', icon: CheckCircle };
    if (property.status === 'pending') return { label: 'Pending', color: 'bg-yellow-500', icon: Clock };
    if (property.status === 'new') return { label: 'New', color: 'bg-green-500', icon: Zap };
    if (property.status === 'featured') return { label: 'Featured', color: 'bg-purple-500', icon: Crown };
    return { label: 'Available', color: 'bg-blue-500', icon: CheckCircle };
  };

  const status = getPropertyStatus();

  // Get property type color
  const getPropertyTypeColor = () => {
    const types = {
      'apartment': 'from-blue-500 to-blue-600',
      'house': 'from-green-500 to-green-600',
      'villa': 'from-purple-500 to-purple-600',
      'land': 'from-orange-500 to-orange-600',
      'commercial': 'from-red-500 to-red-600'
    };
    return types[property.type?.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  // Auto-advance images on hover
  useEffect(() => {
    let interval;
    if (isHovered && property.images && property.images.length > 1) {
      interval = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % property.images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isHovered, property.images]);

  return (
    <motion.div
      ref={cardRef}
      className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl lg:hidden ${
        isDark ? 'border border-gray-700/50' : 'border border-gray-200/50'
      } ${variant === 'elevated' ? 'shadow-2xl' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => window.open(`/property/${property.id}`, '_blank')}
    >
      {/* Enhanced Image Section */}
      <div className="relative overflow-hidden h-48">
        {property.images && property.images[imageIndex] ? (
          <motion.img
            ref={imageRef}
            src={property.images[imageIndex]}
            alt={property.title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isImageLoading ? 'blur-sm' : 'blur-0'
            }`}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div className={`w-12 h-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Square className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isImageLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/50 flex items-center justify-center"
          >
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {/* Property Status Badge */}
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute top-3 left-3 ${status.color} text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}
          >
            <status.icon className="w-3 h-3" />
            <span>{status.label}</span>
          </motion.div>
        )}

        {/* Property Type Badge */}
        {property.type && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`absolute top-3 right-3 bg-gradient-to-r ${getPropertyTypeColor()} text-white px-2 py-1 rounded-full text-xs font-semibold`}
          >
            {property.type}
          </motion.div>
        )}

        {/* Image Navigation Dots */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {property.images.map((_, index) => (
              <motion.button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === imageIndex
                    ? 'bg-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>
        )}

        {/* Image Navigation Arrows */}
        {property.images && property.images.length > 1 && (
          <>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </>
        )}

        {/* Quick Actions Overlay */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-4"
            >
              <motion.button
                onClick={handleQuickView}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Eye className="w-5 h-5 text-white" />
              </motion.button>
              <motion.button
                onClick={handleContact}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Phone className="w-5 h-5 text-white" />
              </motion.button>
              <motion.button
                onClick={handleShare}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="w-5 h-5 text-white" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-3 right-3 flex space-x-2">
            <motion.button
              onClick={handleFavoriteToggle}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Enhanced Content Section */}
      <div className="p-4 space-y-3">
        {/* Price Section */}
        {showPrice && (
          <div className="flex items-center justify-between">
            <div>
              <motion.div 
                className="text-xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {formatPrice(property.price)}
              </motion.div>
              {property.area && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatPricePerSqft(property.price, property.area)}
                </div>
              )}
            </div>
            {property.priceChange && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  property.priceChange > 0 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {property.priceChange > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(property.priceChange)}%</span>
              </motion.div>
            )}
          </div>
        )}

        {/* Title and Location */}
        <div>
          <motion.h3 
            className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {property.title}
          </motion.h3>
          <motion.div 
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{property.location}</span>
          </motion.div>
        </div>

        {/* Property Features */}
        <motion.div 
          className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {property.bedrooms && (
            <div className="flex items-center space-x-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} beds</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center space-x-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} baths</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center space-x-1">
              <Square className="w-4 h-4" />
              <span>{property.area} sqft</span>
            </div>
          )}
        </motion.div>

        {/* Description */}
        {property.description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className={`text-sm text-gray-600 dark:text-gray-400 ${
              showFullDescription ? '' : 'line-clamp-2'
            }`}>
              {property.description}
            </p>
            {property.description.length > 100 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                className="text-sm text-[#51faaa] hover:text-[#dbd5a4] mt-1"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </motion.div>
        )}

        {/* Property Highlights */}
        {property.highlights && property.highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-1"
          >
            {property.highlights.slice(0, 3).map((highlight, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
              >
                {highlight}
              </span>
            ))}
            {property.highlights.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                +{property.highlights.length - 3} more
              </span>
            )}
          </motion.div>
        )}

        {/* Agent Info */}
        {property.agent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-[#0a0c19]">
                {property.agent.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {property.agent.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {property.agent.company}
              </p>
            </div>
            {property.agent.verified && (
              <Shield className="w-4 h-4 text-green-500" />
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex space-x-2 pt-2"
        >
          <motion.button
            onClick={handleContact}
            className="flex-1 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] py-2 rounded-xl font-semibold text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Contact Agent
          </motion.button>
          <motion.button
            onClick={handleQuickView}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Quick View
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnhancedMobilePropertyCard;
