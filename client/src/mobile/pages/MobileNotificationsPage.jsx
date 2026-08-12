import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, BellOff, MessageCircle, Info, Sparkles, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'timeago.js';
import { Capacitor } from '@capacitor/core';

const MobileNotificationsPage = () => {
    const { userPreferences = {}, updatePreferences } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, requestPermission, permissionStatus } = useNotifications();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');

    const filteredNotifications = activeTab === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.data?.url) {
            navigate(notification.data.url);
        } else if (notification.data?.type === 'message' && notification.data?.conversationId) {
            navigate(`/messages?id=${notification.data.conversationId}`);
        }
    };

    const NotificationCard = ({ notification }) => (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative p-5 rounded-3xl border transition-all ${
                isDark 
                ? `${notification.read ? 'bg-white/5 border-white/5' : 'bg-white/10 border-white/10 shadow-lg shadow-[#51faaa]/5'}` 
                : `${notification.read ? 'bg-white border-gray-100 shadow-sm' : 'bg-emerald-50/50 border-emerald-100 shadow-sm'}`
            }`}
            onClick={() => handleNotificationClick(notification)}
        >
            {!notification.read && (
                <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] shadow-lg shadow-[#51faaa]/40" />
            )}

            <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
                }`}>
                    {notification.type === 'message' && <MessageCircle className="text-emerald-500" size={20} />}
                    {notification.type === 'alert' && <Bell className="text-orange-500" size={20} />}
                    {notification.type === 'system' && <Info className="text-purple-500" size={20} />}
                    {!['message', 'alert', 'system'].includes(notification.type) && <Sparkles className="text-emerald-500" size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                        </h4>
                    </div>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notification.body || notification.message}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {format(notification.createdAt?.toDate())}
                    </span>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className={`min-h-screen pb-32 ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-40 px-4 pt-4 pb-2 border-b backdrop-blur-2xl ${isDark ? 'bg-[#0a0c19]/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <motion.button 
                            onClick={() => navigate(-1)} 
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-gray-100 text-gray-700'}`} 
                            whileTap={{ scale: 0.9 }}
                        >
                            <ArrowLeft size={20} />
                        </motion.button>
                        <div>
                            <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h1>
                            {unreadCount > 0 && (
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#51faaa]">
                                    {unreadCount} Unread
                                </p>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${
                                isDark ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Sliding Tabs */}
                <div className="flex relative p-1 rounded-2xl bg-gray-200/50 dark:bg-white/5">
                    <div 
                        className={`absolute top-1 bottom-1 w-1/2 rounded-xl transition-all duration-300 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        style={{ left: activeTab === 'all' ? '4px' : 'calc(50% - 0px)' }}
                    />
                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`relative z-10 flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
                            activeTab === 'all' 
                            ? (isDark ? 'text-white' : 'text-[#0a0c19]') 
                            : (isDark ? 'text-gray-500' : 'text-gray-500')
                        }`}
                    >
                        Activity
                    </button>
                    <button 
                        onClick={() => setActiveTab('unread')}
                        className={`relative z-10 flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
                            activeTab === 'unread' 
                            ? (isDark ? 'text-white' : 'text-[#0a0c19]') 
                            : (isDark ? 'text-gray-500' : 'text-gray-500')
                        }`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Permission Banner (Native only) */}
                {Capacitor.isNativePlatform() && permissionStatus !== 'granted' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-5 rounded-3xl border border-dashed text-center ${
                            isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                        }`}
                    >
                        <Bell className={`mx-auto mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} size={24} />
                        <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Don't miss updates</h3>
                        <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Enable push notifications to get instant property alerts.</p>
                        <button 
                            onClick={requestPermission}
                            className="w-full py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-[#51faaa]/20"
                        >
                            Enable Notifications
                        </button>
                    </motion.div>
                )}

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.map(notification => (
                            <NotificationCard key={notification.id} notification={notification} />
                        ))}
                    </AnimatePresence>

                    {filteredNotifications.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="py-20 text-center space-y-4"
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                                isDark ? 'bg-white/5' : 'bg-gray-100'
                            }`}>
                                <BellOff className="text-gray-400" size={32} />
                            </div>
                            <div>
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>No notifications</p>
                                <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Notification Preferences Link */}
                <div className="pt-8">
                    <motion.button 
                        onClick={() => navigate('/settings')}
                        className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${
                            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'
                        }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                isDark ? 'bg-gray-500/10' : 'bg-gray-50'
                            }`}>
                                <Settings className={isDark ? 'text-gray-400' : 'text-gray-500'} size={22} />
                            </div>
                            <div className="text-left">
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notification Settings</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Manage alerts & preferences</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default MobileNotificationsPage;
