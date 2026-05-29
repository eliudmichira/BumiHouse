import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { updateAuthProfile } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

const MobileEditProfilePage = () => {
    const { currentUser, updateProfile } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Sync displayName when currentUser loads
    useEffect(() => {
        if (currentUser && !displayName) {
            setDisplayName(currentUser?.displayName || currentUser?.name || currentUser?.username || '');
        }
    }, [currentUser]);

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setError('');
        setSaving(true);
        try {
            let photoURL = currentUser.photoURL || currentUser.avatar;
            if (photoFile) {
                const path = `users/${currentUser.id}/avatar_${Date.now()}.jpg`;
                const storageRef = ref(storage, path);
                await uploadBytes(storageRef, photoFile, { contentType: photoFile.type || 'image/jpeg' });
                photoURL = await getDownloadURL(storageRef);
            }
            const res = await updateAuthProfile({
                displayName: displayName.trim() || null,
                ...(photoURL && { photoURL }),
            });
            if (!res.success) throw new Error(res.error);
            updateProfile({
                name: displayName.trim() || currentUser.name,
                username: displayName.trim() || currentUser.username,
                displayName: displayName.trim() || currentUser.displayName,
                avatar: photoURL || currentUser.avatar,
                photoURL: photoURL || currentUser.photoURL,
            });
            navigate(-1);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const photoSrc = photoPreview || currentUser?.photoURL || currentUser?.avatar;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
            {/* Premium Header */}
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-2xl ${isDark ? 'bg-[#0a0c19]/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <motion.button 
                        onClick={() => navigate(-1)} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-gray-100 text-gray-700'}`} 
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h1>
                    <button 
                        onClick={handleSave} 
                        disabled={saving} 
                        className="px-4 py-1.5 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-[#0a0c19] font-bold rounded-full disabled:opacity-50 text-sm shadow-lg shadow-[#3b82f6]/20"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save'}
                    </button>
                </div>
            </div>

            <div className="p-6 pb-32 space-y-8 max-w-lg mx-auto">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Profile Photo Section */}
                <div className="flex flex-col items-center">
                    <motion.label 
                        className="relative inline-block"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="w-32 h-32 rounded-full overflow-hidden p-1 bg-gradient-to-br from-[#3b82f6] via-[#45e695] to-[#06b6d4] shadow-2xl">
                            <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center text-4xl font-black ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                                {photoSrc ? (
                                    <img src={photoSrc} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    (displayName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()
                                )}
                            </div>
                        </div>
                        <motion.span 
                            className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] text-[#0a0c19] flex items-center justify-center shadow-xl border-4 border-[#0a0c19]"
                            whileHover={{ rotate: 15 }}
                        >
                            <Camera size={20} />
                        </motion.span>
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoChange} />
                    </motion.label>
                    <p className={`text-xs font-bold mt-4 uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Tap to change photo</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className={`block text-xs font-black uppercase tracking-widest ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Display Name</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)} 
                                placeholder="Enter your name" 
                                className={`w-full rounded-2xl border px-5 py-4 transition-all outline-none ${
                                    isDark 
                                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#3b82f6]/50 focus:bg-white/10' 
                                    : 'bg-white border-gray-200 text-gray-900 focus:border-[#3b82f6]'
                                }`} 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={`block text-xs font-black uppercase tracking-widest ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Account Email</label>
                        <div className={`rounded-2xl px-5 py-4 border ${isDark ? 'bg-white/5 border-white/5 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                            <p className="text-sm font-medium">{currentUser?.email || '—'}</p>
                        </div>
                        <p className="text-[10px] text-gray-500 ml-1">Email cannot be changed for security reasons.</p>
                    </div>
                </div>

                {/* Extra info/Help */}
                <div className={`rounded-3xl p-6 ${isDark ? 'bg-gradient-to-br from-[#3b82f6]/10 to-transparent border border-[#3b82f6]/20' : 'bg-blue-50 border border-blue-100'}`}>
                    <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>Tip</h4>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-blue-700'}`}>
                        Your display name is visible to agents and other users. Use your real name to build trust within the BumiHouse community.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MobileEditProfilePage;
