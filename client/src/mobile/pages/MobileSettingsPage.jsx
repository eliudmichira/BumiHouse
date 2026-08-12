import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Bell, Mail, Shield, ChevronRight, Lock, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MobileSettingsPage = () => {
    const { currentUser, userPreferences = {}, updatePreferences } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const notifications = userPreferences.notifications !== false;
    const emailAlerts = userPreferences.emailAlerts !== false;

    const handleToggle = (key, currentVal) => {
        updatePreferences({ [key]: !currentVal });
    };

    const SettingRow = ({ icon: Icon, label, value, onClick, type = 'toggle', color = 'blue' }) => (
        <motion.div 
            className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'
            }`}
            whileTap={type === 'link' ? { scale: 0.98 } : {}}
            onClick={type === 'link' ? onClick : undefined}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isDark ? `bg-${color}-500/10` : `bg-${color}-50`
                }`}>
                    <Icon className={isDark ? `text-${color}-400` : `text-${color}-500`} size={22} />
                </div>
                <div>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                    {type === 'toggle' && (
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {value ? 'Enabled' : 'Disabled'}
                        </p>
                    )}
                </div>
            </div>

            {type === 'toggle' ? (
                <button 
                    onClick={onClick}
                    className={`relative w-14 h-8 rounded-full transition-all duration-500 ${
                        value ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4]' : (isDark ? 'bg-white/10' : 'bg-gray-200')
                    }`}
                >
                    <motion.div 
                        className={`absolute top-1 w-6 h-6 rounded-full shadow-lg ${isDark ? 'bg-white' : 'bg-white'}`}
                        animate={{ left: value ? 'calc(100% - 28px)' : '4px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                </button>
            ) : (
                <ChevronRight size={18} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
            )}
        </motion.div>
    );

    return (
        <div className={`min-h-screen pb-32 ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-2xl ${isDark ? 'bg-[#0a0c19]/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
                <div className="flex items-center gap-4">
                    <motion.button 
                        onClick={() => navigate(-1)} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-gray-100 text-gray-700'}`} 
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
                </div>
            </div>

            <div className="p-6 space-y-8 max-w-lg mx-auto">
                {/* Appearance Section */}
                <div className="space-y-4">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Appearance
                    </h3>
                    <SettingRow 
                        icon={Moon} 
                        label="Dark Mode" 
                        value={isDark} 
                        onClick={toggleTheme} 
                        color="purple"
                    />
                </div>

                {/* Notifications Section */}
                <div className="space-y-4">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Notifications
                    </h3>
                    <div className="space-y-3">
                        <SettingRow 
                            icon={Bell} 
                            label="Push Notifications" 
                            value={notifications} 
                            onClick={() => handleToggle('notifications', notifications)} 
                            color="blue"
                        />
                        <SettingRow 
                            icon={Mail} 
                            label="Email Alerts" 
                            value={emailAlerts} 
                            onClick={() => handleToggle('emailAlerts', emailAlerts)} 
                            color="cyan"
                        />
                    </div>
                </div>

                {/* Privacy & Security */}
                <div className="space-y-4">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Privacy & Security
                    </h3>
                    <div className="space-y-3">
                        <SettingRow 
                            icon={Shield} 
                            label="Two-Factor Auth" 
                            type="link"
                            onClick={() => {}} 
                            color="emerald"
                        />
                        <SettingRow 
                            icon={Lock} 
                            label="Change Password" 
                            type="link"
                            onClick={() => {}} 
                            color="orange"
                        />
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-4">
                    <motion.button 
                        className={`w-full flex items-center justify-center gap-2 p-5 rounded-3xl border ${
                            isDark ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-red-50 border-red-100 text-red-600'
                        }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Trash2 size={18} />
                        <span className="font-bold">Delete Account</span>
                    </motion.button>
                    <p className="text-[10px] text-center mt-4 text-gray-500 font-medium">
                        BumiHouse v2.4.0 • Built with ❤️ in Kenya
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MobileSettingsPage;
