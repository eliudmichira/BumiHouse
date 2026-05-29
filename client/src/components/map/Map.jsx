
import "./map.scss";
import { useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function Map({ propertyData }) {
  const [mapUrl, setMapUrl] = useState("");
  const [validProperties, setValidProperties] = useState([]);

  useEffect(() => {
    if (!propertyData || propertyData.length === 0) {
      setMapUrl("");
      setValidProperties([]);
      return;
    }

    // Filter valid properties first
    const valid = propertyData.filter(p => 
      Number.isFinite(p.latitude) && Number.isFinite(p.longitude) &&
      p.latitude >= -5 && p.latitude <= 5 && p.longitude >= 33 && p.longitude <= 42
    );
    setValidProperties(valid);

    // Center the map: average of valid property coordinates
    let center = [-1.2921, 36.8219]; // Default: center of Nairobi, Kenya
    if (valid.length === 1) {
      center = [valid[0].latitude, valid[0].longitude];
    } else if (valid.length > 1) {
      const avgLat = valid.reduce((sum, p) => sum + p.latitude, 0) / valid.length;
      const avgLng = valid.reduce((sum, p) => sum + p.longitude, 0) / valid.length;
      center = [avgLat, avgLng];
    }

    // Markers for each valid property
    const markers = valid
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
            <p>{validProperties.length} properties found</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;