import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, LayoutGrid, Layers, Locate, X, Bed, Bath, Square, ChevronRight, Heart, MapPin, CheckCircle,
    TrendingUp, BarChart3, Pencil, Users, SlidersHorizontal, RotateCcw, DollarSign, Home,
    Bus, Shield, Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../../components/map/MapView';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import MobileMenuOverlay from '../components/MobileMenuOverlay';
import SearchBottomSheet from '../../components/search/SearchBottomSheet';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../hooks/useUserLocation';
import BottomSheet from '../../components/ui/BottomSheet';
import { Sparkles } from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import MobileNavigation from '../components/MobileNavigation';
import { PropertyMobileCard } from '../components/PropertyMobileNav';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { calculateDistance, getNormalizedLatLng } from '../../utils/locationUtils';
import { geocodeAddress as geocodeWithFallback } from '../../utils/geocode';
import SmartSearchBar from '../../components/enhanced/SmartSearchBar';

const HomeScreen = () => {
    const navigate = useNavigate();
    const { currentUser: user, toggleFavorite, isFavorite } = useAuth();
    const { location: currentLocation, loading: locationLoading, getUserLocation: refreshLocation } = useUserLocation();

    // Haptic feedback function
    const hapticFeedback = async (style = ImpactStyle.Light) => {
        try {
            await Haptics.impact({ style });
        } catch (error) {
            if ('vibrate' in navigator) {
                navigator.vibrate(style === ImpactStyle.Medium ? 40 : 10);
            }
        }
    };

    // Don't auto-request geolocation on mount (causes Violation in WebView).
    // Location is fetched when user taps "Locate Me" or "Draw Search Area".

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProperties, setFilteredProperties] = useState([]);

    // Always fetch the full dataset — location-based ranking is done client-side
    // via the scoring engine in finalFilteredProperties. Passing county/geohash to
    // Firestore caused 0 results because seeded properties don't have those fields.
    const discoveryParams = useMemo(() => ({ limit: 500 }), []);


    const { data: propertyData, isLoading: propertiesLoading } = useProperties(discoveryParams);
    const properties = useMemo(() => propertyData?.properties || [], [propertyData]);

    // Track user price affinity (budget, mid, luxury)
    const [priceAffinity, setPriceAffinity] = useState(() => {
        const stored = localStorage.getItem('user_price_affinity');
        return stored || 'mid';
    });

    const updatePriceAffinity = (price) => {
        let affinity = 'mid';
        if (price < 30000) affinity = 'budget';
        else if (price > 150000) affinity = 'luxury';

        setPriceAffinity(affinity);
        localStorage.setItem('user_price_affinity', affinity);
    };
    const [propertiesWithCoords, setPropertiesWithCoords] = useState([]);
    const geocodeCacheRef = useRef({});
    const geocodeAbortControllerRef = useRef(null);
    const MAX_CACHE_SIZE = 100; // Limit cache size to prevent memory leaks

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isExploreMenuOpen, setIsExploreMenuOpen] = useState(false);
    // Dynamic default location - use user location or detect from browser
    const getDefaultLocation = () => {
        if (currentLocation?.coords) {
            return currentLocation.coords;
        }
        // Default to Nairobi, Kenya (can be made more dynamic based on IP/timezone)
        return { lat: -1.2921, lng: 36.8219 };
    };

    const [mapCenter, setMapCenter] = useState(getDefaultLocation());
    const [mapZoom, setMapZoom] = useState(15);
    const [mapType, setMapType] = useState('standard');

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        minBedrooms: '',
        minBathrooms: '',
        propertyType: '',
        status: ''
    });


    // Advanced Map States
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [useClustering, setUseClustering] = useState(true);
    const [showQuickStats, setShowQuickStats] = useState(true);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [activePropertyId, setActivePropertyId] = useState(null);
    const [searchRadius, setSearchRadius] = useState(null); // Store current search radius in meters
    const scrollRef = React.useRef(null);

    // Kenyan locations for suggestions
    const KENYA_LOCATIONS = useMemo(() => [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
        'Kisii', 'Thika', 'Malindi', 'Kitale', 'Garissa',
        'Nyeri', 'Machakos', 'Kilifi', 'Diani', 'Watamu',
        'Westlands', 'Kilimani', 'Lavington', 'Karen', 'Langata',
        'South C', 'Syokimau', 'Kitengela', 'Juja', 'Ruiru'
    ], []);

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.minPrice) count++;
        if (filters.maxPrice) count++;
        if (filters.minBedrooms) count++;
        if (filters.minBathrooms) count++;
        if (filters.propertyType) count++;
        if (filters.status) count++;
        if (searchRadius) count++; // Search radius counts as a filter
        return count;
    }, [filters, searchRadius]);

    // Clear all filters handler
    const handleClearAllFilters = useCallback(() => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            minBedrooms: '',
            minBathrooms: '',
            propertyType: '',
            status: ''
        });
        setSearchQuery('');
        setSearchRadius(null);
    }, []);

    // Helper to extract valid coordinates from property - matching list page approach
    const getNormalizedLatLng = (property) => {
        if (!property) return null;

        // Check all possible coordinate locations
        const rawLat = property.latitude ??
            property.lat ??
            property.location?.lat ??
            property.location?.latitude ??
            property.location?.coordinates?.lat ??
            property.coordinates?.lat;

        const rawLng = property.longitude ??
            property.lng ??
            property.location?.lng ??
            property.location?.longitude ??
            property.location?.coordinates?.lng ??
            property.coordinates?.lng;

        let lat = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat;
        let lng = typeof rawLng === 'string' ? parseFloat(rawLng) : rawLng;

        // Detect swapped coordinates - use let to allow reassignment
        if (typeof lat === 'number' && typeof lng === 'number') {
            if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
                // Swap coordinates if they appear to be reversed
                const temp = lat;
                lat = lng;
                lng = temp;
            }
        }

        if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { lat, lng };
        }
        return null;
    };

    // ✅ CONSOLIDATED FILTERING & SCORING ENGINE
    const finalFilteredProperties = useMemo(() => {
        const sourceProperties = propertiesWithCoords.length > 0 ? propertiesWithCoords : properties;
        if (!sourceProperties.length) return [];

        // 1. Calculate base scores for all properties
        const scored = sourceProperties.map(p => {
            let score = 0;
            // County Match Boost
            if (currentLocation?.county && p.county === currentLocation.county) score += 100;
            // Premium Zone Boost
            if (currentLocation?.premiumZone && p.tags?.includes(currentLocation.premiumZone)) score += 150;
            // Price Affinity Boost
            if (p.priceTier === priceAffinity) score += 50;

            // Distance Penalty
            const pos = getNormalizedLatLng(p);
            if (currentLocation?.coords && pos) {
                const dist = calculateDistance(currentLocation.coords.lat, currentLocation.coords.lng, pos.lat, pos.lng);
                score -= Math.min(100, Math.floor(dist * 5));
            }
            return { ...p, _score: score };
        });

        // 2. Apply Filters
        return scored.filter(p => {
            // Search Query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const titleMatch = (p.title || p.name || '').toLowerCase().includes(query);
                const addressMatch = (p.address || p.location?.address || '').toLowerCase().includes(query);
                const cityMatch = (p.city || p.location?.city || '').toLowerCase().includes(query);
                const typeMatch = (p.type || p.propertyType || '').toLowerCase().includes(query);
                if (!titleMatch && !addressMatch && !cityMatch && !typeMatch) return false;
            }

            // Price
            if (filters.minPrice && (p.price || 0) < parseInt(filters.minPrice)) return false;
            if (filters.maxPrice && (p.price || 0) > parseInt(filters.maxPrice)) return false;

            // Rooms
            if (filters.minBedrooms && (p.bedrooms || 0) < parseInt(filters.minBedrooms)) return false;
            if (filters.minBathrooms && (p.bathrooms || 0) < parseInt(filters.minBathrooms)) return false;

            // Type & Status
            if (filters.propertyType && (p.type || p.propertyType || '').toLowerCase() !== filters.propertyType.toLowerCase()) return false;
            // Status: check BOTH fields since the dataset has two schemas:
            //   Seeded properties:    listing_type = "rent" | "sale",  status = "available"
            //   AddProperty-created:  status = "for-rent" | "for-sale", no listing_type
            if (filters.status) {
                const wantsRent = filters.status.toLowerCase().includes('rent');
                const s = (p.status || '').toLowerCase();
                const lt = (p.listing_type || '').toLowerCase();
                if (wantsRent) {
                    if (!s.includes('rent') && lt !== 'rent') return false;
                } else {
                    if (!s.includes('sale') && lt !== 'sale' && !(s === 'available' && !lt)) return false;
                }
            }

            // Radius
            if (searchRadius && currentLocation?.coords) {
                const pos = getNormalizedLatLng(p);
                if (!pos) return false;
                const dist = calculateDistance(currentLocation.coords.lat, currentLocation.coords.lng, pos.lat, pos.lng) * 1000;
                if (dist > searchRadius) return false;
            }

            return true;
        }).sort((a, b) => b._score - a._score);
    }, [properties, propertiesWithCoords, searchQuery, filters, searchRadius, currentLocation, priceAffinity]);

    // Sync legacy filteredProperties state only when the array content actually
    // changes (by length + id signature). Without this guard, every chunked
    // geocode update produced a new array ref and forced a setState cascade
    // (propertyMarkers → MapView → fitBounds) on every batch, eventually
    // tripping React's "Maximum update depth exceeded" safety net.
    const lastSyncedSigRef = useRef('');
    useEffect(() => {
        const sig = `${finalFilteredProperties.length}:${finalFilteredProperties.map(p => p.id).join('|')}`;
        if (sig === lastSyncedSigRef.current) return;
        lastSyncedSigRef.current = sig;
        setFilteredProperties(finalFilteredProperties);
    }, [finalFilteredProperties]);

    // Geocode address to get coordinates (Google Maps with an OpenStreetMap/
    // Nominatim fallback via utils/geocode), cached to avoid repeat lookups.
    const geocodeAddress = async (address, signal) => {
        if (!address) return null;

        const cacheKey = address.toLowerCase();
        if (geocodeCacheRef.current[cacheKey]) {
            return geocodeCacheRef.current[cacheKey];
        }

        try {
            const coords = await geocodeWithFallback(address, { signal });
            if (!coords) return null;

            // Limit cache size to prevent memory leaks
            const cacheKeys = Object.keys(geocodeCacheRef.current);
            if (cacheKeys.length >= MAX_CACHE_SIZE) {
                // Remove oldest entries (simple FIFO)
                const oldestKey = cacheKeys[0];
                delete geocodeCacheRef.current[oldestKey];
            }

            geocodeCacheRef.current[cacheKey] = coords;
            return coords;
        } catch (error) {
            // Don't log if it's an abort error (expected)
            if (error?.name !== 'AbortError' && import.meta.env.DEV) {
                console.error('Geocoding error:', error);
            }
        }
        return null;
    };

    // Build address string from property
    const buildAddressString = (property) => {
        const parts = [
            property.address,
            property.city,
            property.state,
            'Kenya'
        ].filter(Boolean);
        return parts.join(', ');
    };

    // Geocode properties that don't have coordinates with rate limiting and cleanup
    useEffect(() => {
        if (properties.length === 0) {
            setPropertiesWithCoords([]);
            return;
        }

        // Cancel any pending geocoding requests
        if (geocodeAbortControllerRef.current) {
            geocodeAbortControllerRef.current.abort();
        }

        // Create new abort controller for this geocoding session
        const abortController = new AbortController();
        geocodeAbortControllerRef.current = abortController;

        let isCancelled = false;

        const geocodeProperties = async () => {
            // Rate limiting: process in batches to avoid API limits
            const BATCH_SIZE = 5;
            const DELAY_BETWEEN_BATCHES = 1000; // 1 second between batches

            const processed = [];

            for (let i = 0; i < properties.length; i += BATCH_SIZE) {
                if (abortController.signal.aborted || isCancelled) {
                    break;
                }

                const batch = properties.slice(i, i + BATCH_SIZE);
                const batchResults = await Promise.all(
                    batch.map(async (property, batchIndex) => {
                        if (abortController.signal.aborted) {
                            return property;
                        }

                        // Check if property already has coordinates
                        const existingCoords = getNormalizedLatLng(property);
                        if (existingCoords) {
                            return { ...property, latitude: existingCoords.lat, longitude: existingCoords.lng };
                        }

                        // Try to geocode
                        const addressStr = buildAddressString(property);
                        if (addressStr && addressStr !== 'Kenya') {
                            // Add small delay between requests in same batch
                            if (batchIndex > 0) {
                                await new Promise(resolve => setTimeout(resolve, 200));
                            }

                            const geo = await geocodeAddress(addressStr, abortController.signal);
                            if (geo) {
                                if (import.meta.env.DEV) {
                                    console.log(`✅ Geocoded "${property.title || property.name}":`, geo);
                                }
                                return { ...property, latitude: geo.lat, longitude: geo.lng };
                            }
                        }

                        // Fallback: use default location with better distribution
                        // Use property ID hash for consistent but distributed placement
                        const idHash = property.id ?
                            property.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) :
                            i;
                        const angle = (idHash % 360) * (Math.PI / 180);
                        const radius = 0.05 + ((idHash % 10) / 100); // 0.05 to 0.15 degrees
                        const fallbackLat = -1.2921 + (Math.cos(angle) * radius);
                        const fallbackLng = 36.8219 + (Math.sin(angle) * radius);

                        if (import.meta.env.DEV) {
                            console.log(`⚠️ Using fallback coordinates for "${property.title || property.name}"`);
                        }
                        return { ...property, latitude: fallbackLat, longitude: fallbackLng };
                    })
                );

                processed.push(...batchResults);

                // Update state incrementally for better UX
                if (!abortController.signal.aborted) {
                    setPropertiesWithCoords([...processed]);
                }

                // Delay between batches to respect rate limits
                if (i + BATCH_SIZE < properties.length) {
                    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
                }
            }

            if (!abortController.signal.aborted && !isCancelled) {
                setPropertiesWithCoords(processed);
            }
        };

        geocodeProperties();

        // Cleanup function
        return () => {
            isCancelled = true;
            if (geocodeAbortControllerRef.current) {
                geocodeAbortControllerRef.current.abort();
            }
        };
    }, [properties]);

    // Helper for price formatting
    const formatPrice = (price) => {
        if (!price) return '0';
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
    };

    // ✅ FIXED: Simplified marker creation matching List Page approach
    const propertyMarkers = useMemo(() => {
        // Use properties with coordinates (geocoded if needed)
        const sourceProperties = filteredProperties.length > 0
            ? filteredProperties.map(p => {
                // Find matching property with coordinates
                const withCoords = propertiesWithCoords.find(pc => pc.id === p.id);
                return withCoords || p;
            })
            : propertiesWithCoords.length > 0 ? propertiesWithCoords : properties;

        const markers = sourceProperties.map((p) => {
            const position = getNormalizedLatLng(p);
            if (!position) {
                // Debug: log properties without coordinates
                if (import.meta.env.DEV) {
                    console.log('⚠️ Property without valid coordinates:', {
                        id: p.id,
                        title: p.title || p.name,
                        lat: p.latitude ?? p.lat ?? p.location?.lat,
                        lng: p.longitude ?? p.lng ?? p.location?.lng
                    });
                }
                return null;
            }

            const isActive = activePropertyId === p.id;

            // Format price for label - simplified format
            const price = p.price ? Math.round(p.price / 1000) + 'K' : '';

            return {
                id: p.id,
                position,
                title: p.title || p.name || 'Property',
                featured: isActive,
                // Icon will be created by MapView component when Google Maps is ready
                // Don't create Google Maps objects here - let MapView handle it
                label: price,
                onClick: () => {
                    setActivePropertyId(p.id);
                    setMapCenter(position);

                    setTimeout(() => {
                        const el = document.getElementById(`property-card-${p.id}`);
                        if (el) {
                            el.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'center'
                            });
                        }
                    }, 300);
                }
            };
        }).filter(Boolean);

        // Debug logging removed — was firing every chunked geocode update
        // (5, 10, 15, … up to 246+) and contributed to CLS via repeated
        // marker prop churn driving GoogleMap fitBounds passes.

        return markers;
    }, [filteredProperties, properties, propertiesWithCoords, activePropertyId]);

    // Heatmap data memoization - return plain objects, let MapView create Google Maps objects
    const heatmapPoints = useMemo(() => {
        if (!filteredProperties.length) return [];

        return filteredProperties.map(p => {
            const pos = getNormalizedLatLng(p);
            if (!pos) return null;

            // Return plain object - MapView will create Google Maps LatLng when ready
            return {
                lat: pos.lat,
                lng: pos.lng,
                weight: p.price && p.price > 0 ? Math.max(1, p.price / 1000000) : 1
            };
        }).filter(Boolean);
    }, [filteredProperties]);

    // Quick Stats memoization with proper error handling
    const stats = useMemo(() => {
        if (!filteredProperties.length) return null;

        // Filter out invalid prices (null, undefined, 0, NaN, negative)
        const validPrices = filteredProperties
            .map(p => p.price)
            .filter(price =>
                typeof price === 'number' &&
                !isNaN(price) &&
                isFinite(price) &&
                price > 0
            );

        if (validPrices.length === 0) {
            return {
                count: filteredProperties.length,
                avg: 0,
                min: 0,
                max: 0
            };
        }

        return {
            count: filteredProperties.length,
            avg: validPrices.reduce((a, b) => a + b, 0) / validPrices.length,
            min: Math.min(...validPrices),
            max: Math.max(...validPrices)
        };
    }, [filteredProperties]);

    // Handle horizontal scroll to update map center
    const handleScroll = (e) => {
        const container = e.target;
        const scrollPadding = 24; // px-6
        const cardWidth = 320; // w-80
        const gap = 16; // gap-4

        const scrollLeft = container.scrollLeft;
        const index = Math.round(scrollLeft / (cardWidth + gap));

        const p = filteredProperties[index];
        if (p && p.id !== activePropertyId) {
            setActivePropertyId(p.id);
            const pos = getNormalizedLatLng(p);
            if (pos) {
                setMapCenter(pos);
            }
        }
    };

    const handleSearch = (searchData) => {
        let query = '';
        if (typeof searchData === 'string') {
            query = searchData;
            setSearchQuery(query);
        } else {
            const { from, to } = searchData;
            query = to || '';
            setSearchQuery(query);
            if (from) {
                setMapCenter(from);
                setMapZoom(15);
            }
        }

        // Auto-center map on first result if search query is present
        if (query.trim() && filteredProperties.length > 0) {
            const firstResult = filteredProperties[0];
            const pos = getNormalizedLatLng(firstResult);
            if (pos) {
                setMapCenter(pos);
                setMapZoom(14);
            }
        }

        setIsSearchOpen(false);
    };

    const recenterMap = useCallback(async () => {
        const newLoc = await refreshLocation();
        if (newLoc?.coords) {
            setMapCenter(newLoc.coords);
            setMapZoom(15);
            hapticFeedback(ImpactStyle.Medium);
        }
    }, [refreshLocation]);

    // Auto-recenter on first mount if location is available
    useEffect(() => {
        if (!currentLocation && !locationLoading) {
            // Optionally: delay or wait for user interaction to avoid the 'Violation' console warning
            // For now, only refresh if user hasn't explicitly searched
            if (!searchQuery) {
                refreshLocation();
            }
        }
    }, []);

    // Helper function to filter properties within a radius
    const filterPropertiesByRadius = useCallback((center, radiusInMeters) => {
        if (!window.google?.maps?.geometry?.spherical || !center) {
            return [];
        }

        try {
            const centerLatLng = new window.google.maps.LatLng(center.lat, center.lng);
            const sourceProperties = propertiesWithCoords.length > 0 ? propertiesWithCoords : properties;

            return sourceProperties.filter(p => {
                const pos = getNormalizedLatLng(p);
                if (!pos) return false;

                try {
                    const propertyLatLng = new window.google.maps.LatLng(pos.lat, pos.lng);
                    const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
                        propertyLatLng,
                        centerLatLng
                    );
                    return dist <= radiusInMeters;
                } catch (error) {
                    if (import.meta.env.DEV) {
                        console.error('Distance calculation error:', error);
                    }
                    return false;
                }
            });
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Filter properties by radius error:', error);
            }
            return [];
        }
    }, [properties, propertiesWithCoords]);

    // When drawing mode is activated, center on user location (but don't auto-search - wait for user to draw)
    useEffect(() => {
        if (isDrawingMode && currentLocation?.coords) {
            // Center map on user's current location
            setMapCenter(currentLocation.coords);
            setMapZoom(13); // Zoom level that shows ~5km radius nicely

            // Don't auto-search - let the user draw the circle first
            // The search will happen when they complete drawing the circle
        } else if (isDrawingMode === false && searchRadius !== null) {
            setSearchRadius(null);
            const sourceProperties = propertiesWithCoords.length > 0 ? propertiesWithCoords : properties;
            setFilteredProperties(sourceProperties);
        }
    }, [isDrawingMode, currentLocation, properties, propertiesWithCoords]);

    // Scoring engine has been consolidated into finalFilteredProperties useMemo above

    // Update map center when location is first found or changes significantly
    useEffect(() => {
        if (currentLocation?.coords) {
            // Only update if location changed significantly (more than 1km)
            const distance = mapCenter && currentLocation.coords ?
                Math.sqrt(
                    Math.pow(currentLocation.coords.lat - mapCenter.lat, 2) +
                    Math.pow(currentLocation.coords.lng - mapCenter.lng, 2)
                ) * 111 : // Rough conversion to km
                Infinity;

            if (distance > 0.01 || !mapCenter) { // ~1km threshold
                setMapCenter(currentLocation.coords);
            }
        }
    }, [currentLocation]);

    // (Debug effect that logged on every marker recompute removed — it was
    // firing dozens of times during chunked geocoding.)

    // Stable marker array for <MapView> — without this we re-created the
    // markers prop on every parent render, causing GoogleMap to re-fit and
    // shift layout (CLS) repeatedly.
    const mapMarkers = useMemo(() => {
        const arr = [];
        if (currentLocation?.coords) {
            arr.push({
                id: 'user',
                position: currentLocation.coords,
                title: 'You',
                featured: true
            });
        }
        for (const m of propertyMarkers) arr.push(m);
        return arr;
    }, [currentLocation, propertyMarkers]);




    return (
        <>
            <div className="relative h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
                {/* Full-Screen Map Layer */}
                <div className="absolute inset-0 z-0">
                    <MapView
                        key="home-map"
                        center={mapCenter}
                        zoom={mapZoom}
                        mapTypeId={mapType === 'standard' ? 'roadmap' : 'hybrid'}
                        onMapLoad={(map) => {
                            try {
                                // Debug: Log when map loads with markers
                                if (import.meta.env.DEV) {
                                    console.log('🗺️ HomeScreen Map loaded with', propertyMarkers.length, 'property markers');
                                    console.log('📍 Markers array:', propertyMarkers.slice(0, 3));
                                }
                            } catch (error) {
                                if (import.meta.env.DEV) {
                                    console.error('Map load error:', error);
                                }
                            }
                        }}
                        padding={{
                            top: 140,    // Space for Search Bar + Stats
                            bottom: 100, // Space for Bottom Sheet (Reduced from 260)
                            left: 20,
                            right: 70    // Space for FABs
                        }}
                        markers={mapMarkers}
                        useClustering={useClustering}
                        heatmapData={showHeatmap ? heatmapPoints : []}
                        heatmapOptions={{
                            radius: 30,
                            opacity: 0.6,
                            gradient: [
                                'rgba(0, 255, 255, 0)',
                                'rgba(0, 255, 255, 1)',
                                'rgba(0, 191, 255, 1)',
                                'rgba(0, 127, 255, 1)',
                                'rgba(0, 63, 255, 1)',
                                'rgba(0, 0, 255, 1)',
                                'rgba(0, 0, 223, 1)',
                                'rgba(0, 0, 191, 1)',
                                'rgba(0, 0, 159, 1)',
                                'rgba(0, 0, 127, 1)',
                                'rgba(63, 0, 91, 1)',
                                'rgba(127, 0, 63, 1)',
                                'rgba(191, 0, 31, 1)',
                                'rgba(255, 0, 0, 1)'
                            ]
                        }}

                        loading={locationLoading || !propertyData}
                        onCircleComplete={(circle) => {
                            try {
                                if (!window.google?.maps?.geometry?.spherical) {
                                    if (import.meta.env.DEV) {
                                        console.warn('Google Maps geometry library not loaded');
                                    }
                                    setIsDrawingMode(false);
                                    if (circle) {
                                        circle.setMap(null);
                                    }
                                    return;
                                }

                                const radius = circle.getRadius(); // Radius in meters
                                const center = circle.getCenter();
                                const centerCoords = { lat: center.lat(), lng: center.lng() };

                                // Update search radius state
                                setSearchRadius(radius);

                                // Filter properties within the drawn circle
                                const inRadius = filterPropertiesByRadius(centerCoords, radius);
                                setFilteredProperties(inRadius);

                                // Update map center to the circle center
                                setMapCenter(centerCoords);

                                if (import.meta.env.DEV) {
                                    console.log(`🔍 Found ${inRadius.length} properties within ${(radius / 1000).toFixed(1)}km radius`);
                                }

                                setIsDrawingMode(false);
                                if (circle) {
                                    circle.setMap(null); // Clean up the drawing
                                }
                            } catch (error) {
                                if (import.meta.env.DEV) {
                                    console.error('Circle complete error:', error);
                                }
                                setIsDrawingMode(false);
                                if (circle) {
                                    circle.setMap(null);
                                }
                            }
                        }}
                        className="w-full h-full"
                    />
                    {/* Top Overlay Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Floating Top Search Bar Integration */}
                <div className="absolute left-4 right-4 z-50 flex items-center gap-2" style={{ top: 'max(2rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}>
                    {/* Filters Icon - Opens Search Filters */}
                    <button
                        onClick={() => {
                            hapticFeedback(ImpactStyle.Light);
                            setShowFilters(!showFilters);
                        }}
                        className={`relative h-12 w-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg rounded-full flex items-center justify-center border border-white/20 dark:border-gray-700 hover:bg-white transition-all duration-300 active:scale-95 ${(activeFilterCount > 0 || showFilters) ? 'ring-2 ring-[#51faaa] ring-offset-2 dark:ring-offset-gray-900 shadow-[#51faaa]/20' : ''}`}
                    >
                        <SlidersHorizontal className={(activeFilterCount > 0 || showFilters) ? "text-[#51faaa]" : "text-gray-500"} size={20} />
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#51faaa] text-gray-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <div className="flex-1">
                        <SmartSearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onSearch={handleSearch}
                            suggestions={KENYA_LOCATIONS}
                            placeholder={currentLocation?.county ? `Find in ${currentLocation.county}...` : "Find properties..."}
                        />
                    </div>

                    <button
                        onClick={() => navigate(user ? '/dashboard' : '/auth')}
                        className="relative h-12 w-12 rounded-full shadow-lg flex items-center justify-center overflow-hidden group border-2 border-white dark:border-gray-800"
                    >
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {user?.photoURL || user?.avatar ? (
                                <img
                                    src={user.avatar || user.photoURL}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-xs font-bold text-gray-500">
                                    {user?.displayName?.[0] || user?.name?.[0] || 'G'}
                                </span>
                            )}
                        </div>
                    </button>
                </div>

                {/* Quick Filters - NEW: Solid Google Maps-style pills */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 right-0 z-20 px-4 overflow-x-auto hide-scrollbar flex items-center gap-2"
                    style={{ top: 'calc(max(2rem, calc(env(safe-area-inset-top, 0px) + 1rem)) + 4.5rem)' }}
                >
                    {/* Price Filter Pill */}
                    <button
                        onClick={() => {
                            hapticFeedback(ImpactStyle.Light);
                            setShowFilters(true);
                        }}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all flex items-center gap-1.5 ${filters.minPrice || filters.maxPrice
                            ? 'bg-[#51faaa] border-[#51faaa] text-gray-900 shadow-md scale-105'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-300'
                            }`}
                    >
                        <DollarSign size={13} />
                        {filters.minPrice || filters.maxPrice ? 'Price Active' : 'Price'}
                    </button>

                    {/* Bedroom Toggles */}
                    {[1, 2, 3, 4].map((num) => (
                        <button
                            key={`bed-${num}`}
                            onClick={() => {
                                hapticFeedback(ImpactStyle.Light);
                                setFilters(prev => ({
                                    ...prev,
                                    minBedrooms: prev.minBedrooms === num.toString() ? '' : num.toString()
                                }));
                            }}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all flex items-center gap-1.5 ${filters.minBedrooms === num.toString()
                                ? 'bg-[#51faaa] border-[#51faaa] text-gray-900 shadow-md scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-300'
                                }`}
                        >
                            <Bed size={13} />
                            {num}{num === 4 ? '+' : ''} Bed
                        </button>
                    ))}

                    {/* Quick Attributes (From previous version) */}
                    {[
                        { key: 'isNearPublicTransport', label: 'Transit', icon: Bus },
                        { key: 'isGatedCommunity', label: 'Secure', icon: Shield },
                        { key: 'isWifiIncluded', label: 'WiFi', icon: Wifi }
                    ].map((attr) => (
                        <button
                            key={attr.key}
                            onClick={() => {
                                hapticFeedback(ImpactStyle.Light);
                                setFilters(prev => ({ ...prev, [attr.key]: !prev[attr.key] }));
                            }}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all flex items-center gap-1.5 ${filters[attr.key]
                                ? 'bg-[#51faaa] border-[#51faaa] text-gray-900 shadow-md scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-300'
                                }`}
                        >
                            <attr.icon size={13} />
                            {attr.label}
                        </button>
                    ))}

                    {/* Property Type Toggles */}
                    {['Apartment', 'House', 'Villa'].map((type) => (
                        <button
                            key={type}
                            onClick={() => {
                                hapticFeedback(ImpactStyle.Light);
                                setFilters(prev => ({
                                    ...prev,
                                    propertyType: prev.propertyType.toLowerCase() === type.toLowerCase() ? '' : type.toLowerCase()
                                }));
                            }}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all flex items-center gap-1.5 ${filters.propertyType.toLowerCase() === type.toLowerCase()
                                ? 'bg-[#51faaa] border-[#51faaa] text-gray-900 shadow-md scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-300'
                                }`}
                        >
                            <Home size={13} />
                            {type}
                        </button>
                    ))}

                    {/* Quick Stats Summary Pill (Compact version of old stats) */}
                    {stats && (
                        <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            Avg: {formatPrice(stats.avg).replace('KES', 'KSh')}
                        </div>
                    )}
                </motion.div>

                {/* Property horizontal cards list */}
                <div className="absolute bottom-32 left-0 right-0 z-30 pointer-events-none">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-6 pointer-events-auto">
                            <div className="flex flex-col">
                                <h3 className="text-sm font-bold text-white drop-shadow-md">
                                    {filteredProperties.length} Properties Found
                                </h3>
                                {searchRadius && (
                                    <p className="text-xs text-white/70 drop-shadow-md mt-0.5">
                                        Within {(searchRadius / 1000).toFixed(1)}km {currentLocation && 'of your location'}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/properties')}
                                className="text-xs font-semibold text-white bg-black/60 backdrop-blur-xl px-3 py-1.5
                                dark:text-white dark:bg-black/90 dark:backdrop-blur-xl dark:px-3 dark:py-1.5
                                 rounded-full border border-white/10 flex items-center gap-1 shadow-lg"
                            >
                                View All <ChevronRight size={14} />
                            </button>
                        </div>

                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex overflow-x-auto gap-4 px-6 py-5 scrollbar-hide pointer-events-auto no-scrollbar snap-x snap-mandatory"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredProperties.map((property) => (
                                    <motion.div
                                        key={property.id}
                                        id={`property-card-${property.id}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex-shrink-0 w-[290px] snap-center"
                                    >
                                        <PropertyMobileCard
                                            variant="glass"
                                            className={`p-3 transition-all duration-300 backdrop-blur-xl ${activePropertyId === property.id
                                                ? '!bg-gray-900/80 border-white/30 ring-1 ring-gradient-to-r from-yellow-500 to-orange-500 shadow-[0_8px_32px_rgba(0,0,0,0.5)] scale-105 z-10'
                                                : '!bg-gray-900/50 border-white/10 hover:!bg-gray-900/60 contrast-125'
                                                }`}
                                            onClick={() => {
                                                try {
                                                    navigate(`/property/${property.id}`, { state: { property } });
                                                } catch (error) {
                                                    if (import.meta.env.DEV) {
                                                        console.error('Navigation error:', error);
                                                    }
                                                    navigate(`/property/${property.id}`);
                                                }
                                            }}
                                            interactive
                                        >
                                            <div className="flex gap-3">
                                                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                                                    <img
                                                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&h=200'}
                                                        alt={property.title || property.name || 'Property'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-0 left-0 right-0 p-1.5 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${(property.status?.toLowerCase().includes('rent'))
                                                            ? 'bg-emerald-500/90 text-white'
                                                            : 'bg-[#51faaa]/90 text-[#0a0c19]'
                                                            }`}>
                                                            {(property.status?.toLowerCase().includes('rent')) ? 'Rent' : 'Sale'}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    toggleFavorite && toggleFavorite(property);
                                                                } catch (error) {
                                                                    // console.error(error);
                                                                }
                                                            }}
                                                            className="text-white hover:text-red-500 transition-colors"
                                                        >
                                                            <Heart
                                                                size={14}
                                                                fill={isFavorite && isFavorite(property.id) ? "currentColor" : "none"}
                                                                className={isFavorite && isFavorite(property.id) ? "text-red-500" : ""}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <div className="flex items-center justify-between">

                                                            <p className="bg-orange-100 dark:bg-[#ff922d]/10 p-1 rounded-lg inline-block">
                                                                <span className="text-[#ff922d] font-semibold text-lg leading-tight truncate">
                                                                    {property.price ? formatPrice(property.price).split('.')[0] : 'Price on request'}
                                                                </span>
                                                            </p>
                                                            {property.isVerified && (
                                                                <CheckCircle size={14} className="text-emerald-400" fill="currentColor" stroke="black" />
                                                            )}
                                                        </div>
                                                        <p className="text-white p-1 rounded-lg font-medium truncate opacity-95 mt-0.5">
                                                            {property.title || property.name || 'Property'}
                                                        </p>
                                                        <p className="text-gray-400 text-xs truncate mt-0.5 flex items-center gap-1">
                                                            <MapPin size={10} />
                                                            {property.address || property.location?.address || property.city || 'Location not specified'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 text-white/70 text-xs font-medium">
                                                            {property.bedrooms > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <Bed size={12} className="text-emerald-400" /> {property.bedrooms}
                                                                </span>
                                                            )}
                                                            {property.bathrooms > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <Bath size={12} className="text-emerald-400" /> {property.bathrooms}
                                                                </span>
                                                            )}
                                                            {property.area > 0 && (
                                                                <span className="flex items-center gap-1 truncate max-w-[60px]">
                                                                    {/* <Square size={12} className="text-[#51faaa]" /> {property.area} */}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                                            <ChevronRight size={14} className="text-white/80" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </PropertyMobileCard>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Floating Action Buttons - Improved Layout */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">

                    {/* Drawing Tool - Draw a circle to search within that area */}
                    <FloatingActionButton
                        icon={Pencil}
                        variant="secondary"
                        className={isDrawingMode ? "!bg-[#51faaa] !text-[#111] !border-[#51faaa] shadow-xl" : "shadow-lg"}
                        onClick={() => {
                            hapticFeedback(ImpactStyle.Light);
                            if (!isDrawingMode) {
                                // Activate drawing mode - centers on user location
                                setIsDrawingMode(true);
                                // Request location if not available
                                if (!currentLocation) {
                                    refreshLocation();
                                }
                            } else {
                                // Deactivate drawing mode
                                setIsDrawingMode(false);
                                // Reset to show all properties
                                const sourceProperties = propertiesWithCoords.length > 0 ? propertiesWithCoords : properties;
                                setFilteredProperties(sourceProperties);
                                setSearchRadius(null);
                            }
                        }}
                        tooltip={isDrawingMode ? "Exit Search Area" : "Draw Search Area"}
                    />

                    {/* Map Layers - Switch between standard (roadmap) and satellite (hybrid) */}
                    <FloatingActionButton
                        icon={Layers}
                        variant="secondary"
                        className={mapType !== 'standard' ? "!bg-emerald-500 !text-white !border-emerald-600 shadow-xl" : "shadow-lg"}
                        onClick={() => {
                            hapticFeedback(ImpactStyle.Light);
                            setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
                        }}
                        tooltip={mapType === 'standard' ? "Switch to Satellite View" : "Switch to Standard View"}
                    />

                    {/* Locate Me - Recenter on user location */}
                    <FloatingActionButton
                        icon={Locate}
                        variant="secondary"
                        className="shadow-lg"
                        onClick={() => {
                            hapticFeedback(ImpactStyle.Light);
                            recenterMap();
                        }}
                        tooltip="Locate Me"
                    />

                    {/* Clear Filters - Only shows when filters are active */}
                    {activeFilterCount > 0 && (
                        <>
                            <div className="w-full h-px bg-white/10 my-1" />
                            <FloatingActionButton
                                icon={RotateCcw}
                                variant="secondary"
                                className="shadow-lg hover:!bg-red-500/20 hover:!border-red-500/50"
                                onClick={handleClearAllFilters}
                                tooltip="Clear All Filters"
                            />
                        </>
                    )}
                </div>


            </div>

            {/* Explore Menu Drawer - Now using MobileMenuOverlay for consistency */}
            <MobileMenuOverlay
                isOpen={isExploreMenuOpen}
                onClose={() => setIsExploreMenuOpen(false)}
            />

            {/* Full Screen Search Overlay */}
            <SearchBottomSheet
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSearch={handleSearch}
                currentLocation={currentLocation}
            />

            {/* Filter Bottom Sheet */}
            <AnimatePresence>
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-[60]"
                            onClick={() => setShowFilters(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-gray-900 rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl border-t border-gray-200 dark:border-gray-800 pb-20"
                        >
                            {/* Drag Handle */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-6 bg-gradient-to-b from-[#51faaa] to-[#dbd5a4] rounded-full" />
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filters</h2>
                                        {activeFilterCount > 0 && (
                                            <span className="px-2 py-1 bg-[#51faaa] text-[#111] text-xs font-bold rounded-full">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </div>
                                    <motion.button
                                        onClick={() => setShowFilters(false)}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </motion.button>
                                </div>

                                <div className="space-y-6">
                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Price Range</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="number"
                                                placeholder="Min Price"
                                                value={filters.minPrice}
                                                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#51faaa]"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max Price"
                                                value={filters.maxPrice}
                                                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#51faaa]"
                                            />
                                        </div>
                                    </div>

                                    {/* Bedrooms & Bathrooms */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Min Bedrooms</label>
                                            <select
                                                value={filters.minBedrooms}
                                                onChange={(e) => setFilters(prev => ({ ...prev, minBedrooms: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#51faaa]"
                                            >
                                                <option value="">Any</option>
                                                {[1, 2, 3, 4, 5, 6].map(num => (
                                                    <option key={num} value={num}>{num}+</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Min Bathrooms</label>
                                            <select
                                                value={filters.minBathrooms}
                                                onChange={(e) => setFilters(prev => ({ ...prev, minBathrooms: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#51faaa]"
                                            >
                                                <option value="">Any</option>
                                                {[1, 2, 3, 4, 5].map(num => (
                                                    <option key={num} value={num}>{num}+</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Property Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Property Type</label>
                                        <select
                                            value={filters.propertyType}
                                            onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#51faaa]"
                                        >
                                            <option value="">All Types</option>
                                            <option value="apartment">Apartment</option>
                                            <option value="house">House</option>
                                            <option value="villa">Villa</option>
                                            <option value="land">Land</option>
                                            <option value="commercial">Commercial</option>
                                        </select>
                                    </div>
                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Status</label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#51faaa]"
                                        >
                                            <option value="">All Status</option>
                                            <option value="for-sale">For Sale</option>
                                            <option value="for-rent">For Rent</option>
                                        </select>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                                        <motion.button
                                            onClick={handleClearAllFilters}
                                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Clear All
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setShowFilters(false)}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Apply Filters
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            <MobileNavigation />

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .snap-x {
                    scroll-snap-type: x mandatory;
                }
                .snap-center {
                    scroll-snap-align: center;
                }
                .marker-label {
                    background: rgba(17, 24, 39, 0.9) !important;
                    padding: 4px 8px !important;
                    border-radius: 12px !important;
                    border: 2px solid #51faaa !important;
                    font-weight: bold !important;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
                }
            `}</style>
        </>
    );
};

export default memo(HomeScreen);
