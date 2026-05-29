import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import mapThemes from '../../utils/mapThemes';
import {
    GoogleMap as GoogleMapComponent,
    useJsApiLoader,
    Marker,
    InfoWindow,
    MarkerClusterer,
    DrawingManager
} from '@react-google-maps/api';
import {
    Search, MapPin, Home, Building2, Bed, Bath, Heart, Grid, List,
    SlidersHorizontal, ChevronDown, X, Filter, ArrowUp, Share, Phone,
    Mail, Star, TrendingUp, Clock, Eye, Bookmark, Share2, MessageCircle,
    Calendar, ChevronLeft, ChevronRight, Plus, Minus, Camera, Video,
    School, Train, Info, ZoomIn, Expand, Navigation, Map,
    Sparkles, Shield, Zap, ArrowRight, Layers, Compass, RefreshCw,
    DollarSign, Square, Users, Car, Trees, Waves, Coffee,
    Check, MoreHorizontal, TrendingDown, Moon, Mountain, Wifi,
    AirVent, Snowflake, Flame, ParkingCircle, Dog, Droplets,
    ChefHat, Wine, TreePine, Sun, Building, Truck,
    CloudCog, Bus, ArrowUpDown, MapIcon
} from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import { fetchMarketInsights, formatKes } from '../../services/aiInsights';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getNormalizedLatLng } from '../../utils/locationUtils';
import EnhancedMap from '../../routes/listPage/listPage_fixed_useLocation';





// Google Maps API Key - strict in dev, safe fallback in prod
const IS_PROD = import.meta.env.PROD;
const ENV_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
const PROD_FALLBACK_KEY = 'REDACTED';
const GOOGLE_MAPS_API_KEY = IS_PROD ? (ENV_KEY || PROD_FALLBACK_KEY) : ENV_KEY;
const HAS_GOOGLE_MAPS_KEY = GOOGLE_MAPS_API_KEY.length > 0;

// Keep libraries array stable to avoid unnecessary reloads
const MAP_LIBRARIES = ['drawing', 'geometry', 'marker', 'places', 'visualization'];

// Debug: Log the API key state
if (!HAS_GOOGLE_MAPS_KEY) {
    console.error('[Maps] VITE_GOOGLE_MAPS_API_KEY is missing. In dev, add it to client/.env.local then restart (npm run dev).');
}

// Enhanced debugging for production
if (import.meta.env.DEV) {
    console.log('Maps key present:', HAS_GOOGLE_MAPS_KEY, 'env mode:', IS_PROD ? 'prod' : 'dev');
    console.log('All env vars (filtered):', Object.keys(import.meta.env || {}));
} else {
    // Production debugging - minimal but informative
    console.log('🗺️ Maps API Key loaded:', HAS_GOOGLE_MAPS_KEY ? 'Yes' : 'No');
    console.log('🌍 Environment:', import.meta.env.MODE);
    console.log('🔗 API URL:', import.meta.env.VITE_API_URL);
    console.log('🔑 Maps Key (first 10 chars):', GOOGLE_MAPS_API_KEY ? GOOGLE_MAPS_API_KEY.substring(0, 10) + '...' : 'MISSING');
}

// Default map center (Nairobi, Kenya)
const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };
// const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // New York (commented out)

const DEFAULT_ZOOM = 10; // Closer zoom for city view



const EnhancedMapComponent = ({ propertyData, highlightedProperty, onMarkerHover, onPropertySelect, drawnBounds, setDrawnBounds, mapTheme, setMapTheme, mapCenter, setMapCenter, mapZoom, setMapZoom }) => {

    let { data, isError, isLoading: propertiesLoading } = useProperties()
    const properties = data?.properties || []

    const [selectedProperty, setSelectedProperty] = useState(null);
    const [map, setMap] = useState(null);
    const [showSchools, setShowSchools] = useState(false);
    const [showTransit, setShowTransit] = useState(false);
    const [drawingMode, setDrawingMode] = useState(false);
    const [oms, setOms] = useState(null);
    const [visibleProperties, setVisibleProperties] = useState(null);
    const boundsListenerRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const normalizedProperties = useMemo(() => {
        const source = Array.isArray(propertyData) ? propertyData : [];
        return source.map((property) => {
            const coords = getNormalizedLatLng(property);
            if (!coords) return null;
            return { ...property, latitude: coords.lat, longitude: coords.lng };
        }).filter(Boolean);
    }, [propertyData]);
    const [mapsApiError, setMapsApiError] = useState(false);
    const navigate = useNavigate();

    // Ensure this component can safely check if the Google Maps API is available
    const mapsReady = typeof window !== 'undefined' && !!(window.google && window.google.maps);
    const canInstantiateMap = typeof window !== 'undefined' && !!(window.google && window.google.maps && typeof window.google.maps.Map === 'function');

    // Add safety check for google object with better error handling
    const safeGoogle = typeof window !== 'undefined' && window.google ? window.google : null;

    // Global error handler for Google Maps API
    useEffect(() => {
        const handleGoogleError = (event) => {
            if (event.message && event.message.includes('google is not defined')) {
                console.warn('Google Maps API not yet loaded, retrying...');
                event.preventDefault();
                return false;
            }
        };

        window.addEventListener('error', handleGoogleError);

        return () => {
            window.removeEventListener('error', handleGoogleError);
            // Cleanup retry timeout on unmount
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
            retryCountRef.current = 0;
        };
    }, []);

    // Track retry attempts to prevent infinite loops
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 5;
    const retryTimeoutRef = useRef(null);

    const onLoad = useCallback(async (mapInstance) => {
        // Clear any existing timeout
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        if (import.meta.env.DEV) {
            console.log('🗺️ onLoad called with mapInstance:', !!mapInstance, 'retry:', retryCountRef.current);
        }
        setMap(mapInstance);
        try {
            // Wait for Google Maps to be fully loaded with all required methods
            if (!window.google || !window.google.maps || !window.google.maps.Map || !window.google.maps.Projection) {
                if (retryCountRef.current >= MAX_RETRIES) {
                    if (import.meta.env.DEV) {
                        console.error('Google Maps failed to load after', MAX_RETRIES, 'retries');
                    }
                    return;
                }
                retryCountRef.current += 1;
                if (import.meta.env.DEV) {
                    console.warn('Google Maps not fully ready, retrying...', retryCountRef.current);
                }
                retryTimeoutRef.current = setTimeout(() => onLoad(mapInstance), 1000);
                return;
            }

            // Additional check for required projection methods
            if (!window.google.maps.Projection.prototype.fromLatLngToDivPixel) {
                if (retryCountRef.current >= MAX_RETRIES) {
                    if (import.meta.env.DEV) {
                        console.error('Google Maps projection methods failed to load after', MAX_RETRIES, 'retries');
                    }
                    return;
                }
                retryCountRef.current += 1;
                if (import.meta.env.DEV) {
                    console.warn('Google Maps projection methods not ready, retrying...', retryCountRef.current);
                }
                retryTimeoutRef.current = setTimeout(() => onLoad(mapInstance), 1000);
                return;
            }

            // Reset retry count on success
            retryCountRef.current = 0;

            // Check if we're in production and disable spider if there are issues
            const isProduction = import.meta.env.PROD;
            console.log('🔍 Environment check - isProduction:', isProduction);

            // Skip OverlappingMarkerSpiderfier in production to avoid errors
            if (isProduction) {
                console.log('🚫 OverlappingMarkerSpiderfier disabled in production to prevent errors');
                setOms(null);
                if (import.meta.env.DEV) {
                    console.log('✅ onLoad completed successfully in production mode');
                }
                return;
            }

            // Only import in development - use dynamic import with error handling
            let OverlappingMarkerSpiderfier;
            try {
                // Add a small delay to ensure Google Maps is fully ready
                await new Promise(resolve => setTimeout(resolve, 100));

                const module = await import('overlapping-marker-spiderfier');
                OverlappingMarkerSpiderfier = module.default;
            } catch (importError) {
                console.warn('⚠️ Failed to import OverlappingMarkerSpiderfier:', importError.message);
                setOms(null);
                return;
            }

            // Ensure the library is properly loaded
            if (!OverlappingMarkerSpiderfier) {
                console.warn('OverlappingMarkerSpiderfier not available');
                return;
            }

            // Wait a bit more for the map to be fully rendered
            await new Promise(resolve => setTimeout(resolve, 500));

            // Wrap the spider initialization in a try-catch to handle any remaining errors
            let spider;
            try {
                spider = new OverlappingMarkerSpiderfier(mapInstance, {
                    markersWontMove: true,
                    markersWontHide: true,
                    keepSpiderfied: true,
                    nearbyDistance: 1,
                    circleSpiralSwitchover: 8
                });
                setOms(spider);
                if (import.meta.env.DEV) {
                    console.log('✅ OverlappingMarkerSpiderfier initialized successfully');
                }
            } catch (spiderError) {
                console.warn('⚠️ OverlappingMarkerSpiderfier initialization failed:', spiderError.message);
                // Continue without spider functionality
                setOms(null);
            }
        } catch (e) {
            setOms(null);
        }

        // Debounced bounds-only rendering
        const updateVisible = () => {
            if (!mapInstance) return;
            const bounds = mapInstance.getBounds?.();
            if (!bounds) return;
            const next = (Array.isArray(propertyData) ? propertyData : []).filter((property) => {
                const coords = getNormalizedLatLng(property);
                if (!coords) return false;
                const pos = safeGoogle?.maps?.LatLng ? new safeGoogle.maps.LatLng(coords.lat, coords.lng) : null;
                return bounds.contains(pos);
            });
            setVisibleProperties(next);
        };

        const debouncedUpdate = () => {
            if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = window.setTimeout(updateVisible, 150);
        };

        updateVisible();
        boundsListenerRef.current = mapInstance.addListener('bounds_changed', debouncedUpdate);

        // Fit bounds to show all properties if available
        if (propertyData && propertyData.length > 0) {
            const bounds = safeGoogle?.maps?.LatLngBounds ? new safeGoogle.maps.LatLngBounds() : null;
            let validProperties = 0;

            propertyData.forEach(property => {
                const lat = parseFloat(property.latitude);
                const lng = parseFloat(property.longitude);

                if (lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    bounds.extend({ lat, lng });
                    validProperties++;
                }
            });

            if (validProperties > 0) {
                mapInstance.fitBounds(bounds);
            }
        }
    }, [propertyData]);

    const onUnmount = useCallback(() => {
        if (boundsListenerRef.current) {
            try { boundsListenerRef.current.remove(); } catch (_) { }
            boundsListenerRef.current = null;
        }
        if (debounceTimerRef.current) {
            window.clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        // Cleanup retry timeout
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        retryCountRef.current = 0;
        setMap(null);
    }, []);

    // Recompute visible markers on data change
    useEffect(() => {
        if (!map) return;
        const bounds = map.getBounds?.();
        if (!bounds) return;
        const next = (Array.isArray(normalizedProperties) ? normalizedProperties : []).filter((property) => {
            const pos = safeGoogle?.maps?.LatLng ? new safeGoogle.maps.LatLng(property.latitude, property.longitude) : null;
            return bounds.contains(pos);
        });
        setVisibleProperties(next);
    }, [map, normalizedProperties]);

    const mapContainerStyle = { width: '100%', height: '100%' };

    // Get map options based on theme
    const getMapOptions = useMemo(() => {
        const baseOptions = {
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
        };

        if (mapTheme === 'satellite') {
            baseOptions.mapTypeId = safeGoogle?.maps?.MapTypeId?.SATELLITE;
        } else {
            baseOptions.styles = mapThemes[mapTheme] || mapThemes.default;
        }

        return baseOptions;
    }, [mapTheme]);

    // Custom marker icon
    const createCustomMarker = (property, isHighlighted) => {
        // If API key is not set, use default markers
        return null; // This will use the default Google Maps marker
    };

    const handleMarkerClick = (property) => {
        setSelectedProperty(property);
        onPropertySelect && onPropertySelect(property);

        // Pan map to the selected property so the card is centered
        if (map) {
            map.panTo({
                lat: parseFloat(property.latitude || property.location?.coordinates?.lat),
                lng: parseFloat(property.longitude || property.location?.coordinates?.lng)
            });
            // Optionally adjust zoom to focus nicely on the property
            // map.setZoom(15);
        }
    };

    const handleMarkerMouseOver = (property) => {
        onMarkerHover && onMarkerHover(property.id);
    };

    const handleMarkerMouseOut = () => {
        onMarkerHover && onMarkerHover(null);
    };

    const handleZoomIn = () => {
        if (map) {
            const newZoom = Math.min(map.getZoom() + 1, 20);
            map.setZoom(newZoom);
            setMapZoom(newZoom);
        }
    };

    const handleZoomOut = () => {
        if (map) {
            const newZoom = Math.max(map.getZoom() - 1, 3);
            map.setZoom(newZoom);
            setMapZoom(newZoom);
        }
    };

    const handleCenterMap = () => {
        if (map && propertyData && propertyData.length > 0) {
            const bounds = safeGoogle?.maps?.LatLngBounds ? new safeGoogle.maps.LatLngBounds() : null;
            let validProperties = 0;

            propertyData.forEach(property => {
                const lat = parseFloat(property.latitude);
                const lng = parseFloat(property.longitude);

                if (lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    bounds.extend({ lat, lng });
                    validProperties++;
                }
            });

            if (validProperties > 0) {
                map.fitBounds(bounds);
            }
        }
    };

    // Filter valid properties for markers
    const validProperties = useMemo(() => {
        if (!propertyData || !Array.isArray(propertyData)) return [];

        return propertyData.filter(property => {
            const lat = parseFloat(property.latitude);
            const lng = parseFloat(property.longitude);
            return lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        });
    }, [propertyData]);

    return (
        <div className="relative flex-1 min-w-0 h-[calc(100vh-96px)] bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden">
            {/* API Key Warning */}
            {!HAS_GOOGLE_MAPS_KEY && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-medium">Google Maps API key not configured - showing placeholder</span>
                    </div>
                </div>
            )}

            {!HAS_GOOGLE_MAPS_KEY ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
                    <div className="text-center p-8">
                        <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Google Maps API Key Required</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Please configure your Google Maps API key to view the interactive map.
                        </p>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-left text-sm">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                <strong>Steps to fix:</strong>
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                <li>Enable Maps JavaScript API in Google Cloud Console</li>
                                <li>Update API key restrictions to include Maps APIs</li>
                                <li>Add your domain to the allowed referrers</li>
                            </ol>
                        </div>
                    </div>
                </div>
            ) : mapsApiError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
                    <div className="text-center p-8">
                        <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Maps Temporarily Unavailable</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            We're having trouble loading the interactive map. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-[#3b82f6] text-[#0a0c19] rounded-lg hover:bg-[#45e595] transition-colors font-medium"
                        >
                            Refresh Page
                        </button>

                        {/* Fallback property list */}
                        {propertyData && propertyData.length > 0 && (
                            <div className="mt-6 text-left">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Available Properties:</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {propertyData.slice(0, 5).map((property) => (
                                        <div key={property.id} className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-white dark:bg-gray-700 rounded">
                                            <div className="font-medium">{property.title || property.address}</div>
                                            <div>${property.price?.toLocaleString()}</div>
                                            {property.latitude && property.longitude && (
                                                <div className="text-gray-500">
                                                    📍 {property.latitude}, {property.longitude}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                !canInstantiateMap ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300">Loading map…</div>
                ) : (
                    <div className="w-full h-full">
                        <GoogleMapComponent
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={mapZoom}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            options={getMapOptions}
                        >
                            {/* Property markers with clustering */}
                            {validProperties.length > 0 && (
                                <MarkerClusterer
                                    options={{
                                        maxZoom: 16,
                                        gridSize: 60,
                                        minimumClusterSize: 2,
                                        zoomOnClick: true,
                                        averageCenter: true,
                                        ignoreHidden: true,
                                        calculator: (markers, numStyles) => {
                                            const count = markers.length;
                                            const index = count < 10 ? 1 : count < 50 ? 2 : 3;
                                            const text = count >= 1000 ? `${Math.round(count / 100) / 10}k` : String(count);
                                            return { text, index };
                                        }
                                    }}
                                >
                                    {(clusterer) => {
                                        const baseList = (Array.isArray(visibleProperties) && visibleProperties.length > 0)
                                            ? visibleProperties
                                            : normalizedProperties;

                                        if (normalizedProperties.length === 0) {
                                            return null;
                                        }

                                        return (
                                            <>
                                                {normalizedProperties.map((property, index) => {
                                                    return (
                                                        <Marker
                                                            key={property.id || property._id || `${property.latitude},${property.longitude}`}
                                                            position={{ lat: property.latitude, lng: property.longitude }}
                                                            onClick={() => handleMarkerClick(property)}
                                                            onMouseOver={() => handleMarkerMouseOver(property)}
                                                            onMouseOut={handleMarkerMouseOut}
                                                            title={property.title || 'Property'}
                                                            clusterer={clusterer}
                                                            onLoad={(marker) => {
                                                                if (oms) { oms.addMarker(marker); }
                                                            }}
                                                            onUnmount={(marker) => {
                                                                if (oms) { try { oms.removeMarker(marker); } catch (_) { } }
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </>
                                        );
                                    }}
                                </MarkerClusterer>
                            )}

                            {/* Drawing Manager for boundaries */}
                            {drawingMode && (
                                <DrawingManager
                                    onPolygonComplete={(polygon) => {
                                        setDrawnBounds && setDrawnBounds(polygon);
                                        setDrawingMode(false);
                                    }}
                                    options={{
                                        drawingControl: false,
                                        polygonOptions: {
                                            fillColor: '#3B82F6',
                                            fillOpacity: 0.1,
                                            strokeColor: '#3B82F6',
                                            strokeWeight: 2,
                                            clickable: false,
                                            editable: true,
                                            zIndex: 1
                                        }
                                    }}
                                />
                            )}

                            {/* Info Window for selected property */}
                            {selectedProperty && (
                                <InfoWindow
                                    position={{
                                        lat: parseFloat(selectedProperty.latitude),
                                        lng: parseFloat(selectedProperty.longitude)
                                    }}
                                    onCloseClick={() => setSelectedProperty(null)}
                                    options={{
                                        pixelOffset: (typeof window !== 'undefined' && window.google && window.google.maps)
                                            ? new window.google.maps.Size(0, 400)
                                            : undefined,
                                        zIndex: 999
                                    }}
                                >
                                    <div className="p-3 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-visible" style={{ zIndex: 1000 }}>
                                        <img
                                            src={selectedProperty.images?.[0] || '/placeholder-property.jpg'}
                                            alt={selectedProperty.title}
                                            className="w-full h-32 object-cover rounded-lg mb-2"
                                        />
                                        <h3 className="text-base font-bold text-gray-900 mb-0 truncate">
                                            {typeof selectedProperty.price === 'number' ? `Ksh ${selectedProperty.price.toLocaleString()}` : selectedProperty.price}
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-0 truncate">{selectedProperty.address}</p>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 mb-2">
                                            <span>{selectedProperty.bedrooms} beds</span>
                                            <span>{selectedProperty.bathrooms} baths</span>
                                            {/* {selectedProperty.area && <span>{selectedProperty.area.toLocaleString()} sqft</span>} */}
                                        </div>
                                        <button
                                            onClick={() => navigate(`/property/${selectedProperty.id}`)}
                                            className="w-full px-3 py-1.5 bg-[#3b82f6] text-[#0a0c19] rounded-lg hover:bg-[#06b6d4] transition-colors text-xs font-semibold"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMapComponent>
                    </div>
                )
            )}

            {/* Map Controls */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                {/* Zoom Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                        onClick={handleZoomIn}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                    >
                        <Plus className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Minus className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>
                </div>

                {/* Drawing Tool */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1">
                    <button
                        onClick={() => setDrawingMode(!drawingMode)}
                        className={`p-3 rounded-xl transition-all duration-300 ${drawingMode
                            ? 'bg-[#3b82f6] text-[#0a0c19] shadow-lg shadow-[#3b82f6]/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                        title="Draw boundary"
                    >
                        <Map className="w-5 h-5" />
                    </button>
                </div>

                {/* Center Map */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1">
                    <button
                        onClick={handleCenterMap}
                        className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                        title="Center map on properties"
                    >
                        <Compass className="w-5 h-5" />
                    </button>
                </div>

                {/* Layer Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1">
                    <button
                        onClick={() => setShowSchools(!showSchools)}
                        className={`p-3 rounded-xl transition-all duration-300 ${showSchools
                            ? 'bg-[#3b82f6] text-[#0a0c19] shadow-lg shadow-[#3b82f6]/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                        title="Schools"
                    >
                        <School className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowTransit(!showTransit)}
                        className={`p-3 rounded-xl transition-all duration-300 mt-1 ${showTransit
                            ? 'bg-[#06b6d4] text-[#0a0c19] shadow-lg shadow-[#06b6d4]/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                        title="Transit"
                    >
                        <Train className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Map Style Selector - centered within map area */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 backdrop-blur">
                <div className="flex gap-1">
                    {[
                        { label: 'Default', value: 'default', icon: Layers },
                        { label: 'Night', value: 'night', icon: Moon },
                        { label: 'Satellite', value: 'satellite', icon: Compass }
                    ].map((theme) => (
                        <button
                            key={theme.value}
                            onClick={() => setMapTheme(theme.value)}
                            className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs md:text-sm font-medium transition-all duration-300 ${mapTheme === theme.value
                                ? 'bg-[#3b82f6] text-[#0a0c19] shadow-lg shadow-[#3b82f6]/20'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <theme.icon className="w-4 h-4" />
                            {theme.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Property Count Badge */}
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-[#0a0c19] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
                <Home className="w-5 h-5" />
                <span className="font-semibold">{propertyData.length} properties</span>
            </div>

            {/* Drawing Mode Indicator */}
            {drawingMode && (
                <div className="absolute bottom-4 right-4 bg-[#3b82f6] text-[#0a0c19] px-4 py-2 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2">
                        <Map className="w-4 h-4" />
                        <span className="text-sm font-medium">Click to draw boundary</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EnhancedMapComponent;