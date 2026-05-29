import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Filter, 
  X, 
  TrendingUp, 
  Clock, 
  Star,
  Home,
  Building,
  TreePine,
  ChevronDown,
  Sparkles,
  Zap,
  SlidersHorizontal
} from 'lucide-react';

const SmartSearchBar = ({
  searchQuery,
  setSearchQuery,
  onLocationSelect,
  onFilterChange,
  filters = {},
  propertyCount = 0,
  suggestions = [],
  onSearch,
  placeholder = "Search properties, locations, or keywords...",
  showFilters = false,
  onToggleFilters
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([
    'Apartments in Nairobi',
    'Houses in Mombasa',
    'Land in Kisumu',
    'Commercial properties',
    'Student housing',
    'Gated communities'
  ]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchQuery, suggestions]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (query) => {
    if (query.trim()) {
      // Add to recent searches
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
      
      setSearchQuery(query);
      onSearch?.(query);
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getSearchIcon = () => {
    if (searchQuery.includes('apartment') || searchQuery.includes('flat')) {
      return <Building className="w-5 h-5" />;
    } else if (searchQuery.includes('house') || searchQuery.includes('villa')) {
      return <Home className="w-5 h-5" />;
    } else if (searchQuery.includes('land') || searchQuery.includes('plot')) {
      return <TreePine className="w-5 h-5" />;
    } else if (searchQuery.includes('nairobi') || searchQuery.includes('mombasa') || searchQuery.includes('kisumu')) {
      return <MapPin className="w-5 h-5" />;
    }
    return <Search className="w-5 h-5" />;
  };

  const containerVariants = {
    focused: {
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    unfocused: {
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const suggestionVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative w-full">
      {/* Main Search Container */}
      <motion.div
        ref={searchRef}
        className={`relative bg-white dark:bg-gray-800 rounded-full border-2 transition-all duration-300 ${
          isFocused 
            ? 'border-[#51faaa] shadow-lg shadow-[#51faaa]/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        variants={containerVariants}
        animate={isFocused ? "focused" : "unfocused"}
      >
        <div className="flex items-center p-2">
          {/* Search Icon */}
          <motion.div
            className="flex-shrink-0 mr-2"
            animate={{ 
              color: isFocused ? '#51faaa' : '#6b7280',
              scale: isFocused ? 1.1 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            {getSearchIcon()}
          </motion.div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsFocused(false);
                setShowSuggestions(false);
              }, 200);
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm"
          />

          {/* Clear Button */}
          {searchQuery && (
            <motion.button
              onClick={clearSearch}
              className="flex-shrink-0 ml-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-3 h-3 text-gray-500" />
            </motion.button>
          )}

          {/* Filter Toggle */}
          <motion.button
            onClick={onToggleFilters}
            className={`flex-shrink-0 ml-2 p-1.5 rounded-full transition-all duration-300 ${
              showFilters 
                ? 'bg-[#51faaa] text-[#0a0c19]' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </motion.button>

          {/* Search Button */}
          <motion.button
            onClick={() => handleSearch(searchQuery)}
            className="flex-shrink-0 ml-2 px-4 py-1.5 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-full font-semibold hover:shadow-lg hover:shadow-[#51faaa]/30 transition-all duration-300 flex items-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline text-sm">Search</span>
          </motion.button>
        </div>

      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (isFocused || searchQuery) && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
            variants={suggestionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && !searchQuery && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recent Searches
                  </span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{search}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {!searchQuery && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-[#51faaa]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Popular Searches
                  </span>
                </div>
                <div className="space-y-1">
                  {popularSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-700 dark:text-gray-300">{search}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtered Suggestions */}
            {searchQuery && filteredSuggestions.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-[#51faaa]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Suggestions
                  </span>
                </div>
                <div className="space-y-1">
                  {filteredSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery && filteredSuggestions.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No suggestions found for "{searchQuery}"
                </p>
                <p className="text-sm text-gray-500">
                  Try searching for properties, locations, or keywords
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearchBar;
