import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Users,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import VacancyTracker from './VacancyTracker';

const EnhancedPropertyCard = ({ property, onFavoriteToggle, isFavorite, onVacancyUpdate }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
  };

  const nextImage = () => {
    if (property.images && property.images.length > 1) {
      setImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property.images && property.images.length > 1) {
      setImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPricePerSqft = (price, area) => {
    if (!area) return '';
    const pricePerSqft = Math.round(price / area);
    return `$${pricePerSqft}/sqft`;
  };

  // Get vacancy urgency indicator
  const getVacancyUrgency = () => {
    if (!property.totalUnits || property.totalUnits === 0) return null;
    
    const vacancyPercentage = (property.availableUnits / property.totalUnits) * 100;
    
    if (property.availableUnits === 0) {
      return { type: 'full', icon: Users, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/20' };
    } else if (property.availableUnits === 1) {
      return { type: 'last', icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/20' };
    } else if (vacancyPercentage <= 20) {
      return { type: 'limited', icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
    }
    return null;
  };

  const vacancyUrgency = getVacancyUrgency();
  const UrgencyIcon = vacancyUrgency?.icon;

  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl ${
      isDark ? 'border border-gray-700' : 'border border-gray-200'
    }`}>
      {/* Image Section */}
      <div className="relative overflow-hidden h-48">
        {property.images && property.images[imageIndex] ? (
          <img
            src={property.images[imageIndex]}
            alt={property.title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isImageLoading ? 'blur-sm' : 'blur-0'
            }`}
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

        {/* Vacancy Urgency Badge */}
        {vacancyUrgency && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full ${vacancyUrgency.bgColor} border border-white/20`}>
            <div className="flex items-center space-x-1">
              <UrgencyIcon className={`w-3 h-3 ${vacancyUrgency.color}`} />
              <span className={`text-xs font-medium ${vacancyUrgency.color}`}>
                {vacancyUrgency.type === 'full' ? 'Full' : 
                 vacancyUrgency.type === 'last' ? 'Last Unit' : 'Limited'}
              </span>
            </div>
          </div>
        )}

        {/* Image Navigation Dots */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {property.images.map((_, index) => (
              <button
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
              />
            ))}
          </div>
        )}

        {/* Image Navigation Arrows */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <span className="text-sm">‹</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <span className="text-sm">›</span>
            </button>
          </>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onFavoriteToggle) onFavoriteToggle(property.id);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({
                  title: property.title,
                  text: `Check out this property: ${property.title}`,
                  url: window.location.href,
                });
              }
            }}
            className="w-10 h-10 bg-white/90 text-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Property Status Badge */}
        {property.status && (
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              property.status === 'For Sale'
                ? 'bg-green-500 text-white'
                : property.status === 'For Rent'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-500 text-white'
            }`}>
              {property.status}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Price and Rating */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPrice(property.price)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatPricePerSqft(property.price, property.area)}
            </p>
          </div>
          {property.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {property.rating}
              </span>
            </div>
          )}
        </div>

        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-2">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.address || property.location?.address || 'Location not specified'}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms || 0} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms || 0} baths</span>
            </div>
            {property.area && (
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                <span>{property.area.toLocaleString()} sqft</span>
              </div>
            )}
          </div>
        </div>

        {/* Vacancy Information */}
        {property.totalUnits && property.totalUnits > 0 && (
          <div className="mb-4">
            <VacancyTracker 
              property={property} 
              onVacancyUpdate={onVacancyUpdate}
            />
          </div>
        )}

        {/* Agent Info */}
        {property.agent && (
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={property.agent.avatar || '/default-avatar.png'}
                  alt={property.agent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {property.agent.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {property.agent.experience || 'Real Estate Agent'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {property.agent.rating || 4.5}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/property/${property.id}`}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-semibold transition-all hover:shadow-lg"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Link>
          
          <button className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
            <Phone className="w-5 h-5" />
          </button>
          
          <button className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPropertyCard;
