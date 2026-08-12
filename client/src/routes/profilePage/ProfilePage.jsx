import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Mail, LogOut, Plus, Heart, Settings, MessageCircle, Building2, Star,
  TrendingUp, Eye, Calendar, Award, Shield, CheckCircle, MapPin, Phone,
  Clock, Activity, BarChart3, Users, FileText, Camera, Edit3, Share2,
  Sparkles, Trophy, Target, Zap, DollarSign, Home, ArrowRight, ChevronRight,
  Briefcase, ThumbsUp, MessageSquare, Bell, Grid, List, Filter, Download,
  Instagram, Twitter, Linkedin, Globe, Crown, Flame, Lock
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import apiRequest from "../../lib/apiRequest";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { theme } = useTheme();

  // Fallback values for missing contexts
  const chats = [];
  const userPosts = [];
  const savedPosts = [];

  const [activeTab, setActiveTab] = useState('overview');
  const [showShareModal, setShowShareModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [userStats, setUserStats] = useState({
    listings: 0,
    sold: 0,
    saved: 0,
    views: 0,
    rating: 0,
    reviews: 0,
    followers: 0,
    following: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data and stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.id) return;

      try {
        setIsLoading(true);

        // Fetch user stats
        const [statsRes, achievementsRes, activityRes] = await Promise.all([
          apiRequest.get(`/users/${currentUser.id}/stats`),
          apiRequest.get(`/users/${currentUser.id}/achievements`),
          apiRequest.get(`/users/${currentUser.id}/activity`)
        ]);

        setUserStats(statsRes.data || {
          listings: userPosts?.length || 0,
          sold: 0,
          saved: savedPosts?.length || 0,
          views: 0,
          rating: 0,
          reviews: 0,
          followers: 0,
          following: 0
        });

        setAchievements(achievementsRes.data || []);
        setRecentActivity(activityRes.data || []);

        // Calculate profile completion
        calculateProfileCompletion();
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Use fallback data
        setUserStats({
          listings: userPosts?.length || 0,
          sold: 0,
          saved: savedPosts?.length || 0,
          views: 0,
          rating: 0,
          reviews: 0,
          followers: 0,
          following: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, userPosts, savedPosts]);

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!currentUser) return;

    let completion = 0;
    const fields = [
      currentUser.username,
      currentUser.email,
      currentUser.avatar,
      currentUser.bio,
      currentUser.phone,
      currentUser.location
    ];

    fields.forEach(field => {
      if (field) completion += 100 / fields.length;
    });

    setProfileCompletion(Math.round(completion));
  };

  // Calculate member duration
  const getMemberDuration = () => {
    if (!currentUser?.createdAt && !currentUser?.joinDate) return "New member";

    const joinDate = new Date(currentUser.createdAt || currentUser.joinDate);
    const now = new Date();
    const years = now.getFullYear() - joinDate.getFullYear();
    const months = now.getMonth() - joinDate.getMonth();

    if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const days = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/desktop/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleShare = (platform) => {
    const profileUrl = `${window.location.origin}/agent/${currentUser?.username || currentUser?.id}`;
    const shareText = `Check out my real estate profile: ${currentUser?.name || currentUser?.username}`;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(profileUrl);
        // Show success notification
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(profileUrl)}`;
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`);
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        navigator.clipboard.writeText(profileUrl);
        break;
    }

    setShowShareModal(false);
  };

  const isAgent = currentUser?.role === 'agent' || currentUser?.role === 'admin';

  const tabs = isAgent ? [
    { id: 'overview', label: 'Overview', icon: Grid },
    { id: 'listings', label: 'Listings', icon: Building2, count: userStats.listings },
    { id: 'saved', label: 'Saved', icon: Heart, count: userStats.saved },
    { id: 'messages', label: 'Messages', icon: MessageCircle, count: chats?.length || 0 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reviews', label: 'Reviews', icon: Star, count: userStats.reviews }
  ] : [
    { id: 'overview', label: 'Overview', icon: Grid },
    { id: 'saved', label: 'Saved', icon: Heart, count: userStats.saved },
    { id: 'messages', label: 'Messages', icon: MessageCircle, count: chats?.length || 0 },
  ];

  // Default achievement templates if none from API
  const defaultAchievements = [
    {
      id: 1,
      title: "First Listing",
      description: "Created your first property listing",
      icon: Home,
      color: "from-[#51faaa] to-[#dbd5a4]",
      unlocked: userStats.listings > 0
    },
    {
      id: 2,
      title: "Property Hunter",
      description: "Saved 10+ properties",
      icon: Heart,
      color: "from-pink-400 to-rose-400",
      unlocked: userStats.saved >= 10
    },
    {
      id: 3,
      title: "Active User",
      description: "Logged in for 7 consecutive days",
      icon: Zap,
      color: "from-[#dbd5a4] to-yellow-500",
      unlocked: false
    },
    {
      id: 4,
      title: "Social Butterfly",
      description: "Connected social media accounts",
      icon: Users,
      color: "from-[#29df99] to-[#51faaa]",
      unlocked: !!(currentUser?.social?.instagram || currentUser?.social?.twitter || currentUser?.social?.linkedin)
    }
  ];

  const displayAchievements = achievements.length > 0 ? achievements : defaultAchievements;

  const isDark = theme?.isDark || false;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500 pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#51faaa]/10 dark:bg-[#51faaa]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#dbd5a4]/10 dark:bg-[#dbd5a4]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8 mb-8 transition-all duration-500">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                  <div className="relative group">
                    <img
                      src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || currentUser?.username || 'User')}&background=6366f1&color=fff&size=128`}
                      alt={currentUser?.name || 'Profile'}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <Link to="/profile/update">
                      <button className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-900 ring-2 ring-white dark:ring-gray-800">
                        <Camera className="w-5 h-5" />
                      </button>
                    </Link>
                    {currentUser?.verified && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#51faaa] to-[#45e695] rounded-full flex items-center justify-center shadow-lg text-gray-900 border-2 border-white dark:border-gray-800">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {currentUser?.name || currentUser?.username || 'User'}
                      </h1>
                      {currentUser?.role === 'premium' && (
                        <span className="px-3 py-1 bg-gradient-to-r from-[#51faaa]/30 to-[#45e695]/30 border border-[#51faaa]/40 text-[#0a0c19] dark:text-[#51faaa] text-xs font-bold rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm">
                          <Award className="w-3 h-3" />
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      @{currentUser?.username || 'username'} • {currentUser?.role || 'Property Owner'}
                    </p>
                    {currentUser?.bio && (
                      <p className="text-gray-700 dark:text-gray-200 mb-4 max-w-2xl">{currentUser.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      {currentUser?.location && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4" />
                          {currentUser.location}
                        </div>
                      )}
                      {currentUser?.phone && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Phone className="w-4 h-4" />
                          {currentUser.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        Member for {getMemberDuration()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Link to={isAgent ? "/profile/edit/agent" : "/profile/edit"}>
                    <button className="flex items-center gap-2 bg-gradient-to-r from-[#51faaa] to-[#45e695] text-gray-900 font-bold py-2.5 px-5 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                      <Settings className="w-4 h-4" />
                      {isAgent ? 'Edit Agent Profile' : 'Edit Profile'}
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2.5 px-5 rounded-xl hover:shadow-lg hover:border-[#51faaa] dark:hover:border-[#51faaa] transition-all duration-300"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500/10 border-2 border-red-500/30 text-red-500 dark:text-red-400 font-bold py-2 text-sm px-5 rounded-xl hover:bg-red-500/20 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 lg:w-64">
                {isAgent && (
                  <div className="bg-[#51faaa]/10 rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-300 border border-[#51faaa]/20 shadow-sm">
                    <Building2 className="w-6 h-6 mx-auto mb-1 text-[#51faaa]" />
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{userStats.listings}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">Listings</p>
                  </div>
                )}
                <div className="bg-[#dbd5a4]/10 rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-300 border border-[#dbd5a4]/20 shadow-sm">
                  <Heart className="w-6 h-6 mx-auto mb-1 text-[#dbd5a4]" />
                  <p className="text-2xl font-black text-gray-800 dark:text-white">{userStats.saved}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">Saved</p>
                </div>
                <div className="bg-[#45e695]/10 rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-300 border border-[#45e695]/20 shadow-sm">
                  <MessageCircle className="w-6 h-6 mx-auto mb-1 text-[#45e695]" />
                  <p className="text-2xl font-black text-gray-800 dark:text-white">{chats?.length || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">Messages</p>
                </div>
                {isAgent && (
                  <div className="bg-yellow-500/10 rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-300 border border-yellow-500/20 shadow-sm">
                    <Star className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                    <p className="text-2xl font-black text-gray-800 dark:text-white">
                      {userStats.rating || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">Rating</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Completion */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Completion</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-full transition-all duration-1000 relative overflow-hidden"
                  style={{ width: `${profileCompletion}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                </div>
              </div>
              {profileCompletion < 100 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Complete your profile to unlock all features
                </p>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-xl rounded-2xl p-2 mb-8">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#51faaa] via-[#45e695] to-[#dbd5a4] text-gray-900 shadow-xl shadow-[#51faaa]/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Achievements */}
                <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                    <Trophy className="w-7 h-7 text-yellow-500" />
                    Achievements
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${achievement.unlocked
                          ? 'border-transparent hover:scale-105'
                          : 'border-gray-300 dark:border-gray-600 opacity-60'
                          }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${achievement.color} rounded-2xl ${achievement.unlocked ? 'opacity-100' : 'opacity-0'
                          }`}></div>
                        <div className="relative">
                          <achievement.icon className={`w-8 h-8 mb-3 ${achievement.unlocked ? 'text-white' : 'text-gray-400'
                            }`} />
                          <h3 className={`font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                            {achievement.title}
                          </h3>
                          <p className={`text-sm ${achievement.unlocked ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {achievement.description}
                          </p>
                          {!achievement.unlocked && (
                            <div className="absolute top-3 right-3">
                              <Lock className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                  <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                      <Activity className="w-7 h-7 text-emerald-500" />
                      Recent Activity
                    </h2>
                    <div className="space-y-4">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#45e695] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Activity className="w-5 h-5 text-gray-900" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-white">
                              {activity.action}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.details}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {isAgent && (
                      <Link to="/add-property" className="block">
                        <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-[#51faaa] to-[#45e695] text-gray-900 font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                          <Plus className="w-5 h-5 text-gray-900" />
                          Create New Listing
                        </button>
                      </Link>
                    )}
                    <Link to="/desktop/properties" className="block">
                      <button className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:border-[#51faaa] dark:hover:border-[#51faaa] hover:shadow-lg transition-all duration-300 text-gray-700 dark:text-gray-200 font-bold">
                        <Search className="w-5 h-5" />
                        Browse Properties
                      </button>
                    </Link>
                    {isAgent && (
                      <button className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:border-[#51faaa] dark:hover:border-[#51faaa] hover:shadow-lg transition-all duration-300 text-gray-700 dark:text-gray-200 font-bold">
                        <FileText className="w-5 h-5" />
                        Generate Report
                      </button>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(currentUser?.social?.instagram || currentUser?.social?.twitter || currentUser?.social?.linkedin || currentUser?.website) && (
                  <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Connect</h3>
                    <div className="space-y-3">
                      {currentUser.social?.instagram && (
                        <a href={`https://instagram.com/${currentUser.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                          <Instagram className="w-5 h-5 text-pink-600" />
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {currentUser.social.instagram}
                          </span>
                        </a>
                      )}
                      {currentUser.social?.twitter && (
                        <a href={`https://twitter.com/${currentUser.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                          <Twitter className="w-5 h-5 text-emerald-400" />
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {currentUser.social.twitter}
                          </span>
                        </a>
                      )}
                      {currentUser.social?.linkedin && (
                        <a href={`https://linkedin.com/in/${currentUser.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                          <Linkedin className="w-5 h-5 text-emerald-600" />
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {currentUser.social.linkedin}
                          </span>
                        </a>
                      )}
                      {currentUser.website && (
                        <a href={currentUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                          <Globe className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {currentUser.website}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-emerald-500" />
                  My Listings ({userStats.listings})
                </h2>
                <div className="flex gap-3">
                  <Link to="/add-property">
                    <button className="flex items-center gap-2 bg-gradient-to-r from-[#51faaa] to-[#45e695] text-gray-900 font-bold py-2 px-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                      <Plus className="w-4 h-4" />
                      Add New
                    </button>
                  </Link>
                </div>
              </div>

              {userPosts?.length === 0 ? (
                <EmptyState
                  title="No Listings Yet"
                  description="You haven't created any property listings yet. Start by creating your first post!"
                  icon={Building2}
                  actionText="Create First Post"
                  actionLink="/add-property"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Property cards would be rendered here */}
                  <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                    Property listings will be displayed here
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <Heart className="w-7 h-7 text-pink-500" />
                  Saved Properties ({userStats.saved})
                </h2>
              </div>

              {savedPosts?.length === 0 ? (
                <EmptyState
                  title="No Saved Properties"
                  description="You haven't saved any properties yet. Start exploring and save your favorites!"
                  icon={Heart}
                  actionText="Browse Properties"
                  actionLink="/properties"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Saved property cards would be rendered here */}
                  <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                    Saved properties will be displayed here
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <MessageCircle className="w-7 h-7 text-purple-500" />
                  Messages ({chats?.length || 0})
                </h2>
              </div>

              {(!chats || chats.length === 0) ? (
                <EmptyState
                  title="No Messages Yet"
                  description="You don't have any messages yet. Start a conversation with property owners or agents!"
                  icon={MessageCircle}
                  actionText="Browse Properties"
                  actionLink="/properties"
                />
              ) : (
                <div className="space-y-4">
                  {/* Chat list would be rendered here */}
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Your messages will be displayed here
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  Performance Overview
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  {userStats.listings > 0 ? (
                    <p>Performance analytics coming soon</p>
                  ) : (
                    <EmptyState
                      title="No Data Yet"
                      description="Create listings to see your performance analytics"
                      icon={BarChart3}
                      actionText="Create Listing"
                      actionLink="/add-property"
                    />
                  )}
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-emerald-500" />
                  Views Analytics
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p>Views analytics coming soon</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <Star className="w-7 h-7 text-yellow-500" />
                  Client Reviews ({userStats.reviews})
                </h2>
                {userStats.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(userStats.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">{userStats.rating}</span>
                  </div>
                )}
              </div>

              {userStats.reviews === 0 ? (
                <EmptyState
                  title="No Reviews Yet"
                  description="You haven't received any reviews yet. Keep providing excellent service to get your first review!"
                  icon={Star}
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Reviews will be displayed here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full animate-modal-slide-up">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Share Profile</h3>
            <div className="space-y-4">
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <LinkIcon className="w-5 h-5" />
                Copy Profile Link
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Share via Email
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Twitter className="w-5 h-5 mx-auto text-emerald-400" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5 mx-auto text-emerald-600" />
                </button>
                <button
                  onClick={() => handleShare('instagram')}
                  className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Instagram className="w-5 h-5 mx-auto text-pink-600" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="mt-6 w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(30px, -50px) scale(1.1) rotate(120deg); }
          66% { transform: translate(-20px, 20px) scale(0.9) rotate(240deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        
        .animate-blob {
          animation: blob 20s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        @keyframes modal-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-modal-slide-up {
          animation: modal-slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Empty State Component
function EmptyState({ title, description, icon: Icon, actionText, actionLink }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm pb-[1px] pr-[1px]">
        <Icon className="w-8 h-8 text-gray-900 drop-shadow-sm" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">{description}</p>
      {actionText && actionLink && (
        <Link to={actionLink}>
          <button className="bg-gradient-to-br from-[#51faaa] to-[#45e695] text-gray-900 px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            {actionText}
          </button>
        </Link>
      )}
    </div>
  );
}

// LinkIcon component for share modal
const LinkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

// Search icon (if not available in lucide)
const Search = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default ProfilePage;