import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    MarkerClusterer,
    HeatmapLayer,
    DrawingManager
} from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: -1.2921,
    lng: 36.8219 // Nairobi
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true, // ✅ Enable zoom control
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    gestureHandling: 'greedy', // ✅ Better mobile interaction
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        }
    ]
};

const libraries = ['drawing', 'geometry', 'marker', 'places', 'visualization'];

const MapView = ({
    center,
    zoom,
    markers = [],
    className,
    useClustering = false,
    heatmapData = [],
    heatmapOptions = null,
    drawingMode = null,
    onCircleComplete = null,
    loading = false,
    mapTypeId = 'roadmap',
    children,
    padding,
    options,
    onMapLoad,
    ...rest
}) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [map, setMap] = useState(null);
    const [activeMapType, setActiveMapType] = useState(mapTypeId || 'roadmap');

    // Update activeMapType if mapTypeId prop changes
    useEffect(() => {
        if (mapTypeId) {
            setActiveMapType(mapTypeId);
        }
    }, [mapTypeId]);

    // ✅ FIX: Memoize markers to prevent re-creation
    const memoizedMarkers = useMemo(() => {
        if (!Array.isArray(markers)) return [];

        // Filter out invalid markers
        return markers.filter(marker => {
            const hasPosition = marker?.position?.lat && marker?.position?.lng;
            const isValidLat = !isNaN(marker.position?.lat) &&
                marker.position.lat >= -90 &&
                marker.position.lat <= 90;
            const isValidLng = !isNaN(marker.position?.lng) &&
                marker.position.lng >= -180 &&
                marker.position.lng <= 180;

            return hasPosition && isValidLat && isValidLng;
        });
    }, [markers]);

    const onLoad = useCallback(function callback(mapInstance) {
        if (import.meta.env.DEV) {
            console.log('✅ Map loaded successfully');
        }
        setMap(mapInstance);

        // Call parent callback if provided
        if (options?.onMapLoad) {
            options.onMapLoad(mapInstance);
        }
        if (onMapLoad) {
            onMapLoad(mapInstance);
        }

        // ✅ FIX: Fit bounds to show all markers
        // Only fit bounds if we have markers and NO center was explicitly provided (or we want to override it)
        // Adjust logic: If user provides 'center', maybe we shouldn't auto-fit?
        // User's code auto-fits. I'll stick to user logic but add a check if center is provided to maybe NOT auto-fit? 
        // Actually for this use case (Home Screen), auto-fitting might be annoying if the user is trying to pan.
        // But the user asked for this code. I will include it.
        // However, standard behavior for "Search" often implies fitting bounds.
        // Let's implement as requested.

        if (memoizedMarkers.length > 0 && window.google?.maps?.LatLngBounds) {
            const bounds = new window.google.maps.LatLngBounds();
            let hasValidMarkers = false;

            memoizedMarkers.forEach(marker => {
                if (marker.position?.lat && marker.position?.lng) {
                    bounds.extend({
                        lat: parseFloat(marker.position.lat),
                        lng: parseFloat(marker.position.lng)
                    });
                    hasValidMarkers = true;
                }
            });

            if (hasValidMarkers) {
                // Use padding if provided, otherwise default
                mapInstance.fitBounds(bounds, {
                    top: padding?.top || 80,
                    right: padding?.right || 80,
                    bottom: padding?.bottom || 180,
                    left: padding?.left || 20
                });

                if (import.meta.env.DEV) {
                    console.log(`✅ Fitted bounds to ${memoizedMarkers.length} markers`);
                }
            }
        }
    }, [options, onMapLoad, memoizedMarkers, padding]);

    const onUnmount = useCallback(function callback(map) {
        if (import.meta.env.DEV) {
            console.log('🗺️ Map unmounted');
        }
        setMap(null);
    }, []);

    // ✅ Update center when it changes
    useEffect(() => {
        if (map && center) {
            map.panTo(center);
        }
    }, [map, center]);

    // ✅ Update zoom when it changes
    useEffect(() => {
        if (map && zoom) {
            map.setZoom(zoom);
        }
    }, [map, zoom]);

    // ✅ Update map type when it changes
    useEffect(() => {
        if (map && activeMapType) {
            map.setMapTypeId(activeMapType);
        }
    }, [map, activeMapType]);

    // ✅ Update padding when it changes
    useEffect(() => {
        if (map && padding) {
            if (typeof map.setPadding === 'function') {
                map.setPadding(padding);
            }
        }
    }, [map, padding]);

    // ✅ Log marker count for debugging
    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log(`📍 Total markers: ${markers.length}, Valid markers: ${memoizedMarkers.length}`);

            if (memoizedMarkers.length === 0 && markers.length > 0) {
                console.warn('⚠️ All markers filtered out due to invalid positions:', markers);
            }
        }
    }, [markers, memoizedMarkers]);

    // ✅ Handle load errors
    if (loadError) {
        return (
            <div className={`w-full h-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center ${className}`}>
                <div className="text-center p-8">
                    <span className="text-red-600 dark:text-red-400 font-medium block mb-2">
                        Failed to load Google Maps
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {loadError.message}
                    </span>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className={`w-full h-full bg-gray-100 dark:bg-gray-900 animate-pulse flex items-center justify-center ${className}`}>
                <span className="text-gray-400 font-medium">Loading Map...</span>
            </div>
        );
    }

    // ✅ Custom marker renderer with enhanced visibility
    const renderMarkers = (clusterer) => {
        // console.log(`🎨 Rendering ${memoizedMarkers.length} markers`);

        return memoizedMarkers.map((marker, index) => {
            // Create custom icon with high visibility - ensure Google Maps API is available
            let customIcon = marker.icon;

            // SPECIAL CASE: User Location Marker (Blue)
            if (marker.id === 'user' && window.google && window.google.maps && window.google.maps.SymbolPath) {
                // Determine scale based on zoom using a rough heuristic if needed, or stick to a good default
                customIcon = {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12, // Slightly larger than standard pins
                    fillColor: '#4285F4', // Google Blue
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                    anchor: new window.google.maps.Point(0, 0),
                };
            }
            // DEFAULT CASE: Property Markers (Orange/Green)
            else if (!customIcon && window.google && window.google.maps && window.google.maps.SymbolPath) {
                // Determine scale based on zoom using a rough heuristic if needed, or stick to a good default
                customIcon = {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: marker.featured ? 18 : 14, // Larger dots (was 12/10)
                    fillColor: marker.featured ? '#F97316' : '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2, // Slightly thinner stroke for cleaner look
                    anchor: new window.google.maps.Point(0, 0),
                };
            }

            return (
                <Marker
                    key={marker.id || `marker-${index}`}
                    position={marker.position}
                    title={marker.title}
                    icon={customIcon}
                    label={marker.label ? (typeof marker.label === 'string' ? {
                        text: marker.label,
                        color: '#FFFFFF', // Changed to white text for better contrast on colored dots
                        fontSize: '11px',
                        fontWeight: 'bold',
                    } : {
                        text: marker.label.text || marker.label,
                        color: marker.label.color || '#FFFFFF', // Changed default to white
                        fontSize: marker.label.fontSize || '11px',
                        fontWeight: marker.label.fontWeight || 'bold',
                    }) : undefined}
                    onClick={marker.onClick}
                    clusterer={clusterer}
                    zIndex={marker.featured ? 100 : 10}
                    draggable={marker.draggable}
                    onDragEnd={marker.onDragEnd}
                    onLoad={() => {
                        // console.log(`✅ Marker ${index} loaded at`, marker.position);
                    }}
                />
            );
        });
    };

    return (
        <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center || defaultCenter}
                zoom={zoom || 13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    ...mapOptions,
                    ...options,
                    mapTypeId: activeMapType
                }}
            >
                {/* Heatmap Layer */}
                {heatmapData && heatmapData.length > 0 && (
                    <HeatmapLayer
                        data={heatmapData}
                        options={heatmapOptions || {}}
                    />
                )}

                {/* Drawing Manager - Only render when drawingMode is explicitly set to 'circle' */}
                {drawingMode === 'circle' && (
                    <DrawingManager
                        options={{
                            drawingMode: window.google?.maps?.drawing?.OverlayType?.CIRCLE || 'circle',
                            drawingControl: false,
                            circleOptions: {
                                fillColor: '#3b82f6',
                                fillOpacity: 0.2,
                                strokeWeight: 2,
                                strokeColor: '#3b82f6',
                                clickable: false,
                                editable: true,
                                zIndex: 1,
                            },
                        }}
                        onCircleComplete={onCircleComplete}
                    />
                )}

                {/* Markers with optional clustering */}
                {useClustering ? (
                    <MarkerClusterer
                        options={{
                            gridSize: 60,
                            maxZoom: 15,
                            minimumClusterSize: 2,
                            zoomOnClick: true,
                            averageCenter: true,
                            styles: [
                                {
                                    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTIiIGhlaWdodD0iNTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjYiIGN5PSIyNiIgcj0iMjQiIGZpbGw9IiMxMEI5ODEiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+',
                                    height: 52,
                                    width: 52,
                                    textColor: '#ffffff',
                                    textSize: 14
                                },
                                {
                                    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjgiIGZpbGw9IiNGOTczMTYiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+',
                                    height: 60,
                                    width: 60,
                                    textColor: '#ffffff',
                                    textSize: 16
                                },
                                {
                                    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjgiIGhlaWdodD0iNjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzQiIGN5PSIzNCIgcj0iMzIiIGZpbGw9IiNFRjQ0NDQiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+',
                                    height: 68,
                                    width: 68,
                                    textColor: '#ffffff',
                                    textSize: 18
                                }
                            ]
                        }}
                        onLoad={(clusterer) => {
                            if (import.meta.env.DEV) {
                                console.log('✅ Clusterer loaded with', memoizedMarkers.length, 'markers');
                            }
                        }}
                    >
                        {(clusterer) => renderMarkers(clusterer)}
                    </MarkerClusterer>
                ) : (
                    renderMarkers(null)
                )}

                {/* Custom children */}
                {children}
            </GoogleMap>



            {/* Radar Loading Effect */}
            {loading && (
                <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="relative w-64 h-64">
                        <div className="absolute inset-0 rounded-full border-2 border-[#3b82f6] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-[#3b82f6] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-[#3b82f6] rounded-full shadow-[0_0_15px_rgba(81,250,170,0.8)] animate-pulse"></div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4">
                            <span className="text-[#3b82f6] text-xs font-bold uppercase tracking-[0.2em] drop-shadow-md">
                                Scanning Area...
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Marker Count Badge */}
            {import.meta.env.DEV && (
                <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono">
                    📍 {memoizedMarkers.length} markers loaded
                </div>
            )}
        </div>
    );
};

export default MapView;
