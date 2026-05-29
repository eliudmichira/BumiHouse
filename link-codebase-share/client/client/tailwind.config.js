/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        'manrope': ['Manrope', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'primary': ['Manrope', 'sans-serif'],
      },
      colors: {
        // Primary - Emerald/Green theme
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Redefine as emerald for consistency
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Secondary - Purple/Violet
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Redefine as purple for consistency
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Dark theme specific colors - Standardized Gray-based
        dark: {
          base: '#111827', // gray-900
          surface: '#1f2937', // gray-800
          elevated: '#374151', // gray-700
          overlay: '#4b5563', // gray-600
          900: '#111827', // gray-900
          800: '#1f2937', // gray-800
          700: '#374151', // gray-700
          600: '#4b5563', // gray-600
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      backgroundColor: {
        'dark-base': '#111827', // gray-900
        'dark-surface': '#1f2937', // gray-800
        'dark-elevated': '#374151', // gray-700
        'glass-dark': 'rgba(31, 41, 55, 0.8)', // gray-800 with opacity
        'glass-light': 'rgba(255, 255, 255, 0.8)',
      },
      borderColor: {
        'glass-dark': 'rgba(55, 65, 81, 0.3)', // gray-700 with opacity
        'glass-light': 'rgba(229, 231, 235, 0.5)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #047857 0%, #059669 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
        'gradient-secondary-hover': 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
        'gradient-dark': 'linear-gradient(135deg, #111827 0%, #374151 100%)', // gray-900 to gray-700
        'gradient-emerald': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'glass-inset': 'inset 0 1px 0 0 rgba(52, 211, 153, 0.1)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.4)',
        'emerald': '0 6px 20px 0 rgba(5, 150, 105, 0.4)',
        'purple': '0 6px 20px 0 rgba(139, 92, 246, 0.4)',
      },
      backdropBlur: {
        'glass': '20px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'gradient-shift': 'gradientShift 20s ease infinite',
        'blob-float': 'blobFloat 25s infinite ease-in-out',
        'blob-pulse': 'blobPulse 20s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '0.25', transform: 'scale(1.1) rotate(180deg)' },
        },
        blobFloat: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 30px) scale(0.95)' },
        },
        blobPulse: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.08' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: '0.12' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'all': 'all',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      screens: {
        'xs': '475px',
        // Default Tailwind screens
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom larger screens
        '3xl': '1920px',
        '4xl': '2560px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
      },
    },
  },
  plugins: [
    // Custom plugin for theme-aware utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-gradient-primary': {
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-secondary': {
          background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.glassmorphism-dark': {
          background: 'rgba(31, 41, 55, 0.8)', // gray-800 with opacity
          'backdrop-filter': 'blur(20px) saturate(1.4)',
          border: '1px solid rgba(55, 65, 81, 0.3)', // gray-700 with opacity
          'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(52, 211, 153, 0.1)',
        },
        '.glassmorphism-light': {
          background: 'rgba(255, 255, 255, 0.8)',
          'backdrop-filter': 'blur(20px) saturate(1.2)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};