import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  LogOut,
  ExternalLink,
  Sparkles,
  DollarSign,
  FileText,
  Users,
  Wrench,
  BarChart3,
  FolderOpen,
  Plus,
  TrendingUp
} from 'lucide-react';

const TrialDashboard = () => {
  const navigate = useNavigate();
  const [trialData, setTrialData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Get trial session data
    const trialSession = sessionStorage.getItem('trial_session');
    if (!trialSession) {
      navigate('/trial-login');
      return;
    }

    const sessionData = JSON.parse(trialSession);
    setTrialData(sessionData.userData);

    // Calculate time remaining
    const updateTimeRemaining = () => {
      if (sessionData.userData.trialExpiryDate) {
        let expiryDate;
        
        // Handle Firestore Timestamp objects
        if (sessionData.userData.trialExpiryDate.toDate) {
          expiryDate = sessionData.userData.trialExpiryDate.toDate();
        } 
        // Handle Firestore timestamp objects with seconds/nanoseconds
        else if (sessionData.userData.trialExpiryDate.seconds) {
          expiryDate = new Date(sessionData.userData.trialExpiryDate.seconds * 1000);
        }
        // Handle regular date strings/objects
        else {
          expiryDate = new Date(sessionData.userData.trialExpiryDate);
        }
        
        const now = new Date();
        const diff = expiryDate - now;

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTimeRemaining(`${days} days, ${hours} hours`);
        } else {
          setTimeRemaining('Expired');
        }
      } else {
        setTimeRemaining('30 days'); // Default for new trials
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('trial_session');
    navigate('/trial-login');
  };

  const handleUpgrade = () => {
    navigate('/desktop/register');
  };

  if (!trialData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#51faaa]"></div>
      </div>
    );
  }

  const features = [
    {
      title: 'Property Portfolio',
      description: 'Add and manage your rental properties',
      icon: Building2,
      available: true,
      action: () => navigate('/trial-dashboard/properties'),
      route: '/trial-dashboard/properties'
    },
    {
      title: 'Tenant Management',
      description: 'Track tenants, leases, and applications',
      icon: Users,
      available: true,
      action: () => navigate('/trial-dashboard/tenants'),
      route: '/trial-dashboard/tenants'
    },
    {
      title: 'Record Payments',
      description: 'Record and track tenant payments',
      icon: DollarSign,
      available: true,
      action: () => navigate('/trial-dashboard/payments'),
      route: '/trial-dashboard/payments',
      priority: true
    },
    {
      title: 'Rent Collection',
      description: 'View payment history and analytics',
      icon: TrendingUp,
      available: true,
      action: () => navigate('/trial-dashboard/rent-collection'),
      route: '/trial-dashboard/rent-collection'
    },
    {
      title: 'Maintenance Requests',
      description: 'Handle tenant maintenance requests',
      icon: Wrench,
      available: true,
      action: () => navigate('/trial-dashboard/maintenance'),
      route: '/trial-dashboard/maintenance'
    },
    {
      title: 'Financial Reports',
      description: 'Income, expenses, and profit analytics',
      icon: BarChart3,
      available: true,
      action: () => navigate('/trial-dashboard/reports'),
      route: '/trial-dashboard/reports'
    },
    {
      title: 'Document Storage',
      description: 'Store leases, contracts, and documents',
      icon: FolderOpen,
      available: true,
      action: () => navigate('/trial-dashboard/documents'),
      route: '/trial-dashboard/documents'
    }
  ];

  // Demo data for trial users
  const demoStats = [
    {
      title: 'Total Properties',
      value: '2',
      subtitle: 'Demo properties',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Revenue',
      value: 'KSh 45,000',
      subtitle: 'Demo income',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Tenants',
      value: '3',
      subtitle: 'Demo tenants',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Occupancy Rate',
      value: '75%',
      subtitle: 'Demo rate',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#111]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  RentaKenya Trial
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {trialData.fullName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {timeRemaining}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  remaining
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-2xl p-8 mb-8 text-[#111]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome to RentaKenya Rental Management! 🏠
              </h2>
              <p className="text-lg opacity-90">
                Full access trial! Manage properties, tenants, rent collection, and more for {timeRemaining}.
              </p>
            </div>
            <motion.button
              onClick={handleUpgrade}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Upgrade Now</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Demo Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {demoStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trial Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Trial Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{trialData.fullName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{trialData.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{trialData.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Business</p>
                  <p className="font-medium text-gray-900 dark:text-white">{trialData.businessType}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{trialData.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Trial ID</p>
                  <p className="font-medium text-gray-900 dark:text-white text-xs">{trialData.trialId}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Rental Management Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    feature.priority 
                      ? 'bg-gradient-to-br from-[#51faaa]/10 to-[#dbd5a4]/10 border-[#51faaa]/30 hover:border-[#51faaa] hover:shadow-xl' 
                      : 'bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/20 hover:border-[#51faaa] hover:shadow-lg'
                  }`}
                  onClick={feature.action}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        feature.priority 
                          ? 'bg-[#51faaa] text-white' 
                          : 'bg-[#51faaa]/10 text-[#51faaa]'
                      }`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${
                          feature.priority 
                            ? 'text-[#51faaa] dark:text-[#51faaa]' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {feature.title}
                          {feature.priority && <span className="ml-2 text-xs bg-[#51faaa] text-white px-2 py-1 rounded-full">New!</span>}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Enjoying your trial? Keep your data!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            When you upgrade to a full account, all your trial data (properties, tenants, payments) will be preserved.
          </p>
          <motion.button
            onClick={handleUpgrade}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Continue with Full Account
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default TrialDashboard;
