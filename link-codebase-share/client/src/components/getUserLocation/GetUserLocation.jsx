import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

const GetUserLocation = ({ onLocationSelect }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          onLocationSelect({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          setError("Unable to get your location");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={getUserLocation}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <MapPin className="w-4 h-4" />
        {loading ? "Getting location..." : "Use my location"}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
      {location && (
        <span className="text-green-600 text-sm">
          Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </span>
      )}
    </div>
  );
};

export default GetUserLocation;
