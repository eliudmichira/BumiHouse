import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Share, Heart, Phone, Mail, MessageCircle, 
  MapPin, Bed, Bath, Square, Car, Wifi, Shield, 
  Star, Eye, Calendar, Camera, Video, ChevronLeft, 
  ChevronRight, Plus, Minus, Check, X, Navigation,
  Building2, Home, Users, TreePine, Droplets, Flame,
  Snowflake, AirVent, ParkingCircle, Dog, ChefHat,
  Wine, Coffee, Waves, Mountain, Sun, Moon
} from 'lucide-react';
import { 
  PropertyMobileCard, 
  PropertyMobileButton 
} from '../../components/mobile/PropertyMobileNav';
import { MobilePage } from '../../components/mobile/PropertyMobileLayout';

// Mobile Property Details Component
const MobilePropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Mock property data - replace with actual API call
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock property data
        const mockProperty = {
          id: id,
          title: "Modern 3-Bedroom Apartment in Kilimani",
          address: "Kilimani, Nairobi",
          price: 45000000,
          pricePerSqm: 150000,
          bedrooms: 3,
          bathrooms: 2,
          area: 120,
          type: "Apartment",
          images: [
            "/placeholder-property.jpg",
            "/placeholder-property.jpg",
            "/placeholder-property.jpg"
          ],
          amenities: ["Swimming Pool", "Gym", "Parking", "Security", "Garden"],
          description: "This stunning 3-bedroom apartment offers modern living in the heart of Kilimani. Features include spacious living areas, modern kitchen, and beautiful views of the city.",
          features: {
            parking: 2,
            floors: 2,
            yearBuilt: 2020,
            furnished: "Semi-furnished"
          },
          location: {
            latitude: -1.2921,
            longitude: 36.8219,
            address: "Kilimani, Nairobi",
            city: "Nairobi",
            state: "Nairobi"
          },
          agent: {
            name: "John Doe",
            phone: "+254 700 000 000",
            email: "john@example.com",
            avatar: "/placeholder-avatar.jpg"
          },
          postedDate: "2024-01-15",
          views: 1250,
          rating: 4.8
        };
        
        setProperty(mockProperty);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleContact = () => {
    setShowContactForm(true);
  };

  const handleSendMessage = () => {
    // Handle send message
    navigate('/messages');
  };

  const handleViewOnMap = () => {
    // Handle view on map
    navigate('/map');
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'Swimming Pool': <Waves className="w-4 h-4" />,
      'Gym': <Users className="w-4 h-4" />,
      'Parking': <Car className="w-4 h-4" />,
      'Security': <Shield className="w-4 h-4" />,
      'Garden': <TreePine className="w-4 h-4" />,
      'Wifi': <Wifi className="w-4 h-4" />,
      'Air Conditioning': <AirVent className="w-4 h-4" />,
      'Heating': <Flame className="w-4 h-4" />,
      'Pet Friendly': <Dog className="w-4 h-4" />,
      'Kitchen': <ChefHat className="w-4 h-4" />,
      'Balcony': <Sun className="w-4 h-4" />
    };
    return iconMap[amenity] || <Check className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <MobilePage title="Property Details" showBackButton={true}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#51faaa] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Loading property details...</p>
          </div>
        </div>
      </MobilePage>
    );
  }

  if (error || !property) {
    return (
      <MobilePage title="Property Details" showBackButton={true}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Property Not Found</h3>
              <p className="text-gray-400 mb-4">{error || 'This property does not exist'}</p>
              <PropertyMobileButton
                variant="outline"
                onClick={() => navigate('/properties')}
              >
                Back to Properties
              </PropertyMobileButton>
            </div>
          </div>
        </div>
      </MobilePage>
    );
  }

  return (
    <MobilePage 
      title="Property Details" 
      showBackButton={true}
      rightAction={
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share className="w-5 h-5 text-white" />
          </motion.button>
          <motion.button
            onClick={handleToggleFavorite}
            className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </motion.button>
        </div>
      }
    >
      {/* Image Gallery */}
      <div className="relative mb-6">
        <div className="relative h-64 w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
          {property.images[currentImageIndex] && (
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Image Navigation */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/30 transition-colors"
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(Math.min(property.images.length - 1, currentImageIndex + 1))}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/30 transition-colors"
                disabled={currentImageIndex === property.images.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {property.images.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full text-white text-xs">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          )}
        </div>
      </div>

      {/* Property Info */}
      <div className="space-y-6">
        {/* Title and Price */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{property.title}</h1>
          <div className="flex items-center gap-1 text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{property.address}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-[#51faaa]">{formatPrice(property.price)}</p>
              {property.pricePerSqm && (
                <p className="text-sm text-gray-400">{formatPrice(property.pricePerSqm)}/sqm</p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-gray-300">{property.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Eye className="w-3 h-3" />
                <span>{property.views} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <PropertyMobileCard variant="glass">
          <h3 className="text-lg font-semibold text-white mb-4">Property Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-[#51faaa]" />
              <div>
                <p className="text-sm text-gray-400">Bedrooms</p>
                <p className="text-white font-medium">{property.bedrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-[#51faaa]" />
              <div>
                <p className="text-sm text-gray-400">Bathrooms</p>
                <p className="text-white font-medium">{property.bathrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Square className="w-5 h-5 text-[#51faaa]" />
              <div>
                <p className="text-sm text-gray-400">Area</p>
                <p className="text-white font-medium">{property.area} sqm</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-[#51faaa]" />
              <div>
                <p className="text-sm text-gray-400">Parking</p>
                <p className="text-white font-medium">{property.features.parking}</p>
              </div>
            </div>
          </div>
        </PropertyMobileCard>

        {/* Description */}
        <PropertyMobileCard variant="glass">
          <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
          <p className="text-gray-300 leading-relaxed">{property.description}</p>
        </PropertyMobileCard>

        {/* Amenities */}
        <PropertyMobileCard variant="glass">
          <h3 className="text-lg font-semibold text-white mb-4">Amenities</h3>
          <div className="grid grid-cols-2 gap-3">
            {property.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="text-[#51faaa]">
                  {getAmenityIcon(amenity)}
                </div>
                <span className="text-gray-300 text-sm">{amenity}</span>
              </div>
            ))}
          </div>
        </PropertyMobileCard>

        {/* Agent Info */}
        <PropertyMobileCard variant="glass">
          <h3 className="text-lg font-semibold text-white mb-4">Contact Agent</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {property.agent.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{property.agent.name}</p>
              <p className="text-gray-400 text-sm">Property Agent</p>
            </div>
          </div>
          <div className="flex gap-2">
            <PropertyMobileButton
              variant="outline"
              size="sm"
              onClick={() => window.open(`tel:${property.agent.phone}`)}
              className="flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call
            </PropertyMobileButton>
            <PropertyMobileButton
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:${property.agent.email}`)}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </PropertyMobileButton>
          </div>
        </PropertyMobileCard>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          <PropertyMobileButton
            variant="primary"
            fullWidth
            onClick={handleSendMessage}
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Send Message
          </PropertyMobileButton>
          <PropertyMobileButton
            variant="outline"
            fullWidth
            onClick={handleViewOnMap}
            className="flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            View on Map
          </PropertyMobileButton>
        </div>
      </div>
    </MobilePage>
  );
};

export default MobilePropertyDetails;
