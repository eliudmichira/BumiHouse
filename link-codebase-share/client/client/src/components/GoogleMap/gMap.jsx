import React, { useState, useRef } from 'react';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import "./Gmap.scss"
import GooglePin from '../Googlepin/GooglePin';
import MapPolygons from './MapPolygons';
import DrawToSearch from './DrawToSearch';

function Gmap({data, onBoundsChange, highlightedProperty, onMarkerHover, onDrawComplete, isDrawingMode, onCancelDrawing}){
  const [selected, setSelected] = useState(null);
  const defaultCenter= {lat:  40.7128, lng: -74.0060};
  const gKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef();

  // Example polygon: a rough square in Manhattan
  const samplePolygon = [[
    { lat: 40.73061, lng: -73.935242 }, // NW
    { lat: 40.73061, lng: -73.955242 }, // NE
    { lat: 40.71061, lng: -73.955242 }, // SE
    { lat: 40.71061, lng: -73.935242 }, // SW
    { lat: 40.73061, lng: -73.935242 }  // Close the loop
  ]];

  // Handler for map move/zoom
  const handleMapLoad = (mapInstance) => {
    mapRef.current = mapInstance;
    if (onBoundsChange && mapInstance) {
      mapInstance.addListener('bounds_changed', () => {
        const bounds = mapInstance.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          onBoundsChange({
            ne: { lat: ne.lat(), lng: ne.lng() },
            sw: { lat: sw.lat(), lng: sw.lng() }
          });
        }
      });
    }
  };

  return (
    <div className='map relative'>
      <APIProvider 
        apiKey={gKey}
        libraries={['drawing', 'geometry']}
      >
        <Map
          defaultZoom={12}
          defaultCenter={defaultCenter}
          mapId='DEMO_MAP_ID'
          onClick={() => setSelected(defaultCenter)}
          gestureHandling={'greedy'}
          onLoad={handleMapLoad}
        />
        <GooglePin 
          data={data} 
          highlightedProperty={highlightedProperty} 
          onMarkerHover={onMarkerHover}
        />
        <MapPolygons polygons={samplePolygon} />
        <DrawToSearch 
          onDrawComplete={onDrawComplete}
          isDrawingMode={isDrawingMode}
          onCancel={onCancelDrawing}
        />
      </APIProvider>
    </div>
  )
}

export default Gmap