import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FlyToBounds({ bounds }) {
  const map = useMap();
  React.useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

const LeafletMap = ({ data = [], highlightedProperty, onMarkerHover }) => {
  // Center on New York by default
  const defaultCenter = [40.7128, -74.0060];
  const markers = data.filter(p => p.latitude && p.longitude);
  const bounds = markers.length > 0 ? markers.map(p => [p.latitude, p.longitude]) : null;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bounds && <FlyToBounds bounds={bounds} />}
      {markers.map(property => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          eventHandlers={{
            mouseover: () => onMarkerHover && onMarkerHover(property.id),
            mouseout: () => onMarkerHover && onMarkerHover(null),
          }}
        >
          <Popup>
            <b>{property.title}</b><br />
            {property.address}<br />
            Price: ${property.price.toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap; 