// Enterprise-level Design System
export const designTokens = {
  // Brand Colors (Google Material Design 3 inspired)
  colors: {
    primary: {
      50: '#f0fdf7',
      100: '#dcfce7', 
      400: '#51faaa',
      500: '#3fd693',
      600: '#2dd284',
      700: '#1fb372',
      800: '#15803d',
      900: '#0f5132'
    },
    secondary: {
      50: '#fefdf8',
      100: '#fefbf3',
      200: '#dbd5a4',
      300: '#c9c285',
      400: '#b7af66',
      500: '#a59c47'
    },
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a'
    },
    semantic: {
      success: {
        light: '#dcfce7',
        base: '#16a34a',
        dark: '#15803d'
      },
      warning: {
        light: '#fef3c7',
        base: '#f59e0b',
        dark: '#d97706'
      },
      error: {
        light: '#fee2e2',
        base: '#dc2626',
        dark: '#b91c1c'
      },
      info: {
        light: '#dbeafe',
        base: '#2563eb',
        dark: '#1d4ed8'
      }
    }
  },

  // Typography Scale (Google Fonts inspired)
  typography: {
    fontFamily: {
      sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Inconsolata', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }]
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    }
  },

  // Spacing Scale (8pt grid system)
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    44: '11rem',     // 176px
    48: '12rem',     // 192px
    52: '13rem',     // 208px
    56: '14rem',     // 224px
    60: '15rem',     // 240px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem'      // 384px
  },

  // Border Radius (Smooth, Apple-like)
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Shadows (Material Design 3 inspired)
  boxShadow: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Brand shadows
    primary: '0 10px 40px -10px rgba(81, 250, 170, 0.3)',
    secondary: '0 10px 40px -10px rgba(219, 213, 164, 0.3)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms'
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0.0, 1, 1)',
      out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      // Custom Google-like easings
      emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
      emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
      emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
      standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)'
    }
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },

  // Breakpoints (Mobile-first)
  screens: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px'
  }
};

// Component Variants
export const componentVariants = {
  button: {
    primary: {
      bg: 'bg-gradient-to-r from-primary-400 to-primary-500',
      text: 'text-white',
      hover: 'hover:from-primary-500 hover:to-primary-600',
      focus: 'focus:ring-4 focus:ring-primary-500/25',
      shadow: 'shadow-primary'
    },
    secondary: {
      bg: 'bg-white/10 backdrop-blur-xl border border-white/20',
      text: 'text-gray-900 dark:text-white',
      hover: 'hover:bg-white/20 hover:border-white/30',
      focus: 'focus:ring-4 focus:ring-white/25',
      shadow: 'shadow-glass'
    }
  },
  card: {
    elevated: {
      bg: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
      border: 'border border-gray-200/50 dark:border-gray-700/50',
      shadow: 'shadow-xl',
      rounded: 'rounded-2xl'
    },
    glass: {
      bg: 'bg-white/10 backdrop-blur-xl',
      border: 'border border-white/20',
      shadow: 'shadow-glass',
      rounded: 'rounded-2xl'
    }
  }
};

export default designTokens;
