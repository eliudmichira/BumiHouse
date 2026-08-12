import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Layers, Moon, Home } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// CARTO (CartoDB) basemap tiles — free to use with attribution, powered by OpenStreetMap data.
// https://carto.com/basemaps/
const CARTO_LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const CARTO_DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const CARTO_SUBDOMAINS = 'abcd';
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 }; // Nairobi, Kenya
const DEFAULT_ZOOM = 10;

// Accept {position:{lat,lng}} markers or raw property objects (latitude/longitude, location.*).
function toPosition(item) {
  const p = item?.position;
  if (p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))) {
    return { lat: Number(p.lat), lng: Number(p.lng) };
  }
  if (Number.isFinite(Number(item?.latitude)) && Number.isFinite(Number(item?.longitude))) {
    return { lat: Number(item.latitude), lng: Number(item.longitude) };
  }
  const loc = item?.location?.coordinates || item?.location || item?.coordinates;
  if (loc && Number.isFinite(Number(loc.lat)) && Number.isFinite(Number(loc.lng))) {
    return { lat: Number(loc.lat), lng: Number(loc.lng) };
  }
  if (loc && Number.isFinite(Number(loc.latitude)) && Number.isFinite(Number(loc.longitude))) {
    return { lat: Number(loc.latitude), lng: Number(loc.longitude) };
  }
  return null;
}

function formatPrice(price) {
  const n = typeof price === 'number' ? price : parseFloat(String(price || '').replace(/[^0-9.]/g, ''));
  if (!n || isNaN(n)) return null;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `Ksh ${m >= 10 ? Math.round(m) : Math.round(m * 10) / 10}M`;
  }
  if (n >= 100_000) return `Ksh ${Math.round(n / 1000)}k`;
  return `Ksh ${Math.round(n).toLocaleString()}`;
}

// Green price-pill marker (divIcon) mirroring the Google Maps look.
function buildPillIcon(label, { featured = false, selected = false } = {}) {
  const bg = selected ? (featured ? '#d97706' : '#10b981') : (featured ? '#f59e0b' : '#3dd88a');
  const html = `
    <div style="position: relative; transform: translate(-50%, -100%);">
      <div style="
        background: ${bg};
        color: #fff;
        font: 700 12px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 7px 10px;
        border-radius: 999px;
        border: 2px solid ${selected ? '#ffffff' : 'rgba(255,255,255,0.85)'};
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${label}
      </div>
      <span style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%);
        width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent;
        border-top: 6px solid ${bg};"></span>
    </div>`;
  return L.divIcon({
    className: '',
    html,
    iconSize: [null, null],
    iconAnchor: [0, 0],
  });
}

function FitBounds({ items }) {
  const map = useMap();
  React.useEffect(() => {
    const positions = (Array.isArray(items) ? items : []).map(toPosition).filter(Boolean);
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView([positions[0].lat, positions[0].lng], Math.max(map.getZoom(), 13));
      return;
    }
    const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [items, map]);
  return null;
}

// Leaflet computes its viewport at mount time; if the container is hidden, animating,
// or inside a flexbox that hasn't sized yet, it ends up 0x0 and never draws tiles.
// Watch the container size and re-measure whenever it changes.
function MapResizeHandler() {
  const map = useMap();
  React.useEffect(() => {
    const container = map.getContainer();
    if (!container) return;
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    // Also re-measure shortly after mount in case the container was hidden at mount time.
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [map]);
  return null;
}

/**
 * Fallback interactive map using CARTO (CartoDB) basemap tiles powered by OpenStreetMap data.
 * Renders when the Google Maps API key is missing or fails to load.
 *
 * Accepts an array of either:
 *   - markers: { id, position: {lat,lng}, title, price, onClick, featured, selected, onMouseEnter, onMouseLeave }
 *   - raw properties: { id, title, address, price, latitude, longitude | location.coordinates }
 */
const CartoFallbackMap = ({
  items = [],
  center,
  zoom,
  dark: darkProp,
  className,
  fitToItems = true,
  onItemSelect,
  showStyleSelector = false,
  showCountBadge = false,
  count = 0,
}) => {
  const theme = useTheme();
  // Style selector mirrors the Google map UI: "Default" follows the app theme
  // (light/dark), "Night" always uses the dark basemap.
  const [mapStyle, setMapStyle] = React.useState('default'); // 'default' | 'night'
  const dark = mapStyle === 'night' ? true : (darkProp !== undefined ? darkProp : !!theme?.isDark);

  const normalized = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items
      .map(item => {
        const position = toPosition(item);
        return position ? { item, position } : null;
      })
      .filter(Boolean);
  }, [items]);

  const startCenter = center && toPosition({ position: center })
    ? { lat: Number(center.lat ?? center.latitude), lng: Number(center.lng ?? center.longitude) }
    : DEFAULT_CENTER;

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={startCenter}
        zoom={zoom || DEFAULT_ZOOM}
        // Absolute fill: avoids 0-height collapse when the parent only has
        // a min-height (percentage height chains resolve to auto).
        style={{ position: 'absolute', inset: 0 }}
        scrollWheelZoom
      >
        <MapResizeHandler />
        <TileLayer
          attribution={CARTO_ATTRIBUTION}
          url={dark ? CARTO_DARK_TILES : CARTO_LIGHT_TILES}
          subdomains={CARTO_SUBDOMAINS}
          maxZoom={20}
        />
        {fitToItems && <FitBounds items={items} />}
        {/* Cluster + cull: removeOutsideVisibleBounds (default) only keeps
            markers near the viewport, so 500 markers stay fast while
            panning/zooming. */}
        <MarkerClusterGroup maxClusterRadius={60} showCoverageOnHover={false}>

        {normalized.map(({ item, position }, index) => {
          const label = formatPrice(item.price);
          const active = !!(item.selected || item.active || item.highlighted);
          const icon = label
            ? buildPillIcon(label, { featured: !!item.featured, selected: active })
            : undefined;
          const address =
            typeof item.address === 'string'
              ? item.address
              : item.address?.address || item.address?.city || '';
          return (
            <Marker
              key={item.id || item._id || `marker-${index}`}
              position={[position.lat, position.lng]}
              icon={icon}
              eventHandlers={{
                click: () => item.onClick && item.onClick(),
                mouseover: () => item.onMouseEnter && item.onMouseEnter(),
                mouseout: () => item.onMouseLeave && item.onMouseLeave(),
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong>{item.title || item.name || 'Property'}</strong>
                  {address && (
                    <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{address}</div>
                  )}
                  {label && (
                    <div style={{ color: '#059669', fontWeight: 600, marginTop: 4 }}>{label}</div>
                  )}
                  {onItemSelect && (
                    <button
                      onClick={() => onItemSelect(item)}
                      style={{
                        marginTop: 8,
                        width: '100%',
                        padding: '6px 10px',
                        background: '#3dd88a',
                        color: '#0a0c19',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Map style selector + property count badge (mirrors the Google Maps UI) */}
      {(showStyleSelector || showCountBadge) && (
        <div className="absolute bottom-4 left-4 z-[1100] flex flex-col items-start gap-2">
          {showStyleSelector && (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1.5 flex gap-1">
              {[
                { label: 'Default', value: 'default', icon: Layers },
                { label: 'Night', value: 'night', icon: Moon }
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMapStyle(opt.value)}
                    className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs md:text-sm font-medium transition-all duration-300 ${mapStyle === opt.value
                        ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg shadow-[#51faaa]/20'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {showCountBadge && (
            <div className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5">
              <Home className="w-4 h-4" />
              <span className="font-semibold">{count} properties</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartoFallbackMap;
