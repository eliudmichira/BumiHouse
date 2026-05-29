import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  CreditCard,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

const RentCollection = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const trialSession = sessionStorage.getItem('trial_session');
    if (!trialSession) {
      navigate('/trial-login');
      return;
    }

    const trialId = JSON.parse(trialSession).trialId;
    
    // Load payments
    const savedPayments = localStorage.getItem(`trial_payments_${trialId}`);
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      // Demo payment data
      const demoPayments = [
      {
        id: '1',
        tenantName: 'John Doe',
        property: 'Sunset Apartments - A-101',
        amount: 25000,
        dueDate: '2024-09-01',
        paidDate: '2024-09-01',
        status: 'paid',
        method: 'bank_transfer'
      },
      {
        id: '2',
        tenantName: 'Jane Smith',
        property: 'Sunset Apartments - B-205',
        amount: 25000,
        dueDate: '2024-09-01',
        paidDate: null,
        status: 'overdue',
        method: null
      },
      {
        id: '3',
        tenantName: 'Mike Johnson',
        property: 'Green Valley House - Main',
        amount: 80000,
        dueDate: '2024-09-01',
        paidDate: '2024-08-30',
        status: 'paid',
        method: 'mobile_money'
      }
    ];
    setPayments(demoPayments);
    localStorage.setItem(`trial_payments_${trialId}`, JSON.stringify(demoPayments));
  }

  // Load tenants
  const savedTenants = localStorage.getItem(`trial_tenants_${trialId}`);
  if (savedTenants) {
    setTenants(JSON.parse(savedTenants));
  }
}, [navigate]);

  const totalExpected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCollected = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = totalExpected - totalCollected;
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                  Rent Collection
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track and manage rent payments
                </p>
              </div>
            </div>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Expected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {totalExpected.toLocaleString()}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Collected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {totalCollected.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {totalPending.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{collectionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Method
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-[#111]" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.tenantName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{payment.property}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        KSh {payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </div>
                      {payment.paidDate && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Paid: {new Date(payment.paidDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {payment.status === 'overdue' && <AlertCircle className="w-3 h-3 mr-1" />}
                        <span className="capitalize">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.method ? (
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <CreditCard className="w-4 h-4 mr-2" />
                          {payment.method.replace('_', ' ').toUpperCase()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RentCollection;
