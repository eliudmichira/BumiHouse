import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Eye, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MobileActivityPage = () => {
    const { favorites = [] } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const recentActivity = useMemo(() => {
        const activities = [];
        favorites.slice(0, 8).forEach((fav) => {
            activities.push({ id: `favorite-${fav.id}`, propertyId: fav.id, type: 'favorite', ...fav, time: fav.addedAt ? new Date(fav.addedAt).toLocaleDateString() : 'Recently' });
        });
        try {
            const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]').slice(0, 5);
            viewed.forEach((v, i) => activities.push({ id: `viewed-${v.id || i}`, propertyId: v.id, type: 'view', ...v, time: v.viewedAt ? new Date(v.viewedAt).toLocaleDateString() : 'Recently' }));
        } catch {}
        return activities.slice(0, 12);
    }, [favorites]);

    const formatPrice = (p) => (!p ? 'Price on request' : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(p));

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                    <motion.button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`} whileTap={{ scale: 0.9 }}>
                        <ArrowLeft size={20} />
                    </motion.button>
                    <div>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h1>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Favorites & views</p>
                    </div>
                </div>
            </div>

            <div className="p-4 pb-24 space-y-3">
                {recentActivity.length === 0 ? (
                    <motion.div className={`flex flex-col items-center justify-center py-20 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No activity yet</p>
                        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Save favorites and view properties to see them here.</p>
                        <motion.button onClick={() => navigate('/properties')} className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#45e695] rounded-2xl text-gray-900 font-bold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Explore</motion.button>
                    </motion.div>
                ) : (
                    recentActivity.map((activity, i) => (
                        <motion.div key={activity.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                            <button onClick={() => navigate(`/property/${activity.propertyId || activity.id?.replace('favorite-', '').replace('viewed-', '')}`)} className="w-full flex gap-4 p-4 text-left items-center">
                                <img src={activity.images?.[0] || activity.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'; }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {activity.type === 'favorite' && <Heart size={14} className="text-red-500 fill-red-500" />}
                                        {activity.type === 'view' && <Eye size={14} className="text-emerald-500" />}
                                        <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.title || activity.name || 'Property'}</span>
                                    </div>
                                    <p className="text-[#51faaa] font-semibold text-sm mt-1">{formatPrice(activity.price)}</p>
                                    <p className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><Clock size={12} />{activity.time}</p>
                                </div>
                                <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MobileActivityPage;
