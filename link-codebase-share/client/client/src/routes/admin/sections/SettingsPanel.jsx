import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { 
  Settings, 
  Save, 
  Globe, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Mail,
  Users,
  Home,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
  X,
  Upload,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Hama Estate',
      siteDescription: 'Your trusted real estate platform in Kenya',
      siteUrl: 'https://makao-648bd.web.app',
      contactEmail: 'admin@bogani.com',
      contactPhone: '+254 700 123 456',
      timezone: 'Africa/Nairobi',
      currency: 'KES',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      newUserAlerts: true,
      newPropertyAlerts: true,
      systemAlerts: true,
      marketingEmails: false
    },
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      enableCaptcha: true
    },
    appearance: {
      theme: 'auto',
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.png',
      enableDarkMode: true,
      showBreadcrumbs: true
    },
    content: {
      autoApproveProperties: false,
      requireModeration: true,
      maxImagesPerProperty: 10,
      maxPropertyDescription: 1000,
      enableComments: true,
      enableReviews: true,
      featuredPropertiesLimit: 6
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'admin@bogani.com',
      smtpPassword: '',
      fromEmail: 'noreply@bogani.com',
      fromName: 'Hama Estate',
      enableEmailNotifications: true
    },
    payment: {
      enablePayments: true,
      stripePublicKey: 'pk_test_...',
      stripeSecretKey: '',
      paypalClientId: '',
      paypalSecret: '',
      currency: 'KES',
      taxRate: 16
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'content', label: 'Content', icon: Home },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payment', label: 'Payment', icon: DollarSign }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, 'admin', 'settings');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setSettings(prev => ({ ...prev, ...data }));
        } else {
          await setDoc(ref, settings);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const handleSaveSettings = async (category) => {
    setLoading(true);
    try {
      const ref = doc(db, 'admin', 'settings');
      await updateDoc(ref, { [category]: settings[category] });
    } catch (error) {
      // If the doc doesn't exist yet, create it
      try {
        const ref = doc(db, 'admin', 'settings');
        await setDoc(ref, { [category]: settings[category] }, { merge: true });
      } catch (e) {
        console.error('Error saving settings:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={settings.general.contactEmail}
            onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={settings.general.contactPhone}
            onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="Africa/Nairobi">Africa/Nairobi</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={settings.general.currency}
            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="KES">KES (Kenyan Shilling)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
            <option value="GBP">GBP (British Pound)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          rows="3"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {key.includes('Email') ? 'Send email notifications' : 
                 key.includes('Push') ? 'Send push notifications' :
                 key.includes('SMS') ? 'Send SMS notifications' :
                 key.includes('User') ? 'Alert when new users register' :
                 key.includes('Property') ? 'Alert when new properties are added' :
                 key.includes('System') ? 'Receive system alerts' :
                 'Send marketing emails'}
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', key, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(settings.security).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {key.includes('Email') ? 'Require email verification for new users' :
                 key.includes('Phone') ? 'Require phone verification for new users' :
                 key.includes('TwoFactor') ? 'Enable two-factor authentication' :
                 key.includes('Session') ? 'Session timeout in minutes' :
                 key.includes('Login') ? 'Maximum login attempts before lockout' :
                 key.includes('Password') ? 'Minimum password length' :
                 'Enable CAPTCHA on forms'}
              </p>
            </div>
            {typeof value === 'boolean' ? (
              <button
                onClick={() => handleSettingChange('security', key, !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            ) : (
              <input
                type="number"
                value={value}
                onChange={(e) => handleSettingChange('security', key, parseInt(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-center"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={settings.appearance.theme}
            onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="auto">Auto (System)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Color
          </label>
          <input
            type="color"
            value={settings.appearance.primaryColor}
            onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
            className="w-full h-10 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secondary Color
          </label>
          <input
            type="color"
            value={settings.appearance.secondaryColor}
            onChange={(e) => handleSettingChange('appearance', 'secondaryColor', e.target.value)}
            className="w-full h-10 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            value={settings.appearance.logoUrl}
            onChange={(e) => handleSettingChange('appearance', 'logoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(settings.appearance).filter(([key]) => typeof settings.appearance[key] === 'boolean').map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
            </div>
            <button
              onClick={() => handleSettingChange('appearance', key, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(settings.content).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {key.includes('AutoApprove') ? 'Automatically approve new properties' :
                 key.includes('Moderation') ? 'Require admin moderation for properties' :
                 key.includes('Images') ? 'Maximum images per property' :
                 key.includes('Description') ? 'Maximum description length' :
                 key.includes('Comments') ? 'Enable property comments' :
                 key.includes('Reviews') ? 'Enable property reviews' :
                 'Maximum featured properties to display'}
              </p>
            </div>
            {typeof value === 'boolean' ? (
              <button
                onClick={() => handleSettingChange('content', key, !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            ) : (
              <input
                type="number"
                value={value}
                onChange={(e) => handleSettingChange('content', key, parseInt(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-center"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Username
          </label>
          <input
            type="text"
            value={settings.email.smtpUsername}
            onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Password
          </label>
          <input
            type="password"
            value={settings.email.smtpPassword}
            onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Email
          </label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Name
          </label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Enable Email Notifications</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Send email notifications to users</p>
        </div>
        <button
          onClick={() => handleSettingChange('email', 'enableEmailNotifications', !settings.email.enableEmailNotifications)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.email.enableEmailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-600'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.email.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stripe Public Key
          </label>
          <input
            type="text"
            value={settings.payment.stripePublicKey}
            onChange={(e) => handleSettingChange('payment', 'stripePublicKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stripe Secret Key
          </label>
          <input
            type="password"
            value={settings.payment.stripeSecretKey}
            onChange={(e) => handleSettingChange('payment', 'stripeSecretKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            PayPal Client ID
          </label>
          <input
            type="text"
            value={settings.payment.paypalClientId}
            onChange={(e) => handleSettingChange('payment', 'paypalClientId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            PayPal Secret
          </label>
          <input
            type="password"
            value={settings.payment.paypalSecret}
            onChange={(e) => handleSettingChange('payment', 'paypalSecret', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={settings.payment.currency}
            onChange={(e) => handleSettingChange('payment', 'currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="KES">KES (Kenyan Shilling)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            value={settings.payment.taxRate}
            onChange={(e) => handleSettingChange('payment', 'taxRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Enable Payments</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Allow users to make payments on the platform</p>
        </div>
        <button
          onClick={() => handleSettingChange('payment', 'enablePayments', !settings.payment.enablePayments)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.payment.enablePayments ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-600'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.payment.enablePayments ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'content':
        return renderContentSettings();
      case 'email':
        return renderEmailSettings();
      case 'payment':
        return renderPaymentSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure your platform settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSaveSettings(activeTab)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 