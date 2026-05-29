import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, MapPin, Bed, Bath, DollarSign } from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MobilePropertyMatchPage = () => {
    const { data, isLoading } = useProperties();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [beds, setBeds] = useState('');
    const [baths, setBaths] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [location, setLocation] = useState('');

    const properties = useMemo(() => data?.properties || [], [data]);

    const matches = useMemo(() => {
        return properties.filter((p) => {
            if (beds && (p.bedrooms == null || p.bedrooms < Number(beds))) return false;
            if (baths && (p.bathrooms == null || p.bathrooms < Number(baths))) return false;
            if (maxPrice && (p.price == null || p.price > Number(maxPrice))) return false;
            if (location.trim()) {
                const loc = (p.location || p.address || p.city || '').toString().toLowerCase();
                if (!loc.includes(location.trim().toLowerCase())) return false;
            }
            return true;
        }).slice(0, 20);
    }, [properties, beds, baths, maxPrice, location]);

    const formatPrice = (p) => (!p ? 'Price on request' : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(p));

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                    <motion.button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`} whileTap={{ scale: 0.9 }}>
                        <ArrowLeft size={20} />
                    </motion.button>
                    <div>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Property Match</h1>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{matches.length} matches</p>
                    </div>
                </div>
            </div>

            <div className="p-4 pb-24 space-y-4">
                <motion.div className={`rounded-2xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your criteria</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={`text-xs block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Min beds</label>
                            <input type="number" min="0" placeholder="Any" value={beds} onChange={(e) => setBeds(e.target.value)} className={`w-full rounded-xl border px-3 py-2 text-sm ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                        </div>
                        <div>
                            <label className={`text-xs block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Min baths</label>
                            <input type="number" min="0" placeholder="Any" value={baths} onChange={(e) => setBaths(e.target.value)} className={`w-full rounded-xl border px-3 py-2 text-sm ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                        </div>
                        <div className="col-span-2">
                            <label className={`text-xs block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Max price (KES)</label>
                            <input type="number" min="0" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={`w-full rounded-xl border px-3 py-2 text-sm ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                        </div>
                        <div className="col-span-2">
                            <label className={`text-xs block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Location</label>
                            <input type="text" placeholder="e.g. Nairobi, Westlands" value={location} onChange={(e) => setLocation(e.target.value)} className={`w-full rounded-xl border px-3 py-2 text-sm ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                        </div>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" /></div>
                ) : matches.length === 0 ? (
                    <motion.div className={`rounded-2xl border p-8 text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                        <Target className="w-12 h-12 text-[#3b82f6] mx-auto mb-3" />
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No properties match your criteria</p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Try relaxing beds, baths, or max price.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {matches.map((p, i) => (
                            <motion.div key={p.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <button onClick={() => navigate(`/property/${p.id}`)} className="w-full flex gap-4 p-4 text-left">
                                    <img src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'; }} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.title || p.name || 'Property'}</h3>
                                        <p className="text-[#3b82f6] font-semibold mt-1">{formatPrice(p.price)}</p>
                                        <div className="flex gap-3 mt-1 text-xs">
                                            {p.bedrooms != null && <span className={isDark ? 'text-gray-400' : 'text-gray-500'}><Bed size={12} className="inline" /> {p.bedrooms}</span>}
                                            {p.bathrooms != null && <span className={isDark ? 'text-gray-400' : 'text-gray-500'}><Bath size={12} className="inline" /> {p.bathrooms}</span>}
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

export default MobilePropertyMatchPage;
