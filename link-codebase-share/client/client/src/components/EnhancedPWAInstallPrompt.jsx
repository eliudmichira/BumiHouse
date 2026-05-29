import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  Smartphone, 
  Star, 
  Zap,
  Shield,
  Wifi,
  Battery,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Crown,
  Award,
  TrendingUp,
  Heart,
  Bookmark,
  Settings,
  Home,
  Search,
  Plus,
  User,
  Bell,
  MessageCircle,
  Calendar,
  Map,
  Filter,
  BookOpen,
  HelpCircle,
  Info,
  ExternalLink,
  Share2,
  Copy,
  Link as LinkIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const EnhancedPWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [installStep, setInstallStep] = useState('prompt'); // 'prompt', 'installing', 'success'
  const { isDark } = useTheme();
  const promptRef = useRef(null);

  // Haptic feedback simulation
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay
      setTimeout(() => {
        if (!checkIfInstalled()) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      setInstallStep('success');
      
      // Show success message
      setTimeout(() => {
        setInstallStep('prompt');
      }, 3000);
    };

    // Check if already installed
    if (!checkIfInstalled()) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    triggerHaptic();
    setIsInstalling(true);
    setInstallStep('installing');

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setInstallStep('success');
        setIsInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
        setInstallStep('prompt');
      }
    } catch (error) {
      console.error('Installation error:', error);
      setInstallStep('prompt');
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    triggerHaptic();
    setShowPrompt(false);
    // Store dismissal in localStorage to avoid showing again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleLearnMore = () => {
    triggerHaptic();
    setShowFeatures(!showFeatures);
  };

  const handleShowBenefits = () => {
    triggerHaptic();
    setShowBenefits(!showBenefits);
  };

  // Don't show if already installed or recently dismissed
  if (isInstalled || !showPrompt) {
    return null;
  }

  const recentlyDismissed = localStorage.getItem('pwa-prompt-dismissed');
  if (recentlyDismissed) {
    const dismissedTime = parseInt(recentlyDismissed);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - dismissedTime < oneDay) {
      return null;
    }
  }

  // PWA Features
  const pwaFeatures = [
    {
      icon: Smartphone,
      title: 'App-like Experience',
      description: 'Full-screen, native app feel with smooth animations'
    },
    {
      icon: Wifi,
      title: 'Offline Access',
      description: 'Works without internet connection'
    },
    {
      icon: Battery,
      title: 'Better Performance',
      description: 'Faster loading and smoother interactions'
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Secure HTTPS connection and data protection'
    },
    {
      icon: Star,
      title: 'Quick Access',
      description: 'Easy access from home screen'
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Automatic updates in the background'
    }
  ];

  // PWA Benefits
  const pwaBenefits = [
    {
      icon: TrendingUp,
      title: 'Faster Browsing',
      description: 'Up to 3x faster than regular web browsing'
    },
    {
      icon: Heart,
      title: 'Better UX',
      description: 'Native app-like experience with gestures'
    },
    {
      icon: Bookmark,
      title: 'Easy Access',
      description: 'One tap access from your home screen'
    },
    {
      icon: Settings,
      title: 'Customizable',
      description: 'Personalize your experience'
    }
  ];

  // App Screenshots/Features Preview
  const appScreens = [
    {
      icon: Home,
      title: 'Home',
      description: 'Discover properties'
    },
    {
      icon: Search,
      title: 'Search',
      description: 'Find your perfect home'
    },
    {
      icon: Map,
      title: 'Map View',
      description: 'Explore locations'
    },
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your account'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Stay updated'
    },
    {
      icon: MessageCircle,
      title: 'Messages',
      description: 'Connect with agents'
    }
  ];

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pwa-install-prompt"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          ref={promptRef}
        >
          <div className={`relative p-4 rounded-t-2xl shadow-2xl ${
            isDark 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-t border-[#51faaa]/20' 
              : 'bg-gradient-to-br from-white to-gray-50 border-t border-gray-200'
          }`}>
            {/* Success State */}
            <AnimatePresence mode="wait">
              {installStep === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-2">Installation Complete!</h3>
                  <p className="text-gray-300 text-sm">Your app is now ready to use</p>
                </motion.div>
              ) : installStep === 'installing' ? (
                <motion.div
                  key="installing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center py-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-[#51faaa] border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-lg font-bold text-white mb-2">Installing...</h3>
                  <p className="text-gray-300 text-sm">Please wait while we set up your app</p>
                </motion.div>
              ) : (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ 
                          boxShadow: [
                            "0 0 20px rgba(81, 250, 170, 0.3)",
                            "0 0 40px rgba(81, 250, 170, 0.1)",
                            "0 0 20px rgba(81, 250, 170, 0.3)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center"
                      >
                        <Download className="w-6 h-6 text-[#0a0c19]" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Install App</h3>
                        <p className="text-sm text-gray-300">Get the best experience</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleDismiss}
                      className={`p-2 rounded-lg ${
                        isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Features Preview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {appScreens.slice(0, 6).map((screen, index) => (
                        <motion.div
                          key={screen.title}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          className={`p-3 rounded-lg text-center ${
                            isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
                          }`}
                        >
                          <screen.icon className={`w-6 h-6 mx-auto mb-1 ${
                            isDark ? 'text-[#51faaa]' : 'text-[#51faaa]'
                          }`} />
                          <p className="text-xs font-medium text-white">{screen.title}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Features/Benefits Toggle */}
                  <div className="flex space-x-2 mb-4">
                    <motion.button
                      onClick={handleLearnMore}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        showFeatures
                          ? 'bg-[#51faaa] text-[#0a0c19]'
                          : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Features
                    </motion.button>
                    <motion.button
                      onClick={handleShowBenefits}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        showBenefits
                          ? 'bg-[#51faaa] text-[#0a0c19]'
                          : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Benefits
                    </motion.button>
                  </div>

                  {/* Features/Benefits Content */}
                  <AnimatePresence mode="wait">
                    {showFeatures && (
                      <motion.div
                        key="features"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {pwaFeatures.map((feature, index) => (
                            <motion.div
                              key={feature.title}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-3 rounded-lg ${
                                isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
                              }`}
                            >
                              <feature.icon className={`w-5 h-5 mb-2 ${
                                isDark ? 'text-[#51faaa]' : 'text-[#51faaa]'
                              }`} />
                              <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                              <p className="text-xs text-gray-300">{feature.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {showBenefits && (
                      <motion.div
                        key="benefits"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {pwaBenefits.map((benefit, index) => (
                            <motion.div
                              key={benefit.title}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-3 rounded-lg ${
                                isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
                              }`}
                            >
                              <benefit.icon className={`w-5 h-5 mb-2 ${
                                isDark ? 'text-[#51faaa]' : 'text-[#51faaa]'
                              }`} />
                              <h4 className="text-sm font-semibold text-white mb-1">{benefit.title}</h4>
                              <p className="text-xs text-gray-300">{benefit.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={handleInstall}
                      className="flex-1 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-5 h-5" />
                      <span>Install Now</span>
                    </motion.button>
                    <motion.button
                      onClick={handleDismiss}
                      className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                        isDark
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Later
                    </motion.button>
                  </div>

                  {/* Additional Info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 text-center"
                  >
                    <p className="text-xs text-gray-400">
                      Free • No ads • Secure • Updates automatically
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedPWAInstallPrompt;
