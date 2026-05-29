import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Heart, Search, Eye, Star, Home, MessageSquare, Bell,
    Settings, LogOut, MapPin, TrendingUp, Clock, Bookmark,
    ChevronRight, Edit, Camera, Shield, CreditCard, HelpCircle,
    FileText, Share2, Gift, Award, Zap, Target, BarChart3,
    Calendar, DollarSign, Sparkles, Activity, TrendingDown, ArrowUpRight,
    ArrowLeft, MessageCircle, Mail, ShieldCheck, Verified, ChevronDown, Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../../hooks/useProperties';
import { useTheme } from '../../context/ThemeContext';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';

const MobileProfileScreen = () => {
    const { currentUser: user, signOut, loading, favorites, savedSearches } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const { data: propertiesData } = useProperties();

    // Calculate real stats from user data
    const stats = useMemo(() => {
        const favoritesCount = favorites?.length || 0;
        const savedSearchesCount = savedSearches?.length || 0;

        // Get recently viewed from localStorage or calculate from favorites
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const propertiesViewed = recentlyViewed.length;

        return {
            favorites: favoritesCount,
            savedSearches: savedSearchesCount,
            propertiesViewed: propertiesViewed,
            recommendations: 0 // TODO: Calculate from user preferences
        };
    }, [favorites, savedSearches]);

    // Get recent activity from favorites and recently viewed
    const recentActivity = useMemo(() => {
        const activities = [];

        // Add favorites as activity
        if (favorites && favorites.length > 0) {
            favorites.slice(0, 5).forEach((fav, index) => {
                activities.push({
                    id: `favorite-${fav.id}`,
                    type: 'favorite',
                    title: fav.title || fav.name || 'Property',
                    price: fav.price ? new Intl.NumberFormat('en-KE', {
                        style: 'currency',
                        currency: 'KES',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }).format(fav.price) : 'Price on request',
                    image: fav.images?.[0] || fav.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200',
                    time: fav.addedAt ? new Date(fav.addedAt).toLocaleDateString() : 'Recently'
                });
            });
        }

        // Add recently viewed
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        recentlyViewed.slice(0, 3).forEach((viewed, index) => {
            activities.push({
                id: `viewed-${viewed.id || index}`,
                type: 'view',
                title: viewed.title || viewed.name || 'Property',
                price: viewed.price ? new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(viewed.price) : 'Price on request',
                image: viewed.images?.[0] || viewed.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200',
                time: viewed.viewedAt ? new Date(viewed.viewedAt).toLocaleDateString() : 'Recently'
            });
        });

        return activities.slice(0, 6);
    }, [favorites]);

    // Redirect unauthenticated users away from profile screen
    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth', { replace: true });
        }
    }, [user, loading, navigate]);

    const isAgent = user?.role === 'agent' || user?.role === 'admin';

    const quickStats = useMemo(() => {
        if (isAgent) {
            return [
                {
                    label: 'Properties Sold',
                    value: '0',
                    icon: TrendingUp,
                    color: 'green',
                    gradient: 'from-[#3b82f6]/20 to-[#45e695]/20',
                    iconColor: 'text-[#2eac70]',
                    bgColor: 'bg-[#3b82f6]/20'
                },
                {
                    label: 'Profile Views',
                    value: '0',
                    icon: Eye,
                    color: 'blue',
                    gradient: 'from-blue-500/20 to-cyan-500/20',
                    iconColor: 'text-blue-500',
                    bgColor: 'bg-blue-500/10'
                },
                {
                    label: 'Active Listings',
                    value: '0',
                    icon: Home,
                    color: 'purple',
                    gradient: 'from-purple-500/20 to-pink-500/20',
                    iconColor: 'text-purple-500',
                    bgColor: 'bg-purple-500/10'
                },
                {
                    label: 'Rating',
                    value: 'N/A',
                    icon: Star,
                    color: 'yellow',
                    gradient: 'from-yellow-500/20 to-amber-500/20',
                    iconColor: 'text-yellow-500',
                    bgColor: 'bg-yellow-500/10'
                }
            ];
        }

        return [
            {
                label: 'Properties Viewed',
                value: stats.propertiesViewed.toString(),
                icon: Eye,
                color: 'blue',
                gradient: 'from-blue-500/20 to-cyan-500/20',
                iconColor: 'text-blue-500',
                bgColor: 'bg-blue-500/10'
            },
            {
                label: 'Saved Searches',
                value: stats.savedSearches.toString(),
                icon: Search,
                color: 'purple',
                gradient: 'from-purple-500/20 to-pink-500/20',
                iconColor: 'text-purple-500',
                bgColor: 'bg-purple-500/10'
            },
            {
                label: 'Favorites',
                value: stats.favorites.toString(),
                icon: Heart,
                color: 'red',
                gradient: 'from-red-500/20 to-rose-500/20',
                iconColor: 'text-red-500',
                bgColor: 'bg-red-500/10'
            },
            {
                label: 'Recommendations',
                value: stats.recommendations.toString(),
                icon: Star,
                color: 'yellow',
                gradient: 'from-yellow-500/20 to-amber-500/20',
                iconColor: 'text-yellow-500',
                bgColor: 'bg-yellow-500/10'
            }
        ];
    }, [stats, isAgent]);

    const menuSections = useMemo(() => {
        const sections = [];

        if (isAgent) {
            sections.push({
                title: 'Agent Dashboard',
                items: [
                    { icon: Home, label: 'My Listings', count: 0, color: 'blue', gradient: 'from-[#3b82f6]/10 to-[#06b6d4]/10', iconColor: 'text-[#2eac70]', action: () => navigate('/agent/listings') },
                    { icon: MessageSquare, label: 'Messages', badge: 'New', color: 'green', gradient: 'from-[#45e695]/10 to-emerald-500/10', iconColor: 'text-[#2eac70]', action: () => navigate('/messages') },
                    { icon: Star, label: 'Client Reviews', color: 'yellow', gradient: 'from-yellow-500/10 to-amber-500/10', iconColor: 'text-yellow-500', action: () => navigate('/agent/reviews') }
                ]
            });
        }

        sections.push({
            title: 'My Activity',
            items: [
                { icon: Heart, label: 'Favorites', count: stats.favorites, color: 'red', gradient: 'from-red-500/10 to-rose-500/10', iconColor: 'text-red-500', action: () => navigate('/favorites') },
                { icon: Search, label: 'Saved Searches', count: stats.savedSearches, color: 'blue', gradient: 'from-blue-500/10 to-cyan-500/10', iconColor: 'text-blue-500', action: () => navigate('/saved-searches') },
                { icon: Eye, label: 'Recently Viewed', count: stats.propertiesViewed, color: 'green', gradient: 'from-green-500/10 to-emerald-500/10', iconColor: 'text-green-500', action: () => navigate('/history') },
                { icon: Activity, label: 'Recent Activity', badge: recentActivity.length > 0 ? 'New' : null, color: 'purple', gradient: 'from-purple-500/10 to-pink-500/10', iconColor: 'text-purple-500', action: () => navigate('/activity') }
            ]
        });

        sections.push({
            title: 'Insights',
            items: [
                { icon: Star, label: 'Recommendations', count: stats.recommendations, color: 'yellow', gradient: 'from-yellow-500/10 to-amber-500/10', iconColor: 'text-yellow-500', action: () => navigate('/recommendations') },
                { icon: TrendingUp, label: 'Market Insights', badge: null, color: 'green', gradient: 'from-green-500/10 to-emerald-500/10', iconColor: 'text-green-500', action: () => navigate('/insights') },
                { icon: BarChart3, label: 'Price Alerts', badge: null, color: 'orange', gradient: 'from-orange-500/10 to-amber-500/10', iconColor: 'text-orange-500', action: () => navigate('/alerts') },
                { icon: Target, label: 'Property Match', badge: null, color: 'pink', gradient: 'from-pink-500/10 to-rose-500/10', iconColor: 'text-pink-500', action: () => navigate('/match') }
            ]
        });
        sections.push({
            title: 'Account',
            items: [
                {
                    icon: User,
                    label: isAgent ? 'Business Profile' : 'Edit Profile',
                    color: 'gray',
                    gradient: 'from-gray-500/10 to-slate-500/10',
                    iconColor: 'text-gray-500',
                    action: () => navigate(isAgent ? '/profile/edit/agent' : '/profile/edit')
                },
                ...(isAgent ? [
                    {
                        icon: FileText,
                        label: 'Professional Bio',
                        color: 'gray',
                        gradient: 'from-gray-500/10 to-slate-500/10',
                        iconColor: 'text-gray-500',
                        action: () => navigate('/profile/edit/agent/bio')
                    },
                    {
                        icon: Share2,
                        label: 'Social & Contact',
                        color: 'gray',
                        gradient: 'from-gray-500/10 to-slate-500/10',
                        iconColor: 'text-gray-500',
                        action: () => navigate('/profile/edit/agent/social')
                    }
                ] : []),
                { icon: Settings, label: 'Settings', color: 'gray', gradient: 'from-gray-500/10 to-slate-500/10', iconColor: 'text-gray-500', action: () => navigate('/settings') },
                { icon: Bell, label: 'Notifications', badge: null, color: 'gray', gradient: 'from-gray-500/10 to-slate-500/10', iconColor: 'text-gray-500', action: () => navigate('/notifications') },
                { icon: HelpCircle, label: 'Help & Support', color: 'gray', gradient: 'from-gray-500/10 to-slate-500/10', iconColor: 'text-gray-500', action: () => navigate('/support') }
            ]
        });

        return sections;
    }, [stats, recentActivity, isAgent, navigate]);

    if (loading) {
        return <ProfileSkeleton />;
    }

    return (
        <div className={`min-h-screen ${isDark
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
            }`}>
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3b82f6]/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#06b6d4]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Header with Profile Card */}
            <motion.div
                className="relative pt-6 pb-32 px-4 z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Enhanced Profile Card */}
                <motion.div
                    className={`relative ${isDark
                        ? 'bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-white/20'
                        : 'bg-white/90 backdrop-blur-xl border-gray-200/50'
                        } rounded-3xl p-6 border shadow-2xl overflow-hidden`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Decorative gradient overlay */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#3b82f6]/20 to-transparent rounded-full blur-3xl -z-10" />

                    {/* Profile Picture with Edit Button */}
                    <div className="flex items-start gap-4 mb-6">
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-[#3b82f6] via-[#45e695] to-[#06b6d4] flex items-center justify-center text-3xl font-bold ${isDark ? 'text-gray-900' : 'text-gray-900'} shadow-2xl ring-4 ${isDark ? 'ring-white/20' : 'ring-gray-200/50'}`}>
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    user?.displayName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'M'
                                )}
                            </div>
                            <motion.button
                                onClick={() => navigate(isAgent ? '/profile/edit/agent' : '/profile/edit')}
                                className="absolute -bottom-1 -right-1 w-9 h-9 bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] rounded-full flex items-center justify-center text-gray-900 shadow-xl ring-2 ring-gray-900/20"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Camera size={16} />
                            </motion.button>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                            <motion.h1
                                className={`text-2xl font-bold mb-2 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Welcome back, {user?.displayName || user?.name || user?.username || 'User'}!
                            </motion.h1>
                            <motion.p
                                className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Here's what's happening with your property search
                            </motion.p>

                            {/* Enhanced Verification Badges */}
                            <motion.div
                                className="flex items-center gap-2 flex-wrap"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <motion.span
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/30 to-blue-600/30 border border-blue-400/40 text-blue-700 dark:text-blue-200 text-xs font-semibold shadow-lg backdrop-blur-sm"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <Shield size={13} className="text-blue-600 dark:text-blue-300" />
                                    Verified
                                </motion.span>
                                {isAgent && (
                                    <motion.span
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#3b82f6]/30 to-[#45e695]/30 border border-[#3b82f6]/40 text-[#0a0c19] dark:text-[#3b82f6] text-xs font-semibold shadow-lg backdrop-blur-sm"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <Award size={13} />
                                        Premium Agent
                                    </motion.span>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Main Content */}
            <div className="relative -mt-24 px-4 pb-32 z-10">
                {/* Enhanced Tab Navigation */}
                <motion.div
                    className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {['Overview', 'Activity', 'Insights'].map((tab, index) => (
                        <motion.button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all relative overflow-hidden ${activeTab === tab.toLowerCase()
                                ? 'bg-gradient-to-r from-[#3b82f6] via-[#45e695] to-[#06b6d4] text-gray-900 shadow-xl shadow-[#3b82f6]/30'
                                : isDark
                                    ? 'bg-white/10 backdrop-blur-xl text-gray-300 border border-white/20 hover:bg-white/15'
                                    : 'bg-gray-100/80 backdrop-blur-xl text-gray-700 border border-gray-300/50 hover:bg-gray-200/80'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            {tab}
                        </motion.button>
                    ))}
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Enhanced Quick Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {quickStats.map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                        className={`relative bg-gradient-to-br ${stat.gradient} backdrop-blur-xl rounded-3xl p-5 border ${isDark ? 'border-white/20' : 'border-gray-200/50'} shadow-xl overflow-hidden group`}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                    >
                                        {/* Animated background gradient */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center shadow-lg`}>
                                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                                </div>
                                                <motion.div
                                                    className="w-2 h-2 rounded-full bg-[#3b82f6]"
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            </div>
                                            <motion.p
                                                className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                                            >
                                                {stat.value}
                                            </motion.p>
                                            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Enhanced Menu Sections */}
                            {menuSections.map((section, sectionIndex) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * sectionIndex }}
                                >
                                    <h3 className={`text-xs font-black uppercase tracking-widest mb-4 px-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <div className="w-1 h-4 bg-gradient-to-b from-[#3b82f6] to-[#06b6d4] rounded-full" />
                                        {section.title}
                                    </h3>
                                    <div className={`${isDark ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-white/80 backdrop-blur-xl border-gray-200/50'} rounded-3xl border overflow-hidden shadow-xl`}>
                                        {section.items.map((item, index) => (
                                            <motion.button
                                                key={item.label}
                                                onClick={item.action}
                                                className={`w-full flex items-center justify-between p-5 hover:bg-gradient-to-r ${item.gradient} transition-all border-b ${isDark ? 'border-white/5' : 'border-gray-200/50'} last:border-b-0 group`}
                                                whileTap={{ scale: 0.98 }}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                        <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                                                        {item.count !== undefined && (
                                                            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.count} {item.count === 1 ? 'item' : 'items'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {item.badge && (
                                                        <motion.span
                                                            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#45e695] text-[#0a0c19] text-xs font-black shadow-lg"
                                                            animate={{ scale: [1, 1.1, 1] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        >
                                                            {item.badge}
                                                        </motion.span>
                                                    )}
                                                    {item.count !== undefined && item.count > 0 && (
                                                        <span className={`font-black text-lg ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{item.count}</span>
                                                    )}
                                                    <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-600'} group-hover:text-[#3b82f6] group-hover:translate-x-1 transition-all`} />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Enhanced Logout Button */}
                            <motion.button
                                onClick={async () => {
                                    await signOut();
                                    navigate('/auth', { replace: true });
                                }}
                                className="w-full p-5 bg-red-500/10 border-2 border-red-500/30 rounded-3xl flex items-center justify-center gap-3 text-red-400 font-bold text-base hover:bg-red-500/20 transition-all group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                                Logout
                            </motion.button>
                        </motion.div>
                    )}

                    {activeTab === 'activity' && (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <h3 className={`text-xs font-black uppercase tracking-widest mb-4 px-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <div className="w-1 h-4 bg-gradient-to-b from-[#3b82f6] to-[#06b6d4] rounded-full" />
                                Recent Activity
                            </h3>
                            {recentActivity.length === 0 ? (
                                <motion.div
                                    className={`flex flex-col items-center justify-center h-96 text-center backdrop-blur-xl rounded-3xl border p-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200/50'}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-gray-700/50' : 'bg-gray-200/50'}`}>
                                        <Activity className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-600'}`} />
                                    </div>
                                    <p className={`font-bold text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No recent activity</p>
                                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Start exploring properties to see your activity here</p>
                                    <motion.button
                                        onClick={() => navigate('/properties')}
                                        className="mt-6 px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#45e695] rounded-2xl text-gray-900 font-bold"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Explore Properties
                                    </motion.button>
                                </motion.div>
                            ) : (
                                recentActivity.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        className={`backdrop-blur-xl rounded-3xl p-5 border flex gap-4 cursor-pointer group transition-all ${isDark ? 'bg-white/10 border-white/20 hover:bg-white/15' : 'bg-white/80 border-gray-200/50 hover:bg-gray-100/80'}`}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            if (activity.id.startsWith('favorite-') || activity.id.startsWith('viewed-')) {
                                                const propertyId = activity.id.split('-')[1];
                                                navigate(`/property/${propertyId}`);
                                            }
                                        }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <motion.img
                                            src={activity.image}
                                            alt={activity.title}
                                            className="w-24 h-24 rounded-2xl object-cover shadow-xl"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200';
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                {activity.type === 'favorite' && (
                                                    <Heart size={16} className="text-red-500 fill-red-500" />
                                                )}
                                                {activity.type === 'view' && (
                                                    <Eye size={16} className="text-blue-500" />
                                                )}
                                                <p className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.title}</p>
                                            </div>
                                            <p className="text-[#3b82f6] font-black text-lg mb-3">{activity.price}</p>
                                            <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <Clock size={14} />
                                                <span>{activity.time}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-600'} group-hover:text-[#3b82f6] group-hover:translate-x-1 transition-all flex-shrink-0`} />
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'insights' && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <h3 className={`text-xs font-black uppercase tracking-widest mb-4 px-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <div className="w-1 h-4 bg-gradient-to-b from-[#3b82f6] to-[#06b6d4] rounded-full" />
                                Market Insights
                            </h3>

                            <motion.div
                                className={`bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-6 border shadow-xl overflow-hidden relative ${isDark ? 'border-white/20' : 'border-gray-200/50'}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#3b82f6]/20 to-transparent rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className={`font-black text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Market Insights</h3>
                                    </div>
                                    <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Properties in Westlands are trending <span className="text-[#3b82f6] font-bold">12% above average</span> this month. Great time to explore investment opportunities!
                                    </p>
                                    <motion.button
                                        className={`px-6 py-3 backdrop-blur-sm rounded-2xl font-bold text-sm transition-all ${isDark ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-200/80 text-gray-900 hover:bg-gray-300/80'}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Learn More
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Additional Insights Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <motion.div
                                    className={`backdrop-blur-xl rounded-3xl p-5 border ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200/50'}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center mb-3">
                                        <Target className="w-5 h-5 text-green-400" />
                                    </div>
                                    <p className={`font-black text-2xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>85%</p>
                                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Match Score</p>
                                </motion.div>
                                <motion.div
                                    className={`backdrop-blur-xl rounded-3xl p-5 border ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200/50'}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-3">
                                        <BarChart3 className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <p className={`font-black text-2xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>+8%</p>
                                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Price Trend</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default MobileProfileScreen;
