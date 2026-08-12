import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mpesaAPI } from '../../lib/mpesaAPI';
import {
  Home,
  CreditCard,
  Bell,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Phone,
  Settings,
  History,
  Star,
  Award,
  TrendingUp,
  Smartphone,
  Zap,
  Shield,
  Gift,
  Target,
  Users,
  ArrowRight,
  Plus,
  LogOut,
  RefreshCw
} from 'lucide-react';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [tenantData, setTenantData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMpesaPrompt, setShowMpesaPrompt] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [cribbyScore, setCribbyScore] = useState(850);
  const [streak, setStreak] = useState(6);

  // Quick Actions state
  const [showAutoPay, setShowAutoPay] = useState(false);
  const [autoPay, setAutoPay] = useState({ enabled: false, day: 1, method: 'M-Pesa' });
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [maintenance, setMaintenance] = useState({ category: 'General', description: '' });

  // Smooth in-page navigation
  const handleNavigate = (targetId) => {
    try {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (_) { }
  };

  // Quick Actions handlers
  const handleSaveAutoPay = () => {
    const updated = { ...autoPay, enabled: true };
    setAutoPay(updated);
    // persist in session
    const ses = sessionStorage.getItem('tenant_session');
    if (ses) {
      const obj = JSON.parse(ses);
      const next = { ...obj, autoPay: updated };
      sessionStorage.setItem('tenant_session', JSON.stringify(next));
    }
    setNotifications(prev => [{
      id: Date.now(),
      type: 'info',
      title: 'Auto-Pay Enabled',
      message: `Auto-pay scheduled on day ${updated.day} via ${updated.method}`,
      time: 'Just now',
      urgent: false
    }, ...prev].slice(0, 5));
    setShowAutoPay(false);
  };

  const handleSubmitMaintenance = () => {
    // Save to local (mock)
    const ticketId = 'MT' + Math.floor(Math.random() * 100000);
    localStorage.setItem(ticketId, JSON.stringify({ ...maintenance, createdAt: new Date().toISOString() }));
    setNotifications(prev => [{
      id: Date.now(),
      type: 'maintenance',
      title: 'Maintenance Request Submitted',
      message: `${maintenance.category}: ${maintenance.description.slice(0, 60)}...`,
      time: 'Just now',
      urgent: false
    }, ...prev].slice(0, 5));
    setShowMaintenance(false);
    setMaintenance({ category: 'General', description: '' });
  };

  const handleDownloadReceipts = () => {
    const history = (tenantData?.paymentHistory || []).slice(0, 10);
    if (history.length === 0) {
      alert('No receipts available yet.');
      return;
    }
    const lines = [
      `BumiHouse Rent Receipts for ${tenantData.name} (${tenantData.propertyName} - ${tenantData.unitNumber})`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Amount | Date | Method | Reference'
    ].concat(history.map(p => `${p.amount} | ${new Date(p.date).toLocaleDateString()} | ${p.method} | ${p.reference || p.id}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipts.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const tenantSession = sessionStorage.getItem('tenant_session');
    if (!tenantSession) {
      navigate('/tenant-login');
      return;
    }

    const data = JSON.parse(tenantSession);

    // Inject mock data for a richer demo if missing
    const hasHistory = Array.isArray(data.paymentHistory) && data.paymentHistory.length > 0;
    const mockHistory = [
      {
        id: 'MP123ABC',
        amount: data.monthlyRent || 25000,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
        method: 'M-Pesa',
        reference: 'MP123ABC',
        status: 'completed'
      },
      {
        id: 'MP456DEF',
        amount: data.monthlyRent || 25000,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 65).toISOString(),
        method: 'M-Pesa',
        reference: 'MP456DEF',
        status: 'completed'
      }
    ];

    const hydrated = {
      ...data,
      name: data.name || 'John Doe',
      propertyName: data.propertyName || 'Sunset Apartments',
      unitNumber: data.unitNumber || 'A-101',
      monthlyRent: data.monthlyRent || 25000,
      status: data.status || 'active',
      nextDueDate: data.nextDueDate || '2025-02-01',
      balance: typeof data.balance === 'number' ? data.balance : 25000,
      paymentHistory: hasHistory ? data.paymentHistory : mockHistory
    };

    setTenantData(hydrated);

    // Load notifications
    setNotifications([
      {
        id: 1,
        type: 'reminder',
        title: 'Rent Due Soon',
        message: 'Your rent is due in 5 days',
        time: '2 hours ago',
        urgent: true
      },
      {
        id: 2,
        type: 'maintenance',
        title: 'Maintenance Complete',
        message: 'AC repair has been completed',
        time: '1 day ago',
        urgent: false
      }
    ]);
  }, [navigate]);

  const handlePayRent = () => {
    setShowPaymentModal(true);
  };

  const initiateMpesaPayment = async () => {
    setShowPaymentModal(false);
    setShowMpesaPrompt(true);
    setPaymentProcessing(true);

    try {
      // Validate phone number
      const isValidPhone = mpesaAPI.validatePhone(tenantData.phone);
      if (!isValidPhone) {
        throw new Error('Invalid phone number format');
      }

      // Prepare payment data
      const paymentData = {
        phoneNumber: mpesaAPI.formatPhone(tenantData.phone),
        amount: tenantData.monthlyRent,
        accountReference: mpesaAPI.generateReference(tenantData.tenantId, tenantData.propertyId),
        transactionDesc: `Rent payment for ${tenantData.propertyName} ${tenantData.unitNumber}`,
        tenantId: tenantData.tenantId,
        propertyId: tenantData.propertyId || 'demo_property'
      };

      console.log('💳 Initiating M-Pesa payment:', paymentData);

      // Use simulation for demo, real M-Pesa for production
      const isDemo = tenantData.tenantId.includes('demo') || tenantData.phone === '+254712345678';

      let response;
      if (isDemo) {
        // Demo mode - simulate STK push
        response = await mpesaAPI.simulate(paymentData);
      } else {
        // Production mode - real M-Pesa API
        response = await mpesaAPI.initiate(paymentData);
      }

      if (response.success) {
        const checkoutRequestId = response.data.checkoutRequestId;
        console.log('✅ STK Push sent:', checkoutRequestId);

        // Wait for payment completion (simulate or query real status)
        setTimeout(async () => {
          let completionResponse;

          if (isDemo) {
            completionResponse = await mpesaAPI.simulateCompletion(checkoutRequestId);
          } else {
            // Poll for payment status
            completionResponse = await pollPaymentStatus(checkoutRequestId);
          }

          setPaymentProcessing(false);

          if (completionResponse.success && completionResponse.data.status === 'completed') {
            setPaymentSuccess(true);

            const receiptNumber = completionResponse.data.mpesaReceiptNumber || ('MP' + Date.now());

            // Update tenant session with payment
            const paymentRecord = {
              id: receiptNumber,
              amount: tenantData.monthlyRent,
              date: new Date().toISOString(),
              method: 'M-Pesa',
              reference: receiptNumber,
              status: 'completed',
              checkoutRequestId
            };

            const updatedData = {
              ...tenantData,
              balance: Math.max(0, tenantData.balance - tenantData.monthlyRent),
              lastPayment: new Date().toISOString(),
              paymentHistory: [...tenantData.paymentHistory, paymentRecord]
            };

            setTenantData(updatedData);
            sessionStorage.setItem('tenant_session', JSON.stringify(updatedData));

            // Update streak and score
            setStreak(prev => prev + 1);
            setCribbyScore(prev => prev + 25);

            // Store payment in localStorage for demo
            const trialId = tenantData.tenantId;
            const existingPayments = JSON.parse(localStorage.getItem(`trial_payments_${trialId}`) || '[]');
            existingPayments.push({
              ...paymentRecord,
              tenantName: tenantData.name,
              propertyName: `${tenantData.propertyName} - ${tenantData.unitNumber}`
            });
            localStorage.setItem(`trial_payments_${trialId}`, JSON.stringify(existingPayments));

            setTimeout(() => {
              setShowMpesaPrompt(false);
              setPaymentSuccess(false);
            }, 3000);
          } else {
            // Payment failed
            setPaymentSuccess(false);
            alert('Payment failed. Please try again.');
            setTimeout(() => {
              setShowMpesaPrompt(false);
            }, 1000);
          }
        }, isDemo ? 3000 : 5000);

      } else {
        throw new Error(response.error || 'Failed to initiate payment');
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      setPaymentProcessing(false);
      setPaymentSuccess(false);
      alert(`Payment failed: ${error.message}`);
      setTimeout(() => {
        setShowMpesaPrompt(false);
      }, 1000);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId, maxAttempts = 10) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const statusResponse = await mpesaAPI.query(checkoutRequestId);

        if (statusResponse.success) {
          const status = statusResponse.data.status;

          if (status === 'completed' || status === 'failed') {
            return statusResponse;
          }
        }

        // Wait before next attempt
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Payment status check attempt ${attempt} failed:`, error);
      }
    }

    // If we get here, payment status is still pending or unknown
    return { success: false, error: 'Payment status check timeout' };
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tenant_session');
    navigate('/tenant-login');
  };

  if (!tenantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  const isRentDue = () => {
    const dueDate = new Date(tenantData.nextDueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { diffDays, dueDate };
  };

  const { diffDays, dueDate } = isRentDue();
  const rentStatus = diffDays <= 0 ? 'overdue' : diffDays <= 5 ? 'due-soon' : 'current';

  const getRentStatusColor = () => {
    switch (rentStatus) {
      case 'overdue': return 'bg-red-500';
      case 'due-soon': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRentStatusMessage = () => {
    if (diffDays <= 0) return '🚨 RENT OVERDUE';
    if (diffDays <= 5) return `⏰ DUE IN ${diffDays} DAYS`;
    return '✅ PAID UP TO DATE';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar + Main Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-shrink-0">
          <div className="sticky top-6 h-[calc(100vh-3rem)] p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-xl space-y-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-[#0a0c19]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">BumiHouse</p>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tenant Portal</h2>
              </div>
            </div>

            {/* User snapshot */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{tenantData.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{tenantData.propertyName} • {tenantData.unitNumber}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-[#51faaa]/20 text-[#0a0c19] border border-[#51faaa]/30">{tenantData.status || 'Active'}</span>
            </div>

            {/* Nav */}
            <nav className="space-y-2">
              <button onClick={() => handleNavigate('overview')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium flex items-center gap-3">
                <TrendingUp className="w-4 h-4" /> Dashboard Overview
              </button>
              <button onClick={() => handleNavigate('payments')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium flex items-center gap-3">
                <DollarSign className="w-4 h-4" /> Payments
              </button>
              <button onClick={() => handleNavigate('maintenance')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium flex items-center gap-3">
                <Settings className="w-4 h-4" /> Maintenance
              </button>
              <button onClick={() => handleNavigate('receipts')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium flex items-center gap-3">
                <History className="w-4 h-4" /> Receipts
              </button>
              <button onClick={() => handleNavigate('support')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium flex items-center gap-3">
                <Users className="w-4 h-4" /> Support
              </button>
            </nav>

            <div className="mt-auto">
              <button onClick={handleLogout} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Dashboard Overview Section */}
          <div id="overview" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Dashboard Overview</h2>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Manage your rent, track payments, and stay on top of your home</p>
              </div>
              <div className="hidden lg:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#51faaa]">{cribbyScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">BumiHouse Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#dbd5a4]">{streak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Month Streak</div>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-3xl bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/20 hover:shadow-2xl hover:shadow-[#51faaa]/10 transition-all duration-500 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 dark:from-[#51faaa]/30 dark:to-[#dbd5a4]/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-7 h-7 text-[#51faaa]" />
                  </div>
                  <div className={`w-4 h-4 rounded-full ${rentStatus === 'overdue' ? 'bg-red-500' :
                    rentStatus === 'due-soon' ? 'bg-yellow-500' :
                      'bg-[#51faaa]'
                    } shadow-lg`}></div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  KSh {tenantData.monthlyRent.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">Monthly Rent</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-3xl bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/20 hover:shadow-2xl hover:shadow-[#51faaa]/10 transition-all duration-500 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 dark:from-[#51faaa]/30 dark:to-[#dbd5a4]/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-7 h-7 text-[#51faaa]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  {dueDate.toLocaleDateString('en-US', { day: 'numeric' })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
                  {dueDate.toLocaleDateString('en-US', { month: 'long' })} Due Date
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-3xl bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/20 hover:shadow-2xl hover:shadow-[#51faaa]/10 transition-all duration-500 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 dark:from-[#51faaa]/30 dark:to-[#dbd5a4]/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-7 h-7 text-[#51faaa]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{cribbyScore}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">BumiHouse Score</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-3xl bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/20 hover:shadow-2xl hover:shadow-[#51faaa]/10 transition-all duration-500 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 dark:from-[#51faaa]/30 dark:to-[#dbd5a4]/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-7 h-7 text-[#51faaa]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{streak}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">Month Streak</p>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Rent Payment Card */}
              <motion.div id="payments"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-8 rounded-3xl bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/20 hover:shadow-2xl hover:shadow-[#51faaa]/10 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                      💰 Rent Payment
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">
                      {dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`px-6 py-3 rounded-full text-sm font-bold ${rentStatus === 'overdue' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-2 border-red-200 dark:border-red-800' :
                    rentStatus === 'due-soon' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-200 dark:border-yellow-800' :
                      'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-800'
                    } transition-colors duration-300`}>
                    {getRentStatusMessage()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 transition-colors duration-300">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-300">Amount Due</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                      KSh {tenantData.monthlyRent.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 transition-colors duration-300">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-300">Due Date</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                      {dueDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Pay Rent Button */}
                <motion.button
                  onClick={handlePayRent}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-6 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-bold text-xl rounded-2xl hover:shadow-xl hover:shadow-[#51faaa]/25 transition-all duration-300 flex items-center justify-center gap-4 group"
                >
                  <Zap className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
                  <span>🔥 PAY RENT NOW</span>
                  <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </motion.div>

              {/* Payment History */}
              <motion.div id="receipts"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-[#51faaa]/10 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold text-gray-900">
                    📊 Payment History
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                    <History className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {tenantData.paymentHistory.length} payments
                    </span>
                  </div>
                </div>

                {tenantData.paymentHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <History className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">No payments yet</h4>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Your payment history will appear here once you make your first rent payment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tenantData.paymentHistory.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 border border-[#51faaa]/30 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="w-7 h-7 text-[#51faaa]" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">
                              KSh {payment.amount.toLocaleString()}
                            </p>
                            <p className="text-gray-600">
                              {new Date(payment.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} • {payment.method}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 text-[#51faaa] font-semibold rounded-xl border border-[#51faaa]/30">
                            ✅ Paid
                          </span>
                          <p className="text-sm text-gray-500 mt-1">#{payment.reference || payment.id}</p>
                        </div>
                      </div>
                    ))}

                    {tenantData.paymentHistory.length > 5 && (
                      <div className="text-center pt-6">
                        <button className="px-6 py-3 text-[#51faaa] font-medium hover:bg-gray-50 rounded-xl transition-colors">
                          View All Payments ({tenantData.paymentHistory.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-8">
              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-[#51faaa]/10 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Bell className="w-6 h-6 mr-3 text-[#51faaa]" />
                    Notifications
                  </h3>
                  <span className="px-3 py-1 bg-[#51faaa] text-gray-900 text-sm font-bold rounded-full">
                    {notifications.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {notifications.slice(0, 2).map((notification) => (
                    <div key={notification.id} className="p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${notification.urgent
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 border border-[#51faaa]/30'
                          }`}>
                          {notification.urgent ? (
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                          ) : (
                            <CheckCircle className="w-6 h-6 text-[#51faaa]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">
                            {notification.title}
                          </h4>
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-500 font-medium">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* BumiHouse Score card removed per request */}

              {/* Enhanced Quick Actions */}
              <motion.div id="maintenance"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-[#51faaa]/10 transition-all duration-500"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  ⚡ Quick Actions
                </h3>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAutoPay(true)}
                    className="w-full p-6 text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl transition-all duration-300 flex items-center space-x-4 border border-gray-200/50 hover:border-[#51faaa]/40 group shadow-sm hover:shadow-lg"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#51faaa]/25">
                      <RefreshCw className="w-8 h-8 text-[#0a0c19]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Set Up Auto-Pay</p>
                      <p className="text-gray-600 font-medium">Never miss a payment again</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMaintenance(true)}
                    className="w-full p-6 text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl transition-all duration-300 flex items-center space-x-4 border border-gray-200/50 hover:border-[#51faaa]/40 group shadow-sm hover:shadow-lg"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#51faaa]/25">
                      <Settings className="w-8 h-8 text-[#0a0c19]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Request Maintenance</p>
                      <p className="text-gray-600 font-medium">Report any issues quickly</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadReceipts}
                    className="w-full p-6 text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl transition-all duration-300 flex items-center space-x-4 border border-gray-200/50 hover:border-[#51faaa]/40 group shadow-sm hover:shadow-lg"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#51faaa]/25">
                      <History className="w-8 h-8 text-[#0a0c19]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Download Receipts</p>
                      <p className="text-gray-600 font-medium">Get payment confirmations</p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Support */}
              <motion.div
                id="support"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-gray-900/5"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">🧩 Support</h3>
                <p className="text-gray-600 mb-4">Need help with payments, maintenance, or your account?</p>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">Help Center</button>
                  <button className="flex-1 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-bold rounded-xl">Contact Support</button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Close main and container before modals */}
        </main>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                🔥 Pay Rent - KSh {tenantData.monthlyRent.toLocaleString()}
              </h2>

              <div className="space-y-4 mb-8">
                <button
                  onClick={initiateMpesaPayment}
                  className="w-full p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-100 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 border border-[#51faaa]/30 rounded-2xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-[#51faaa]" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-gray-900 text-lg">M-Pesa (Instant)</p>
                      <p className="text-gray-600">STK Push to {tenantData.phone}</p>
                    </div>
                    <div className="bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 text-[#51faaa] px-3 py-1 rounded-full text-sm font-medium border border-[#51faaa]/30">
                      Most Popular
                    </div>
                  </div>
                </button>

                <button className="w-full p-6 bg-gray-50 border border-gray-200 rounded-2xl opacity-50 cursor-not-allowed">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-500 text-lg">Bank Transfer</p>
                      <p className="text-gray-400">Coming Soon</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* M-Pesa STK Push Modal */}
      <AnimatePresence>
        {showMpesaPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-gray-100 shadow-xl"
            >
              {paymentProcessing ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 border border-[#51faaa]/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Smartphone className="w-10 h-10 text-[#51faaa] animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Check Your Phone! 📱
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    We've sent an M-Pesa payment request to<br />
                    <strong>{tenantData.phone}</strong>
                  </p>
                  <div className="flex items-center justify-center space-x-2 mb-8">
                    <div className="w-3 h-3 bg-[#51faaa] rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-[#51faaa] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-[#51faaa] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-gray-500 font-medium">
                    Enter your M-Pesa PIN to complete payment
                  </p>
                </>
              ) : paymentSuccess ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 border border-[#51faaa]/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10 text-[#51faaa]" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#51faaa] mb-4">
                    Payment Successful! 🎉
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    Your rent payment of <strong>KSh {tenantData.monthlyRent.toLocaleString()}</strong> has been processed successfully.
                  </p>
                  <div className="p-6 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 rounded-2xl border border-[#51faaa]/30 mb-4">
                    <div className="space-y-2 text-[#51faaa] font-medium">
                      <p>✅ Landlord notified</p>
                      <p>✅ Receipt sent via SMS</p>
                      <p>✅ +25 BumiHouse Score points</p>
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-Pay Modal */}
      <AnimatePresence>
        {showAutoPay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔄 Set Up Auto-Pay</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={autoPay.method}
                    onChange={(e) => setAutoPay(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]"
                  >
                    <option>M-Pesa</option>
                    <option>Bank</option>
                    <option>Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Day (1-28)</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={autoPay.day}
                    onChange={(e) => setAutoPay(prev => ({ ...prev, day: Number(e.target.value) }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAutoPay(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveAutoPay} className="flex-1 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-gray-900 font-bold rounded-xl">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Modal */}
      <AnimatePresence>
        {showMaintenance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🛠️ Request Maintenance</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={maintenance.category}
                    onChange={(e) => setMaintenance(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]"
                  >
                    <option>General</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Internet/WiFi</option>
                    <option>Security</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={maintenance.description}
                    onChange={(e) => setMaintenance(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder="Describe the issue..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51faaa]"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowMaintenance(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmitMaintenance} className="flex-1 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-gray-900 font-bold rounded-xl">Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantDashboard;

