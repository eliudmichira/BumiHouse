import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Eye, MessageCircle, BarChart3,
    TrendingUp, LogOut, ChevronRight,
    Shield, Award, Star, Loader2, Activity, Trash2,
    Linkedin, Facebook, Phone, Settings, User as UserIcon,
    Camera, DollarSign, MapPin
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { accountDashboardAPI, propertiesAPI, agentsAPI } from '../../lib/firebaseAPI';
// Haptics loaded dynamically to avoid browser crashes
let Haptics, ImpactStyle;
import('@capacitor/haptics').then(mod => {
    Haptics = mod.Haptics;
    ImpactStyle = mod.ImpactStyle;
}).catch(() => { });
import PropertyCardSkeleton from '../components/skeletons/PropertyCardSkeleton';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';
import { MobilePage } from '../components/PropertyMobileLayout'; // Use layout wrapper

const MobileNavigation = lazy(() => import('../components/MobileNavigation'));

const MobileAgentProfile = () => {
    const { id } = useParams(); // Get ID from URL
    const { currentUser: user, signOut, loading, isVerifiedAgent } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Determine if we're viewing our own profile or another agent's
    const isOwner = !id || (user && user.id === id);
    const profileId = id || user?.id;

    const [agentProfile, setAgentProfile] = useState(null);
    const [agentStats, setAgentStats] = useState({
        totalProperties: 0,
        activeListings: 0,
        totalViews: 0,
        totalInquiries: 0,
        thisMonthRevenue: 0,
        avgRating: 0
    });
    const [isProfileLoading, setProfileLoading] = useState(true);
    const [isPropertiesLoading, setPropertiesLoading] = useState(true);
    const [isInquiriesLoading, setInquiriesLoading] = useState(true);

    const [properties, setProperties] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Progressive Data Fetching
    useEffect(() => {
        if (!profileId) return;

        const loadProfile = async () => {
            try {
                const profile = await agentsAPI.getById(profileId);
                setAgentProfile(profile);
            } catch (err) {
                console.error('Failed to fetch agent profile:', err);
            } finally {
                setProfileLoading(false);
            }
        };

        const loadProperties = async () => {
            try {
                // Use the new public method if available or fallback
                const userProperties = await accountDashboardAPI.getUserProperties(profileId);
                setProperties(userProperties || []);

                // Update stats that depend on properties
                setAgentStats(prev => ({
                    ...prev,
                    totalProperties: userProperties?.length || 0,
                    activeListings: userProperties?.length || 0,
                    totalViews: (userProperties || []).reduce((sum, prop) => sum + (prop.views || 0), 0),
                    avgRating: userProperties?.length
                        ? Math.round((userProperties.reduce((sum, p) => sum + (p.rating || 0), 0) / userProperties.length) * 10) / 10
                        : 0
                }));
            } catch (err) {
                console.error('Failed to fetch properties:', err);
            } finally {
                setPropertiesLoading(false);
            }
        };

        const loadInquiries = async () => {
            // Only load inquiries for the owner
            if (!isOwner) {
                setInquiriesLoading(false);
                return;
            }
            try {
                const agentInquiries = await accountDashboardAPI.getAgentInquiries(profileId);
                setInquiries(agentInquiries || []);
                setAgentStats(prev => ({
                    ...prev,
                    totalInquiries: (agentInquiries || []).length
                }));
            } catch (err) {
                console.error('Failed to fetch inquiries:', err);
            } finally {
                setInquiriesLoading(false);
            }
        };

        // Fire all requests in parallel
        loadProfile();
        loadProperties();
        loadInquiries();
    }, [profileId, isOwner]);

    // Redirect unauthenticated users ONLY if trying to view own profile
    useEffect(() => {
        if (!loading && !user && !id) {
            navigate('/auth', { replace: true });
        }
    }, [user, loading, navigate, id]);
    const handleTabChange = async (tabId) => {
        setActiveTab(tabId);
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            if (navigator.vibrate) navigator.vibrate(10);
        }
    };

    // Skeleton Components
    const StatSkeleton = () => (
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/40 border-white/10' : 'bg-white border-gray-200'} animate-pulse`}>
            <div className="w-4 h-4 rounded bg-gray-500/10 mb-3" />
            <div className="h-6 bg-gray-500/10 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-500/10 rounded w-1/2" />
        </div>
    );

    // Memoized Quick Stats Data — pastel card palette
    const quickStatsData = useMemo(() => [
        {
            label: 'Active Listings',
            value: agentStats.activeListings.toString(),
            icon: Building2,
            cardBg: 'bg-blue-100/70',
            tileBg: 'bg-blue-200/70',
            iconColor: 'text-blue-600',
            loading: isPropertiesLoading
        },
        {
            label: 'Total Views',
            value: agentStats.totalViews.toLocaleString(),
            icon: Eye,
            cardBg: 'bg-emerald-100/70',
            tileBg: 'bg-emerald-200/70',
            iconColor: 'text-emerald-600',
            loading: isPropertiesLoading
        },
        {
            label: 'Inquiries',
            value: agentStats.totalInquiries.toString(),
            icon: MessageCircle,
            cardBg: 'bg-purple-100/70',
            tileBg: 'bg-purple-200/70',
            iconColor: 'text-purple-600',
            loading: isInquiriesLoading
        },
        // Only show revenue/financial stats to owner
        ...(isOwner ? [{
            label: 'This Month',
            value: `KSh ${(agentStats.thisMonthRevenue / 1000).toFixed(0)}k`,
            icon: DollarSign,
            cardBg: 'bg-amber-100/70',
            tileBg: 'bg-amber-200/70',
            iconColor: 'text-amber-600',
            loading: isPropertiesLoading
        }] : [])
    ], [agentStats, isPropertiesLoading, isInquiriesLoading, isOwner]);

    // If not owner, wrap in MobilePage for consistent header/nav
    const ContentWrapper = ({ children }) => {
        if (!isOwner) {
            return (
                <MobilePage title="Agent Profile" showBackButton={true}>
                    {children}
                </MobilePage>
            );
        }
        return children;
    };

    if (isProfileLoading) {
        return (
            <ContentWrapper>
                <ProfileSkeleton />
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper>
            <div className={`min-h-screen ${(!isOwner ? 'pt-0' : '')} ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>

                {/* Header with Profile Card */}
                <motion.div
                    className={`relative px-4 pb-6 z-10 ${isOwner ? 'pt-4' : 'pt-4'}`}
                    style={{ paddingTop: isOwner ? 'calc(env(safe-area-inset-top) + 1rem)' : '1rem' }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={`rounded-2xl p-5 border shadow-sm ${isDark ? 'bg-gray-900/60 border-white/10' : 'bg-white border-slate-100'}`}>

                        <div className="flex items-center gap-5 relative z-10">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className={`w-16 h-16 rounded-full overflow-hidden ring-2 ring-white shadow-md ${isDark ? 'bg-gray-800' : ''}`}
                                    style={!agentProfile?.image && !agentProfile?.avatar && !agentProfile?.photo ? { background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)' } : undefined}>
                                    {agentProfile?.image || agentProfile?.avatar || agentProfile?.photo ? (
                                        <img
                                            src={agentProfile?.image || agentProfile?.avatar || agentProfile?.photo}
                                            alt={agentProfile?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-semibold tracking-tight text-white">
                                            {(agentProfile?.name?.[0]?.toUpperCase()) || (user?.displayName?.[0]?.toUpperCase()) || 'A'}
                                        </div>
                                    )}
                                </div>
                                {isOwner && (
                                    <motion.button
                                        onClick={() => navigate('/profile/edit/agent')}
                                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-400 ring-2 ring-white rounded-full flex items-center justify-center text-white shadow"
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Camera size={14} />
                                    </motion.button>
                                )}
                            </motion.div>

                            <div className="flex-1 min-w-0">
                                <motion.h1
                                    className={`text-[17px] font-bold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {isOwner ? `Welcome back, ${(user?.displayName || user?.name || user?.username || 'Agent').split(' ')[0]}!` : agentProfile?.name || 'Agent Profile'}
                                </motion.h1>

                                {isProfileLoading ? (
                                    <div className="space-y-2 mb-4">
                                        <div className="h-4 w-48 bg-gray-500/10 rounded animate-pulse" />
                                    </div>
                                ) : (
                                    <motion.p
                                        className={`mt-1 text-[13px] mb-3 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {agentProfile?.professionalTitle || "Real Estate Professional"} <span className="mx-1 text-slate-300">•</span> {agentProfile?.company || "Independent Agent"}
                                    </motion.p>
                                )}

                                {/* Enhanced Verification Badges & Social Links */}
                                <motion.div
                                    className="flex items-center gap-3 flex-wrap"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {(isOwner ? isVerifiedAgent : agentProfile?.verified) && (
                                        <motion.span
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <Shield size={11} />
                                            Verified Agent
                                        </motion.span>
                                    )}

                                    <div className="flex items-center gap-1.5">
                                        {agentProfile?.linkedinUrl && (
                                            <motion.a
                                                href={agentProfile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                                className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10' : 'bg-gray-100 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Linkedin size={16} />
                                            </motion.a>
                                        )}
                                        {agentProfile?.facebookUrl && (
                                            <motion.a
                                                href={agentProfile.facebookUrl} target="_blank" rel="noopener noreferrer"
                                                className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-600/10' : 'bg-gray-100 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Facebook size={16} />
                                            </motion.a>
                                        )}
                                        {agentProfile?.whatsappNumber && (
                                            <motion.a
                                                href={`https://wa.me/${agentProfile.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                                className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-gray-400 hover:text-green-400 hover:bg-green-500/10' : 'bg-gray-100 text-gray-500 hover:text-green-600 hover:bg-green-50'}`}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Phone size={16} />
                                            </motion.a>
                                        )}
                                    </div>
                                    {agentStats.avgRating > 4 && (
                                        <motion.span
                                            className={`inline-flex items-center gap-1 text-[11px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <Award size={11} />
                                            Top Rated
                                        </motion.span>
                                    )}
                                </motion.div>
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="relative px-4 pb-40 z-10">
                    {/* Enhanced Tab Navigation */}
                    <motion.div
                        className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {
                            [
                                { id: 'overview', label: 'Overview', icon: Activity },
                                { id: 'properties', label: 'Properties', icon: Building2 },
                                ...(isOwner ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] : [])
                            ].map((tab, index) => (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`px-5 py-2.5 rounded-full font-semibold text-[13px] whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-md shadow-emerald-500/20'
                                        : isDark
                                            ? 'bg-gray-900/60 text-gray-300 border border-white/10'
                                            : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </motion.button>
                            ))
                        }
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
                                {/* Stats — pastel personality cards */}
                                <div className="grid grid-cols-2 gap-3">
                                    {quickStatsData.map((stat, index) => (
                                        stat.loading ? (
                                            <StatSkeleton key={index} />
                                        ) : (
                                            <div
                                                key={stat.label}
                                                className={`relative rounded-2xl p-4 shadow-sm overflow-hidden ${isDark ? 'bg-gray-900/40 border border-white/10' : `${stat.cardBg} border border-white/60`}`}
                                            >
                                                <div className="flex items-start justify-between mb-5">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : stat.tileBg}`}>
                                                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2.2} />
                                                    </div>
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
                                                </div>
                                                <p className={`text-[28px] font-bold leading-none tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {stat.value}
                                                </p>
                                                <p className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{stat.label}</p>
                                            </div>
                                        )
                                    ))}
                                </div>

                                {/* Service Areas */}
                                {agentProfile?.serviceAreas?.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] mb-3 px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                            <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                                            Service Areas
                                        </h3>
                                        <div className="flex flex-wrap gap-2 px-2">
                                            {agentProfile.serviceAreas.map((area, idx) => (
                                                <span key={idx} className={`px-3 py-1.5 rounded-2xl text-[10px] font-bold shadow-sm ${isDark ? 'bg-white/10 text-emerald-300 border border-white/10' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Professional Bio */}
                                {agentProfile?.bio && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] mb-3 px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                            <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                                            About Me
                                        </h3>
                                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/10 border-white/20 backdrop-blur-xl' : 'bg-white border-slate-100 shadow-sm'}`}>
                                            <p className={`text-[13px] leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                                                {agentProfile.bio}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Professional Presence */}
                                {(agentProfile?.linkedinUrl || agentProfile?.facebookUrl || agentProfile?.whatsappNumber) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] mb-3 px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                            <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                                            Professional Presence
                                        </h3>
                                        <div className="flex gap-4 px-2">
                                            {agentProfile.linkedinUrl && (
                                                <motion.a
                                                    href={agentProfile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Linkedin size={20} />
                                                </motion.a>
                                            )}
                                            {agentProfile.facebookUrl && (
                                                <motion.a
                                                    href={agentProfile.facebookUrl} target="_blank" rel="noopener noreferrer"
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-600/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}
                                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Facebook size={20} />
                                                </motion.a>
                                            )}
                                            {agentProfile.whatsappNumber && (
                                                <motion.a
                                                    href={`https://wa.me/${agentProfile.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-600 border border-green-100'}`}
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Phone size={20} />
                                                </motion.a>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Account Settings Section - OWNER ONLY */}
                                {isOwner && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] mb-3 px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                            <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                                            Account Settings
                                        </h3>
                                        <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? 'bg-gray-900/40 border-white/10' : 'bg-white border-slate-100'}`}>
                                            {[
                                                { icon: UserIcon, label: 'Edit Profile Details', tile: 'bg-gradient-to-br from-emerald-400 to-emerald-500', iconColor: 'text-white', action: () => navigate('/profile/edit/agent') },
                                                { icon: Settings, label: 'Account Preferences', tile: 'bg-blue-50', iconColor: 'text-blue-600', action: () => navigate('/settings') },
                                                { icon: Shield, label: 'Security & Password', tile: 'bg-purple-50', iconColor: 'text-purple-600', action: () => navigate('/settings') },
                                                { icon: Building2, label: 'Real Estate License', tile: 'bg-amber-50', iconColor: 'text-amber-600', action: () => navigate('/agent-verification') }
                                            ].map((item) => (
                                                <button
                                                    key={item.label}
                                                    onClick={item.action}
                                                    className={`w-full flex items-center justify-between px-4 py-3 transition-colors border-b last:border-b-0 ${isDark ? 'border-white/5 active:bg-white/5' : 'border-slate-100 active:bg-slate-50'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.tile} ${item.tile.includes('gradient') ? 'shadow-sm shadow-emerald-500/30' : ''}`}>
                                                            <item.icon className={`w-[18px] h-[18px] ${item.iconColor}`} strokeWidth={2.1} />
                                                        </div>
                                                        <span className={`text-[14px] font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>{item.label}</span>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-slate-400'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Enhanced Logout Button - OWNER ONLY */}
                                {isOwner && (
                                    <motion.button
                                        onClick={async () => {
                                            await signOut();
                                            navigate('/auth', { replace: true });
                                        }}
                                        className="w-full py-3.5 border border-red-200 bg-red-50 rounded-2xl flex items-center justify-center gap-2 text-red-500 font-semibold text-[14px] active:bg-red-100 transition-colors shadow-sm"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                                        Logout
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'properties' && (
                            <motion.div
                                key="properties"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] mb-3 px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                    <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                                    My Properties
                                </h3>

                                {isPropertiesLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <PropertyCardSkeleton key={i} />)}
                                    </div>
                                ) : properties.length === 0 ? (
                                    <div className={`flex flex-col items-center justify-center py-20 text-center rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200/50'}`}>
                                        <Building2 className={`w-12 h-12 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                        <p className={`font-bold text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No properties listed yet</p>
                                        <button
                                            onClick={() => navigate('/properties/add')}
                                            className="mt-6 px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-2xl text-gray-900 font-bold"
                                        >
                                            Add Your First Listing
                                        </button>
                                    </div>
                                ) : (
                                    properties.map((property, index) => (
                                        <motion.div
                                            key={property.id}
                                            className={`rounded-xl p-3 border flex gap-3 cursor-pointer transition-colors ${isDark ? 'bg-gray-900/40 border-white/10 active:bg-white/5' : 'bg-white border-gray-200 active:bg-gray-50'}`}
                                            onClick={() => navigate(`/property/${property.id}`)}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-xl border border-white/10 flex-shrink-0">
                                                <img
                                                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'}
                                                    alt={property.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[8px] font-bold text-white uppercase tracking-wider">
                                                    Active
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                <div>
                                                    <p className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{property.title}</p>
                                                    <p className="text-[#51faaa] font-black text-lg">KES {property.price?.toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {isOwner ? (
                                                        <>
                                                            <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                <Activity size={12} className="text-emerald-400" />
                                                                <span>{(property.views || 0).toLocaleString()} views</span>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/properties/add?edit=${property.id}`);
                                                                }}
                                                                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPropertyToDelete(property);
                                                                }}
                                                                className={`p-1.5 rounded-lg ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                                                title="Delete property"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        // Public view actions
                                                        <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            <MapPin size={12} className="text-[#51faaa]" />
                                                            <span>{property.location?.city || 'Kenya'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 self-center ${isDark ? 'text-gray-500' : 'text-gray-600'} group-hover:text-[#51faaa] group-hover:translate-x-1 transition-all`} />
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'analytics' && (
                            <motion.div
                                key="analytics"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] mb-3 px-1 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                    <span className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                                    Growth Insights
                                </h3>

                                <motion.div
                                    className={`bg-gradient-to-br from-emerald-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-6 border shadow-xl overflow-hidden relative ${isDark ? 'border-white/20' : 'border-gray-200/50'}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#51faaa]/20 to-transparent rounded-full blur-2xl" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <h3 className={`font-black text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Revenue Stream</h3>
                                        </div>
                                        <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                            You have <span className="text-[#51faaa] font-bold">{properties.length} active listing{properties.length !== 1 ? 's' : ''}</span> with {agentStats.totalViews.toLocaleString()} total views. You've earned KES {agentStats.thisMonthRevenue.toLocaleString()} this month.
                                        </p>

                                        {/* Stats Comparison Bar */}
                                        <div className={`mt-6 p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Inquiry Rate</span>
                                                <span className="text-[#51faaa] font-black text-sm">{agentStats.totalViews > 0 ? ((inquiries.length / agentStats.totalViews) * 100).toFixed(1) : '0.0'}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-700/30 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-[#51faaa] to-[#dbd5a4]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(agentStats.totalViews > 0 ? ((inquiries.length / agentStats.totalViews) * 100 * 10) : 0, 100)}%` }}
                                                    transition={{ duration: 1.5, delay: 0.5 }}
                                                />
                                            </div>
                                            <p className={`text-[10px] mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                Based on {agentStats.totalViews.toLocaleString()} views in {agentProfile?.countyOfOperation || 'Nairobi'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Total Reach', value: agentStats.totalViews.toLocaleString(), icon: Eye, color: 'text-emerald-400' },
                                        { label: 'Agent Score', value: agentStats.avgRating.toFixed(1), icon: Star, color: 'text-yellow-400' },
                                        { label: 'Active Leads', value: inquiries.length, icon: MessageCircle, color: 'text-purple-400' },
                                        { label: 'Listings', value: properties.length, icon: Award, color: 'text-[#51faaa]' }
                                    ].map((item, idx) => (
                                        <div key={idx} className={`p-5 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-lg'}`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <item.icon size={16} className={item.color} />
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</span>
                                            </div>
                                            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Delete property confirmation modal */}
                {
                    propertyToDelete && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                            <div className={`rounded-2xl p-6 w-full max-w-sm shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Property</h3>
                                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Delete &quot;{propertyToDelete.title}&quot;? This cannot be undone.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            if (!propertyToDelete?.id) return;
                                            setDeleting(true);
                                            try {
                                                await propertiesAPI.delete(propertyToDelete.id);
                                                setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
                                                setPropertyToDelete(null);
                                            } catch (err) {
                                                console.error('Error deleting property:', err);
                                            } finally {
                                                setDeleting(false);
                                            }
                                        }}
                                        disabled={deleting}
                                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold disabled:opacity-50"
                                    >
                                        {deleting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Delete'}
                                    </button>
                                    <button
                                        onClick={() => setPropertyToDelete(null)}
                                        disabled={deleting}
                                        className={`flex-1 py-2.5 rounded-xl font-semibold border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    (isOwner) && (
                        <Suspense fallback={null}>
                            <MobileNavigation />
                        </Suspense>
                    )
                }

                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            </div>
        </ContentWrapper>
    );
};

export default MobileAgentProfile;
