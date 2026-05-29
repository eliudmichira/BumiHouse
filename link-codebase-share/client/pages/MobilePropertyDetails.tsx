import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Mail,
  MapPin,
  Home,
  Building,
  Star,
  Bed,
  Bath,
  Car,
  Wifi,
  Waves,
  Dumbbell,
  Shield,
  TreePine,
  Calendar,
  Eye,
  TrendingUp,
  Loader2,
  RefreshCw,
  X
} from "lucide-react";
import { useTheme } from "../src/context/ThemeContext";
import { useProperty } from "../src/hooks/useProperties";
import { formatKes } from "../src/services/aiInsights";

const MobilePropertyDetails = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: property, isLoading, isError, refetch } = useProperty(id);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    if (property) {
      // Reset image index when property changes
      setCurrentImageIndex(0);
    }
  }, [property]);

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const toggleContactOptions = () => {
    setShowContactOptions(!showContactOptions);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.name || property?.title || 'Property',
        text: `Check out this property: ${property?.name || property?.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCall = () => {
    // In a real app, this would show the agent's phone number
    alert('This would show the agent\'s contact information');
  };

  const handleEmail = () => {
    // In a real app, this would open email client
    alert('This would open email client with agent\'s email');
  };

  const getPropertyImages = () => {
    if (property?.images && property.images.length > 0) {
      return property.images;
    }
    if (property?.image) {
      return [property.image];
    }
    return ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'];
  };

  const getPropertyName = () => {
    return property?.name || property?.title || 'Property';
  };

  const getPropertyLocation = () => {
    if (property?.location) {
      // Handle location object with nested properties
      if (typeof property.location === 'object') {
        if (property.location.city) {
          return property.location.city;
        }
        if (property.location.address) {
          return property.location.address;
        }
        // If it's an object but no city/address, try to stringify safely
        return 'Location not specified';
      }
      // Handle string location
      return property.location;
    }
    if (property?.address) {
      return property.address;
    }
    return 'Location not specified';
  };

  const formatPrice = (price: any) => {
    if (!price) return 'Price on request';
    if (typeof price === 'string') return price;
    return formatKes(price);
  };

  const getAmenities = () => {
    const amenities = [];
    if (property?.amenities) {
      amenities.push(...property.amenities);
    }
    if (property?.features) {
      amenities.push(...property.features);
    }
    return amenities;
  };

  const amenitiesIcons: { [key: string]: any } = {
    wifi: <Wifi className="w-4 h-4" />,
    parking: <Car className="w-4 h-4" />,
    pool: <Waves className="w-4 h-4" />,
    gym: <Dumbbell className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    garden: <TreePine className="w-4 h-4" />,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#51faaa] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Property Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The property you're looking for doesn't exist or has been removed
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#45e695] transition-colors"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const images = getPropertyImages();
  const amenities = getAmenities();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 mx-4">
            {getPropertyName()}
          </h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Property Images */}
      <section className="relative">
        <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
          <img
            src={images[currentImageIndex]}
            alt={getPropertyName()}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleImageChange(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* View All Images Button */}
          {images.length > 1 && (
            <button
              onClick={() => setShowAllImages(true)}
              className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm hover:bg-black/75 transition-colors"
            >
              View All ({images.length})
            </button>
          )}
        </div>
      </section>

      {/* Property Details */}
      <main className="pb-20">
        <div className="p-4 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {getPropertyName()}
            </h2>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{getPropertyLocation()}</span>
            </div>
            <div className="text-2xl font-bold text-[#51faaa] mb-3">
              {formatPrice(property.price)}
            </div>
            
            {/* Rating */}
            {property.rating && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    {property.rating}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Excellent rating
                </span>
              </div>
            )}
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-3 gap-4">
            {(property.bedrooms || property.bedroom) && (
              <div className="text-center">
                <div className="w-12 h-12 bg-[#51faaa]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Bed className="w-6 h-6 text-[#51faaa]" />
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {property.bedrooms || property.bedroom}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</div>
              </div>
            )}
            
            {(property.bathrooms || property.bathroom) && (
              <div className="text-center">
                <div className="w-12 h-12 bg-[#51faaa]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-[#51faaa]" />
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {property.bathrooms || property.bathroom}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</div>
              </div>
            )}
            
            {property.type && (
              <div className="text-center">
                <div className="w-12 h-12 bg-[#51faaa]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Building className="w-6 h-6 text-[#51faaa]" />
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {property.type}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Type</div>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Amenities
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
                      {amenitiesIcons[amenity.toLowerCase()] || <Home className="w-4 h-4 text-[#51faaa]" />}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Property Details
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              {property.size && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Size</span>
                  <span className="text-gray-900 dark:text-white font-medium">{property.size}</span>
                </div>
              )}
              {property.floor && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Floor</span>
                  <span className="text-gray-900 dark:text-white font-medium">{property.floor}</span>
                </div>
              )}
              {property.yearBuilt && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Year Built</span>
                  <span className="text-gray-900 dark:text-white font-medium">{property.yearBuilt}</span>
                </div>
              )}
              {property.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Listed</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Contact Options */}
      <AnimatePresence>
        {showContactOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowContactOptions(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-t-2xl p-6 w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Agent
                </h3>
                <button
                  onClick={() => setShowContactOptions(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleCall}
                  className="w-full flex items-center gap-3 p-4 bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#45e695] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call Agent
                </button>
                
                <button
                  onClick={handleEmail}
                  className="w-full flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Send Email
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showAllImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onClick={() => setShowAllImages(false)}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <button
                onClick={() => setShowAllImages(false)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="relative w-full max-w-2xl">
                <img
                  src={images[currentImageIndex]}
                  alt={getPropertyName()}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageChange(currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
                    >
                      ←
                    </button>
                    
                    <button
                      onClick={() => handleImageChange(currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
                    >
                      →
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageChange(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex 
                              ? 'bg-white' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={toggleContactOptions}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#51faaa] text-[#111] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
      >
        <Phone className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MobilePropertyDetails;
