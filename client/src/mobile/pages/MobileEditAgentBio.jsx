import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, FileText, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { agentsAPI } from '../../lib/firebaseAPI';

const MobileEditAgentBio = () => {
    const { currentUser } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [bio, setBio] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAgentData = async () => {
            if (!currentUser?.id) return;
            try {
                const agentData = await agentsAPI.getById(currentUser.id);
                if (agentData) {
                    setBio(agentData.bio || '');
                }
            } catch (err) {
                console.error('Failed to fetch agent data:', err);
                setError('Failed to load bio');
            } finally {
                setLoading(false);
            }
        };

        fetchAgentData();
    }, [currentUser?.id]);

    const handleSave = async () => {
        if (!currentUser) return;
        setError('');
        setSaving(true);
        try {
            await agentsAPI.createOrUpdate({
                id: currentUser.id,
                bio: bio.trim(),
                name: currentUser.displayName || currentUser.name || '',
                email: currentUser.email
            });
            navigate(-1);
        } catch (err) {
            setError(err.message || 'Failed to update bio');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <Loader2 className="w-8 h-8 text-[#51faaa] animate-spin" />
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
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Professional Bio</h1>
                    <button onClick={handleSave} disabled={saving} className="text-[#51faaa] font-semibold disabled:opacity-50">
                        {saving ? <Loader2 size={20} className="animate-spin inline" /> : 'Save'}
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {error && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}

                <div className="space-y-4">
                    <h3 className={`text-[10px] font-semibold uppercase tracking-[0.18em] flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <FileText size={12} /> Elaborate your experience
                    </h3>
                    <div className="relative group">
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={15}
                            className={`w-full bg-transparent border-0 border-b py-3 text-[15px] leading-relaxed outline-none transition-colors resize-none ${isDark
                                    ? 'border-white/10 text-white placeholder-gray-600 focus:border-[#51faaa]'
                                    : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#51faaa]'
                                }`}
                            placeholder="Tell potential clients about your expertise, successful deals, and professional background..."
                        />
                        <div className={`absolute bottom-4 right-4 text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {bio.length} characters
                        </div>
                    </div>
                </div>

                <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-[#51faaa] to-[#45e695] rounded-2xl text-gray-900 font-bold shadow-xl shadow-[#51faaa]/20 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                    Save Bio
                </motion.button>
            </div>
        </div>
    );
};

export default MobileEditAgentBio;
