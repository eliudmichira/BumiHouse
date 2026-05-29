import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MobileSavedSearchesPage = () => {
    const { currentUser, savedSearches = [], removeSavedSearch } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const handleRunSearch = (search) => {
        const params = new URLSearchParams();
        if (search.location) params.set('location', search.location);
        if (search.minPrice) params.set('minPrice', search.minPrice);
        if (search.maxPrice) params.set('maxPrice', search.maxPrice);
        if (search.bedrooms) params.set('bedrooms', search.bedrooms);
        if (search.type) params.set('type', search.type);
        navigate(`/properties?${params.toString()}`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                    <motion.button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`} whileTap={{ scale: 0.9 }}>
                        <ArrowLeft size={20} />
                    </motion.button>
                    <div>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Saved Searches</h1>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{savedSearches.length} saved</p>
                    </div>
                </div>
            </div>

            <div className="p-4 pb-24 space-y-3">
                {savedSearches.length === 0 ? (
                    <motion.div className={`flex flex-col items-center justify-center py-20 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                            <Search className="w-10 h-10 text-blue-400" />
                        </div>
                        <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No saved searches</p>
                        <p className={`text-sm mb-6 max-w-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>When you search on the Properties page, you can save searches here for quick access.</p>
                        <motion.button onClick={() => navigate('/properties')} className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#45e695] rounded-2xl text-gray-900 font-bold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Browse Properties</motion.button>
                    </motion.div>
                ) : (
                    savedSearches.map((search, i) => (
                        <motion.div key={search.id} className={`rounded-2xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="flex items-start justify-between gap-3">
                                <button onClick={() => handleRunSearch(search)} className="flex-1 text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        {search.location && <><MapPin size={14} className="text-[#3b82f6]" /><span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{search.location}</span></>}
                                    </div>
                                    <div className={`flex flex-wrap gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {search.minPrice && <span>From {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(search.minPrice)}</span>}
                                        {search.maxPrice && <span>To {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(search.maxPrice)}</span>}
                                        {search.bedrooms && <span>{search.bedrooms} beds</span>}
                                        {search.type && <span>{search.type}</span>}
                                    </div>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatDate(search.createdAt)}</p>
                                </button>
                                <motion.button onClick={() => removeSavedSearch(search.id)} className="p-2 rounded-full text-red-400 hover:bg-red-500/10" whileTap={{ scale: 0.9 }}>
                                    <Trash2 size={18} />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MobileSavedSearchesPage;
