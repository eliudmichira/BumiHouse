import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Plus, 
  Calendar, 
  User,
  ArrowLeft,
  CreditCard,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Edit3,
  Trash2,
  Users
} from 'lucide-react';

const PaymentRecording = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditPaymentForm, setShowEditPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    tenantId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    const trialSession = sessionStorage.getItem('trial_session');
    if (!trialSession) {
      navigate('/trial-login');
      return;
    }

    const trialId = JSON.parse(trialSession).trialId;
    
    // Load tenants
    const savedTenants = localStorage.getItem(`trial_tenants_${trialId}`);
    if (savedTenants) {
      setTenants(JSON.parse(savedTenants));
    }

    // Load payments
    const savedPayments = localStorage.getItem(`trial_payments_${trialId}`);
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      // Initialize with demo payments
      const demoPayments = [
        {
          id: '1',
          tenantId: '1',
          tenantName: 'John Doe',
          propertyName: 'Sunset Apartments - A-101',
          amount: 25000,
          paymentDate: '2024-09-01',
          paymentMethod: 'bank_transfer',
          reference: 'TXN123456',
          notes: 'September rent payment',
          createdAt: '2024-09-01T10:00:00Z'
        },
        {
          id: '2',
          tenantId: '3',
          tenantName: 'Mike Johnson',
          propertyName: 'Green Valley House - Main',
          amount: 80000,
          paymentDate: '2024-08-30',
          paymentMethod: 'mobile_money',
          reference: 'MPESA-ABC123',
          notes: 'August rent payment - paid early',
          createdAt: '2024-08-30T14:30:00Z'
        }
      ];
      setPayments(demoPayments);
      localStorage.setItem(`trial_payments_${trialId}`, JSON.stringify(demoPayments));
    }
  }, [navigate]);

  // Calculate tenant balances based on payments
  const calculateTenantBalance = (tenant) => {
    const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
    const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate months since lease start
    const leaseStart = new Date(tenant.leaseStart);
    const now = new Date();
    const monthsDiff = Math.max(0, Math.floor((now - leaseStart) / (1000 * 60 * 60 * 24 * 30)));
    const totalOwed = monthsDiff * tenant.monthlyRent;
    
    return Math.max(0, totalOwed - totalPaid);
  };

  // Get tenant payment status
  const getTenantStatus = (tenant) => {
    const balance = calculateTenantBalance(tenant);
    const lastPayment = payments
      .filter(p => p.tenantId === tenant.id)
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0];
    
    if (balance === 0) return 'current';
    if (balance > 0 && balance <= tenant.monthlyRent) return 'due';
    return 'overdue';
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const trialSession = JSON.parse(sessionStorage.getItem('trial_session'));
    const trialId = trialSession.trialId;
    
    const tenant = tenants.find(t => t.id === paymentForm.tenantId);
    
    const newPayment = {
      id: Date.now().toString(),
      tenantId: paymentForm.tenantId,
      tenantName: tenant.name,
      propertyName: `${tenant.propertyName} - ${tenant.unitNumber}`,
      amount: parseFloat(paymentForm.amount),
      paymentDate: paymentForm.paymentDate,
      paymentMethod: paymentForm.paymentMethod,
      reference: paymentForm.reference,
      notes: paymentForm.notes,
      createdAt: new Date().toISOString()
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    localStorage.setItem(`trial_payments_${trialId}`, JSON.stringify(updatedPayments));

    // Update tenant's last payment date and balance
    const updatedTenants = tenants.map(t => {
      if (t.id === paymentForm.tenantId) {
        return {
          ...t,
          lastPayment: paymentForm.paymentDate,
          balance: calculateTenantBalance(t) - parseFloat(paymentForm.amount)
        };
      }
      return t;
    });
    setTenants(updatedTenants);
    localStorage.setItem(`trial_tenants_${trialId}`, JSON.stringify(updatedTenants));

    // Reset form
    setPaymentForm({
      tenantId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      reference: '',
      notes: ''
    });
    setShowPaymentForm(false);
    setSelectedTenant(null);
  };

  const handleQuickPayment = (tenant) => {
    setSelectedTenant(tenant);
    setPaymentForm({
      ...paymentForm,
      tenantId: tenant.id,
      amount: tenant.monthlyRent.toString()
    });
    setShowPaymentForm(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      tenantId: payment.tenantId,
      amount: payment.amount.toString(),
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      reference: payment.reference,
      notes: payment.notes
    });
    setShowEditPaymentForm(true);
  };

  const handleUpdatePayment = (e) => {
    e.preventDefault();
    const trialSession = JSON.parse(sessionStorage.getItem('trial_session'));
    const trialId = trialSession.trialId;
    
    const tenant = tenants.find(t => t.id === paymentForm.tenantId);
    
    const updatedPayment = {
      ...editingPayment,
      tenantId: paymentForm.tenantId,
      tenantName: tenant.name,
      propertyName: `${tenant.propertyName} - ${tenant.unitNumber}`,
      amount: parseFloat(paymentForm.amount),
      paymentDate: paymentForm.paymentDate,
      paymentMethod: paymentForm.paymentMethod,
      reference: paymentForm.reference,
      notes: paymentForm.notes,
      updatedAt: new Date().toISOString()
    };

    const updatedPayments = payments.map(p => 
      p.id === editingPayment.id ? updatedPayment : p
    );
    setPayments(updatedPayments);
    localStorage.setItem(`trial_payments_${trialId}`, JSON.stringify(updatedPayments));

    // Reset form
    setPaymentForm({
      tenantId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      reference: '',
      notes: ''
    });
    setShowEditPaymentForm(false);
    setEditingPayment(null);
  };

  const handleDeletePayment = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      const trialSession = JSON.parse(sessionStorage.getItem('trial_session'));
      const trialId = trialSession.trialId;
      
      const updatedPayments = payments.filter(p => p.id !== paymentId);
      setPayments(updatedPayments);
      localStorage.setItem(`trial_payments_${trialId}`, JSON.stringify(updatedPayments));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'due': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'current': return <CheckCircle className="w-4 h-4" />;
      case 'due': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Calculate dashboard stats
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = tenants.reduce((sum, t) => sum + calculateTenantBalance(t), 0);
  const currentTenants = tenants.filter(t => getTenantStatus(t) === 'current').length;
  const overdueTenants = tenants.filter(t => getTenantStatus(t) === 'overdue').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/trial-dashboard')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#111]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Payment Recording
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Record and track tenant payments
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => setShowPaymentForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Collected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {totalCollected.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {totalOutstanding.toLocaleString()}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Tenants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentTenants}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Tenants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overdueTenants}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </motion.div>
        </div>

        {/* Tenant Payment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/20 overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tenant Payment Status</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tenants.map((tenant) => {
                  const balance = calculateTenantBalance(tenant);
                  const status = getTenantStatus(tenant);
                  
                  return (
                    <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-[#111]" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {tenant.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {tenant.propertyName} - {tenant.unitNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          KSh {tenant.monthlyRent.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          KSh {balance.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="ml-1 capitalize">{status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {tenant.lastPayment ? new Date(tenant.lastPayment).toLocaleDateString() : 'No payments'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.button
                          onClick={() => handleQuickPayment(tenant)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-[#51faaa] text-white px-3 py-1 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                        >
                          Record Payment
                        </motion.button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
          </div>
          
          <div className="p-6">
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          KSh {payment.amount.toLocaleString()} from {payment.tenantName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.propertyName} • {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                        {payment.notes && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Note: {payment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.reference}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit Payment"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete Payment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Payment Recording Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Record Payment</h2>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tenant
                  </label>
                  <select
                    value={paymentForm.tenantId}
                    onChange={(e) => setPaymentForm({...paymentForm, tenantId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {tenant.propertyName} {tenant.unitNumber}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money (M-Pesa)</option>
                    <option value="check">Check</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                  placeholder="Transaction ID, Check number, etc."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes about this payment"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedTenant(null);
                    setPaymentForm({
                      tenantId: '',
                      amount: '',
                      paymentDate: new Date().toISOString().split('T')[0],
                      paymentMethod: 'cash',
                      reference: '',
                      notes: ''
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditPaymentForm && editingPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Payment</h2>
            
            <form onSubmit={handleUpdatePayment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tenant
                  </label>
                  <select
                    value={paymentForm.tenantId}
                    onChange={(e) => setPaymentForm({...paymentForm, tenantId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {tenant.propertyName} {tenant.unitNumber}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money (M-Pesa)</option>
                    <option value="check">Check</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                  placeholder="Transaction ID, Check number, etc."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes about this payment"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPaymentForm(false);
                    setEditingPayment(null);
                    setPaymentForm({
                      tenantId: '',
                      amount: '',
                      paymentDate: new Date().toISOString().split('T')[0],
                      paymentMethod: 'cash',
                      reference: '',
                      notes: ''
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Update Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PaymentRecording;
