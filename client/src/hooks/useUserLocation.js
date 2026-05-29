import { useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { getCountyFromCoords, getGeohash, getPremiumZone } from '../utils/locationUtils';

export const useUserLocation = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getUserLocation = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Check permissions first
            const permissionStatus = await Geolocation.checkPermissions();

            if (permissionStatus.location === 'denied') {
                const requestStatus = await Geolocation.requestPermissions();
                if (requestStatus.location === 'denied') {
                    throw new Error('Location permission denied');
                }
            }

            let position;
            try {
                position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                });
            } catch (err) {
                console.warn('High accuracy location failed, trying low accuracy...', err);
                position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 3600000 // 1 hour
                });
            }

            const { latitude: lat, longitude: lng } = position.coords;
            const county = getCountyFromCoords(lat, lng);
            const geohash = getGeohash(lat, lng);
            const premiumZone = getPremiumZone(lat, lng);

            const newLocation = {
                coords: { lat, lng },
                county: county?.name || null,
                countyCode: county?.code || null,
                geohash,
                premiumZone: premiumZone?.name || null,
                timestamp: position.timestamp
            };

            setLocation(newLocation);
            setLoading(false);
            return newLocation;
        } catch (err) {
            console.error('Error getting location:', err);
            setError(err.message || 'Unable to retrieve your location');
            setLoading(false);
            return null;
        }
    }, []);

    return { location, loading, error, getUserLocation };
};
