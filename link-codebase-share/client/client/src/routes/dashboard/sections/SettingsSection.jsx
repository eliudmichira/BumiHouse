import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, Palette, Globe, Save, Eye, EyeOff, Check, X, Camera, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const SettingsSection = () => {
  const { currentUser, updateProfile, userPreferences, updatePreferences } = useAuth();
  
  const [settings, setSettings] = useState({
    profile: {
      fullName: currentUser?.name || 'Mich Michira',
      email: currentUser?.email || 'mich@example.com',
      phone: currentUser?.phone || '+254 700 123 456',
      bio: currentUser?.bio || 'Professional real estate agent with 5+ years of experience',
      avatar: currentUser?.avatar || ''
    },
    notifications: {
      email: userPreferences?.notifications?.email ?? true,
      sms: userPreferences?.notifications?.sms ?? false,
      propertyAlerts: userPreferences?.notifications?.propertyAlerts ?? true,
      inquiryAlerts: userPreferences?.notifications?.inquiryAlerts ?? true,
      marketingEmails: userPreferences?.notifications?.marketingEmails ?? false
    },
    security: {
      twoFactorEnabled: false,
      passwordLastChanged: "2024-01-15"
    },
    appearance: {
      theme: localStorage.getItem('theme') || 'light',
      language: userPreferences?.language || 'English',
      currency: userPreferences?.currency || 'KES'
    }
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Update settings when user data changes
  useEffect(() => {
    if (currentUser) {
      setSettings(prev => ({
        ...prev,
        profile: {
          fullName: currentUser.name || prev.profile.fullName,
          email: currentUser.email || prev.profile.email,
          phone: currentUser.phone || prev.profile.phone,
          bio: currentUser.bio || prev.profile.bio,
          avatar: currentUser.avatar || prev.profile.avatar
        }
      }));
    }
  }, [currentUser]);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    
    // Clear errors when user starts typing
    if (errors[`${category}.${key}`]) {
      setErrors(prev => ({
        ...prev,
        [`${category}.${key}`]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Profile validation
    if (!settings.profile.fullName.trim()) {
      newErrors['profile.fullName'] = 'Full name is required';
    }
    if (!settings.profile.email.trim()) {
      newErrors['profile.email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(settings.profile.email)) {
      newErrors['profile.email'] = 'Please enter a valid email';
    }
    if (!settings.profile.phone.trim()) {
      newErrors['profile.phone'] = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Update profile
      if (currentUser) {
        await updateProfile({
          name: settings.profile.fullName,
          email: settings.profile.email,
          phone: settings.profile.phone,
          bio: settings.profile.bio,
          avatar: settings.profile.avatar
        });
      }

      // Update preferences
      await updatePreferences({
        notifications: settings.notifications,
        language: settings.appearance.language,
        currency: settings.appearance.currency
      });

      // Update theme
      if (settings.appearance.theme !== localStorage.getItem('theme')) {
        localStorage.setItem('theme', settings.appearance.theme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(settings.appearance.theme);
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const newErrors = {};
    
    if (!passwordData.current) {
      newErrors.current = 'Current password is required';
    }
    if (!passwordData.new) {
      newErrors.new = 'New password is required';
    } else if (passwordData.new.length < 8) {
      newErrors.new = 'Password must be at least 8 characters';
    }
    if (passwordData.new !== passwordData.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }
    
    try {
      // Simulate password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      setErrors({});
      
      // Update last changed date
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          passwordLastChanged: new Date().toISOString().split('T')[0]
        }
      }));
      
      alert('Password changed successfully!');
    } catch (error) {
      alert('Failed to change password. Please try again.');
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatar: e.target.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (theme) => {
    handleSettingChange('appearance', 'theme', theme);
    // Apply theme immediately
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  };

  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return { type: 'info', message: 'Saving changes...', icon: null };
      case 'success':
        return { type: 'success', message: 'Settings saved successfully!', icon: Check };
      case 'error':
        return { type: 'error', message: 'Failed to save settings. Please try again.', icon: AlertCircle };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          statusMessage.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : statusMessage.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
        }`}>
          {statusMessage.icon && <statusMessage.icon className="w-4 h-4" />}
          {statusMessage.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Profile</h4>
          </div>
          
          {/* Avatar Section */}
          <div className="mb-6 text-center">
            <div className="relative inline-block">
              <img
                src={settings.profile.avatar || `https://via.placeholder.com/80x80/6366f1/ffffff?text=${settings.profile.fullName?.charAt(0) || 'U'}`}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={settings.profile.fullName}
                onChange={(e) => handleSettingChange('profile', 'fullName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors['profile.fullName'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors['profile.fullName'] && (
                <p className="text-red-500 text-xs mt-1">{errors['profile.fullName']}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors['profile.email'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors['profile.email'] && (
                <p className="text-red-500 text-xs mt-1">{errors['profile.email']}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors['profile.phone'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors['profile.phone'] && (
                <p className="text-red-500 text-xs mt-1">{errors['profile.phone']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={settings.profile.bio}
                onChange={(e) => handleSettingChange('profile', 'bio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Notifications</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SMS Notifications</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.sms}
                  onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Property Alerts</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified about property updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.propertyAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'propertyAlerts', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Inquiry Alerts</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified about new inquiries</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.inquiryAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'inquiryAlerts', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Marketing Emails</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive promotional content</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.marketingEmails}
                  onChange={(e) => handleSettingChange('notifications', 'marketingEmails', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Security</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Auth</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.security.twoFactorEnabled}
                  onChange={(e) => handleSettingChange('security', 'twoFactorEnabled', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Change Password
            </button>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Last changed: {settings.security.passwordLastChanged}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Appearance</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button 
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              settings.appearance.theme === 'light' 
                ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded border"></div>
            Light Mode
          </button>
          
          <button 
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              settings.appearance.theme === 'dark' 
                ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="w-4 h-4 bg-gray-800 rounded border"></div>
            Dark Mode
          </button>
          
          <button 
            onClick={() => handleThemeChange('auto')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              settings.appearance.theme === 'auto' 
                ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="w-4 h-4 bg-gradient-to-r from-white to-gray-800 rounded border"></div>
            Auto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select
              value={settings.appearance.language}
              onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="English">English</option>
              <option value="Swahili">Swahili</option>
              <option value="French">French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={settings.appearance.currency}
              onChange={(e) => handleSettingChange('appearance', 'currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.current ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.current && (
                  <p className="text-red-500 text-xs mt-1">{errors.current}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.new ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.new && (
                  <p className="text-red-500 text-xs mt-1">{errors.new}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.confirm ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.confirm && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Profile Picture</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <img
                  src={avatarPreview || settings.profile.avatar || `https://via.placeholder.com/100x100/6366f1/ffffff?text=${settings.profile.fullName?.charAt(0) || 'U'}`}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowAvatarModal(false);
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsSection; 