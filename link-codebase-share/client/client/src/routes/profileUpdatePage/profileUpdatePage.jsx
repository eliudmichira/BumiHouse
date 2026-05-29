import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { 
  User, Mail, Lock, Camera, ArrowLeft, Save, Shield, 
  Check, Eye, EyeOff, AlertCircle, Sparkles, Upload,
  CheckCircle, XCircle, Info, Settings, Key, Smartphone,
  Bell, Moon, Sun, Globe, CreditCard, Home, MapPin
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../lib/i18n.jsx";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { auth } from "../../lib/firebase";
import { updatePassword } from "firebase/auth";

function ProfileUpdatePage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, changeLanguage } = useLanguage();
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatar, setAvatar] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    preferences: {
      notifications: true,
      newsletter: true,
      darkMode: theme === 'dark',
      language: 'en'
    }
  });

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        password: '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        preferences: {
          ...currentUser.preferences,
          notifications: currentUser.preferences?.notifications ?? true,
          newsletter: currentUser.preferences?.newsletter ?? true,
          darkMode: theme === 'dark',
          language: currentUser.preferences?.language || 'en'
        }
      });
    }
  }, [currentUser, theme]);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handlePreferenceChange = (key) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const dataToUpdate = {
        ...formData,
        avatar: avatar[0] || currentUser?.avatar
      };
      
      // Handle password update with Firebase if password is provided
      if (formData.password) {
        try {
          // Update Firebase auth password
          await updatePassword(auth.currentUser, formData.password);
          setSuccess(t('passwordUpdated'));
        } catch (passwordError) {
          setError(t('failedToUpdatePassword') + ": " + passwordError.message);
          setIsSubmitting(false);
          return;
        }
        // Remove password from dataToUpdate since it's already updated in Firebase
        delete dataToUpdate.password;
      }

      // Update theme if darkMode preference changed
      if (dataToUpdate.preferences.darkMode !== (theme === 'dark')) {
        toggleTheme();
      }

      // Check if we're in production (no backend available)
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      if (isProduction) {
        // In production, save to localStorage and update AuthContext
        const updatedUser = { ...currentUser, ...dataToUpdate };
        localStorage.setItem('estate_user', JSON.stringify(updatedUser));
        
        // Update the user in AuthContext
        if (updateProfile) {
          updateProfile(updatedUser);
        }
      } else {
        // In development, try the API
        try {
          const res = await apiRequest.put(`/users/${currentUser.id}`, dataToUpdate);
          
          // Update the user in AuthContext
          if (updateProfile) {
            updateProfile(res.data);
          }
        } catch (apiError) {
          // Fallback to localStorage if API fails
          const updatedUser = { ...currentUser, ...dataToUpdate };
          localStorage.setItem('estate_user', JSON.stringify(updatedUser));
          
          if (updateProfile) {
            updateProfile(updatedUser);
          }
        }
      }
      
              if (!formData.password) {
          setSuccess(t('profileUpdated'));
        }
      
      // Show success animation
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
          } catch (err) {
        setError(err.response?.data?.message || t('failedToUpdate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return t('password_strength_weak');
    if (passwordStrength <= 50) return t('password_strength_fair');
    if (passwordStrength <= 75) return t('password_strength_good');
    return t('password_strength_strong');
  };

  const tabs = [
    { id: 'profile', label: t('profile_info'), icon: User },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'preferences', label: t('preferences'), icon: Settings }
  ];

  // Redirect if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-all duration-500">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <button 
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 mb-6 transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              {t('back_to_profile')}
            </button>
            
            <div className="relative inline-block mb-6">
              <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                {t('update_your_profile')}
              </h1>
              <Sparkles className="absolute -top-6 -right-6 w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('keep_info_up_to_date_manage_prefs')}
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl animate-slide-down">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 animate-bounce" />
                <span className="text-green-700 dark:text-green-300 font-medium">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl animate-slide-down">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-3">
                <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8 transition-all duration-500 hover:shadow-3xl">
                  <div className="space-y-6">
                    {activeTab === 'profile' && (
                      <div className="space-y-6 animate-fade-in">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            {t('username')}
                          </label>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                              name="username"
                              type="text"
                              value={formData.username}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 dark:text-gray-100"
                              placeholder={t('enter_username')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            {t('email_address')}
                          </label>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 dark:text-gray-100"
                              placeholder={t('enter_email')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            {t('phone_number')}
                          </label>
                          <div className="relative group">
                            <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 dark:text-gray-100"
                              placeholder={t('enter_phone_number')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            {t('location')}
                          </label>
                          <div className="relative group">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                              name="location"
                              type="text"
                              value={formData.location}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 dark:text-gray-100"
                              placeholder={t('city_state')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            {t('bio')}
                          </label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 dark:text-gray-100 resize-none"
                            placeholder={t('tell_about_yourself')}
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'security' && (
                      <div className="space-y-6 animate-fade-in">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            {t('new_password')}
                          </label>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-12 py-3 bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 dark:text-gray-100"
                              placeholder={t('enter_new_password_optional')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          
                          {formData.password && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('password_strength')}:</span>
                                <span className={`text-sm font-medium ${
                                  passwordStrength > 75 ? 'text-green-600' :
                                  passwordStrength > 50 ? 'text-yellow-600' :
                                  passwordStrength > 25 ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                  {getPasswordStrengthText()}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full ${getPasswordStrengthColor()} transition-all duration-500`}
                                  style={{ width: `${passwordStrength}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 pt-4">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            {t('two_factor_authentication')}
                          </h3>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <div className="space-y-2">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  {t('add_extra_security')}
                                </p>
                                <button
                                  type="button"
                                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {t('enable_2fa')} →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('login_history')}</h3>
                          <div className="space-y-2">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-gray-200">{t('current_session')}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {navigator.userAgent.includes('Chrome') ? t('chrome') : 
                                     navigator.userAgent.includes('Firefox') ? t('firefox') : 
                                     navigator.userAgent.includes('Safari') ? t('safari') : t('browser')} • {t('active_now')}
                                  </p>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-gray-200">{t('last_login')}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {currentUser?.lastLoginAt ? 
                                      new Date(currentUser.lastLoginAt).toLocaleDateString() : 
                                      t('no_previous_login_data')
                                    }
                                  </p>
                                </div>
                                <Info className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'preferences' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            {t('notifications')}
                          </h3>
                          
                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors">
                            <div className="flex items-center gap-3">
                              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('push_notifications')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('get_notified_new_props')}</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.preferences.notifications}
                                onChange={() => handlePreferenceChange('notifications')}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </label>

                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors">
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('email_newsletter')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('weekly_prop_updates')}</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.preferences.newsletter}
                                onChange={() => handlePreferenceChange('newsletter')}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </label>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            {t('display_settings')}
                          </h3>
                          
                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors">
                            <div className="flex items-center gap-3">
                              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('dark_mode')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('toggle_dark_theme')}</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={theme === 'dark'}
                                onChange={() => {
                                  toggleTheme();
                                }}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </label>

                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('language')}</p>
                              </div>
                            </div>
                                                          <select
                                name="language"
                                value={formData.preferences.language}
                                onChange={(e) => {
                                  const newLanguage = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    preferences: { ...prev.preferences, language: newLanguage }
                                  }));
                                  // Update the language context immediately
                                  if (changeLanguage) {
                                    changeLanguage(newLanguage);
                                  }
                                }}
                                className="w-full mt-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="en">English</option>
                                <option value="sw">Kiswahili</option>
                              </select>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t('updating')}...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          {t('save_changes')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Picture */}
                <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8 text-center transition-all duration-500 hover:shadow-3xl">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                    {t('profile_picture')}
                  </h3>
                  <div className="relative inline-block group">
                    <img 
                      src={avatar[0] || currentUser?.avatar || `https://via.placeholder.com/160x160/6366f1/ffffff?text=${currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}`} 
                      alt="Profile" 
                      className="w-40 h-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl mx-auto group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-4 mb-6">
                    {t('click_to_upload_new_profile_pic')}
                  </p>
                  
                  {/* Fallback file upload for production */}
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setAvatar([e.target.result]);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      {t('choose_file')}
                    </label>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-6 transition-all duration-500 hover:shadow-3xl">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    {t('account_overview')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <span className="text-gray-600 dark:text-gray-400">{t('properties_listed')}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {currentUser?.propertiesCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <span className="text-gray-600 dark:text-gray-400">{t('saved_properties')}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {currentUser?.savedPropertiesCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <span className="text-gray-600 dark:text-gray-400">{t('member_since')}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {currentUser?.createdAt ? new Date(currentUser.createdAt).getFullYear() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-6 transition-all duration-500 hover:shadow-3xl">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    {t('quick_actions')}
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors text-left group">
                      <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-gray-700 dark:text-gray-300">{t('billing_payments')}</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors text-left group">
                      <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-gray-700 dark:text-gray-300">{t('privacy_settings')}</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors text-left group">
                      <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-gray-700 dark:text-gray-300">{t('help_support')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(30px, -50px) scale(1.1) rotate(120deg); }
          66% { transform: translate(-20px, 20px) scale(0.9) rotate(240deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        
        .animate-blob {
          animation: blob 20s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

export default ProfileUpdatePage;