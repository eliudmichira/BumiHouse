import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { accountDashboardAPI } from '../../lib/firebaseAPI';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useProperties } from '../../hooks/useProperties';
import { SimpleSpinner, SimpleLoadingDots } from '../../components/SimpleLoadingStates';
import {
  Home,
  MessageCircle,
  Settings,
  Heart,
  Search,
  Eye,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Building2,
  User,
  Bell,
  Filter,
  Bookmark,
  Clock,
  DollarSign
} from 'lucide-react';
import { DashboardLoader } from '../../components/Preloader';

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, favorites, savedSearches, userPreferences } = useAuth();
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [userProperties, setUserProperties] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState({
    totalFavorites: 0,
    totalBookings: 0,
    totalProperties: 0,
    totalViews: 0
  });
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [viewedProperties, setViewedProperties] = useState([]);

  // Get section from URL params or default to overview
  const sectionFromUrl = searchParams.get('section');

  useEffect(() => {
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  // Update URL when section changes
  useEffect(() => {
    if (activeSection !== sectionFromUrl) {
      setSearchParams({ section: activeSection });
    }
  }, [activeSection, sectionFromUrl, setSearchParams]);

  // Load user data from Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.id) return;

      setIsLoading(true);
      try {
        // Essential data fetching
        const [properties, bookings] = await Promise.all([
          accountDashboardAPI.getUserProperties(currentUser.id).catch(() => []),
          accountDashboardAPI.getUserBookings(currentUser.id).catch(() => [])
        ]);

        setUserProperties(properties);
        setUserBookings(bookings);
        
        // Use favorites from AuthContext for analytics
        setUserAnalytics({
          totalFavorites: favorites?.length || 0,
          totalBookings: bookings.length,
          totalProperties: properties.length,
          totalViews: properties.reduce((sum, prop) => sum + (prop.views || 0), 0)
        });

        // Auxiliary data fetching (non-critical)
        try {
          const [viewedData, recommendedData, activityData] = await Promise.all([
            accountDashboardAPI.getUserViewHistory(currentUser.id).catch(() => []),
            accountDashboardAPI.getRecommendedProperties(currentUser.id).catch(() => []),
            accountDashboardAPI.getUserActivity(currentUser.id).catch(() => [])
          ]);
          
          setViewedProperties(viewedData);
          setRecommendedProperties(recommendedData);
          setRecentActivity(activityData);
        } catch (auxError) {
          console.warn('Some non-critical dashboard data failed to load', auxError);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, favorites]);

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'Your dashboard summary'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      description: 'Your saved properties'
    },
    {
      id: 'searches',
      label: 'Saved Searches',
      icon: Search,
      description: 'Your search criteria'
    },
    {
      id: 'activity',
      label: 'Recent Activity',
      icon: Clock,
      description: 'Your recent actions'
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: Star,
      description: 'Properties for you'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: TrendingUp,
      description: 'Market data & trends'
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      description: 'Your viewing appointments'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'searches':
        return <SearchesSection />;
      case 'activity':
        return <ActivitySection />;
      case 'recommendations':
        return <RecommendationsSection />;
      case 'insights':
        return <InsightsSection />;
      case 'bookings':
        return <BookingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  // Overview Section Component
  const OverviewSection = () => (
    <div className="space-y-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userAnalytics.totalFavorites}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <Search className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Saved Searches</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{savedSearches?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Properties Viewed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{viewedProperties.length}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recommendations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recommendedProperties.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/desktop/properties')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] hover:shadow-lg transition-all"
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Search Properties</span>
          </button>

          <button
            onClick={() => setActiveSection('favorites')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">View Favorites</span>
          </button>

          <button
            onClick={() => navigate('/messages')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Messages</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Favorites Section Component
  const FavoritesSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Favorites</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{userFavorites.length} properties</span>
        </div>

        {userFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userFavorites.slice(0, 6).map((property) => (
              <div key={property.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'}
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <button className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#51faaa] transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {property.location?.address || 'Location not specified'}
                  </p>
                  <p className="text-lg font-bold text-[#51faaa] mt-2">
                    KES {property.price?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start exploring properties and save your favorites
            </p>
            <button
              onClick={() => navigate('/desktop/properties')}
              className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Searches Section Component
  const SearchesSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Searches</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{savedSearches?.length || 0} searches</span>
        </div>

        {savedSearches && savedSearches.length > 0 ? (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <div key={search.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{search.query}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Saved {new Date(search.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#51faaa] text-[#111] rounded-lg hover:bg-[#45e595] transition-colors">
                  Search Again
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved searches</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your saved searches will appear here
            </p>
            <button
              onClick={() => navigate('/desktop/properties')}
              className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Start Searching
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Activity Section Component
  const ActivitySection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>

        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => {
              // Select the icon component based on the icon name
              let IconComponent = Eye; // default
              if (activity.icon === 'Heart') IconComponent = Heart;
              if (activity.icon === 'Search') IconComponent = Search;
              if (activity.icon === 'Eye') IconComponent = Eye;

              return (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <div className="w-10 h-10 rounded-full bg-[#51faaa]/20 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-[#51faaa]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recent activity</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your activity history will appear here as you use the platform
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Recommendations Section Component
  const RecommendationsSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recommended for You</h2>

        {recommendedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProperties.map((property) => (
              <div key={property.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'}
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <button className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                  {property.reason && (
                    <div className="absolute bottom-3 left-3">
                      <div className="px-2 py-1 rounded-full bg-[#51faaa]/90 text-[#0a0c19] text-xs font-medium">
                        {property.reason}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#51faaa] transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {property.location?.address || property.location?.city || 'Location not specified'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-lg font-bold text-[#51faaa]">
                      KES {property.price?.toLocaleString() || '0'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{property.bedrooms || 0} beds</span>
                      <span>•</span>
                      <span>{property.bathrooms || 0} baths</span>
                      {property.area && (
                        <>
                          <span>•</span>
                          <span>{property.area}m²</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recommendations yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Browse properties to get personalized recommendations
            </p>
            <button
              onClick={() => navigate('/desktop/properties')}
              className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Explore Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Bookings Section Component
  const BookingsSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Bookings</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{userBookings.length} appointments</span>
        </div>

        {userBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBookings.map((booking) => (
              <div key={booking.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={booking.propertyImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&h=300'} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{booking.propertyTitle}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Agent: {booking.agentName}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4 text-[#51faaa]" />
                    <span>{booking.viewingDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-[#51faaa]" />
                    <span>{booking.viewingTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'pending'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/property/${booking.propertyId}`)}
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    View Property
                  </button>
                  <button className="flex-1 px-3 py-2 text-xs bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Book a viewing for properties you're interested in
            </p>
            <button
              onClick={() => navigate('/desktop/properties')}
              className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Explore Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Insights Section Component
  const InsightsSection = () => {
    const { data, isLoading: isPropertiesLoading } = useProperties();
    
    const stats = React.useMemo(() => {
      const list = data?.properties || [];
      const withPrice = list.filter((p) => p.price != null && p.price > 0);
      const avgPrice = withPrice.length ? withPrice.reduce((s, p) => s + p.price, 0) / withPrice.length : 0;
      
      const byType = {};
      const byLocation = {};
      
      list.forEach((p) => {
          const t = p.type || p.propertyType || 'Other';
          byType[t] = (byType[t] || 0) + 1;
          const loc = p.location || p.city || p.address || 'Other';
          const locStr = typeof loc === 'string' ? loc : (loc?.city || loc?.name || 'Other');
          byLocation[locStr] = (byLocation[locStr] || 0) + 1;
      });
      
      const topTypesData = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
      const topLocationsData = Object.entries(byLocation).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
      
      return { total: list.length, avgPrice, topTypesData, topLocationsData, withPrice: withPrice.length };
    }, [data]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (isPropertiesLoading) {
       return <div className="flex justify-center py-12"><SimpleSpinner size="md" /></div>;
    }

    return (
      <div className="space-y-6">
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#51faaa]/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#51faaa]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Insights</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overview of current property listings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Market Listings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Market Price</p>
              <p className="text-3xl font-bold text-[#51faaa]">
                {stats.avgPrice ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(stats.avgPrice) : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Properties by Location</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topLocationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12}} />
                            <RechartsTooltip 
                                cursor={{fill: isDark ? '#374151' : '#f3f4f6'}}
                                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="count" name="Properties" fill="#51faaa" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>

            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Properties by Type</h3>
                <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.topTypesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="count"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {stats.topTypesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                             contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced loading with skeleton cards */}
          <div className="space-y-8">
            {/* Header skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent -skew-x-12"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent -skew-x-12"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                />
              </div>
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-elevation-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    </div>
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Property cards skeleton */}
            <div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Enhanced skeleton loading */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-2xl h-96 overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-gray-600/40 to-transparent -skew-x-12"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: i * 0.2
                        }}
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="fixed bottom-8 right-8 bg-white dark:bg-gray-800 p-4 rounded-full shadow-elevation-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <SimpleSpinner size="sm" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Loading dashboard...
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Google-Level Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome back, {currentUser?.name || 'User'}!
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Here's what's happening with your property search
          </motion.p>
        </motion.div>

        {/* Google-Level Navigation Tabs */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-wrap gap-3">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 overflow-hidden ${activeSection === section.id
                  ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-primary'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-elevation-1 hover:shadow-elevation-2'
                  }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
              >
                {/* Shimmer effect for active tab */}
                {activeSection === section.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "linear"
                    }}
                  />
                )}

                <motion.div
                  animate={{
                    rotate: activeSection === section.id ? 360 : 0,
                    scale: activeSection === section.id ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <section.icon className="w-5 h-5 relative z-10" />
                </motion.div>
                <span className="relative z-10">{section.label}</span>

                {/* Active indicator */}
                {activeSection === section.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <div className="mb-8">
          {renderSection()}
        </div>
      </div>
    </motion.div>
  );
};

export default UserDashboard;
