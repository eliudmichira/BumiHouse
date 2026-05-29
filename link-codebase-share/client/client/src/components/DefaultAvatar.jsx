import React from 'react';
import { useTheme } from '../context/ThemeContext';

const DefaultAvatar = ({ 
  name = 'User', 
  size = 'md', 
  className = '',
  showVerification = false 
}) => {
  const { isDark } = useTheme();

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  };

  // Generate a consistent color based on name
  const getColorFromName = (name) => {
    if (!name) return 'from-[#51faaa] to-[#dbd5a4]';
    
    const colors = [
      'from-[#51faaa] to-[#dbd5a4]',
      'from-[#dbd5a4] to-[#51faaa]',
      'from-[#51faaa] to-[#45e595]',
      'from-[#45e595] to-[#51faaa]',
      'from-[#dbd5a4] to-[#45e595]',
      'from-[#45e595] to-[#dbd5a4]'
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const initials = getInitials(name);
  const gradientClass = getColorFromName(name);

  return (
    <div className={`relative ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        rounded-full 
        bg-gradient-to-br ${gradientClass}
        flex items-center justify-center 
        font-bold text-[#0a0c19]
        shadow-lg
        animate-pulse
        border-2 border-white/20
        ${isDark ? 'border-[#51faaa]/20' : 'border-gray-200'}
      `}>
        {initials}
      </div>
      
      {showVerification && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#51faaa] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
          <svg className="w-3 h-3 text-[#0a0c19]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default DefaultAvatar;
