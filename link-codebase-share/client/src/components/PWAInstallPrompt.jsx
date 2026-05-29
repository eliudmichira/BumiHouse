import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { isDark } = useTheme();

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

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to avoid showing again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
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

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden pwa-install-prompt ${showPrompt ? 'show' : ''}`}>
      <div className={`relative p-4 rounded-t-2xl shadow-2xl ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-t border-[#51faaa]/20' 
          : 'bg-gradient-to-br from-white to-gray-50 border-t border-gray-200'
      }`}>
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-4 pr-8">
          {/* App Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="w-8 h-8 text-[#0a0c19]" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Install Hama Estate
              </h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">4.8</span>
              </div>
            </div>
            
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Get the full app experience with offline access, push notifications, and faster loading.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className={`flex items-center space-x-2 text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Offline Access</span>
              </div>
              <div className={`flex items-center space-x-2 text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Faster Loading</span>
              </div>
              <div className={`flex items-center space-x-2 text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Push Notifications</span>
              </div>
              <div className={`flex items-center space-x-2 text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>App-like Experience</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
