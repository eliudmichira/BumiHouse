import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Phone, 
  Lock, 
  CreditCard, 
  Shield,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Zap,
  Clock,
  Users,
  HeartHandshake,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

const TenantLogin = () => {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({
    phone: '',
    apartment: '',
    pin: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Get tenant data from localStorage (added by landlord/agent)
    setTimeout(() => {
      try {
        // Get trial ID from session to check trial tenants
        const trialSession = sessionStorage.getItem('trial_session');
        let tenants = [];
        
        if (trialSession) {
          const trialData = JSON.parse(trialSession);
          const trialId = trialData.trialId;
          tenants = JSON.parse(localStorage.getItem(`trial_tenants_${trialId}`) || '[]');
        } else {
          // Also check for demo tenants from Tenant Management
          tenants = JSON.parse(localStorage.getItem('demo_tenants') || '[]');
        }

        // Add default demo tenants if none exist
        if (tenants.length === 0) {
          tenants = [
            {
              id: 'tenant_1',
              name: 'John Doe',
              email: 'john.doe@email.com',
              phone: '+254701234567',
              propertyName: 'Sunset Apartments',
              unitNumber: 'A-101',
              monthlyRent: 25000,
              leaseStart: '2024-01-01',
              leaseEnd: '2024-12-31',
              status: 'active',
              balance: 0
            },
            {
              id: 'tenant_2',
              name: 'Jane Smith',
              email: 'jane.smith@email.com',
              phone: '+254707654321',
              propertyName: 'Sunset Apartments',
              unitNumber: 'B-205',
              monthlyRent: 25000,
              leaseStart: '2024-03-01',
              leaseEnd: '2025-02-28',
              status: 'active',
              balance: 25000
            },
            {
              id: 'tenant_3',
              name: 'Mike Johnson',
              email: 'mike.johnson@email.com',
              phone: '+254709876543',
              propertyName: 'Green Valley House',
              unitNumber: 'Main',
              monthlyRent: 80000,
              leaseStart: '2024-06-01',
              leaseEnd: '2025-05-31',
              status: 'active',
              balance: 0
            }
          ];
        }

        // Find tenant by phone number
        const tenant = tenants.find(t => t.phone === loginForm.phone);
        
        if (tenant) {
          // Extract unit number for PIN validation (e.g., "A-101" -> "101", "Main" -> "main")
          const extractedPin = tenant.unitNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const enteredPin = loginForm.pin.toLowerCase();
          
          // Check if apartment/property matches and PIN matches unit number
          const apartmentMatches = tenant.propertyName.toLowerCase().includes(loginForm.apartment.toLowerCase()) ||
                                 tenant.unitNumber.toLowerCase().includes(loginForm.apartment.toLowerCase());
          
          const pinMatches = extractedPin === enteredPin || 
                           tenant.unitNumber.toLowerCase() === enteredPin ||
                           tenant.unitNumber === loginForm.pin;

          if (apartmentMatches && pinMatches) {
            // Create tenant session
            const tenantSession = {
              tenantId: tenant.id,
              phone: tenant.phone,
              apartment: tenant.unitNumber,
              name: tenant.name,
              email: tenant.email,
              propertyName: tenant.propertyName,
              unitNumber: tenant.unitNumber,
              monthlyRent: tenant.monthlyRent,
              balance: tenant.balance || 0,
              leaseStart: tenant.leaseStart,
              leaseEnd: tenant.leaseEnd,
              status: tenant.status,
              loginTime: new Date().toISOString(),
              nextDueDate: '2025-02-01',
              paymentHistory: []
            };

            sessionStorage.setItem('tenant_session', JSON.stringify(tenantSession));
            navigate('/tenant-dashboard');
          } else {
            alert('Invalid credentials. Please check your apartment/property name and unit number (PIN).');
          }
        } else {
          alert('No tenant found with this phone number. Please contact your landlord.');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      }
      
      setIsLoading(false);
    }, 2000);
  };

  const features = [
    {
      icon: CreditCard,
      title: 'One-Click Rent Payment',
      description: 'Pay rent instantly with M-Pesa STK push - no app switching needed!'
    },
    {
      icon: Smartphone,
      title: 'Smart Reminders',
      description: 'Never miss rent again with intelligent SMS and WhatsApp reminders'
    },
    {
      icon: Shield,
      title: 'Secure & Instant',
      description: 'Bank-grade security with instant confirmation to you and your landlord'
    },
    {
      icon: CheckCircle,
      title: 'Auto-Pay Setup',
      description: 'Set up auto-payments and get discounts - cancel anytime!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#51faaa]/25">
                  <Home className="w-7 h-7 text-[#0a0c19]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] bg-clip-text text-transparent">
                    CRIBBY
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">Tenant Portal</p>
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => setShowFeatures(!showFeatures)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 hover:from-[#51faaa]/20 hover:to-[#dbd5a4]/20 rounded-2xl text-[#51faaa] font-semibold transition-all duration-300 border border-[#51faaa]/20"
            >
              Why CRIBBY?
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto lg:mx-0"
          >
            {/* Hero Text */}
            <div className="text-center lg:text-left mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 rounded-full border border-[#51faaa]/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-[#51faaa]" />
                <span className="text-sm font-semibold text-[#51faaa]">Welcome Home! 🏠</span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              >
                Access Your
                <span className="block bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] bg-clip-text text-transparent">
                  CRIBBY Portal
                </span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed"
              >
                Pay rent, track payments, and manage your home - all in one secure place
              </motion.p>
            </div>

            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-gray-900/5"
            >
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-[#51faaa] transition-colors duration-300" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={loginForm.phone}
                      onChange={handleInputChange}
                      placeholder="+254712345678"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#51faaa]/20 focus:border-[#51faaa] transition-all duration-300 bg-gray-50/50 hover:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Property/Building Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Home className="w-5 h-5 text-gray-400 group-focus-within:text-[#51faaa] transition-colors duration-300" />
                    </div>
                    <input
                      type="text"
                      name="apartment"
                      value={loginForm.apartment}
                      onChange={handleInputChange}
                      placeholder="e.g., Sunset Apartments, Green Valley"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#51faaa]/20 focus:border-[#51faaa] transition-all duration-300 bg-gray-50/50 hover:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Unit Number (PIN)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-[#51faaa] transition-colors duration-300" />
                    </div>
                    <input
                      type="password"
                      name="pin"
                      value={loginForm.pin}
                      onChange={handleInputChange}
                      placeholder="Your unit number (e.g., A-101, Main)"
                      maxLength="10"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#51faaa]/20 focus:border-[#51faaa] transition-all duration-300 bg-gray-50/50 hover:bg-white"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-5 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-bold rounded-2xl hover:shadow-xl hover:shadow-[#51faaa]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-[#0a0c19] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>🏠 Access My Crib</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
                <p className="text-sm text-gray-600 mb-4 font-medium">
                  New tenant? Contact your landlord to get access
                </p>
                
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Shield className="w-4 h-4 text-[#51faaa]" />
                  <span className="font-medium">Secured with bank-grade encryption</span>
                </div>
              </div>
            </motion.div>

            {/* Demo Access Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 rounded-2xl border border-[#51faaa]/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center shadow-lg shadow-[#51faaa]/25">
                  <Zap className="w-5 h-5 text-[#0a0c19]" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Demo Access</h4>
              </div>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/50 rounded-xl p-3">
                    <span className="text-gray-600 font-semibold text-xs">Phone:</span>
                    <p className="text-gray-900 font-mono font-bold">+254701234567</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3">
                    <span className="text-gray-600 font-semibold text-xs">Property:</span>
                    <p className="text-gray-900 font-mono font-bold">Sunset</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3">
                    <span className="text-gray-600 font-semibold text-xs">PIN:</span>
                    <p className="text-gray-900 font-mono font-bold">A-101</p>
                  </div>
                </div>
                <div className="text-center pt-4 border-t border-[#51faaa]/30">
                  <p className="text-xs text-gray-500 font-semibold mb-2">More demo accounts:</p>
                  <p className="text-xs text-gray-600 font-medium">Jane: +254707654321 | Sunset | B-205</p>
                  <p className="text-xs text-gray-600 font-medium">Mike: +254709876543 | Green Valley | Main</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-12"
          >
            {/* Header */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 rounded-full border border-[#51faaa]/20 mb-6"
              >
                <HeartHandshake className="w-4 h-4 text-[#51faaa]" />
                <span className="text-sm font-semibold text-[#51faaa]">Why Tenants Love CRIBBY 💚</span>
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
              >
                The Smartest Way to
                <span className="block bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] bg-clip-text text-transparent">
                  Manage Your Rent
                </span>
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-600 leading-relaxed"
              >
                Communicate with your landlord and track payments seamlessly
              </motion.p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 hover:border-[#51faaa]/40 hover:shadow-xl hover:shadow-[#51faaa]/10 transition-all duration-500 hover:-translate-y-2 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#51faaa]/25 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-[#0a0c19]" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-gray-900/5"
            >
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                    99.9%
                  </div>
                  <div className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-[#51faaa]" />
                    Uptime
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                    10k+
                  </div>
                  <div className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 text-[#51faaa]" />
                    Happy Tenants
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                    24/7
                  </div>
                  <div className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-[#51faaa]" />
                    Support
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TenantLogin;
