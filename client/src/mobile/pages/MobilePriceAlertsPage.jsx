import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Plus, Trash2, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'BumiHouse_price_alerts';

const MobilePriceAlertsPage = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [location, setLocation] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minPrice, setMinPrice] = useState('');

    useEffect(() => {
        try {
            setAlerts(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
        } catch { }
    }, []);

    const saveAlerts = (next) => {
        setAlerts(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const addAlert = () => {
        const newAlert = {
            id: Date.now().toString(),
            location: location.trim() || 'Any',
            minPrice: minPrice ? Number(minPrice) : null,
            maxPrice: maxPrice ? Number(maxPrice) : null,
            createdAt: new Date().toISOString(),
        };
        saveAlerts([newAlert, ...alerts]);
        setLocation('');
        setMaxPrice('');
        setMinPrice('');
        setShowForm(false);
    };

    const removeAlert = (id) => saveAlerts(alerts.filter((a) => a.id !== id));

    const formatPrice = (p) => (p != null ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(p) : 'Any');

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`} whileTap={{ scale: 0.9 }}>
                            <ArrowLeft size={20} />
                        </motion.button>
                        <div>
                            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Price Alerts</h1>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Get notified when prices match</p>
                        </div>
                    </div>
                    <motion.button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-full bg-[#3b82f6] text-gray-900 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                        <Plus size={20} />
                    </motion.button>
                </div>
            </div>

            <div className="p-4 pb-24 space-y-4">
                {showForm && (
                    <motion.div className={`rounded-2xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>New alert</h3>
                        <input type="text" placeholder="Location (e.g. Nairobi)" value={location} onChange={(e) => setLocation(e.target.value)} className={`w-full rounded-xl border px-4 py-3 mb-3 ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                        <input type="number" placeholder="Min price (KES)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={`w-full rounded-xl border px-4 py-3 mb-3 ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                        <input type="number" placeholder="Max price (KES)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={`w-full rounded-xl border px-4 py-3 mb-4 ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                        <div className="flex gap-2">
                            <button onClick={() => setShowForm(false)} className={`flex-1 py-3 rounded-xl font-semibold ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}>Cancel</button>
                            <button onClick={addAlert} className="flex-1 py-3 rounded-xl font-semibold bg-[#3b82f6] text-gray-900">Save</button>
                        </div>
                    </motion.div>
                )}

                {alerts.length === 0 && !showForm ? (
                    <motion.div className={`flex flex-col items-center justify-center py-20 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Bell className="w-12 h-12 text-[#3b82f6] mb-4" />
                        <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No price alerts</p>
                        <p className={`text-sm mb-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create an alert to get notified when new listings match your budget and location.</p>
                        <motion.button onClick={() => setShowForm(true)} className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#45e695] rounded-2xl text-gray-900 font-bold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Create alert</motion.button>
                    </motion.div>
                ) : (
                    alerts.map((alert) => (
                        <motion.div key={alert.id} className={`rounded-2xl border p-4 flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 flex items-center justify-center"><MapPin size={18} className="text-[#3b82f6]" /></div>
                                <div>
                                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{alert.location}</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatPrice(alert.minPrice)} – {formatPrice(alert.maxPrice)}</p>
                                </div>
                            </div>
                            <motion.button onClick={() => removeAlert(alert.id)} className="p-2 rounded-full text-red-400 hover:bg-red-500/10" whileTap={{ scale: 0.9 }}><Trash2 size={18} /></motion.button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MobilePriceAlertsPage;

