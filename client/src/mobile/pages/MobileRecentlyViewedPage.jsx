import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, MapPin, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 50;

const MobileRecentlyViewedPage = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [items, setItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });

    const clearHistory = () => setItems([]);

    const removeItem = (id) => {
        setItems((prev) => {
            const next = prev.filter((x) => (x.id || x) !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const formatPrice = (p) => (!p ? 'Price on request' : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(p));

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`} whileTap={{ scale: 0.9 }}>
                            <ArrowLeft size={20} />
                        </motion.button>
                        <div>
                            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recently Viewed</h1>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{items.length} properties</p>
                        </div>
                    </div>
                    {items.length > 0 && (
                        <button onClick={clearHistory} className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>Clear all</button>
                    )}
                </div>
            </div>

            <div className="p-4 pb-24 space-y-3">
                {items.length === 0 ? (
                    <motion.div className={`flex flex-col items-center justify-center py-20 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                            <Eye className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No recent views</p>
                        <p className={`text-sm mb-6 max-w-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Properties you view will appear here.</p>
                        <motion.button onClick={() => navigate('/properties')} className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#45e695] rounded-2xl text-gray-900 font-bold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Browse Properties</motion.button>
                    </motion.div>
                ) : (
                    items.map((item, i) => (
                        <motion.div key={item.id || i} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                            <button onClick={() => navigate(`/property/${item.id}`)} className="w-full flex gap-4 p-4 text-left">
                                <img src={item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'; }} />
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title || item.name || 'Property'}</h3>
                                    {(item.location || item.address) && <p className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><MapPin size={12} />{item.location || item.address}</p>}
                                    <p className="text-[#51faaa] font-semibold mt-1">{formatPrice(item.price)}</p>
                                </div>
                            </button>
                            <div className="px-4 pb-3 flex justify-end">
                                <motion.button onClick={() => removeItem(item.id)} className="p-2 rounded-full text-red-400 hover:bg-red-500/10 text-sm flex items-center gap-1" whileTap={{ scale: 0.9 }}>
                                    <Trash2 size={14} /> Remove
                                </motion.button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MobileRecentlyViewedPage;
