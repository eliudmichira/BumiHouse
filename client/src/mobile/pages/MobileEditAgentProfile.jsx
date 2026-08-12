import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Loader2, User, Building2, Award, MapPin, FileText, CheckCircle, Shield, MessageCircle, ChevronRight, Share2, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { updateAuthProfile, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { agentsAPI, usersAPI } from '../../lib/firebaseAPI';

const MobileEditAgentProfile = () => {
    const { currentUser, updateProfile } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    // Form state
    const [displayName, setDisplayName] = useState(currentUser?.displayName || currentUser?.name || '');
    const [formData, setFormData] = useState({
        company: '',
        licenseNumber: '',
        yearsOfExperience: '',
        specialization: '',
        countyOfOperation: '',
        phoneNumber: currentUser?.phone || '',
        professionalTitle: '',
        serviceAreas: ''
    });

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Kenyan counties for dropdown (Sync with AgentVerificationRequest)
    const kenyanCounties = [
        'Nairobi', 'Kiambu', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
        'Machakos', 'Kakamega', 'Bungoma', 'Uasin Gishu', 'Nyeri', 'Meru',
        'Embu', 'Kirinyaga', 'Murang\'a', 'Nandi', 'Trans Nzoia', 'West Pokot',
        'Samburu', 'Turkana', 'Marsabit', 'Isiolo', 'Garissa', 'Wajir',
        'Mandera', 'Tana River', 'Lamu', 'Taita Taveta', 'Kwale', 'Kilifi',
        'Kitui', 'Makueni', 'Kajiado', 'Narok', 'Bomet',
        'Kericho', 'Vihiga', 'Busia', 'Siaya', 'Homa Bay',
        'Migori', 'Kisii', 'Nyamira', 'Nyandarua', 'Laikipia',
        'Baringo', 'Elgeyo Marakwet'
    ];

    const specializations = [
        'Apartments & Condominiums', 'Commercial Properties', 'Land Sales & Development',
        'Holiday Rentals', 'Affordable Housing', 'Mixed-use Developments',
        'Luxury Properties', 'Student Housing', 'Industrial Properties',
        'Agricultural Land', 'Beachfront Properties', 'Mountain View Properties'
    ];

    useEffect(() => {
        const fetchAgentData = async () => {
            if (!currentUser?.id) return;
            try {
                const agentData = await agentsAPI.getById(currentUser.id);
                if (agentData) {
                    setFormData({
                        company: agentData.company || '',
                        licenseNumber: agentData.licenseNumber || '',
                        yearsOfExperience: agentData.yearsOfExperience || '',
                        specialization: agentData.specialization || '',
                        countyOfOperation: agentData.countyOfOperation || '',
                        phoneNumber: agentData.phoneNumber || currentUser.phone || '',
                        professionalTitle: agentData.professionalTitle || '',
                        serviceAreas: Array.isArray(agentData.serviceAreas) ? agentData.serviceAreas.join(', ') : (agentData.serviceAreas || '')
                    });
                }
            } catch (err) {
                console.error('Failed to fetch agent data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAgentData();
    }, [currentUser?.id]);

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setError('');
        setSaving(true);
        try {
            let photoURL = currentUser.photoURL || currentUser.avatar;

            // 1. Upload new photo if selected
            if (photoFile) {
                const path = `users/${currentUser.id}/avatar_${Date.now()}.jpg`;
                const storageRef = ref(storage, path);
                await uploadBytes(storageRef, photoFile, { contentType: photoFile.type || 'image/jpeg' });
                photoURL = await getDownloadURL(storageRef);
            }

            // 2. Update Auth Profile
            const authRes = await updateAuthProfile({
                displayName: displayName.trim() || null,
                ...(photoURL && { photoURL }),
            });
            if (!authRes.success) throw new Error(authRes.error);

            // 3. Update User document (for synced fields)
            await usersAPI.updateProfile(currentUser.id, {
                name: displayName.trim(),
                displayName: displayName.trim(),
                username: displayName.trim(),
                phone: formData.phoneNumber,
                avatar: photoURL,
                photoURL: photoURL
            });

            // 4. Update Agent document
            await agentsAPI.createOrUpdate({
                id: currentUser.id,
                ...formData,
                serviceAreas: typeof formData.serviceAreas === 'string'
                    ? formData.serviceAreas.split(',').map(s => s.trim()).filter(Boolean)
                    : [],
                name: displayName.trim(),
                email: currentUser.email,
                photoURL: photoURL
            });

            // 5. Update local context
            updateProfile({
                name: displayName.trim(),
                username: displayName.trim(),
                displayName: displayName.trim(),
                avatar: photoURL,
                photoURL: photoURL,
                phone: formData.phoneNumber
            });

            navigate(-1);
        } catch (err) {
            setError(err.message || 'Failed to update agent profile');
        } finally {
            setSaving(false);
        }
    };

    const photoSrc = photoPreview || currentUser?.photoURL || currentUser?.avatar;

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
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Agent Profile</h1>
                    <button onClick={handleSave} disabled={saving} className="text-[#51faaa] font-semibold disabled:opacity-50">
                        {saving ? <Loader2 size={20} className="animate-spin inline" /> : 'Save'}
                    </button>
                </div>
            </div>

            <div className="p-4 pb-24 space-y-6">
                {error && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}

                {/* Photo Upload */}
                <div className="flex flex-col items-center">
                    <label className="relative inline-block">
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] flex items-center justify-center text-3xl font-bold text-gray-900 ring-4 ring-white/10 shadow-2xl">
                            {photoSrc ? <img src={photoSrc} alt="" className="w-full h-full object-cover" /> : (displayName?.[0] || currentUser?.email?.[0] || 'A').toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#51faaa] text-gray-900 flex items-center justify-center shadow-lg border-2 border-gray-900"><Camera size={18} /></span>
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoChange} />
                    </label>
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Change profile picture</p>
                </div>

                <div className="space-y-4">
                    <h3 className={`text-xs font-black uppercase tracking-widest px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <User size={14} /> Personal Details
                    </h3>
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={`w-full bg-transparent border-0 border-b py-3 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white focus:border-[#51faaa]' : 'border-gray-200 text-gray-900 focus:border-[#51faaa]'}`} />
                    </div>
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone Number</label>
                        <input type="tel" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} className={`w-full bg-transparent border-0 border-b py-3 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white focus:border-[#51faaa]' : 'border-gray-200 text-gray-900 focus:border-[#51faaa]'}`} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className={`text-xs font-black uppercase tracking-widest px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Shield size={14} /> Professional Details
                    </h3>
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Professional Title (e.g. Senior Agent)</label>
                        <input type="text" value={formData.professionalTitle} onChange={(e) => handleInputChange('professionalTitle', e.target.value)} className={`w-full bg-transparent border-0 border-b py-3 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white focus:border-[#51faaa]' : 'border-gray-200 text-gray-900 focus:border-[#51faaa]'}`} placeholder="e.g. Luxury Property Specialist" />
                    </div>
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Company / Agency</label>
                        <input type="text" value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} className={`w-full bg-transparent border-0 border-b py-3 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white focus:border-[#51faaa]' : 'border-gray-200 text-gray-900 focus:border-[#51faaa]'}`} />
                    </div>
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>License Number</label>
                        <input type="text" value={formData.licenseNumber} onChange={(e) => handleInputChange('licenseNumber', e.target.value)} className={`w-full bg-transparent border-0 border-b py-3 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white focus:border-[#51faaa]' : 'border-gray-200 text-gray-900 focus:border-[#51faaa]'}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Experience (Years)</label>
                            <input type="number" value={formData.yearsOfExperience} onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)} className={`w-full bg-transparent border-0 border-b py-3 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white focus:border-[#51faaa]' : 'border-gray-200 text-gray-900 focus:border-[#51faaa]'}`} />
                        </div>
                        <div>
                            <label className={`block text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>County of Operation</label>
                            <select value={formData.countyOfOperation} onChange={(e) => handleInputChange('countyOfOperation', e.target.value)} className={`w-full bg-transparent border-0 border-b py-3 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white focus:border-[#51faaa]' : 'border-gray-200 text-gray-900 focus:border-[#51faaa]'}`}>
                                <option value="">Select County</option>
                                {kenyanCounties.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Specialization</label>
                        <select value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} className={`w-full bg-transparent border-0 border-b py-3 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white focus:border-[#51faaa]' : 'border-gray-200 text-gray-900 focus:border-[#51faaa]'}`}>
                            <option value="">Select Specialization</option>
                            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Service Areas (comma separated)</label>
                        <input type="text" value={formData.serviceAreas} onChange={(e) => handleInputChange('serviceAreas', e.target.value)} className={`w-full bg-transparent border-0 border-b py-3 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white focus:border-[#51faaa]' : 'border-gray-200 text-gray-900 focus:border-[#51faaa]'}`} placeholder="e.g. Westlands, Kilimani, Lavington" />
                    </div>
                </div>

                {/* Navigation Links to Decoupled Pages */}
                <div className="space-y-3 pt-4">
                    <h3 className={`text-xs font-black uppercase tracking-widest px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Edit size={14} /> Additional Information
                    </h3>

                    <motion.button
                        onClick={() => navigate('/profile/edit/agent/bio')}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                <FileText className="text-purple-400" size={20} />
                            </div>
                            <div className="text-left">
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Professional Bio</p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Describe your experience & expertise</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                    </motion.button>

                    <motion.button
                        onClick={() => navigate('/profile/edit/agent/social')}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <Share2 className="text-emerald-400" size={20} />
                            </div>
                            <div className="text-left">
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Social & Contact</p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>WhatsApp, LinkedIn, Facebook</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default MobileEditAgentProfile;
