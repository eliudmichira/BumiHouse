import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const EnhancedThemeContext = createContext();

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within EnhancedThemeProvider');
  }
  return context;
};

// Theme presets
const themePresets = {
  light: {
    name: 'Light',
    primary: '#51faaa',
    secondary: '#dbd5a4',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    accent: '#3fd693'
  },
  dark: {
    name: 'Dark',
    primary: '#51faaa',
    secondary: '#dbd5a4',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    accent: '#3fd693'
  },
  midnight: {
    name: 'Midnight',
    primary: '#6366f1',
    secondary: '#a78bfa',
    background: '#0c0a1e',
    surface: '#1a1829',
    text: '#e2e8f0',
    accent: '#8b5cf6'
  },
  nature: {
    name: 'Nature',
    primary: '#059669',
    secondary: '#fbbf24',
    background: '#f0fdf4',
    surface: '#ecfdf5',
    text: '#064e3b',
    accent: '#10b981'
  },
  ocean: {
    name: 'Ocean',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    background: '#f0f9ff',
    surface: '#e0f2fe',
    text: '#0c4a6e',
    accent: '#0284c7'
  },
  sunset: {
    name: 'Sunset',
    primary: '#f97316',
    secondary: '#fbbf24',
    background: '#fffbeb',
    surface: '#fef3c7',
    text: '#92400e',
    accent: '#ea580c'
  }
};

export const EnhancedThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [customTheme, setCustomTheme] = useState(null);
  const [animations, setAnimations] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Detect system preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const stored = localStorage.getItem('enhanced-theme-settings');
    if (stored) {
      const settings = JSON.parse(stored);
      setCurrentTheme(settings.currentTheme || (mediaQuery.matches ? 'dark' : 'light'));
      setCustomTheme(settings.customTheme);
      setAnimations(settings.animations ?? true);
      setReducedMotion(settings.reducedMotion ?? motionQuery.matches);
      setColorBlindMode(settings.colorBlindMode ?? false);
      setHighContrast(settings.highContrast ?? contrastQuery.matches);
      setFontSize(settings.fontSize ?? 16);
    } else {
      setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');
      setReducedMotion(motionQuery.matches);
      setHighContrast(contrastQuery.matches);
    }

    const handleThemeChange = (e) => {
      if (!localStorage.getItem('enhanced-theme-settings')) {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      }
    };

    const handleMotionChange = (e) => {
      setReducedMotion(e.matches);
    };

    const handleContrastChange = (e) => {
      setHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    const theme = customTheme || themePresets[currentTheme];
    const root = document.documentElement;

    // CSS custom properties
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--font-size-base', `${fontSize}px`);

    // Theme classes
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${currentTheme}`);
    
    if (reducedMotion) root.classList.add('reduce-motion');
    else root.classList.remove('reduce-motion');
    
    if (highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
    
    if (colorBlindMode) root.classList.add('color-blind-mode');
    else root.classList.remove('color-blind-mode');

    // Meta theme color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme.primary;
    }
  }, [currentTheme, customTheme, reducedMotion, highContrast, colorBlindMode, fontSize]);

  // Save settings
  useEffect(() => {
    const settings = {
      currentTheme,
      customTheme,
      animations,
      reducedMotion,
      colorBlindMode,
      highContrast,
      fontSize
    };
    localStorage.setItem('enhanced-theme-settings', JSON.stringify(settings));
  }, [currentTheme, customTheme, animations, reducedMotion, colorBlindMode, highContrast, fontSize]);

  const changeTheme = async (themeName) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Smooth transition effect
    if (animations && !reducedMotion) {
      document.body.style.transition = 'all 0.3s ease-in-out';
    }
    
    setCurrentTheme(themeName);
    setCustomTheme(null);
    
    setTimeout(() => {
      setIsTransitioning(false);
      document.body.style.transition = '';
    }, 300);
  };

  const createCustomTheme = (themeConfig) => {
    setCustomTheme(themeConfig);
    setCurrentTheme('custom');
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const toggleColorBlindMode = () => {
    setColorBlindMode(!colorBlindMode);
  };

  const adjustFontSize = (size) => {
    setFontSize(Math.max(12, Math.min(24, size)));
  };

  const getThemeConfig = () => {
    return customTheme || themePresets[currentTheme];
  };

  const value = {
    // Current state
    currentTheme,
    customTheme,
    animations,
    reducedMotion,
    colorBlindMode,
    highContrast,
    fontSize,
    isTransitioning,
    
    // Available themes
    themePresets,
    
    // Actions
    changeTheme,
    createCustomTheme,
    setAnimations,
    setReducedMotion,
    toggleHighContrast,
    toggleColorBlindMode,
    adjustFontSize,
    getThemeConfig,
    
    // Helper functions
    isDark: currentTheme === 'dark' || currentTheme === 'midnight',
    isLight: currentTheme === 'light' || currentTheme === 'nature' || currentTheme === 'ocean' || currentTheme === 'sunset'
  };

  return (
    <EnhancedThemeContext.Provider value={value}>
      <motion.div
        className="min-h-screen transition-colors duration-300"
        animate={{
          backgroundColor: getThemeConfig().background
        }}
        transition={{ duration: isTransitioning ? 0.3 : 0 }}
      >
        {children}
      </motion.div>
    </EnhancedThemeContext.Provider>
  );
};

export default EnhancedThemeContext;
