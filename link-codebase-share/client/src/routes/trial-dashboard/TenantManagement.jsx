import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail,
  Calendar,
  ArrowLeft,
  User,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

const TenantManagement = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [viewingTenant, setViewingTenant] = useState(null);
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    unitNumber: '',
    monthlyRent: '',
    leaseStart: '',
    leaseEnd: '',
    securityDeposit: '',
    status: 'active'
  });

  useEffect(() => {
    const trialSession = sessionStorage.getItem('trial_session');
    if (!trialSession) {
      navigate('/trial-login');
      return;
    }

    const savedTenants = localStorage.getItem(`trial_tenants_${JSON.parse(trialSession).trialId}`);
    if (savedTenants) {
      setTenants(JSON.parse(savedTenants));
    } else {
      // Initialize with demo tenants
      const demoTenants = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+254701234567',
          propertyId: '1',
          propertyName: 'Sunset Apartments',
          unitNumber: 'A-101',
          monthlyRent: 25000,
          leaseStart: '2024-01-01',
          leaseEnd: '2024-12-31',
          securityDeposit: 50000,
          status: 'active',
          lastPayment: '2024-09-01',
          balance: 0
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+254707654321',
          propertyId: '1',
          propertyName: 'Sunset Apartments',
          unitNumber: 'B-205',
          monthlyRent: 25000,
          leaseStart: '2024-03-01',
          leaseEnd: '2025-02-28',
          securityDeposit: 50000,
          status: 'active',
          lastPayment: '2024-08-01',
          balance: 25000
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike.johnson@email.com',
          phone: '+254709876543',
          propertyId: '2',
          propertyName: 'Green Valley House',
          unitNumber: 'Main',
          monthlyRent: 80000,
          leaseStart: '2024-06-01',
          leaseEnd: '2025-05-31',
          securityDeposit: 160000,
          status: 'active',
          lastPayment: '2024-09-01',
          balance: 0
        }
      ];
      setTenants(demoTenants);
      localStorage.setItem(`trial_tenants_${JSON.parse(trialSession).trialId}`, JSON.stringify(demoTenants));
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTenant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTenant = (e) => {
    e.preventDefault();
    const trialSession = JSON.parse(sessionStorage.getItem('trial_session'));
    
    const tenant = {
      id: Date.now().toString(),
      ...newTenant,
      monthlyRent: parseFloat(newTenant.monthlyRent),
      securityDeposit: parseFloat(newTenant.securityDeposit),
      balance: 0,
      lastPayment: null,
      createdAt: new Date().toISOString()
    };

    const updatedTenants = [...tenants, tenant];
    setTenants(updatedTenants);
    localStorage.setItem(`trial_tenants_${trialSession.trialId}`, JSON.stringify(updatedTenants));
    
    setNewTenant({
      name: '',
      email: '',
      phone: '',
      propertyId: '',
      unitNumber: '',
      monthlyRent: '',
      leaseStart: '',
      leaseEnd: '',
      securityDeposit: '',
      status: 'active'
    });
    setShowAddForm(false);
  };

  const handleEditTenant = (tenant) => {
    setEditingTenant(tenant);
    setNewTenant(tenant);
    setShowEditForm(true);
  };

  const handleViewTenant = (tenant) => {
    setViewingTenant(tenant);
    setShowViewModal(true);
  };

  const handleUpdateTenant = (e) => {
    e.preventDefault();
    const trialSession = JSON.parse(sessionStorage.getItem('trial_session'));
    
    const updatedTenant = {
      ...newTenant,
      monthlyRent: parseFloat(newTenant.monthlyRent),
      securityDeposit: parseFloat(newTenant.securityDeposit),
    };

    const updatedTenants = tenants.map(t => 
      t.id === editingTenant.id ? updatedTenant : t
    );
    setTenants(updatedTenants);
    localStorage.setItem(`trial_tenants_${trialSession.trialId}`, JSON.stringify(updatedTenants));
    
    setNewTenant({
      name: '',
      email: '',
      phone: '',
      propertyId: '',
      unitNumber: '',
      monthlyRent: '',
      leaseStart: '',
      leaseEnd: '',
      securityDeposit: '',
      status: 'active'
    });
    setShowEditForm(false);
    setEditingTenant(null);
  };

  const handleDeleteTenant = (tenantId) => {
    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      const trialSession = JSON.parse(sessionStorage.getItem('trial_session'));
      const updatedTenants = tenants.filter(t => t.id !== tenantId);
      setTenants(updatedTenants);
      localStorage.setItem(`trial_tenants_${trialSession.trialId}`, JSON.stringify(updatedTenants));
    }
  };

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const totalBalance = tenants.reduce((sum, t) => sum + (t.balance || 0), 0);
  const totalRent = tenants.reduce((sum, t) => sum + t.monthlyRent, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'late': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
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
                <Users className="w-6 h-6 text-[#111]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tenant Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your tenants and leases
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => setShowAddForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tenant</span>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTenants}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Tenants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeTenants}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {totalBalance.toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {totalRent.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
        </div>

        {/* Tenants Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Tenants</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Property & Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lease Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#111]" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {tenant.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {tenant.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {tenant.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{tenant.propertyName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Unit: {tenant.unitNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        KSh {tenant.monthlyRent.toLocaleString()}
                      </div>
                      {tenant.balance > 0 && (
                        <div className="text-sm text-red-600">
                          Balance: KSh {tenant.balance.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(tenant.leaseStart).toLocaleDateString()} - 
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(tenant.leaseEnd).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                        {getStatusIcon(tenant.status)}
                        <span className="ml-1 capitalize">{tenant.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewTenant(tenant)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditTenant(tenant)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Tenant"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Tenant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Add Tenant Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Tenant</h2>
            
            <form onSubmit={handleAddTenant} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newTenant.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newTenant.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newTenant.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    name="unitNumber"
                    value={newTenant.unitNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Rent (KSh)
                  </label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={newTenant.monthlyRent}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security Deposit (KSh)
                  </label>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={newTenant.securityDeposit}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lease Start Date
                  </label>
                  <input
                    type="date"
                    name="leaseStart"
                    value={newTenant.leaseStart}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lease End Date
                  </label>
                  <input
                    type="date"
                    name="leaseEnd"
                    value={newTenant.leaseEnd}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Add Tenant
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Tenant Modal */}
      {showViewModal && viewingTenant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tenant Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-[#111]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewingTenant.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{viewingTenant.email}</p>
                    <p className="text-gray-600 dark:text-gray-400">{viewingTenant.phone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Property</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingTenant.propertyName}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unit</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingTenant.unitNumber}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</p>
                    <p className="font-medium text-gray-900 dark:text-white">KSh {viewingTenant.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Security Deposit</p>
                    <p className="font-medium text-gray-900 dark:text-white">KSh {viewingTenant.securityDeposit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Lease Info */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Lease Information</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Lease Start</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(viewingTenant.leaseStart).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">Lease End</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(viewingTenant.leaseEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                    <p className="text-sm text-green-600 dark:text-green-400">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewingTenant.status)}`}>
                      {getStatusIcon(viewingTenant.status)}
                      <span className="ml-1 capitalize">{viewingTenant.status}</span>
                    </span>
                  </div>
                  {viewingTenant.lastPayment && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                      <p className="text-sm text-purple-600 dark:text-purple-400">Last Payment</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(viewingTenant.lastPayment).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {viewingTenant.balance > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                      <p className="text-sm text-orange-600 dark:text-orange-400">Outstanding Balance</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        KSh {viewingTenant.balance.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {showEditForm && editingTenant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Tenant</h2>
            
            <form onSubmit={handleUpdateTenant} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newTenant.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newTenant.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newTenant.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    name="unitNumber"
                    value={newTenant.unitNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Rent (KSh)
                  </label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={newTenant.monthlyRent}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security Deposit (KSh)
                  </label>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={newTenant.securityDeposit}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lease Start Date
                  </label>
                  <input
                    type="date"
                    name="leaseStart"
                    value={newTenant.leaseStart}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lease End Date
                  </label>
                  <input
                    type="date"
                    name="leaseEnd"
                    value={newTenant.leaseEnd}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={newTenant.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="late">Late</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingTenant(null);
                    setNewTenant({
                      name: '',
                      email: '',
                      phone: '',
                      propertyId: '',
                      unitNumber: '',
                      monthlyRent: '',
                      leaseStart: '',
                      leaseEnd: '',
                      securityDeposit: '',
                      status: 'active'
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
                  Update Tenant
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
