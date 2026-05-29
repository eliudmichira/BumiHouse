import React, { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Heart, Eye, MapPin, Bed, Bath, Square, Star, ArrowRight, 
  Play, Sparkles, TrendingUp, Award, Users
} from 'lucide-react';

// Enhanced Property Card with Google-level interactions
export const GoogleLevelPropertyCard = ({ property, index = 0, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const {
    id,
    title,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    images = [],
    featured = false,
    rating = 0,
    views = 0
  } = property;

  return (
    <motion.div
      ref={ref}
      className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-500"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
      transition={{ delay: index * 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        {/* Main Image */}
        <motion.img
          src={images[currentImageIndex] || '/api/placeholder/400/300'}
          alt={title}
          className="w-full h-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Image Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          {/* Featured Badge */}
          {featured && (
            <motion.div
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-full shadow-lg"
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Sparkles className="w-3 h-3" />
              Featured
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 ml-auto">
            <motion.button
              className="p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
              transition={{ delay: 0.1 }}
            >
              <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </motion.button>

            <motion.button
              className="p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
              transition={{ delay: 0.2 }}
            >
              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Price Tag */}
        <motion.div
          className="absolute bottom-4 left-4 px-4 py-2 bg-black/80 backdrop-blur-sm text-white rounded-xl font-bold text-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          KES {price?.toLocaleString() || 'N/A'}
        </motion.div>

        {/* Image Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Removed Virtual Tour button */}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Location */}
        <motion.div 
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <MapPin className="w-3 h-3" />
          <span>
            {(() => {
              // Safely extract location string from object or use as string
              if (typeof location === 'string') {
                return location;
              }
              if (location && typeof location === 'object') {
                const parts = [];
                // Some feeds provide nested location objects; guard everything
                const addr = typeof location.address === 'string'
                  ? location.address
                  : (location.address && typeof location.address === 'object'
                      ? [location.address.street, location.address.line, location.address.name]
                          .filter(Boolean)
                          .join(', ')
                      : undefined);
                const city = typeof location.city === 'string' ? location.city : undefined;
                const state = typeof location.state === 'string' ? location.state : undefined;
                const zip = typeof location.zipCode === 'string' || typeof location.zipCode === 'number'
                  ? String(location.zipCode)
                  : undefined;
                if (addr) parts.push(addr);
                if (city) parts.push(city);
                if (state) parts.push(state);
                if (zip) parts.push(zip);
                const text = parts.join(', ');
                return text || '';
              }
              return '';
            })()}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h3 
          className="font-bold text-xl text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {title}
        </motion.h3>

        {/* Property Details */}
        <motion.div 
          className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{bedrooms}</span>
            </div>
          )}
          {bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{bathrooms}</span>
            </div>
          )}
          {area && (
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span>{area}m²</span>
            </div>
          )}
        </motion.div>

        {/* Bottom Row */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Views */}
          {views > 0 && (
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Eye className="w-3 h-3" />
              <span>{views} views</span>
            </div>
          )}

          {/* More Info Button */}
          <motion.button
            onClick={() => onClick?.(property.id)}
            className="text-primary-600 dark:text-primary-400 font-medium text-sm hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
            whileHover={{ x: 5 }}
          >
            View Details
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        </motion.div>
      </div>

      {/* Hover Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// Enhanced Testimonial Card
export const GoogleLevelTestimonialCard = ({ testimonial, index = 0 }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const { name = '', location = '', quote = '', avatar = '', rating = 5 } = testimonial;

  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return '';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase();
  };
  const initials = getInitials(name);
  const quoteParts = String(quote)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  return (
    <motion.div
      ref={ref}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
      transition={{ delay: index * 0.2, duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Quote */}
      <div className="mb-6">
        {quoteParts.map((part, i) => (
          <motion.p
            key={i}
            className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ delay: index * 0.2 + 0.2 + i * 0.05 }}
          >
            “{part.replace(/^\"|\"$/g, '')}”
          </motion.p>
        ))}
      </div>

      {/* Rating */}
      <motion.div 
        className="flex items-center gap-1 mb-4"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0 }}
        transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: index * 0.2 + 0.4 + i * 0.1 }}
          >
            <Star className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </motion.div>
        ))}
      </motion.div>

      {/* Author */}
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -20 }}
        transition={{ delay: index * 0.2 + 0.5 }}
      >
        <motion.div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 p-0.5 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
              {initials}
            </div>
          )}
        </motion.div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{location}</p>
        </div>
      </motion.div>

      {/* Background Accent */}
      <motion.div
        className="absolute top-4 right-4 text-primary-100 dark:text-primary-900/20 group-hover:text-primary-200 dark:group-hover:text-primary-800/30 transition-colors"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0 }}
        transition={{ delay: index * 0.2 + 0.6 }}
      >
        <Quote className="w-8 h-8" />
      </motion.div>
    </motion.div>
  );
};

// Quote Icon Component
const Quote = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
  </svg>
);

export default {
  GoogleLevelPropertyCard,
  GoogleLevelTestimonialCard
};
