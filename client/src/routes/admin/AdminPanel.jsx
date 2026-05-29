import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  BarChart3,
  FileText,
  Settings,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Home,
  Star,
  AlertCircle,
  Calendar,
  DollarSign,
  Activity,
  Globe,
  Bell,
  Palette,
  Database,
  Menu,
  BookOpen
} from 'lucide-react';

// Admin Sections
import UserManagement from './sections/UserManagement';
import PropertyModeration from './sections/PropertyModeration';
import AnalyticsDashboard from './sections/AnalyticsDashboard';
import AgentVerification from './sections/AgentVerification';
import ContentManagement from './sections/ContentManagement';
import BlogManagement from './sections/BlogManagement';
import SettingsPanel from './sections/SettingsPanel';
import FloatingDashboardNav from '../../components/FloatingDashboardNav';

const AdminPanel = () => {
  const { currentUser, getUserRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ activeUsers: 0, properties: 0, pending: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get section from URL params or default to analytics
  const sectionFromUrl = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionFromUrl || 'analytics');

  // Update URL when section changes
  useEffect(() => {
    if (activeSection !== sectionFromUrl) {
      setSearchParams({ section: activeSection });
    }
  }, [activeSection, sectionFromUrl, setSearchParams]);

  // Load header stats (active users, properties, pending)
  useEffect(() => {
    const loadStats = async () => {
      // Prevent running queries if the role isn't definitively admin yet
      if (!currentUser || (getUserRole && getUserRole() !== 'admin')) {
        return;
      }

      try {
        // Define active as lastSeen within last 5 minutes OR explicit isOnline true
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentQuery = query(
          collection(db, 'users'),
          where('lastSeen', '>=', Timestamp.fromDate(fiveMinutesAgo))
        );
        const [recentSnap, allUsersSnap, propsSnap] = await Promise.all([
          getDocs(recentQuery),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'properties'))
        ]);

        const users = allUsersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const props = propsSnap.docs.map(d => d.data());
        const activeViaLastSeen = new Set(recentSnap.docs.map(d => d.id));
        const activeUsers = users.filter(u => {
          if (u.isOnline === true) return true;
          if (u.lastSeen?.toDate) {
            return u.lastSeen.toDate() >= fiveMinutesAgo;
          }
          if (typeof u.lastSeen === 'number') {
            return new Date(u.lastSeen) >= fiveMinutesAgo;
          }
          return false;
        }).length || activeViaLastSeen.size;
        const properties = props.length;
        const pending = props.filter(p => (p.status || 'pending') === 'pending').length;
        setStats({ activeUsers, properties, pending });
      } catch (_) {
        setStats({ activeUsers: 0, properties: 0, pending: 0 });
      }
    };
    loadStats();
  }, [currentUser, getUserRole]);

  // Debug admin access
  const userRole = getUserRole ? getUserRole() : 'user';
  // Check if user is admin
  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/desktop/login" replace />;
  }

  const sections = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Site usage statistics and insights'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage users, roles, and permissions'
    },
    {
      id: 'moderation',
      label: 'Property Moderation',
      icon: Shield,
      description: 'Approve, reject, and manage listings'
    },
    {
      id: 'verification',
      label: 'Agent Verification',
      icon: UserCheck,
      description: 'Review and verify agent requests'
    },
    {
      id: 'content',
      label: 'Content Management',
      icon: FileText,
      description: 'Manage featured properties and content'
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: BookOpen,
      description: 'Create and edit blog articles'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Site configuration and preferences'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserManagement />;
      case 'moderation':
        return <PropertyModeration />;
      case 'verification':
        return <AgentVerification />;
      case 'content':
        return <ContentManagement />;
      case 'blog':
        return <BlogManagement />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 pt-20 transition-colors duration-300 overflow-y-auto relative">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-gray-800 p-6 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <section.icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{section.label}</div>
                    <div className="text-xs opacity-75">{section.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Fixed BumiHouse logo - visible on desktop */}
      <div className="hidden lg:block fixed top-6 left-6 z-50">
        <button
          onClick={() => navigate('/')}
          className="group relative flex items-center gap-3 px-3 py-2 rounded-full shadow-elevation-4 border transition-all duration-300 overflow-hidden bg-gradient-to-r from-white/95 to-gray-50/95 border-white/20 text-gray-900 backdrop-blur-xl dark:from-gray-800/95 dark:to-gray-900/95 dark:border-gray-700/50 dark:text-white"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#4fd69c] p-1">
              <img src="/logo.png" alt="BumiHouse" className="w-full h-full rounded-full object-cover" />
            </div>
          </div>
        </button>
      </div>

      {/* Floating Dashboard Navigation */}
      <FloatingDashboardNav variant="admin" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Mobile-visible Logo */}
              <div className="lg:hidden w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#4fd69c] p-1">
                <img src="/logo.png" alt="BumiHouse" className="w-full h-full rounded-full object-cover" />
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Admin Panel
                </h1>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                  Manage your real estate platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto pb-2 lg:pb-0">
              {/* Quick Stats - Responsive */}
              <div className="flex items-center gap-4 lg:gap-6 min-w-max">
                <div className="text-center px-2 lg:px-0">
                  <div className="text-xl lg:text-2xl font-bold text-green-600">{stats.activeUsers.toLocaleString()}</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Active</div>
                </div>
                <div className="text-center px-2 lg:px-0">
                  <div className="text-xl lg:text-2xl font-bold text-blue-600">{stats.properties.toLocaleString()}</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Properties</div>
                </div>
                <div className="text-center px-2 lg:px-0">
                  <div className="text-xl lg:text-2xl font-bold text-purple-600">{stats.pending.toLocaleString()}</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Navigation */}
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeSection === section.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs opacity-75">{section.description}</div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveSection('content')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Featured Property
                  </button>
                  <button
                    onClick={() => setActiveSection('blog')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <BookOpen className="w-4 h-4" />
                    Manage blog
                  </button>
                  <button
                    onClick={() => setActiveSection('analytics')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <AlertCircle className="w-4 h-4" />
                    View Reports
                  </button>
                  <button
                    onClick={() => setActiveSection('settings')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Bell className="w-4 h-4" />
                    Manage Notifications
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="lg:bg-white lg:dark:bg-gray-800 lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:p-6 overflow-hidden">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 
