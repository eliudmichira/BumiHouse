import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Search, MapPin, Home, Award, Users, Building2, Star, Shield, Sparkles,
  ChevronRight, Check, TrendingUp, Phone, Mail, MessageCircle, Play,
  ArrowRight, Zap, Globe, Heart, Eye, Bed, Bath, Square, 
  Wifi, Car, Trees, Mountain, Waves, Coffee, Dumbbell, ShoppingBag,
  X, Share2, Filter, Map, MessageSquare, PhoneCall
} from 'lucide-react';
import Hero from '../../components/hero/Hero';
import { useTheme } from '../../context/ThemeContext';
import { useFeaturedProperties } from '../../hooks/useProperties';
import { SpinnerLoader } from '../../components/Preloader';
import { SimpleSpinner } from '../../components/SimpleLoadingStates';
import { 
  GoogleLevelSearchBar, 
  GoogleLevelFeatureCard 
} from '../../components/enhanced/GoogleLevelHomeSections';
import { 
  GoogleLevelPropertyCard, 
  GoogleLevelTestimonialCard 
} from '../../components/enhanced/GoogleLevelPropertyShowcase';
import { testimonialsAPI } from '../../lib/firebaseAPI';

// Custom hooks
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

const useParallax = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return offset;
};

// Minimal Premium Property Card Component
function PropertyCard({ property, index, onClick }) {
  const { isDark } = useTheme();
  const [isSaved, setIsSaved] = useState(false);
  
  // Debug logging to identify the issue
  React.useEffect(() => {
    if (property && property.location && typeof property.location === 'object') {
      console.log('🔍 Property location object:', property.location);
      console.log('🔍 Property location type:', typeof property.location);
      console.log('🔍 Property location keys:', Object.keys(property.location));
    }
  }, [property]);

  const handleContactAgent = (e) => {
    e.stopPropagation();
    window.open(`https://wa.me/254700000000?text=Hi, I'm interested in ${property.title}`, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div 
      className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
        isDark 
          ? 'bg-[#10121e] shadow-lg hover:shadow-2xl hover:shadow-[#51faaa]/20 hover:border hover:border-[#51faaa]/30' 
          : 'bg-white shadow-lg hover:shadow-2xl hover:shadow-[#51faaa]/20 hover:border hover:border-[#51faaa]/30'
      }`}
      onClick={onClick}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Featured Badge - only if property marks it */}
        {(property.featured || property.is_featured) && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md bg-white/90 text-gray-900 shadow-sm group-hover:shadow-lg group-hover:shadow-[#51faaa]/20 transition-all duration-300">
              ⭐ Featured
            </span>
          </div>
        )}
        
        {/* Minimal Save Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-[#51faaa]/20"
        >
          <Heart className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>

        {/* Minimal Property Features */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-white text-sm">
            <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Bed className="w-4 h-4" />
              <span className="font-medium">{property.bedrooms}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Bath className="w-4 h-4" />
              <span className="font-medium">{property.bathrooms}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Square className="w-4 h-4" />
              <span className="font-medium">{property.area?.toLocaleString()}</span>
            </span>
          </div>
        </div>


      </div>
      
      {/* Minimal Property Details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={`text-xl font-semibold mb-2 leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {property.title}
            </h3>
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className={`w-4 h-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`} />
              <p className={`text-sm ${
                isDark ? 'text-white/70' : 'text-gray-600'
              }`}>
                {(() => {
                  // Safely extract address from location object or fallback to property.address
                  if (typeof property.location === 'string') {
                    return property.location;
                  } else if (property.location && typeof property.location === 'object') {
                    return property.location.address || property.location.city || property.location.state || '';
                  }
                  return property.address || '';
                })()}
              </p>
            </div>
          </div>
          {typeof property.rating === 'number' && (
            <div className="flex items-center gap-1.5 bg-yellow-500 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-white fill-current" />
              <span className="text-white text-sm font-medium">
                {property.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        {/* Price Display */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {formatPrice(property.price)}
            </div>
            {(
              typeof property.listing_type === 'string' && property.listing_type.toLowerCase() === 'rent'
            ) && (
              <div className={`text-xs ${
                isDark ? 'text-white/60' : 'text-gray-500'
              }`}>
                per month
              </div>
            )}
          </div>
          <div className="text-right">
            {property.status && (
              <div className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {property.status}
              </div>
            )}
            {typeof property.days_on_market === 'number' && (
              <div className={`text-xs ${
                isDark ? 'text-white/60' : 'text-gray-500'
              }`}>
                {property.days_on_market} days on market
              </div>
            )}
          </div>
        </div>

        {/* Amenities - show only what exists */}
        {(() => {
          const amenities = Array.isArray(property.amenities) ? property.amenities.map(a => String(a).toLowerCase()) : [];
          const features = Array.isArray(property.features) ? property.features.map(f => String(f).toLowerCase()) : [];
          const hasWifi = amenities.includes('wifi') || amenities.includes('fibre') || features.includes('wifi');
          const hasParking = amenities.includes('parking') || features.includes('parking') || property.hasParking;
          const hasGarden = amenities.includes('garden') || features.includes('garden');
          const chips = [
            hasWifi && { key: 'wifi', icon: <Wifi className="w-3 h-3" />, label: 'WiFi' },
            hasParking && { key: 'parking', icon: <Car className="w-3 h-3" />, label: 'Parking' },
            hasGarden && { key: 'garden', icon: <Trees className="w-3 h-3" />, label: 'Garden' }
          ].filter(Boolean);
          return chips.length > 0 ? (
            <div className="flex items-center gap-4 text-xs">
              {chips.map(chip => (
                <span key={chip.key} className={`flex items-center gap-1 ${
                  isDark ? 'text-white/70' : 'text-gray-600'
                }`}>
                  {chip.icon}
                  <span>{chip.label}</span>
                </span>
              ))}
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}

const HomePage = () => { 
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [remoteTestimonials, setRemoteTestimonials] = useState([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', location: '', rating: 5, comment: '' });
  const { isDark } = useTheme();
  
  // Get featured properties from Firebase
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedProperties(6);
  const featuredProperties = featuredData?.properties || [];

  // Navigation handlers
  const handlePropertyTypeClick = (type) => {
    window.location.href = `/properties?propertyType=${type}`;
  };

  const handlePropertyCardClick = (propertyId) => {
    window.location.href = `/property/${propertyId}`;
  };

  const handleStartSearching = () => {
    window.location.href = '/properties';
  };

  const handleScheduleCall = () => {
    window.location.href = '/contact';
  };

  const featuredRef = useRef(null);
  const testimonialsRef = useRef(null);
  const scrollByAmount = (ref, amount) => {
    if (!ref?.current) return;
    ref.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Enhanced auto-scroll carousels with smooth infinite loop
  useEffect(() => {
    const setupAutoScroll = (el, speed = 0.8) => {
      if (!el) return () => {};
      let raf;
      let paused = false;
      let direction = 1; // 1 for forward, -1 for backward

      const onEnter = () => { paused = true; };
      const onLeave = () => { paused = false; };
      const onVisibility = () => { paused = document.hidden; };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      document.addEventListener('visibilitychange', onVisibility);

      const step = () => {
        if (!paused) {
          el.scrollLeft += speed * direction;
          
          // Check if we need to reverse direction or reset
          if (direction === 1 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
            // Smooth reset to beginning
            el.scrollTo({ left: 0, behavior: 'smooth' });
            setTimeout(() => {
              el.scrollLeft = 0;
            }, 500);
          } else if (direction === -1 && el.scrollLeft <= 0) {
            // Smooth reset to end
            el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: 'smooth' });
            setTimeout(() => {
              el.scrollLeft = el.scrollWidth - el.clientWidth;
            }, 500);
          }
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);

      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    };

    const cleanupFeatured = setupAutoScroll(featuredRef.current, 1.5);
    const cleanupTestimonials = setupAutoScroll(testimonialsRef.current, 1.0);
    return () => {
      cleanupFeatured && cleanupFeatured();
      cleanupTestimonials && cleanupTestimonials();
    };
  }, []);

  // Load testimonials from Firestore with fallback
  useEffect(() => {
    (async () => {
      try {
        const items = await testimonialsAPI.getAll(12);
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map((t) => ({
            name: t.name,
            location: t.location || '',
            rating: t.rating || 5,
            quote: (t.comment || t.quote || '').replace(/virtual tours?/gi, 'photo tours'),
            avatar: t.avatar || getKenyanAvatar(t.name)
          }));
          setRemoteTestimonials(mapped);
        } else {
          // fallback to local static testimonials mapped to quote
          const mappedLocal = testimonials.map((t) => ({ ...t, quote: t.comment, avatar: t.avatar || getKenyanAvatar(t.name) }));
          setRemoteTestimonials(mappedLocal);
        }
      } catch (e) {
        const mappedLocal = testimonials.map((t) => ({ ...t, quote: t.comment, avatar: t.avatar || getKenyanAvatar(t.name) }));
        setRemoteTestimonials(mappedLocal);
      } finally {
        setIsLoadingTestimonials(false);
      }
    })();
  }, []);

  const handleSubmitReview = async () => {
    try {
      if (!reviewForm.name || !reviewForm.comment) return;
      const payload = {
        name: reviewForm.name,
        location: reviewForm.location,
        rating: Number(reviewForm.rating) || 5,
        comment: reviewForm.comment,
        avatar: ''
      };
      await testimonialsAPI.create(payload);
      // Optimistically update UI
      setRemoteTestimonials((prev) => [
        { name: payload.name, location: payload.location, rating: payload.rating, quote: payload.comment, avatar: payload.avatar },
        ...prev
      ]);
      setIsAddReviewOpen(false);
      setReviewForm({ name: '', location: '', rating: 5, comment: '' });
    } catch (e) {
      console.error('Failed to submit review', e);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'
    }`}>
      {/* Original Hero Section */}
      <Hero />

      {/* Google-Level Property Types Section */}
      <motion.section 
        className={`py-24 transition-colors duration-500 relative overflow-hidden ${
          isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${isDark ? '#51faaa' : '#51faaa'} 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Find Your Perfect Home
              </span>
            </motion.h2>
            <motion.p 
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? 'text-white/80' : 'text-gray-600'
              }`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Explore different property types and find the one that matches your lifestyle
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {propertyTypes.map((type, index) => (
              <motion.button
                key={type.id}
                onClick={() => handlePropertyTypeClick(type.id)}
                className={`group p-6 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isDark 
                    ? 'bg-[#10121e] shadow-md hover:shadow-lg hover:shadow-[#51faaa]/20 hover:border hover:border-[#51faaa]/30' 
                    : 'bg-white shadow-md hover:shadow-lg hover:shadow-[#51faaa]/20 hover:border hover:border-[#51faaa]/30'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Gradient on Hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#51faaa]/5 to-[#dbd5a4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1 }}
                />
                
                <div className="relative z-10">
                  <motion.div 
                    className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 group-hover:shadow-lg group-hover:shadow-[#51faaa]/20 transition-all duration-300 ${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    }`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <type.icon className={`w-6 h-6 transition-colors duration-300 group-hover:text-[#51faaa] ${
                      isDark ? 'text-white/80' : 'text-gray-600'
                    }`} />
                  </motion.div>
                  
                  <motion.h3 
                    className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {type.name}
                  </motion.h3>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Premium Featured Properties Section */}
      <section className={`py-24 transition-colors duration-500 relative ${
        isDark ? 'bg-[#0a0c19]' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Minimal Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              isDark ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-600'
            }">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium tracking-wide uppercase">Premium Featured</span>
            </div>
            
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Featured Properties
            </h2>
            <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${
              isDark ? 'text-white/70' : 'text-gray-600'
            }`}>
              Discover our exclusive handpicked selection of premium properties across Kenya. 
              These featured listings receive maximum visibility and premium placement.
            </p>
            
            {/* Minimal Stats */}
            <div className="flex items-center justify-center gap-12 mt-10">
              <div className="text-center">
                <div className={`text-2xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>500+</div>
                <div className={`text-xs uppercase tracking-wide ${
                  isDark ? 'text-white/50' : 'text-gray-500'
                }`}>Daily Views</div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>98%</div>
                <div className={`text-xs uppercase tracking-wide ${
                  isDark ? 'text-white/50' : 'text-gray-500'
                }`}>Response Rate</div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>24/7</div>
                <div className={`text-xs uppercase tracking-wide ${
                  isDark ? 'text-white/50' : 'text-gray-500'
                }`}>Support</div>
              </div>
            </div>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center space-y-4">
                <div className="relative">
                  {/* Simple spinning ring */}
                  <div className="w-16 h-16 rounded-full border-2 border-[#51faaa]/20 border-t-[#51faaa] animate-spin" style={{ animationDuration: '2s' }} />
                  
                  {/* Center logo */}
                  <div className="absolute inset-4 w-8 h-8 rounded-full bg-[#51faaa] flex items-center justify-center shadow-lg">
                    <div className="text-[#0a0c19] font-bold text-sm">M</div>
                  </div>
                </div>
                <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Discovering amazing properties...
                </p>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full bg-[#51faaa] animate-pulse`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="relative">
              {/* Minimal Navigation Arrows */}
              <button 
                onClick={() => scrollByAmount(featuredRef, -400)}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDark 
                    ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md' 
                    : 'bg-white text-gray-900 hover:bg-gray-100 shadow-md border border-gray-200'
                }`}
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              
              <button 
                onClick={() => scrollByAmount(featuredRef, 400)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDark 
                    ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md' 
                    : 'bg-white text-gray-900 hover:bg-gray-100 shadow-md border border-gray-200'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div ref={featuredRef} className="flex gap-6 overflow-hidden scroll-smooth pb-12 pt-6 px-8" style={{ scrollBehavior: 'smooth' }}>
                {featuredProperties.map((property, index) => (
                  <div key={property.id} className="min-w-[320px] md:min-w-[360px] lg:min-w-[400px] flex-shrink-0">
                    <PropertyCard 
                      property={property} 
                      index={index} 
                      onClick={() => handlePropertyCardClick(property.id)}
                    />
                  </div>
                ))}
              </div>
              
                              
                {/* Subtle edge fade overlays */}
                <div className={`pointer-events-none absolute inset-y-0 left-0 w-32 z-5 ${isDark ? 'bg-gradient-to-r from-[#0a0c19]/80 via-[#0a0c19]/40 to-transparent' : 'bg-gradient-to-r from-white/80 via-white/40 to-transparent'}`}></div>
                <div className={`pointer-events-none absolute inset-y-0 right-0 w-32 z-5 ${isDark ? 'bg-gradient-to-l from-[#0a0c19]/80 via-[#0a0c19]/40 to-transparent' : 'bg-gradient-to-l from-white/80 via-white/40 to-transparent'}`}></div>
                
                                {/* Minimal Scroll Indicators */}
                <div className="flex justify-center items-center gap-2 mt-8">
                {featuredProperties.slice(0, 3).map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === 0 
                        ? 'bg-gray-900 dark:bg-white w-6' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className={`text-lg ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                No featured properties available at the moment.
              </p>
            </div>
          )}
          
          {/* Minimal CTA Section */}
          <div className="mt-16 text-center">
            <h3 className={`text-2xl font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Want to feature your property?
            </h3>
            <p className={`text-sm max-w-lg mx-auto mb-6 ${
              isDark ? 'text-white/70' : 'text-gray-600'
            }`}>
              Get maximum exposure to thousands of qualified buyers and renters.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button 
                onClick={() => window.location.href = '/contact'}
                className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-medium rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Sales
              </button>
              <button 
                onClick={() => window.location.href = '/properties'}
                className={`px-6 py-3 border-2 font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${
                  isDark 
                    ? 'border-[#51faaa] text-[#51faaa] hover:bg-[#51faaa] hover:text-[#111]' 
                    : 'border-[#51faaa] text-[#51faaa] hover:bg-[#51faaa] hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                View All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className={`py-24 transition-colors duration-500 ${
        isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Why Choose Hama Estate?
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDark ? 'text-white/80' : 'text-gray-600'
            }`}>
              Experience the future of real estate with our innovative platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <GoogleLevelFeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-24 transition-colors duration-500 ${
        isDark ? 'bg-[#10121e]' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Loved by Thousands
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDark ? 'text-white/80' : 'text-gray-600'
            }`}>
              See what our customers have to say about their experience
            </p>
          </div>
          
          <div className="relative">
            <div ref={testimonialsRef} className="flex gap-8 overflow-hidden scroll-smooth pb-2">
              {(isLoadingTestimonials ? testimonials.map((t)=>({ ...t, quote: t.comment })) : remoteTestimonials).map((testimonial, index) => (
                <div key={index} className="min-w-[320px] md:min-w-[400px] lg:min-w-[450px] flex-shrink-0">
                  <GoogleLevelTestimonialCard 
                    testimonial={testimonial}
                    index={index}
                  />
                </div>
              ))}
            </div>
            {/* Edge fade overlays */}
            <div className={`pointer-events-none absolute inset-y-0 left-0 w-16 z-10 ${isDark ? 'bg-gradient-to-r from-[#10121e] to-transparent' : 'bg-gradient-to-r from-white to-transparent'}`}></div>
            <div className={`pointer-events-none absolute inset-y-0 right-0 w-16 z-10 ${isDark ? 'bg-gradient-to-l from-[#10121e] to-transparent' : 'bg-gradient-to-l from-white to-transparent'}`}></div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setIsAddReviewOpen(true)}
                className={`px-5 py-2 rounded-full border ${isDark ? 'border-white/30 text-white/80 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition`}
              >
                Add a review
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <motion.section 
        className={`py-24 transition-colors duration-500 relative overflow-hidden ${
          isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                isDark ? 'bg-[#51faaa]/30' : 'bg-[#51faaa]/20'
              }`}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1.2
              }}
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + i * 8}%`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Ready to Find Your Dream Home?
              </span>
            </motion.h2>
            
            <motion.p 
              className={`text-xl mb-8 max-w-2xl mx-auto ${
                isDark ? 'text-white/80' : 'text-gray-600'
              }`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Start your journey today and discover the perfect property that matches your lifestyle
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.button
              onClick={handleStartSearching}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-semibold rounded-full overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Start Searching
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
            
            <motion.button
              onClick={handleScheduleCall}
              className={`px-8 py-4 border-2 rounded-full font-semibold transition-all duration-300 relative overflow-hidden group ${
                isDark 
                  ? 'border-[#51faaa] text-[#51faaa] hover:bg-[#51faaa] hover:text-[#111]' 
                  : 'border-[#51faaa] text-[#51faaa] hover:bg-[#51faaa] hover:text-white'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Schedule a Call
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsVideoModalOpen(false)}>
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 hover:bg-black/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <Play className="w-20 h-20 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {isAddReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setIsAddReviewOpen(false)}>
          <div className={`w-full max-w-lg rounded-2xl p-6 ${isDark ? 'bg-[#0f1222] text-white' : 'bg-white text-gray-900'}`} onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Add a review</h3>
              <button onClick={()=>setIsAddReviewOpen(false)} className={`rounded-full w-8 h-8 flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input value={reviewForm.name} onChange={(e)=>setReviewForm({...reviewForm, name: e.target.value})} className={`w-full rounded-lg px-3 py-2 outline-none ${isDark ? 'bg-white/10 border border-white/10' : 'bg-gray-50 border border-gray-200'}`} placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm mb-1">Location</label>
                <input value={reviewForm.location} onChange={(e)=>setReviewForm({...reviewForm, location: e.target.value})} className={`w-full rounded-lg px-3 py-2 outline-none ${isDark ? 'bg-white/10 border border-white/10' : 'bg-gray-50 border border-gray-200'}`} placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-sm mb-1">Rating</label>
                <select value={reviewForm.rating} onChange={(e)=>setReviewForm({...reviewForm, rating: e.target.value})} className={`w-full rounded-lg px-3 py-2 outline-none ${isDark ? 'bg-white/10 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  {[5,4,3,2,1].map(r=> <option key={r} value={r}>{r} stars</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Your review</label>
                <textarea value={reviewForm.comment} onChange={(e)=>setReviewForm({...reviewForm, comment: e.target.value})} rows={4} className={`w-full rounded-lg px-3 py-2 outline-none ${isDark ? 'bg-white/10 border border-white/10' : 'bg-gray-50 border border-gray-200'}`} placeholder="Share your experience" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={()=>setIsAddReviewOpen(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>Cancel</button>
                <button onClick={handleSubmitReview} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-semibold">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Data
const propertyTypes = [
  { id: 'apartment', name: 'Apartments', icon: Building2 },
  { id: 'house', name: 'Houses', icon: Home },
  { id: 'villa', name: 'Villas', icon: Waves },
  { id: 'land', name: 'Land', icon: MapPin }
];

const features = [
  {
    id: 'secure',
    icon: Shield,
    title: "Security & Trust",
    description: "Bank-level encryption and verified listings ensure your peace of mind throughout the process.",
    points: ["256-bit SSL encryption", "ID-verified agents", "Escrow protection", "Legal compliance"]
  },
  {
    id: 'ai',
    icon: Zap,
    title: "AI Technology",
    description: "AI-powered matching and instant notifications help you never miss the perfect property.",
    points: ["Instant property matching", "Price prediction accuracy", "Market trend analysis", "98% accuracy rate"]
  },
  {
    id: 'reach',
    icon: Globe,
    title: "Kenya-wide Reach",
    description: "From bustling Nairobi to pristine Mombasa beaches - we connect you with properties everywhere.",
    points: ["All 47 counties", "Multi-language support", "Local market experts", "24/7 customer support"]
  }
];

// Kenyan avatar fallbacks (deterministic by name)
// Use initials avatars (no external image dependency)
const getKenyanAvatar = () => '';

const testimonials = [
  {
    name: "Grace Wanjiku",
    location: "Nairobi, Kenya",
    rating: 5,
    comment: "Found my dream home in just 2 weeks! The platform made it so easy to compare properties. I connected with a trusted agent the same day.",
    avatar: ""
  },
  {
    name: "David Kimani",
    location: "Mombasa, Kenya",
    rating: 5,
    comment: "Excellent service from start to finish. The photo galleries saved me time. Support followed up until closing.",
    avatar: ""
  },
  {
    name: "Aisha Mwende",
    location: "Kisumu, Kenya",
    rating: 5,
    comment: "Transparent pricing and fast responses. I loved the neighbourhood insights. Highly recommended!",
    avatar: ""
  }
];

export default HomePage;