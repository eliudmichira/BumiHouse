import ngeohash from 'ngeohash';
import * as turf from '@turf/turf';
import countyData from '../assets/data/kenya-counties.json';

/**
 * Calculates the Haversine distance between two points in km.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Finds the nearest Kenyan county for a given coordinate.
 * Uses a centroid-based approach for performance.
 */
export const getCountyFromCoords = (lat, lng) => {
    if (!lat || !lng) return null;

    let nearestCounty = null;
    let minDistance = Infinity;

    countyData.forEach(county => {
        const dist = calculateDistance(lat, lng, county.lat, county.lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearestCounty = county;
        }
    });

    // If the nearest county is more than 150km away, it might not be in Kenya
    if (minDistance > 150) {
        return null;
    }

    return nearestCounty;
};

/**
 * Encodes coordinates into a geohash.
 */
export const getGeohash = (lat, lng, precision = 9) => {
    if (!lat || !lng) return null;
    return ngeohash.encode(lat, lng, precision);
};

/**
 * Checks if a location is considered an 'exclusive/posh' area.
 * This is a simplified logic – can be expanded with GeoJSON polygons.
 */
const PREMIUM_ZONES = [
    { name: 'Runda', lat: -1.2267, lng: 36.8167, radius: 2.5 },
    { name: 'Muthaiga', lat: -1.2522, lng: 36.8286, radius: 2.0 },
    { name: 'Karen', lat: -1.3333, lng: 36.7000, radius: 4.0 },
    { name: 'Kileleshwa', lat: -1.2825, lng: 36.7886, radius: 1.5 },
    { name: 'Nyali', lat: -4.0333, lng: 39.7167, radius: 3.0 }
];

export const getPremiumZone = (lat, lng) => {
    return PREMIUM_ZONES.find(zone => {
        const dist = calculateDistance(lat, lng, zone.lat, zone.lng);
        return dist <= zone.radius;
    });
};

/**
 * Formats a location into a displayable string.
 */
export const formatLocation = (countyName, subArea) => {
    if (!countyName) return 'Unknown Location';
    return subArea ? `${subArea}, ${countyName}` : `${countyName} County`;
};

/**
 * Normalizes coordinates from various the property object formats.
 */
export const getNormalizedLatLng = (p) => {
    if (!p) return null;

    // Handle {lat, lng} directly
    if (typeof p.lat === 'number' && typeof p.lng === 'number') {
        return { lat: p.lat, lng: p.lng };
    }

    // Handle {coordinates: {lat, lng}}
    if (p.coordinates?.lat && p.coordinates?.lng) {
        return { lat: Number(p.coordinates.lat), lng: Number(p.coordinates.lng) };
    }

    // Handle {location: {lat, lng}}
    if (p.location?.lat && p.location?.lng) {
        return { lat: Number(p.location.lat), lng: Number(p.location.lng) };
    }

    // Handle Firestore GeoPoint
    if (p.coordinates?.latitude && p.coordinates?.longitude) {
        return { lat: p.coordinates.latitude, lng: p.coordinates.longitude };
    }

    return null;
};
