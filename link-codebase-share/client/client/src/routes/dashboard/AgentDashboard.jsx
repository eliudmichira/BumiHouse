import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { accountDashboardAPI } from '../../lib/firebaseAPI';
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
        // Load agent's properties
        const userProperties = await accountDashboardAPI.getUserProperties(currentUser.id);
        console.log('AgentDashboard: Loaded properties:', userProperties.length);
        setProperties(userProperties);

        // Load agent's inquiries
        console.log('AgentDashboard: About to fetch inquiries for agent ID:', currentUser.id);
        const agentInquiries = await accountDashboardAPI.getAgentInquiries(currentUser.id);
        console.log('AgentDashboard: Loaded inquiries:', agentInquiries.length, agentInquiries);
        setInquiries(agentInquiries);

        // Load agent's analytics
        const agentAnalytics = await accountDashboardAPI.getAgentAnalytics(currentUser.id);
        
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
          activeListings: userProperties.length, // Assuming all are active for now
          totalViews: agentAnalytics.totalViews,
          totalInquiries: agentAnalytics.totalInquiries,
          totalRevenue: agentAnalytics.totalRevenue,
          avgRating: agentAnalytics.averageRating,
          thisMonthRevenue: thisMonthRevenue,
          conversionRate: agentAnalytics.conversionRate
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
      default:
        return <OverviewSection />;
    }
  };

  // Overview Section Component
  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[#111]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {currentUser?.name || 'Agent'}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your performance summary for today
            </p>
          </div>
        </div>
      </div>

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
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] hover:shadow-lg transition-all"
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
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
              className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
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
                  <span className="font-bold text-[#51faaa]">KES {property.price?.toLocaleString() || '0'}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{property.bedrooms || 0} beds</span>
                    <span>•</span>
                    <span>{property.bathrooms || 0} baths</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => navigate(`/properties/add?edit=${property.id}`)}
                    className="flex-1 px-3 py-1 text-xs bg-[#51faaa] text-[#111] rounded-lg font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="flex-1 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
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
                    className="flex-1 px-3 py-1 text-xs bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#51faaa]/90 transition-colors"
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

  // Analytics Section Component
  const AnalyticsSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-2xl font-bold">KES {agentStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Conversion Rate</p>
                <p className="text-2xl font-bold">{agentStats.conversionRate}%</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Average Rating</p>
                <p className="text-2xl font-bold">{agentStats.avgRating}/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Views</span>
                <span className="font-semibold text-[#51faaa]">{agentStats.totalViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Inquiries</span>
                <span className="font-semibold text-[#51faaa]">{agentStats.totalInquiries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Properties</span>
                <span className="font-semibold text-[#51faaa]">{agentStats.activeListings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">This Month Revenue</span>
                <span className="font-semibold text-[#51faaa]">KES {agentStats.thisMonthRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#51faaa] rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {agentStats.activeListings} properties listed
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {agentStats.totalInquiries} inquiries received
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {agentStats.conversionRate}% conversion rate
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {agentStats.avgRating}/5 average rating
                </span>
              </div>
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-[#51faaa] text-[#111] shadow-lg'
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
