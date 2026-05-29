import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Home, DollarSign, MapPin } from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MobileInsightsPage = () => {
    const { data, isLoading } = useProperties();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const stats = useMemo(() => {
        const list = data?.properties || [];
        const withPrice = list.filter((p) => p.price != null && p.price > 0);
        const avgPrice = withPrice.length ? withPrice.reduce((s, p) => s + p.price, 0) / withPrice.length : 0;
        const byType = {};
        const byLocation = {};
        list.forEach((p) => {
            const t = p.type || p.propertyType || 'Other';
            byType[t] = (byType[t] || 0) + 1;
            const loc = p.location || p.city || p.address || 'Other';
            const locStr = typeof loc === 'string' ? loc : (loc?.city || loc?.name || 'Other');
            byLocation[locStr] = (byLocation[locStr] || 0) + 1;
        });
        const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const topLocations = Object.entries(byLocation).sort((a, b) => b[1] - a[1]).slice(0, 5);
        return { total: list.length, avgPrice, topTypes, topLocations, withPrice: withPrice.length };
    }, [data]);

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                    <motion.button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`} whileTap={{ scale: 0.9 }}>
                        <ArrowLeft size={20} />
                    </motion.button>
                    <div>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Market Insights</h1>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overview of listings</p>
                    </div>
                </div>
            </div>

            <div className="p-4 pb-24 space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <>
                        <motion.div className={`rounded-2xl border p-5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#3b82f6]" /></div>
                                <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Summary</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total listings</p>
                                </div>
                                <div>
                                    <p className={`text-2xl font-black text-[#3b82f6]`}>
                                        {stats.avgPrice ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(stats.avgPrice) : '—'}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg. price</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div className={`rounded-2xl border p-5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"><Home className="w-6 h-6 text-blue-400" /></div>
                                <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>By type</h2>
                            </div>
                            <ul className="space-y-2">
                                {stats.topTypes.map(([name, count]) => (
                                    <li key={name} className="flex justify-between items-center">
                                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{name}</span>
                                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div className={`rounded-2xl border p-5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center"><MapPin className="w-6 h-6 text-purple-400" /></div>
                                <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>By location</h2>
                            </div>
                            <ul className="space-y-2">
                                {stats.topLocations.map(([name, count]) => (
                                    <li key={name} className="flex justify-between items-center">
                                        <span className={`truncate mr-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{name}</span>
                                        <span className={`font-semibold flex-shrink-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MobileInsightsPage;
