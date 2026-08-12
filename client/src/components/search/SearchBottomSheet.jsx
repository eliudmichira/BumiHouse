import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Clock, X, TrendingUp } from 'lucide-react';
import BottomSheet from '../ui/BottomSheet';
import countyData from '../../assets/data/kenya-counties.json';
import { calculateDistance } from '../../utils/locationUtils';

const SearchBottomSheet = ({ isOpen, onClose, onSearch, currentLocation }) => {
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    // Load and normalize recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('recentSearches');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Normalize: Ensure all items are objects with a 'text' property
                const normalized = parsed.map(item => {
                    if (typeof item === 'string') {
                        return {
                            id: Date.now() + Math.random(),
                            text: item,
                            type: 'query',
                            timestamp: new Date().toISOString()
                        };
                    }
                    return item;
                }).filter(item => item && typeof item.text === 'string');
                setRecentSearches(normalized);
            } catch (e) {
                console.error('Failed to parse recent searches:', e);
                setRecentSearches([]);
            }
        }
    }, []);

    // Dynamic suggestions based on location
    const locations = useMemo(() => {
        const baseLocations = [
            'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
            'Thika', 'Kilimani', 'Westlands', 'Karen', 'Runda'
        ];

        if (!currentLocation?.coords) return baseLocations;

        // Sort counties by distance to user
        const nearbyCounties = [...countyData]
            .sort((a, b) => {
                const distA = calculateDistance(currentLocation.coords.lat, currentLocation.coords.lng, a.lat, a.lng);
                const distB = calculateDistance(currentLocation.coords.lat, currentLocation.coords.lng, b.lat, b.lng);
                return distA - distB;
            })
            .slice(0, 5)
            .map(c => c.name);

        return [...new Set([...nearbyCounties, ...baseLocations])];
    }, [currentLocation]);

    // Generate suggestions based on query
    useEffect(() => {
        if (query.trim().length > 0) {
            const filtered = locations
                .filter(loc => loc.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [query, locations]);

    const saveSearch = (searchText) => {
        const newSearch = {
            id: Date.now(),
            text: searchText,
            type: 'query',
            timestamp: new Date().toISOString()
        };

        const updated = [newSearch, ...recentSearches.filter(s => s.text !== searchText)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const removeRecentSearch = (id) => {
        const updated = recentSearches.filter(s => s.id !== id);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleSearch = (e, searchText = null) => {
        e?.preventDefault();
        const searchQuery = searchText || query;
        if (searchQuery.trim()) {
            saveSearch(searchQuery.trim());
            onSearch({ from: null, to: searchQuery.trim() });
            onClose();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        handleSearch(null, suggestion);
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            snapPoints={['85%']}
            initialSnap={0}
        >
            <div className="flex flex-col h-full">
                {/* Search Header */}
                <div className="px-2 mb-6">
                    <h2 className="text-xl font-bold mb-4">Find Properties</h2>
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by location, price, or type..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            autoFocus
                        />
                    </form>
                </div>

                {/* Current Location Option */}
                <div className="px-2 mb-2">
                    <button
                        onClick={() => {
                            onSearch({ from: currentLocation?.coords, to: 'Current Location' });
                            onClose();
                        }}
                        className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                    >
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <div className="font-semibold">Current Location</div>
                            <div className="text-sm text-gray-500">
                                {currentLocation?.county ? `Search in ${currentLocation.county}` : 'Search near you'}
                            </div>
                        </div>
                    </button>
                </div>

                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                    <div className="px-2 mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2 px-3">Suggestions</h3>
                        <div className="space-y-1">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={`suggestion-${index}-${suggestion}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                                >
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{suggestion}</div>
                                        <div className="text-xs text-gray-400">Popular location</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                    <div className="px-2">
                        <div className="flex items-center justify-between mb-2 px-3">
                            <h3 className="text-sm font-semibold text-gray-500">Recent Searches</h3>
                            <button
                                onClick={() => {
                                    setRecentSearches([]);
                                    localStorage.removeItem('recentSearches');
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="space-y-1">
                            {recentSearches.map((item, index) => (
                                <div
                                    key={item.id || `recent-${index}`}
                                    onClick={() => handleSearch(null, item.text)}
                                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left group cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleSearch(null, item.text);
                                        }
                                    }}
                                >
                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
                                        <Clock size={20} />
                                    </div>
                                    <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-3">
                                        <div className="font-medium">{item.text}</div>
                                        <div className="text-xs text-gray-400 capitalize">{item.type}</div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeRecentSearch(item.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-opacity"
                                        aria-label="Remove search"
                                    >
                                        <X size={16} className="text-gray-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular Locations */}
                {!query && recentSearches.length === 0 && (
                    <div className="px-2">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2 px-3">Popular Locations</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {locations.slice(0, 6).map((location, index) => (
                                <button
                                    key={`loc-${index}-${location}`}
                                    onClick={() => handleSuggestionClick(location)}
                                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span className="font-medium text-sm">{location}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </BottomSheet>
    );
};

export default SearchBottomSheet;
