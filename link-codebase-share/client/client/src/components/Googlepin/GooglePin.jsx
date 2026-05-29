import { useEffect, useRef } from 'react';
import { AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const GooglePin = ({ data, highlightedProperty, onMarkerHover }) => {
  const map = useMap();
  const clustererRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;

    // Remove previous markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    // Create native Google Maps markers for clustering
    const markers = data
      .filter(location => location && location.latitude && location.longitude) // Filter out invalid data
      .map(location => {
        const isHighlighted = highlightedProperty === location.id;
        
        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.innerHTML = `
          <div style="
            width: ${isHighlighted ? '50px' : '40px'};
            height: ${isHighlighted ? '50px' : '40px'};
            background: ${isHighlighted ? '#EF4444' : '#3B82F6'};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial;
            font-size: ${isHighlighted ? '14px' : '12px'};
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ${isHighlighted ? 'box-shadow: 0 0 20px rgba(239,68,68,0.6);' : ''}
          ">
            $${Math.round((location.price || 0)/1000)}k
          </div>
        `;

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) },
          map,
          title: location.title,
          content: markerElement,
          zIndex: isHighlighted ? 1000 : 1
        });

      // Add hover events to marker
      marker.addListener('mouseover', () => {
        if (onMarkerHover) {
          onMarkerHover(location.id);
        }
      });

      marker.addListener('mouseout', () => {
        if (onMarkerHover) {
          onMarkerHover(null);
        }
      });

      // Add click event to marker
      marker.addListener('click', () => {
        // You can add navigation or info window here
        });

      return marker;
    });
    markersRef.current = markers;

    // Create and add clusterer with basic options (no GridAlgorithm)
    clustererRef.current = new MarkerClusterer({
      map,
      markers,
      renderer: {
        render: ({ count, position }) => {
          const svg = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#fff" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${count}</text>
            </svg>
          `;
          
          const clusterElement = document.createElement('div');
          clusterElement.innerHTML = `
            <div style="
              width: 40px;
              height: 40px;
              background: #3B82F6;
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-family: Arial;
              font-size: 14px;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              ${count}
            </div>
          `;

          return new window.google.maps.marker.AdvancedMarkerElement({
            position,
            content: clusterElement,
            title: `${count} properties`,
            zIndex: Number.MAX_SAFE_INTEGER
          });
        }
      }
    });

    return () => {
      markers.forEach(marker => marker.setMap(null));
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
    };
  }, [map, data, highlightedProperty, onMarkerHover]);

  // No need to render anything in React tree, markers are managed by Google Maps API
  return null;
};

export default GooglePin;
