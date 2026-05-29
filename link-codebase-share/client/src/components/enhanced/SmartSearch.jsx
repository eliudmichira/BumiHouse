import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Home, DollarSign, Filter, X, Sparkles } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

const SmartSearch = ({
  onSearch,
  onFiltersChange,
  placeholder = "Search properties, locations, or describe what you're looking for...",
  showFilters = true,
  aiSuggestions = true,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: '',
    priceRange: '',
    location: '',
    bedrooms: '',
    bathrooms: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Smart suggestions based on query
  const smartSuggestions = useMemo(() => [
    {
      type: 'ai',
      icon: Sparkles,
      text: 'Properties with swimming pool under 50M',
      description: 'AI-powered search',
      action: () => setQuery('swimming pool under 50M')
    },
    {
      type: 'location',
      icon: MapPin,
      text: 'Westlands, Nairobi',
      description: 'Popular area',
      action: () => setFilters(prev => ({ ...prev, location: 'Westlands' }))
    },
    {
      type: 'property',
      icon: Home,
      text: '3 bedroom apartments',
      description: 'Most searched',
      action: () => setFilters(prev => ({ ...prev, bedrooms: '3', propertyType: 'apartment' }))
    },
    {
      type: 'price',
      icon: DollarSign,
      text: 'Under KES 20M',
      description: 'Price range',
      action: () => setFilters(prev => ({ ...prev, priceRange: '0-20000000' }))
    }
  ], []);

  // Simulate AI processing
  useEffect(() => {
    if (debouncedQuery && aiSuggestions) {
      setIsAIProcessing(true);
      const timer = setTimeout(() => {
        setIsAIProcessing(false);
        // In real implementation, this would call your AI service
        setSuggestions(smartSuggestions.filter(s => 
          s.text.toLowerCase().includes(debouncedQuery.toLowerCase())
        ));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [debouncedQuery, aiSuggestions, smartSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query, filters);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({
      propertyType: '',
      priceRange: '',
      location: '',
      bedrooms: '',
      bathrooms: ''
    });
    onSearch?.('', {});
  };

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Townhouse', 'Commercial'];
  const priceRanges = [
    { label: 'Under 10M', value: '0-10000000' },
    { label: '10M - 20M', value: '10000000-20000000' },
    { label: '20M - 50M', value: '20000000-50000000' },
    { label: 'Above 50M', value: '50000000-999999999' }
  ];

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <motion.div
        className={`relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
          isExpanded 
            ? 'border-primary-400 shadow-[0_0_30px_rgba(81,250,170,0.15)]' 
            : 'border-gray-200 dark:border-gray-700 shadow-lg'
        }`}
        animate={{
          scale: isExpanded ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
              isExpanded ? 'text-primary-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsExpanded(true);
                setShowSuggestions(true);
              }}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-lg"
            />
            
            {query && (
              <motion.button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <X className="w-4 h-4 text-gray-400" />
              </motion.button>
            )}
          </div>

          {showFilters && (
            <motion.button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`mx-2 p-3 rounded-xl transition-all ${
                isExpanded 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-5 h-5" />
            </motion.button>
          )}
        </form>

        {/* AI Processing Indicator */}
        <AnimatePresence>
          {isAIProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 p-3"
            >
              <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                AI is analyzing your search...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Filters */}
        <AnimatePresence>
          {isExpanded && showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Property Type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>

                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Price Range</option>
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Location"
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                <select
                  value={filters.bedrooms}
                  onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Bedrooms</option>
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num}+ Bed</option>
                  ))}
                </select>

                <select
                  value={filters.bathrooms}
                  onChange={(e) => setFilters(prev => ({ ...prev, bathrooms: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Bathrooms</option>
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num}+ Bath</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Smart Suggestions */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || smartSuggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2">
              {(suggestions.length > 0 ? suggestions : smartSuggestions).map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={suggestion.action}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`p-2 rounded-lg ${
                    suggestion.type === 'ai' ? 'bg-primary-100 dark:bg-primary-900/30' :
                    suggestion.type === 'location' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    suggestion.type === 'property' ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    <suggestion.icon className={`w-4 h-4 ${
                      suggestion.type === 'ai' ? 'text-primary-600 dark:text-primary-400' :
                      suggestion.type === 'location' ? 'text-blue-600 dark:text-blue-400' :
                      suggestion.type === 'property' ? 'text-green-600 dark:text-green-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{suggestion.text}</div>
                    <div className="text-sm text-gray-500">{suggestion.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearch;
