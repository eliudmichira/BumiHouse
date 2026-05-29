import React, { useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, Star, Shield, Zap, Globe, Play, ChevronRight,
  TrendingUp, Award, Users, Heart, Eye, Sparkles 
} from 'lucide-react';

// Enhanced Hero Section with Google-level animations
export const GoogleLevelHero = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-32 h-32 rounded-full ${
              i % 2 === 0 
                ? 'bg-gradient-to-br from-primary-200/30 to-primary-400/20' 
                : 'bg-gradient-to-br from-secondary-200/30 to-secondary-400/20'
            } blur-xl`}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Trusted by 10,000+ property seekers
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent">
            Find Your Perfect
          </span>
          <br />
          <motion.span
            className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              backgroundSize: '200% 200%'
            }}
          >
            Home in Kenya
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Discover premium properties across all 47 counties. From modern apartments to luxury villas, 
          find the perfect place to call home.
        </motion.p>

        {/* Enhanced Search Bar */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <GoogleLevelSearchBar />
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          {[
            { number: '5,000+', label: 'Properties Available' },
            { number: '30', label: 'Counties Covered' },
            { number: '8,000+', label: 'Happy Customers' },
            { number: '200+', label: 'Expert Agents' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: isInView ? 1 : 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5, type: "spring" }}
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating Action Buttons */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <motion.button
          className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold shadow-primary hover:shadow-elevation-4 transition-all relative overflow-hidden"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative z-10 flex items-center gap-2">
            Browse Properties
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>

        <motion.button
          className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white rounded-2xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          List Your Property
        </motion.button>
      </motion.div>
    </motion.section>
  );
};

// Enhanced Search Bar Component
export const GoogleLevelSearchBar = () => {
  const [activeField, setActiveField] = useState(null);
  const [searchData, setSearchData] = useState({
    location: '',
    type: '',
    priceRange: ''
  });

  return (
    <motion.div
      className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-2 shadow-elevation-4 border border-gray-200/50 dark:border-gray-700/50"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* Location Field */}
        <motion.div
          className={`relative p-4 rounded-2xl transition-all cursor-pointer ${
            activeField === 'location' 
              ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300 dark:ring-primary-700' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
          onClick={() => setActiveField('location')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Location
          </label>
          <input
            type="text"
            placeholder="Select location"
            value={searchData.location}
            onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
            className="w-full bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none placeholder-gray-400"
          />
        </motion.div>

        {/* Property Type Field */}
        <motion.div
          className={`relative p-4 rounded-2xl transition-all cursor-pointer ${
            activeField === 'type' 
              ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300 dark:ring-primary-700' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
          onClick={() => setActiveField('type')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Property Type
          </label>
          <input
            type="text"
            placeholder="Select type"
            value={searchData.type}
            onChange={(e) => setSearchData({ ...searchData, type: e.target.value })}
            className="w-full bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none placeholder-gray-400"
          />
        </motion.div>

        {/* Price Range Field */}
        <motion.div
          className={`relative p-4 rounded-2xl transition-all cursor-pointer ${
            activeField === 'price' 
              ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300 dark:ring-primary-700' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
          onClick={() => setActiveField('price')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Price Range
          </label>
          <input
            type="text"
            placeholder="Select range (KSh)"
            value={searchData.priceRange}
            onChange={(e) => setSearchData({ ...searchData, priceRange: e.target.value })}
            className="w-full bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none placeholder-gray-400"
          />
        </motion.div>

        {/* Search Button */}
        <motion.button
          className="relative p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold shadow-primary hover:shadow-elevation-3 transition-all overflow-hidden group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            <span className="hidden md:inline">Search Properties</span>
          </span>
        </motion.button>
      </div>

      {/* Active Field Indicator */}
      <AnimatePresence>
        {activeField && (
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Feature Card
export const GoogleLevelFeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
      />

      {/* Icon */}
      <motion.div
        className="relative z-10 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
        whileHover={{ rotate: 5 }}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ scale: 0.8 }}
        whileHover={{ scale: 1 }}
      />
    </motion.div>
  );
};

export default {
  GoogleLevelHero,
  GoogleLevelSearchBar,
  GoogleLevelFeatureCard
};
