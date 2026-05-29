import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import analyticsService from '../../../lib/analytics';
import { getTotalViews } from '../../../lib/propertyViews';
import { getTotalPageViews } from '../../../lib/pageViews';
import { DashboardLoader } from '../../../components/Preloader';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Home, 
  Eye, 
  Heart, 
  Search, 
  DollarSign,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: { totalUsers: 0, totalProperties: 0, totalViews: 0, totalFavorites: 0, userGrowth: 0, propertyGrowth: 0, viewGrowth: 0, favoriteGrowth: 0 },
    userStats: { newUsers: 0, activeUsers: 0, returningUsers: 0, userRetention: 0 },
    propertyStats: { totalListings: 0, activeListings: 0, pendingApproval: 0, featuredProperties: 0, averagePrice: 0, priceRange: { min: 0, max: 0 } },
    engagement: { pageViews: 0, uniqueVisitors: 0, averageSessionDuration: '—', bounceRate: 0, conversionRate: 0 },
    topProperties: [],
    recentActivity: []
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Track dashboard view
        analyticsService.trackCustomEvent('admin_dashboard_viewed', {
          section: 'analytics',
          time_range: timeRange
        });
        
        const [usersSnap, propsSnap, realTotalViews, totalPageViews] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'properties')),
          getTotalViews(),
          getTotalPageViews()
        ]);

        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const props = propsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const totalUsers = users.length;
        const totalProperties = props.length;
        const featuredProperties = props.filter(p => !!p.featured).length;
        const activeListings = props.filter(p => (p.status || 'pending') === 'approved').length;
        const pendingApproval = props.filter(p => (p.status || 'pending') === 'pending').length;

        const prices = props.map(p => p.price || 0);
        const averagePrice = prices.length ? Math.round(prices.reduce((a,b)=>a+b,0) / prices.length) : 0;
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;

        // Use real total views from database
        const totalViews = realTotalViews;
        const totalFavorites = props.reduce((sum, p) => sum + (p.favorites || 0), 0);

        const normalizeLoc = (rawLoc, data) => typeof rawLoc === 'string' ? rawLoc : (rawLoc && typeof rawLoc === 'object') ? [rawLoc.address, rawLoc.city, rawLoc.state].filter(Boolean).join(', ') : [data.city, data.state].filter(Boolean).join(', ');
        const topProperties = [...props]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map((p, idx) => ({
            id: p.id,
            title: p.title || (typeof p.address === 'string' ? p.address : (p.address?.address || `Property ${idx+1}`)),
            views: p.views || 0,
            favorites: p.favorites || 0,
            price: p.price || 0
          }));

        // Recent activity: latest users and properties by createdAt
        const toDate = (ts) => ts?.toDate ? ts.toDate() : (typeof ts === 'number' ? new Date(ts) : null);
        const recentUsers = users
          .map(u => ({ ...u, _t: toDate(u.createdAt) || new Date(0) }))
          .sort((a,b) => b._t - a._t)
          .slice(0, 3)
          .map(u => ({ type: 'user_registered', user: u.email || u.username || 'User', time: (u._t).toLocaleString() }));
        const recentProps = props
          .map(p => ({ ...p, _t: toDate(p.createdAt) || new Date(0) }))
          .sort((a,b) => b._t - a._t)
          .slice(0, 3)
          .map(p => ({ type: 'property_added', property: p.title || p.address || p.id, time: (p._t).toLocaleString() }));

        setAnalyticsData({
          overview: { totalUsers, totalProperties, totalViews, totalFavorites, userGrowth: 0, propertyGrowth: 0, viewGrowth: 0, favoriteGrowth: 0 },
          userStats: { newUsers: recentUsers.length, activeUsers: totalUsers, returningUsers: 0, userRetention: 0 },
          propertyStats: { totalListings: totalProperties, activeListings, pendingApproval, featuredProperties, averagePrice, priceRange: { min: minPrice, max: maxPrice } },
          engagement: { pageViews: totalPageViews, uniqueVisitors: totalUsers, averageSessionDuration: '—', bounceRate: 0, conversionRate: 0 },
          topProperties,
          recentActivity: [...recentUsers, ...recentProps]
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [timeRange]);

  const StatCard = ({ title, value, change, icon, color, trend = 'up' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' ? (
              <ArrowUp className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}%
            </span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'user_registered': return <Users className="w-4 h-4 text-blue-500" />;
        case 'property_added': return <Home className="w-4 h-4 text-green-500" />;
        case 'property_viewed': return <Eye className="w-4 h-4 text-purple-500" />;
        case 'user_logged_in': return <Activity className="w-4 h-4 text-orange-500" />;
        case 'property_favorited': return <Heart className="w-4 h-4 text-red-500" />;
        default: return <Activity className="w-4 h-4 text-gray-500" />;
      }
    };

    const getActivityText = (activity) => {
      switch (activity.type) {
        case 'user_registered': return `New user registered: ${activity.user}`;
        case 'property_added': return `New property added: ${activity.property}`;
        case 'property_viewed': return `Property viewed: ${activity.property}`;
        case 'user_logged_in': return `User logged in: ${activity.user}`;
        case 'property_favorited': return `Property favorited: ${activity.property}`;
        default: return 'Unknown activity';
      }
    };

    return (
      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
        {getActivityIcon(activity.type)}
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-white">{getActivityText(activity)}</p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor your platform's performance and user engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analyticsData.overview.totalUsers.toLocaleString()}
          change={analyticsData.overview.userGrowth}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100 dark:bg-blue-900/30"
          trend="up"
        />
        <StatCard
          title="Total Properties"
          value={analyticsData.overview.totalProperties.toLocaleString()}
          change={analyticsData.overview.propertyGrowth}
          icon={<Home className="w-6 h-6 text-green-600" />}
          color="bg-green-100 dark:bg-green-900/30"
          trend="up"
        />
        <StatCard
          title="Total Views"
          value={analyticsData.overview.totalViews.toLocaleString()}
          change={analyticsData.overview.viewGrowth}
          icon={<Eye className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100 dark:bg-purple-900/30"
          trend="up"
        />
        <StatCard
          title="Total Favorites"
          value={analyticsData.overview.totalFavorites.toLocaleString()}
          change={analyticsData.overview.favoriteGrowth}
          icon={<Heart className="w-6 h-6 text-red-600" />}
          color="bg-red-100 dark:bg-red-900/30"
          trend="up"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Users</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.userStats.newUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.userStats.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Returning Users</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.userStats.returningUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
              <span className="font-semibold text-green-600">{analyticsData.userStats.userRetention}%</span>
            </div>
          </div>
        </div>

        {/* Property Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Listings</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.propertyStats.totalListings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Listings</span>
              <span className="font-semibold text-green-600">{analyticsData.propertyStats.activeListings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pending Approval</span>
              <span className="font-semibold text-orange-600">{analyticsData.propertyStats.pendingApproval}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Featured Properties</span>
              <span className="font-semibold text-purple-600">{analyticsData.propertyStats.featuredProperties}</span>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Engagement</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Page Views</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.engagement.pageViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Unique Visitors</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.engagement.uniqueVisitors.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Session</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.engagement.averageSessionDuration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Bounce Rate</span>
              <span className="font-semibold text-red-600">{analyticsData.engagement.bounceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Properties and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Properties */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Properties</h3>
          <div className="space-y-3">
            {analyticsData.topProperties.map((property, index) => (
              <div key={property.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{property.title}</p>
                    <p className="text-sm text-gray-500">Ksh {property.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{property.views} views</p>
                  <p className="text-xs text-gray-500">{property.favorites} favorites</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {analyticsData.recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Analytics Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Analytics Active</span>
              </div>
              <span className="text-sm text-green-600 dark:text-green-400">Real-time tracking</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>• Page views are being tracked automatically</p>
              <p>• Property views are logged with details</p>
              <p>• Search queries are monitored</p>
              <p>• User interactions are recorded</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Tracked Events</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Page Views</span>
                  <span className="font-medium text-gray-900 dark:text-white">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Property Views</span>
                  <span className="font-medium text-gray-900 dark:text-white">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Search Events</span>
                  <span className="font-medium text-gray-900 dark:text-white">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User Actions</span>
                  <span className="font-medium text-gray-900 dark:text-white">✓ Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Charts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">User Growth Chart</p>
              <p className="text-xs text-gray-400">Powered by Firebase Analytics</p>
            </div>
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Property Views Trend</p>
              <p className="text-xs text-gray-400">Real-time data from analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 