import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

// polygons: array of arrays of {lat, lng}
const MapPolygons = ({ polygons = [], options = {} }) => {
  const map = useMap();
  const polygonsRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;
    // Remove previous polygons
    polygonsRef.current.forEach(poly => poly.setMap(null));
    polygonsRef.current = [];

    // Draw new polygons
    polygons.forEach(path => {
      const polygon = new window.google.maps.Polygon({
        paths: path,
        strokeColor: options.strokeColor || '#3B82F6',
        strokeOpacity: options.strokeOpacity || 0.8,
        strokeWeight: options.strokeWeight || 2,
        fillColor: options.fillColor || '#3B82F6',
        fillOpacity: options.fillOpacity || 0.15,
        map,
        ...options
      });
      polygonsRef.current.push(polygon);
    });

    return () => {
      polygonsRef.current.forEach(poly => poly.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, polygons, options]);

  return null;
};

export default MapPolygons; 