import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Trash2, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MobileFavoritesPage = () => {
    const { currentUser, favorites = [], toggleFavorite } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const sortedFavorites = useMemo(() => {
        return [...favorites].sort((a, b) => {
            const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
            const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [favorites]);

    const formatPrice = (price) => {
        if (!price) return 'Price on request';
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleRemoveFavorite = async (e, property) => {
        e.stopPropagation();
        if (toggleFavorite) {
            await toggleFavorite(property.id || property);
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-30 px-4 py-4 ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} border-b backdrop-blur-xl`}>
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={() => navigate(-1)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <div>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Favorites</h1>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {sortedFavorites.length} saved {sortedFavorites.length === 1 ? 'property' : 'properties'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 pb-24 space-y-4">
                {sortedFavorites.length === 0 ? (
                    <motion.div
                        className={`flex flex-col items-center justify-center py-20 text-center rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                            <Heart className="w-10 h-10 text-red-400" />
                        </div>
                        <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No favorites yet</p>
                        <p className={`text-sm mb-6 max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Start exploring properties and tap the heart icon to save your favorites here
                        </p>
                        <motion.button
                            onClick={() => navigate('/properties')}
                            className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#45e695] rounded-2xl text-gray-900 font-bold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore Properties
                        </motion.button>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        {sortedFavorites.map((property, index) => (
                            <motion.div
                                key={property.id || index}
                                className={`rounded-3xl overflow-hidden border shadow-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => navigate(`/property/${property.id}`)}
                            >
                                {/* Image */}
                                <div className="relative h-48">
                                    <img
                                        src={property.images?.[0] || property.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'}
                                        alt={property.title || property.name || 'Property'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <motion.button
                                        onClick={(e) => handleRemoveFavorite(e, property)}
                                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                                        whileTap={{ scale: 0.8 }}
                                    >
                                        <Heart size={18} className="text-red-500 fill-red-500" />
                                    </motion.button>
                                    <div className="absolute bottom-3 left-3">
                                        <p className="text-white font-black text-xl">{formatPrice(property.price)}</p>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {property.title || property.name || 'Property'}
                                    </h3>
                                    {(property.location || property.address || property.city) && (
                                        <div className={`flex items-center gap-1 text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <MapPin size={14} />
                                            <span className="truncate">
                                                {(() => {
                                                    const loc = property.location || property.address;
                                                    if (typeof loc === 'string') return loc;
                                                    if (typeof loc === 'object' && loc) {
                                                        return loc.address || loc.city || 'Location available';
                                                    }
                                                    return property.city || 'Location not specified';
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 text-sm">
                                        {property.bedrooms && (
                                            <div className={`flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <Bed size={14} /> {property.bedrooms} Beds
                                            </div>
                                        )}
                                        {property.bathrooms && (
                                            <div className={`flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <Bath size={14} /> {property.bathrooms} Baths
                                            </div>
                                        )}
                                        {property.size && (
                                            <div className={`flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <Maximize size={14} /> {property.size} sqft
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default MobileFavoritesPage;
