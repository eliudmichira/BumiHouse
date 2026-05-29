import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Upload, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Crown,
  User,
  Settings as SettingsIcon,
  Clock,
  Database,
  Cloud,
  Lock,
  Key,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Mock data
const storeSettings = {
  name: 'Bogani',
  tagline: 'Premium Probiotic Yogurt for Better Health',
  email: 'support@bogani.com',
  phone: '+254 712 345 678',
  address: 'Westlands Business Park, Nairobi, Kenya',
  website: 'https://bogani.web.app',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  language: 'English',
  logo: '/assets/logo.jpg'
};

const adminUsers = [
  {
    id: 1,
    name: 'Michael Michira',
    email: 'michmichira@gmail.com',
    role: 'Super Admin',
    avatar: '/avatars/michael.jpg',
    lastLogin: '2024-01-15 14:30',
    status: 'active',
    permissions: ['all']
  },
  {
    id: 2,
    name: 'Eliud Samwels',
    email: 'eliudsamwels7@gmail.com',
    role: 'Admin',
    avatar: '/avatars/eliud.jpg',
    lastLogin: '2024-01-15 11:20',
    status: 'active',
    permissions: ['sales', 'inventory', 'reports']
  },
  {
    id: 3,
    name: 'Sarah Wanjiku',
    email: 'sarah.wanjiku@bogani.com',
    role: 'Manager',
    avatar: '/avatars/sarah.jpg',
    lastLogin: '2024-01-14 16:45',
    status: 'active',
    permissions: ['sales', 'reports']
  },
  {
    id: 4,
    name: 'David Kiprotich',
    email: 'david.kiprotich@bogani.com',
    role: 'Editor',
    avatar: '/avatars/david.jpg',
    lastLogin: '2024-01-13 09:15',
    status: 'inactive',
    permissions: ['inventory']
  }
];

const notificationSettings = {
  email: {
    newOrders: true,
    lowStock: true,
    systemUpdates: false,
    marketing: true
  },
  sms: {
    criticalAlerts: true,
    orderUpdates: false,
    promotions: false
  },
  push: {
    realTimeUpdates: true,
    dailySummary: true,
    weeklyReports: false
  }
};

const paymentMethods = [
  {
    id: 1,
    name: 'M-Pesa',
    type: 'mobile_money',
    status: 'active',
    lastUsed: '2024-01-15',
    icon: Smartphone
  },
  {
    id: 2,
    name: 'Visa Card',
    type: 'credit_card',
    status: 'active',
    lastUsed: '2024-01-12',
    icon: CreditCard
  },
  {
    id: 3,
    name: 'PayPal',
    type: 'digital_wallet',
    status: 'inactive',
    lastUsed: '2024-01-08',
    icon: Globe
  }
];

const SettingsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [storeData, setStoreData] = useState(storeSettings);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const tabs = [
    { id: 'store', label: 'Store Settings', icon: SettingsIcon },
    { id: 'users', label: 'User Management', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database }
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleDeleteUser = (userId: number) => {
    // Implement user deletion logic
    console.log('Delete user:', userId);
  };

  const handleToggleUserStatus = (userId: number) => {
    // Implement user status toggle logic
    console.log('Toggle user status:', userId);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Manager':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Editor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Store Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={storeData.name}
              onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={storeData.tagline}
              onChange={(e) => setStoreData({ ...storeData, tagline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={storeData.email}
              onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={storeData.phone}
              onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <textarea
              value={storeData.address}
              onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={storeData.currency}
              onChange={(e) => setStoreData({ ...storeData, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
            >
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={storeData.timezone}
              onChange={(e) => setStoreData({ ...storeData, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
            >
              <option value="Africa/Nairobi">Africa/Nairobi</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={storeData.language}
              onChange={(e) => setStoreData({ ...storeData, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
            >
              <option value="English">English</option>
              <option value="Swahili">Swahili</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Users</h3>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
        
        <div className="space-y-4">
          {adminUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{user.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Last login: {user.lastLogin}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  user.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleUserStatus(user.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {user.role !== 'Super Admin' && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive notifications about {key.toLowerCase()}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    email: { ...notifications.email, [key]: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primaryRed/20 dark:peer-focus:ring-primaryRed/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primaryRed"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">SMS Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.sms).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive SMS for {key.toLowerCase()}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    sms: { ...notifications.sms, [key]: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primaryRed/20 dark:peer-focus:ring-primaryRed/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primaryRed"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Method
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <method.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{method.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{method.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  method.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last used: {method.lastUsed}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 transition-colors">
              Enable
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Change Password</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">System Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark themes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primaryRed/20 dark:peer-focus:ring-primaryRed/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primaryRed"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Sound Effects</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enable notification sounds</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primaryRed/20 dark:peer-focus:ring-primaryRed/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primaryRed"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Database & Backup</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Backup Database</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create a backup of your store data</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 transition-colors">
              Backup Now
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Auto Backup</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically backup data daily</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm">
              Enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your store configuration and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primaryRed text-primaryRed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'store' && renderStoreSettings()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'payments' && renderPaymentMethods()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'system' && renderSystem()}
        </div>
      </div>
    </div>
  );
};

export default SettingsSection; 