import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { accountDashboardAPI, propertiesAPI } from '../../lib/firebaseAPI';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  Home,
  MessageCircle,
  Settings,
  Plus,
  Eye,
  DollarSign,
  TrendingUp,
  Calendar,
  Search,
  Building2,
  Users as UsersIcon,
  MapPin,
  Star,
  Phone,
  Mail,
  Clock,
  Edit,
  Trash2,
  BarChart3,
  Activity,
  Loader2
} from 'lucide-react';
import { DashboardLoader } from '../../components/Preloader';

const AgentDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, isVerifiedAgent } = useAuth();
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [agentStats, setAgentStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalRevenue: 0,
    avgRating: 0,
    thisMonthRevenue: 0,
    conversionRate: 0
  });
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Mock data for charts
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      let monthIndex = currentMonth - i;
      if (monthIndex < 0) monthIndex += 12;
      data.push({
        name: months[monthIndex],
        views: Math.floor(Math.random() * 500) + 100,
        inquiries: Math.floor(Math.random() * 50) + 5,
      });
    }
    return data;
  };

  const chartData = useMemo(() => generateChartData(), []);

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

  // Load agent data from Firebase
  useEffect(() => {
    console.log('AgentDashboard: useEffect triggered, currentUser:', currentUser);

    const loadAgentData = async () => {
      console.log('AgentDashboard: loadAgentData called, currentUser:', currentUser);

      if (!currentUser?.id) {
        console.log('AgentDashboard: No currentUser.id, returning early');
        return;
      }

      console.log('AgentDashboard: Loading data for user:', currentUser.id);
      setIsLoading(true);
      try {
        // Parallelize data fetching to improve performance
        const [userProperties, agentInquiries, agentAnalytics] = await Promise.all([
          accountDashboardAPI.getUserProperties(currentUser.id).catch(err => {
            console.error('Error fetching properties:', err);
            return [];
          }),
          accountDashboardAPI.getAgentInquiries(currentUser.id).catch(err => {
            console.error('Error fetching inquiries:', err);
            return [];
          }),
          accountDashboardAPI.getAgentAnalytics(currentUser.id).catch(err => {
            console.error('Error fetching analytics:', err);
            return { totalViews: 0, totalInquiries: 0, totalRevenue: 0, averageRating: 0, conversionRate: 0 };
          }),
          accountDashboardAPI.getAgentBookings(currentUser.id).catch(err => {
            console.error('Error fetching bookings:', err);
            return [];
          })
        ]);

        console.log('AgentDashboard: Data loaded', {
          properties: userProperties.length,
          inquiries: agentInquiries.length
        });

        setProperties(userProperties);
        setInquiries(agentInquiries);
        setBookings(agentBookings || []);

        // Calculate this month's revenue (simplified calculation)
        const thisMonthRevenue = userProperties.reduce((sum, prop) => {
          const createdAt = prop.createdAt?.toDate?.() || new Date();
          const now = new Date();
          const isThisMonth = createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear();
          return isThisMonth ? sum + (prop.price || 0) : sum;
        }, 0);

        setAgentStats({
          totalProperties: userProperties.length,
          activeListings: userProperties.length,
          totalViews: agentAnalytics.totalViews || 0,
          totalInquiries: agentAnalytics.totalInquiries || 0,
          totalRevenue: agentAnalytics.totalRevenue || 0,
          avgRating: agentAnalytics.averageRating || 0,
          thisMonthRevenue: thisMonthRevenue,
          conversionRate: agentAnalytics.conversionRate || 0
        });
      } catch (error) {
        console.error('Error loading agent data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgentData();
  }, [currentUser]);

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'Dashboard summary and analytics'
    },
    {
      id: 'properties',
      label: 'My Properties',
      icon: Building2,
      description: 'Manage your listings'
    },
    {
      id: 'inquiries',
      label: 'Inquiries',
      icon: MessageCircle,
      description: 'Client messages and leads'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Performance metrics'
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      description: 'Viewing requests'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'properties':
        return <PropertiesSection />;
      case 'inquiries':
        return <InquiriesSection />;
      case 'analytics':
        return <AnalyticsSection />;
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
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{agentStats.activeListings}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{agentStats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{agentStats.totalInquiries}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">KES {agentStats.thisMonthRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/properties/add')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-[#111] hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add New Property</span>
          </button>

          <button
            onClick={() => setActiveSection('inquiries')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">View Inquiries</span>
          </button>

          <button
            onClick={() => setActiveSection('analytics')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Properties Section Component
  const PropertiesSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Properties</h2>
          <button
            onClick={() => navigate('/properties/add')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Properties Listed</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start listing your properties to reach potential clients
            </p>
            <button
              onClick={() => navigate('/properties/add')}
              className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Add Your First Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg mb-4 overflow-hidden">
                  {property.images && property.images[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{property.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{property.location?.address || 'Location not specified'}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#3b82f6]">KES {property.price?.toLocaleString() || '0'}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{property.bedrooms || 0} beds</span>
                    <span>•</span>
                    <span>{property.bathrooms || 0} baths</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/properties/add?edit=${property.id}`)}
                    className="flex-1 px-3 py-1 text-xs bg-[#3b82f6] text-[#111] rounded-lg font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="flex-1 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setPropertyToDelete(property)}
                    className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50"
                    title="Delete Property"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Property</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete &quot;{propertyToDelete.title}&quot;? This action cannot be undone.
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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Delete'}
              </button>
              <button
                onClick={() => setPropertyToDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Inquiries Section Component
  const InquiriesSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inquiries</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{inquiries.length} total inquiries</span>
        </div>

        {inquiries.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Inquiries Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Client inquiries from your property listings will appear here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Start listing properties to receive inquiries from potential clients
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {inquiry.client?.name || inquiry.clientName || 'Anonymous Client'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {inquiry.client?.email || inquiry.clientEmail || 'No email provided'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        inquiry.status === 'active' ? 'bg-green-100 text-green-800' :
                          inquiry.status === 'responded' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                      }`}>
                      {inquiry.status || 'new'}
                    </span>
                    {inquiry.source && (
                      <span className="text-xs text-gray-500">
                        Via {inquiry.source}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {inquiry.lastMessage || inquiry.message || 'No message provided'}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>Property: {inquiry.property?.title || inquiry.propertyTitle || 'Unknown Property'}</span>
                  <span>{inquiry.updatedAt?.toDate?.()?.toLocaleDateString() || inquiry.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      if (inquiry.conversationId) {
                        // Navigate to messages page with the conversation
                        navigate(`/messages?conversation=${inquiry.conversationId}`);
                      }
                    }}
                    className="flex-1 px-3 py-1 text-xs bg-[#3b82f6] text-[#111] rounded-lg font-medium hover:bg-[#3b82f6]/90 transition-colors"
                  >
                    {inquiry.conversationId ? 'View Chat' : 'Reply'}
                  </button>
                  <button className="flex-1 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium">
                    Mark Read
                  </button>
                </div>
              </div>
            ))}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Viewing Requests</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{bookings.length} total requests</span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Viewing requests from potential clients will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {booking.userName || 'Anonymous Client'}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{booking.viewingDate} at {booking.viewingTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Home className="w-3.5 h-3.5" />
                          <span>{booking.propertyTitle}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:self-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'pending'}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 text-xs bg-[#3b82f6] text-[#111] rounded-lg font-medium hover:opacity-90 transition-all">
                    Confirm Viewing
                  </button>
                  <button className="flex-1 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    Reschedule
                  </button>
                  <button className="px-3 py-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-all">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Analytics Section Component
  const AnalyticsSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
          <select className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border-none focus:ring-2 focus:ring-[#3b82f6]`}>
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp className="w-16 h-16" /></div>
            <p className="text-sm font-medium opacity-90 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold mb-2">KES {agentStats.totalRevenue.toLocaleString()}</p>
            <div className="flex items-center text-sm font-medium">
               <span className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" /> +12.5%
               </span>
               <span className="ml-2 opacity-80">vs last month</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><BarChart3 className="w-16 h-16" /></div>
            <p className="text-sm font-medium opacity-90 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold mb-2">{agentStats.conversionRate}%</p>
             <div className="flex items-center text-sm font-medium">
               <span className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" /> +2.1%
               </span>
               <span className="ml-2 opacity-80">vs last month</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><Star className="w-16 h-16" /></div>
            <p className="text-sm font-medium opacity-90 mb-1">Average Rating</p>
            <p className="text-3xl font-bold mb-2">{agentStats.avgRating}/5</p>
             <div className="flex items-center text-sm font-medium">
               <span className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                 <Star className="w-3 h-3 fill-current" /> 4.8
               </span>
               <span className="ml-2 opacity-80">recent reviews</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Views vs Inquiries</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: isDark ? '#f3f4f6' : '#111827', fontWeight: 500 }}
                            />
                            <Area type="monotone" dataKey="views" name="Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                            <Area type="monotone" dataKey="inquiries" name="Inquiries" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInquiries)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                 <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Lead Generation</h3>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12}} />
                            <Tooltip 
                                cursor={{fill: isDark ? '#374151' : '#f3f4f6'}}
                                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="inquiries" name="Leads" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        </div>

        {/* Performance Metrics */}
        <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Properties</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{agentStats.totalProperties}</p>
               </div>
               <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Listings</p>
                  <p className="text-xl font-bold text-[#3b82f6]">{agentStats.activeListings}</p>
               </div>
               <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Views</p>
                  <p className="text-xl font-bold text-[#10b981]">{agentStats.totalViews.toLocaleString()}</p>
               </div>
               <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Leads</p>
                  <p className="text-xl font-bold text-[#8b5cf6]">{agentStats.totalInquiries}</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DashboardLoader text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agent Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your properties and track your performance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeSection === section.id
                    ? 'bg-[#3b82f6] text-[#111] shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <section.icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
