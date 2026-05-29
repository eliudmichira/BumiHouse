import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Share2, MessageCircle, Linkedin, Facebook, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { agentsAPI } from '../../lib/firebaseAPI';

const MobileEditAgentSocial = () => {
    const { currentUser } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        whatsappNumber: '',
        linkedinUrl: '',
        facebookUrl: ''
    });

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAgentData = async () => {
            if (!currentUser?.id) return;
            try {
                const agentData = await agentsAPI.getById(currentUser.id);
                if (agentData) {
                    setFormData({
                        whatsappNumber: agentData.whatsappNumber || '',
                        linkedinUrl: agentData.linkedinUrl || '',
                        facebookUrl: agentData.facebookUrl || ''
                    });
                }
            } catch (err) {
                console.error('Failed to fetch agent data:', err);
                setError('Failed to load social links');
            } finally {
                setLoading(false);
            }
        };

        fetchAgentData();
    }, [currentUser?.id]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setError('');
        setSaving(true);
        try {
            await agentsAPI.createOrUpdate({
                id: currentUser.id,
                ...formData,
                name: currentUser.displayName || currentUser.name || '',
                email: currentUser.email
            });
            navigate(-1);
        } catch (err) {
            setError(err.message || 'Failed to update social links');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <motion.button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`} whileTap={{ scale: 0.9 }}>
                        <ArrowLeft size={20} />
                    </motion.button>
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Social & Contact</h1>
                    <button onClick={handleSave} disabled={saving} className="text-[#3b82f6] font-semibold disabled:opacity-50">
                        {saving ? <Loader2 size={20} className="animate-spin inline" /> : 'Save'}
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {error && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}

                <div className="space-y-6">
                    <h3 className={`text-xs font-black uppercase tracking-widest px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Share2 size={14} /> Manage online presence
                    </h3>

                    <div className="space-y-4">
                        <div className="relative group">
                            <label className={`block text-xs font-semibold mb-2 ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>WhatsApp Number</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-green-500">
                                    <MessageCircle size={18} />
                                </div>
                                <input
                                    type="tel"
                                    value={formData.whatsappNumber}
                                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                                    className={`w-full rounded-2xl border pl-12 pr-4 py-3.5 transition-all ${isDark
                                            ? 'bg-white/5 border-white/10 text-white focus:border-[#3b82f6]/50'
                                            : 'bg-white border-gray-200 focus:border-[#3b82f6]'
                                        }`}
                                    placeholder="e.g. +254 7..."
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className={`block text-xs font-semibold mb-2 ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>LinkedIn URL</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-blue-500">
                                    <Linkedin size={18} />
                                </div>
                                <input
                                    type="url"
                                    value={formData.linkedinUrl}
                                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                                    className={`w-full rounded-2xl border pl-12 pr-4 py-3.5 transition-all ${isDark
                                            ? 'bg-white/5 border-white/10 text-white focus:border-[#3b82f6]/50'
                                            : 'bg-white border-gray-200 focus:border-[#3b82f6]'
                                        }`}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className={`block text-xs font-semibold mb-2 ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Facebook URL</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-blue-600">
                                    <Facebook size={18} />
                                </div>
                                <input
                                    type="url"
                                    value={formData.facebookUrl}
                                    onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                                    className={`w-full rounded-2xl border pl-12 pr-4 py-3.5 transition-all ${isDark
                                            ? 'bg-white/5 border-white/10 text-white focus:border-[#3b82f6]/50'
                                            : 'bg-white border-gray-200 focus:border-[#3b82f6]'
                                        }`}
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-[#3b82f6] to-[#45e695] rounded-2xl text-gray-900 font-bold shadow-xl shadow-[#3b82f6]/20 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                    Save Social Links
                </motion.button>
            </div>
        </div>
    );
};

export default MobileEditAgentSocial;
