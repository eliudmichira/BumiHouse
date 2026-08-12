import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    MarkerClusterer,
    HeatmapLayer,
    DrawingManager
} from '@react-google-maps/api';
import CartoFallbackMap from '../GoogleMap/CartoFallbackMap';

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

// ---------- Price-pill helpers ----------
const formatPricePill = (price) => {
    const n = typeof price === 'number' ? price : parseFloat(String(price || '').replace(/[^0-9.]/g, ''));
    if (!n || isNaN(n)) return 'Ksh —';
    if (n >= 1_000_000) {
        const m = n / 1_000_000;
        return `Ksh ${m >= 10 ? Math.round(m) : (Math.round(m * 10) / 10)}M`;
    }
    if (n >= 100_000) return `Ksh ${Math.round(n / 1000)}k`;
    return `Ksh ${Math.round(n).toLocaleString()}`;
};

const buildPricePillSvg = (label, { featured = false, selected = false } = {}) => {
    const bg = selected
        ? (featured ? '#d97706' : '#10b981')
        : (featured ? '#f59e0b' : '#3dd88a');
    const ring = selected ? '#ffffff' : 'rgba(255,255,255,0.85)';
    const ringW = selected ? 2.5 : 1.25;
    const scale = selected ? 1.1 : 1;
    const charW = 7.2;
    const padX = 14;
    const textW = Math.max(36, Math.ceil(label.length * charW));
    const w = textW + padX * 2;
    const h = 30;
    const totalH = h + 8;
    const cx = w / 2;
    const tailY = h;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${Math.ceil(w * scale)}' height='${Math.ceil(totalH * scale)}' viewBox='0 0 ${w} ${totalH}'>
        <g filter='drop-shadow(0 2px 4px rgba(0,0,0,0.25))'>
            <rect x='1' y='1' rx='15' ry='15' width='${w - 2}' height='${h - 2}' fill='${bg}' stroke='${ring}' stroke-width='${ringW}'/>
            <path d='M ${cx - 6} ${tailY - 1} L ${cx} ${tailY + 7} L ${cx + 6} ${tailY - 1} Z' fill='${bg}' stroke='${ring}' stroke-width='${ringW}' stroke-linejoin='round'/>
            <rect x='${cx - 6}' y='${tailY - 3}' width='12' height='3' fill='${bg}'/>
            <text x='${cx}' y='${h / 2 + 5}' text-anchor='middle' font-family='-apple-system,BlinkMacSystemFont,Inter,Segoe UI,Roboto,sans-serif' font-size='13' font-weight='700' fill='#ffffff'>${label}</text>
        </g>
    </svg>`;
    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        size: { w: Math.ceil(w * scale), h: Math.ceil(totalH * scale) },
        anchor: { x: Math.ceil((w * scale) / 2), y: Math.ceil(totalH * scale) }
    };
};

const buildClusterSvg = (count) => {
    const size = count < 10 ? 44 : count < 50 ? 54 : 64;
    const fill = '#3dd88a';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
        <circle cx='${size / 2}' cy='${size / 2}' r='${size / 2 - 4}' fill='${fill}' fill-opacity='0.25'/>
        <circle cx='${size / 2}' cy='${size / 2}' r='${size / 2 - 8}' fill='${fill}' stroke='#ffffff' stroke-width='3'/>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const CLUSTER_STYLES = [
    { url: buildClusterSvg(5), height: 44, width: 44, textColor: '#ffffff', textSize: 13, fontWeight: 'bold' },
    { url: buildClusterSvg(25), height: 54, width: 54, textColor: '#ffffff', textSize: 14, fontWeight: 'bold' },
    { url: buildClusterSvg(75), height: 64, width: 64, textColor: '#ffffff', textSize: 16, fontWeight: 'bold' }
];


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
    // Once the user pans/drags the map, stop auto-fitting bounds so we don't fight them.
    const userInteractedRef = useRef(false);
    // Track the marker count we last framed, so we only re-fit when it actually changes.
    const lastFitCountRef = useRef(-1);
    // Viewport culling: only render markers inside the current map bounds so we
    // never build hundreds of Marker objects at once (same fix as the list page).
    const [visibleMarkers, setVisibleMarkers] = useState(null); // null until map is interactive
    const boundsListenerRef = useRef(null);
    const boundsDebounceRef = useRef(null);

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

    // Fit the camera to all current markers. Cheap and idempotent — safe to call
    // whenever markers change without remounting the map.
    const fitToMarkers = useCallback((mapInstance) => {
        if (!mapInstance || !window.google?.maps?.LatLngBounds) return;
        if (memoizedMarkers.length === 0) return;

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
            mapInstance.fitBounds(bounds, {
                top: padding?.top || 80,
                right: padding?.right || 80,
                bottom: padding?.bottom || 180,
                left: padding?.left || 20
            });
        }
    }, [memoizedMarkers, padding]);

    // Compute the markers currently inside the map viewport (plus always-kept
    // pins like the user location), so we only build the visible Marker objects.
    const updateVisibleMarkers = useCallback((mapInstance) => {
        if (!mapInstance) return;
        const bounds = mapInstance.getBounds?.();
        if (!bounds) return;
        const next = memoizedMarkers.filter((marker) => {
            // Always keep the user-location pin and draggable (editing) markers.
            if (marker.id === 'user' || marker.draggable) return true;
            const pos = marker?.position;
            if (!pos || pos.lat === undefined || pos.lng === undefined) return false;
            return bounds.contains({ lat: Number(pos.lat), lng: Number(pos.lng) });
        });
        setVisibleMarkers(next);
    }, [memoizedMarkers]);

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

        fitToMarkers(mapInstance);
        updateVisibleMarkers(mapInstance);

        // Keep the culled marker set in sync while the user pans/zooms (debounced).
        boundsListenerRef.current = mapInstance.addListener('bounds_changed', () => {
            if (boundsDebounceRef.current) window.clearTimeout(boundsDebounceRef.current);
            boundsDebounceRef.current = window.setTimeout(() => updateVisibleMarkers(mapInstance), 150);
        });
    }, [options, onMapLoad, fitToMarkers, updateVisibleMarkers]);

    // Re-fit bounds as markers stream in (e.g. progressive geocoding), but stop
    // once the user has panned the map so we don't hijack their view. Only re-fit
    // when the marker count changes, not on every unrelated re-render.
    useEffect(() => {
        if (map && !userInteractedRef.current && memoizedMarkers.length !== lastFitCountRef.current) {
            lastFitCountRef.current = memoizedMarkers.length;
            fitToMarkers(map);
            updateVisibleMarkers(map);
        }
    }, [map, memoizedMarkers, fitToMarkers, updateVisibleMarkers]);

    const onUnmount = useCallback(function callback(map) {
        if (import.meta.env.DEV) {
            console.log('🗺️ Map unmounted');
        }
        if (boundsListenerRef.current) {
            try { boundsListenerRef.current.remove(); } catch (_) { }
            boundsListenerRef.current = null;
        }
        if (boundsDebounceRef.current) {
            window.clearTimeout(boundsDebounceRef.current);
            boundsDebounceRef.current = null;
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

    // ✅ Fallback to the CARTO/OpenStreetMap basemap when Google Maps is unavailable
    if (!GOOGLE_MAPS_API_KEY || loadError) {
        return (
            <CartoFallbackMap
                items={memoizedMarkers}
                center={center || defaultCenter}
                zoom={zoom || 13}
                className={className}
                onItemSelect={(item) => item.onClick && item.onClick()}
            />
        );
    }

    if (!isLoaded) {
        return (
            <div className={`w-full h-full bg-gray-100 dark:bg-gray-900 animate-pulse flex items-center justify-center ${className}`}>
                <span className="text-gray-400 font-medium">Loading Map...</span>
            </div>
        );
    }

    // Render only the markers inside the current viewport once the map is
    // interactive; fall back to the full list until then.
    const markersToRender = Array.isArray(visibleMarkers) ? visibleMarkers : memoizedMarkers;

    // ✅ Custom marker renderer with enhanced visibility
    const renderMarkers = (clusterer) => {
        // console.log(`🎨 Rendering ${markersToRender.length} markers`);

        return markersToRender.map((marker, index) => {
            let customIcon = marker.icon;
            const g = window.google;

            // USER LOCATION MARKER
            if (marker.id === 'user' && g && g.maps && g.maps.SymbolPath) {
                customIcon = {
                    path: g.maps.SymbolPath.CIRCLE,
                    scale: 11,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                    anchor: new g.maps.Point(0, 0),
                };
                return (
                    <Marker
                        key={marker.id || `marker-${index}`}
                        position={marker.position}
                        title={marker.title}
                        icon={customIcon}
                        onClick={marker.onClick}
                        clusterer={clusterer}
                        zIndex={50}
                    />
                );
            }

            // PROPERTY PRICE-PILL MARKER
            if (!customIcon && g && g.maps) {
                const priceVal = marker.price ?? (typeof marker.label === 'string' ? marker.label : marker.label?.text);
                const label = formatPricePill(priceVal);
                const selected = !!(marker.selected || marker.active);
                const pill = buildPricePillSvg(label, { featured: !!marker.featured, selected });
                customIcon = {
                    url: pill.url,
                    scaledSize: new g.maps.Size(pill.size.w, pill.size.h),
                    anchor: new g.maps.Point(pill.anchor.x, pill.anchor.y),
                };
            }

            return (
                <Marker
                    key={marker.id || `marker-${index}`}
                    position={marker.position}
                    title={marker.title}
                    icon={customIcon}
                    onClick={marker.onClick}
                    clusterer={clusterer}
                    zIndex={(marker.selected || marker.active) ? 9999 : (marker.featured ? 500 : 100)}
                    draggable={marker.draggable}
                    onDragEnd={marker.onDragEnd}
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
                onDragStart={() => { userInteractedRef.current = true; }}
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
                                fillColor: '#51faaa',
                                fillOpacity: 0.2,
                                strokeWeight: 2,
                                strokeColor: '#51faaa',
                                clickable: false,
                                editable: true,
                                zIndex: 1,
                            },
                        }}
                        onCircleComplete={onCircleComplete}
                    />
                )}

                {/* Markers with optional clustering (auto-enables when > 30 markers) */}
                {(useClustering || memoizedMarkers.length > 30) ? (
                    <MarkerClusterer
                        options={{
                            gridSize: 60,
                            maxZoom: 15,
                            minimumClusterSize: 2,
                            zoomOnClick: true,
                            averageCenter: true,
                            styles: CLUSTER_STYLES,
                            calculator: (markers) => {
                                const count = markers.length;
                                const index = count < 10 ? 1 : count < 50 ? 2 : 3;
                                const text = count >= 1000 ? `${Math.round(count / 100) / 10}k` : String(count);
                                return { text, index };
                            }
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
                        <div className="absolute inset-0 rounded-full border-2 border-[#51faaa] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-[#51faaa] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-[#51faaa] rounded-full shadow-[0_0_15px_rgba(81,250,170,0.8)] animate-pulse"></div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4">
                            <span className="text-[#51faaa] text-xs font-bold uppercase tracking-[0.2em] drop-shadow-md">
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
