import React from 'react';
import { MapPin, Navigation, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import MapView from '../../../components/map/MapView';

const StepLocation = ({ formData, handleInputChange, handleMapsLinkChange, handleGeocode, geocoding, resolvingUrl, errors }) => {
    const { isDark } = useTheme();

    return (
        <div className="space-y-6">
            <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#10121e]' : 'bg-white shadow-sm'}`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <MapPin className="w-6 h-6 text-[#3b82f6]" /> Location
                </h2>

                <div className="space-y-4">
                    {/* Address */}
                    <div>
                        <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Address / Street *
                        </label>
                        <input
                            type="text"
                            value={formData.location.address}
                            onChange={(e) => handleInputChange('location.address', e.target.value)}
                            placeholder="e.g. 123 Argwings Kodhek Rd"
                            className={`w-full p-4 rounded-xl border font-medium ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all`}
                        />
                        {errors['location.address'] && <p className="text-red-500 text-xs mt-1">{errors['location.address']}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* City */}
                        <div>
                            <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                City *
                            </label>
                            <input
                                type="text"
                                value={formData.location.city}
                                onChange={(e) => handleInputChange('location.city', e.target.value)}
                                placeholder="e.g. Nairobi"
                                className={`w-full p-4 rounded-xl border font-medium ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all`}
                            />
                            {errors['location.city'] && <p className="text-red-500 text-xs mt-1">{errors['location.city']}</p>}
                        </div>

                        {/* State */}
                        <div>
                            <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                State / County
                            </label>
                            <input
                                type="text"
                                value={formData.location.state}
                                onChange={(e) => handleInputChange('location.state', e.target.value)}
                                placeholder="e.g. Nairobi"
                                className={`w-full p-4 rounded-xl border font-medium ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all`}
                            />
                        </div>
                    </div>

                    {/* Google Maps Link */}
                    <div className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                        <label className="flex items-center gap-2 text-sm font-bold text-blue-500 mb-3">
                            <Navigation className="w-4 h-4" />
                            Google Maps Link or Code
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.location.googleMapsLink}
                                onChange={(e) => handleMapsLinkChange(e.target.value)}
                                placeholder="Paste Link or Code (e.g. V2V7+5JJ, Juja)"
                                className={`w-full p-3 pl-10 text-sm rounded-lg border ${isDark ? 'bg-[#0a0c19] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} focus:border-blue-500 outline-none`}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                            {resolvingUrl ? (
                                <span className="text-xs text-blue-500 animate-pulse flex items-center gap-1">
                                    <Navigation className="w-3 h-3 animate-spin" /> Resolving location...
                                </span>
                            ) : formData.location.coordinates?.lat ? (
                                <span className="text-xs text-green-500 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Coordinates found
                                </span>
                            ) : (
                                <span className="text-xs text-gray-500">Geocodes coordinates from link</span>
                            )}
                        </div>
                    </div>

                    {/* Coordinates Display (Read Only) */}
                    <div className="grid grid-cols-2 gap-4 opacity-70">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Latitude</label>
                            <input
                                type="text"
                                value={formData.location.coordinates?.lat || ''}
                                className={`w-full p-3 rounded-lg border text-sm ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'}`}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Longitude</label>
                            <input
                                type="text"
                                value={formData.location.coordinates?.lng || ''}
                                className={`w-full p-3 rounded-lg border text-sm ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'}`}
                                readOnly
                            />
                        </div>
                    </div>
                    {errors['location.coordinates'] && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors['location.coordinates']}
                        </p>
                    )}

                    {/* Auto-fill Button */}
                    <button
                        type="button"
                        onClick={handleGeocode}
                        disabled={geocoding || !formData.location.address}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${geocoding
                            ? 'opacity-70 cursor-wait'
                            : isDark
                                ? 'border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6]/10'
                                : 'border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10'
                            }`}
                    >
                        {geocoding ? 'Locating...' : 'Geocode Address'}
                    </button>

                    {/* Map View for Visual Confirmation */}
                    <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mt-4 relative">
                        {formData.location.coordinates?.lat && formData.location.coordinates?.lng ? (
                            <MapView
                                center={{
                                    lat: parseFloat(formData.location.coordinates.lat),
                                    lng: parseFloat(formData.location.coordinates.lng)
                                }}
                                zoom={15}
                                markers={[{
                                    id: 'location-pin',
                                    position: {
                                        lat: parseFloat(formData.location.coordinates.lat),
                                        lng: parseFloat(formData.location.coordinates.lng)
                                    },
                                    draggable: true,
                                    onDragEnd: (e) => {
                                        const newLat = e.latLng.lat();
                                        const newLng = e.latLng.lng();
                                        handleInputChange('location.coordinates', { lat: String(newLat), lng: String(newLng) });
                                    }
                                }]}
                                options={{
                                    disableDefaultUI: false,
                                    streetViewControl: false,
                                    mapTypeControl: false
                                }}
                            />
                        ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center ${isDark ? 'bg-[#1a1d2d]' : 'bg-gray-100'}`}>
                                <MapPin className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Map will appear here when location is found</span>
                            </div>
                        )}

                        {/* Overlay Hint */}
                        {formData.location.coordinates?.lat && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-3 py-1 rounded-full pointer-events-none z-10">
                                Drag pin to adjust location
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepLocation;
