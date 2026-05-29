import React from 'react';
import { useTheme } from '../context/ThemeContext';

// Main Preloader Component with multiple variants
const Preloader = ({ 
  variant = 'default', 
  size = 'medium', 
  text = 'Loading...', 
  className = '',
  showText = true,
  fullScreen = false 
}) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  // Minimalist Spinner Variant
  const SpinnerLoader = () => (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[#51faaa]/20 border-t-[#51faaa]`} />
  );

  // Minimalist Pulse Variant
  const PulseLoader = () => (
    <div className={`${sizeClasses[size]} animate-pulse rounded-full bg-[#51faaa]/20`} />
  );

  // Minimalist Dots Variant
  const DotsLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full bg-[#51faaa] animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  // Minimalist Ring Variant
  const RingLoader = () => (
    <div className={`${sizeClasses[size]} relative`}>
      <div className={`absolute inset-0 rounded-full border-2 border-[#51faaa]/20`} />
      <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-[#51faaa] animate-spin`} />
    </div>
  );

  // Minimalist Wave Variant
  const WaveLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 h-6 rounded-full bg-[#51faaa] animate-pulse`}
          style={{ 
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  // Minimalist Cube Variant
  const CubeLoader = () => (
    <div className={`${sizeClasses[size]} relative transform rotate-45`}>
      <div className={`absolute inset-0 rounded-lg bg-[#51faaa] animate-pulse`} />
      <div className={`absolute inset-1 rounded-lg ${isDark ? 'bg-[#0a0c19]' : 'bg-white'}`} />
    </div>
  );

  // Minimalist Gradient Spinner Variant
  const GradientSpinner = () => (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] animate-spin" />
      <div className={`absolute inset-1 rounded-full ${isDark ? 'bg-[#0a0c19]' : 'bg-white'}`} />
    </div>
  );

  // Minimalist Logo Spinner Variant
  const LogoSpinner = () => (
    <div className="relative">
      {/* Simple spinning ring */}
      <div className="w-24 h-24 rounded-full border-2 border-[#51faaa]/20 border-t-[#51faaa] animate-spin" style={{ animationDuration: '2s' }} />
      
      {/* Center logo */}
      <div className="absolute inset-4 w-16 h-16 rounded-full bg-[#51faaa] flex items-center justify-center shadow-lg">
        <div className="text-[#0a0c19] font-bold text-lg">M</div>
      </div>
    </div>
  );

  // Minimalist Skeleton Variant
  const SkeletonLoader = () => (
    <div className="space-y-3">
      <div className={`h-4 rounded bg-[#51faaa]/20 animate-pulse`} />
      <div className={`h-4 rounded w-5/6 bg-[#51faaa]/20 animate-pulse`} />
      <div className={`h-4 rounded w-4/6 bg-[#51faaa]/20 animate-pulse`} />
    </div>
  );

  // Minimalist Card Skeleton Variant
  const CardSkeleton = () => (
    <div className={`rounded-xl p-6 border ${isDark ? 'bg-[#0a0c19] border-[#51faaa]/20' : 'bg-white border-gray-200 shadow-lg'}`}>
      <div className="space-y-4">
        <div className={`h-6 rounded w-3/4 bg-[#51faaa]/20 animate-pulse`} />
        <div className={`h-4 rounded w-full bg-[#51faaa]/20 animate-pulse`} />
        <div className={`h-4 rounded w-5/6 bg-[#51faaa]/20 animate-pulse`} />
        <div className="flex space-x-2">
          <div className={`h-8 rounded w-20 bg-[#51faaa]/20 animate-pulse`} />
          <div className={`h-8 rounded w-20 bg-[#51faaa]/20 animate-pulse`} />
        </div>
      </div>
    </div>
  );

  // Minimalist Dashboard Skeleton Variant
  const DashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className={`h-8 rounded w-1/3 bg-[#51faaa]/20 animate-pulse`} />
        <div className={`h-4 rounded w-1/2 bg-[#51faaa]/20 animate-pulse`} />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`rounded-xl p-6 border ${isDark ? 'bg-[#0a0c19] border-[#51faaa]/20' : 'bg-white border-gray-200 shadow-lg'}`}>
            <div className="space-y-3">
              <div className={`h-4 rounded w-1/2 bg-[#51faaa]/20 animate-pulse`} />
              <div className={`h-8 rounded w-3/4 bg-[#51faaa]/20 animate-pulse`} />
              <div className={`h-3 rounded w-1/3 bg-[#51faaa]/20 animate-pulse`} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-xl p-6 border ${isDark ? 'bg-[#0a0c19] border-[#51faaa]/20' : 'bg-white border-gray-200 shadow-lg'}`}>
          <div className="space-y-4">
            <div className={`h-6 rounded w-1/4 bg-[#51faaa]/20 animate-pulse`} />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-4 rounded bg-[#51faaa]/20 animate-pulse`} />
              ))}
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-6 border ${isDark ? 'bg-[#0a0c19] border-[#51faaa]/20' : 'bg-white border-gray-200 shadow-lg'}`}>
          <div className="space-y-4">
            <div className={`h-6 rounded w-1/3 bg-[#51faaa]/20 animate-pulse`} />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-4 rounded bg-[#51faaa]/20 animate-pulse`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Minimalist Property Card Skeleton
  const PropertyCardSkeleton = () => (
    <div className={`rounded-xl overflow-hidden border ${isDark ? 'bg-[#0a0c19] border-[#51faaa]/20' : 'bg-white border-gray-200 shadow-lg'}`}>
      <div className={`h-48 bg-[#51faaa]/20 animate-pulse`} />
      <div className="p-4 space-y-3">
        <div className={`h-5 rounded w-3/4 bg-[#51faaa]/20 animate-pulse`} />
        <div className={`h-4 rounded w-1/2 bg-[#51faaa]/20 animate-pulse`} />
        <div className={`h-6 rounded w-1/3 bg-[#51faaa]/20 animate-pulse`} />
        <div className="flex space-x-2">
          <div className={`h-4 rounded w-16 bg-[#51faaa]/20 animate-pulse`} />
          <div className={`h-4 rounded w-16 bg-[#51faaa]/20 animate-pulse`} />
          <div className={`h-4 rounded w-16 bg-[#51faaa]/20 animate-pulse`} />
        </div>
      </div>
    </div>
  );

  // Get the appropriate loader component
  const getLoaderComponent = () => {
    switch (variant) {
      case 'spinner': return <SpinnerLoader />;
      case 'pulse': return <PulseLoader />;
      case 'dots': return <DotsLoader />;
      case 'ring': return <RingLoader />;
      case 'wave': return <WaveLoader />;
      case 'cube': return <CubeLoader />;
      case 'gradient': return <GradientSpinner />;
      case 'logo': return <LogoSpinner />;
      case 'skeleton': return <SkeletonLoader />;
      case 'card': return <CardSkeleton />;
      case 'dashboard': return <DashboardSkeleton />;
      case 'property': return <PropertyCardSkeleton />;
      default: return <SpinnerLoader />;
    }
  };

  // Full screen loader
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
        <div className="text-center space-y-6">
          {/* Logo and Spinner */}
          <div className="flex justify-center">
            {getLoaderComponent()}
          </div>
          
          {/* Loading Text */}
          {showText && (
            <div className="space-y-2">
              <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {text}
              </p>
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full bg-[#51faaa] animate-pulse`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular loader
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {getLoaderComponent()}
      {showText && (
        <p className={`${textSizes[size]} ${isDark ? 'text-[#dbd5a4]' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Convenience components for common use cases
export const PageLoader = ({ text = 'Welcome to Makao Homes' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0c19]">
    <div className="text-center space-y-8 max-w-md mx-auto px-6">
      {/* Minimalist Logo Container */}
      <div className="relative mx-auto w-32 h-32">
        {/* Simple spinning ring */}
        <div className="w-32 h-32 rounded-full border-2 border-[#51faaa]/20 border-t-[#51faaa] animate-spin" style={{ animationDuration: '2s' }} />
        
        {/* Center logo */}
        <div className="absolute inset-8 w-16 h-16 rounded-full bg-[#51faaa] flex items-center justify-center shadow-lg">
          <div className="text-[#0a0c19] font-bold text-2xl">M</div>
        </div>
      </div>
      
      {/* Clean Typography */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white tracking-wide">
          {text}
        </h1>
        <p className="text-lg text-[#dbd5a4] font-medium">
          Finding your perfect home
        </p>
      </div>
      
      {/* Minimal loading dots */}
      <div className="flex justify-center space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full bg-[#51faaa] animate-pulse`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export const DashboardLoader = ({ text = 'Loading your dashboard...' }) => (
  <Preloader variant="dashboard" text={text} />
);

export const PropertyLoader = ({ text = 'Loading properties...' }) => (
  <Preloader variant="property" text={text} />
);

export const CardLoader = ({ text = 'Loading...' }) => (
  <Preloader variant="card" text={text} />
);

export const SpinnerLoader = ({ text = 'Loading...', size = 'medium' }) => (
  <Preloader variant="spinner" size={size} text={text} />
);

export const DotsLoader = ({ text = 'Loading...', size = 'medium' }) => (
  <Preloader variant="dots" size={size} text={text} />
);

export const SkeletonLoader = ({ text = 'Loading...' }) => (
  <Preloader variant="skeleton" text={text} />
);

export default Preloader;
