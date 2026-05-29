import * as React from 'react';
import { RMap, RMarker, RPopup, RMapContextProvider } from 'maplibre-react-components';
import 'maplibre-gl/dist/maplibre-gl.css';

// Use a free OpenStreetMap style instead of MapTiler
const MAP_STYLE = 'https://demotiles.maplibre.org/style.json';
const DEFAULT_CENTER = [-74.0060, 40.7128]; // [lng, lat] for New York

function MapLibreMapComponent({ data = [], highlightedProperty, onMarkerHover }) {
  const [popupInfo, setPopupInfo] = React.useState(null);
  const markers = data.filter(p => p.latitude && p.longitude);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <RMapContextProvider>
        <RMap
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLE}
          initialCenter={DEFAULT_CENTER}
          initialZoom={11}
        >
          {markers.map(property => (
            <RMarker
              key={property.id}
              longitude={property.longitude}
              latitude={property.latitude}
            >
              <div
                style={{
                  background: highlightedProperty === property.id ? '#2563eb' : 'white',
                  border: '2px solid #2563eb',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: highlightedProperty === property.id ? 'white' : '#2563eb',
                  fontWeight: 700,
                  fontSize: 12,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => onMarkerHover && onMarkerHover(property.id)}
                onMouseLeave={() => onMarkerHover && onMarkerHover(null)}
                onClick={e => {
                  e.stopPropagation();
                  setPopupInfo(property);
                }}
              >
                ●
              </div>
            </RMarker>
          ))}
          {popupInfo && (
            <RPopup
              longitude={popupInfo.longitude}
              latitude={popupInfo.latitude}
              closeOnClick={false}
              onClose={() => setPopupInfo(null)}
            >
              <div style={{ minWidth: 180 }}>
                <b>{popupInfo.title}</b><br />
                {popupInfo.address}<br />
                Price: ${popupInfo.price?.toLocaleString()}
              </div>
            </RPopup>
          )}
        </RMap>
      </RMapContextProvider>
    </div>
  );
}

export default MapLibreMapComponent; 