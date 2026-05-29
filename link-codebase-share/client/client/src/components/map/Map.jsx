
import "./map.scss";
import { useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function Map({ propertyData }) {
  const [mapUrl, setMapUrl] = useState("");

  useEffect(() => {
    if (!propertyData || propertyData.length === 0) {
      setMapUrl("");
      return;
    }

    // Center the map: average of all property coordinates
    let center = [39.8283, -98.5795]; // Default: center of US
    if (propertyData.length === 1) {
      center = [propertyData[0].latitude, propertyData[0].longitude];
    } else if (propertyData.length > 1) {
      const avgLat = propertyData.reduce((sum, p) => sum + p.latitude, 0) / propertyData.length;
      const avgLng = propertyData.reduce((sum, p) => sum + p.longitude, 0) / propertyData.length;
      center = [avgLat, avgLng];
    }

    // Markers for each property
    const markers = propertyData
      .map(p => `markers=color:red%7C${p.latitude},${p.longitude}`)
      .join("&");

    // Build the Google Static Maps URL
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${center[0]},${center[1]}&zoom=11&size=600x400&maptype=roadmap&${markers}&key=${GOOGLE_MAPS_API_KEY}`;
    setMapUrl(url);
  }, [propertyData]);

  if (!propertyData || propertyData.length === 0) {
    return <div className="map-placeholder">Loading map...</div>;
  }

  return (
    <div className="map-container">
      <div className="map-wrapper">
        <img 
          src={mapUrl} 
          alt="Property Map" 
          className="map-image"
          style={{ 
            width: "100%", 
            height: "400px", 
            objectFit: "cover",
            borderRadius: "8px"
          }}
        />
        <div className="map-overlay">
          <div className="map-info">
            <h3>Property Locations</h3>
            <p>{propertyData.length} properties found</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;