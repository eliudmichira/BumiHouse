import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Bed, Bath } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../hooks/useProperties';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MobileRecommendationsPage = () => {
    const { favorites = [] } = useAuth();
    const { data, isLoading } = useProperties();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const properties = useMemo(() => data?.properties || [], [data]);
    const favoriteIds = useMemo(() => new Set((favorites || []).map((f) => f.id)), [favorites]);

    const recommended = useMemo(() => {
        if (!properties.length) return [];
        const notFav = properties.filter((p) => !favoriteIds.has(p.id));
        const shuffled = [...notFav].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 15);
    }, [properties, favoriteIds]);

    const formatPrice = (p) => (!p ? 'Price on request' : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(p));

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                    <motion.button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`} whileTap={{ scale: 0.9 }}>
                        <ArrowLeft size={20} />
                    </motion.button>
                    <div>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recommendations</h1>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Picked for you</p>
                    </div>
                </div>
            </div>

            <div className="p-4 pb-24">
                {isLoading ? (
                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" /></div>
                ) : recommended.length === 0 ? (
                    <motion.div className={`flex flex-col items-center justify-center py-20 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Star className="w-12 h-12 text-[#3b82f6] mb-4" />
                        <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No recommendations yet</p>
                        <p className={`text-sm mb-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Browse and save some favorites to get personalized picks.</p>
                        <motion.button onClick={() => navigate('/properties')} className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#45e695] rounded-2xl text-gray-900 font-bold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Browse Properties</motion.button>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        {recommended.map((p, i) => (
                            <motion.div key={p.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                <button onClick={() => navigate(`/property/${p.id}`)} className="w-full text-left">
                                    <div className="relative h-40">
                                        <img src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'; }} />
                                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                                            <span className="font-bold text-white text-lg drop-shadow">{formatPrice(p.price)}</span>
                                            <span className="px-2 py-1 rounded-full bg-[#3b82f6] text-gray-900 text-xs font-semibold">Recommended</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.title || p.name || (typeof p.address === 'string' ? p.address : (p.address?.address || p.address?.city || 'Property'))}</h3>
                                        {(p.location || p.address) && (
                                            <p className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <MapPin size={12} />
                                                {(() => {
                                                    const loc = p.location || p.address;
                                                    if (typeof loc === 'string') return loc;
                                                    if (typeof loc === 'object' && loc) return loc.address || loc.city || loc.state || 'Location available';
                                                    return 'Location not specified';
                                                })()}
                                            </p>
                                        )}
                                        <div className="flex gap-4 mt-2 text-xs">
                                            {p.bedrooms != null && <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><Bed size={12} />{p.bedrooms}</span>}
                                            {p.bathrooms != null && <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><Bath size={12} />{p.bathrooms}</span>}
                                        </div>
                                    </div>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileRecommendationsPage;
