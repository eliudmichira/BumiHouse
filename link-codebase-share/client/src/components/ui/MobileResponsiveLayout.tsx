import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Mobile-specific layout components
export interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'transparent' | 'glass' | 'solid' | 'gradient';
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className = '',
  padding = 'md',
  background = 'transparent'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const backgroundClasses = {
    transparent: '',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
    solid: 'bg-gray-900/95',
    gradient: 'bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        min-h-screen w-full
        ${paddingClasses[padding]}
        ${backgroundClasses[background]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

// Mobile Header Component
export interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  variant?: 'default' | 'transparent' | 'glass';
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800',
    transparent: 'bg-transparent',
    glass: 'bg-white/10 backdrop-blur-xl border-b border-white/20'
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        sticky top-0 z-40 px-4 py-3
        ${variantClasses[variant]}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {leftAction && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {leftAction}
            </motion.div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {rightAction}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

// Mobile Content Area
export interface MobileContentProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const MobileContent: React.FC<MobileContentProps> = ({
  children,
  className = '',
  scrollable = true,
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`
        flex-1 w-full
        ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </motion.main>
  );
};

// Mobile Bottom Navigation
export interface MobileNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  onClick: () => void;
}

export interface MobileBottomNavProps {
  items: MobileNavItem[];
  activeItem?: string;
  variant?: 'default' | 'glass' | 'solid';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items,
  activeItem,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-gray-900/95 backdrop-blur-xl border-t border-gray-800',
    glass: 'bg-white/10 backdrop-blur-xl border-t border-white/20',
    solid: 'bg-gray-900 border-t border-gray-800'
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        fixed bottom-0 left-0 right-0 z-50
        ${variantClasses[variant]}
        pb-safe
      `}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={item.onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              flex flex-col items-center justify-center w-16 h-16 rounded-xl
              transition-all duration-200 relative
              ${activeItem === item.id
                ? 'bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }
            `}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                </motion.div>
              )}
            </div>
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
};

// Mobile Card Component
export interface MobileCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  onClick?: () => void;
  interactive?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  interactive = false
}) => {
  const variantClasses = {
    default: 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
    elevated: 'bg-gray-800 shadow-xl border border-gray-700',
    outlined: 'bg-transparent border-2 border-gray-700'
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
    : '';

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={`
        rounded-2xl p-4 transition-all duration-300
        ${variantClasses[variant]}
        ${interactiveClasses}
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

// Mobile Button Component
export interface MobileButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = ''
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] hover:shadow-lg',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    outline: 'border-2 border-[#51faaa] text-[#51faaa] hover:bg-[#51faaa] hover:text-[#0a0c19]',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        rounded-xl font-semibold transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

// Mobile List Item Component
export interface MobileListItemProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  rightContent?: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'elevated';
}

export const MobileListItem: React.FC<MobileListItemProps> = ({
  title,
  subtitle,
  icon,
  rightContent,
  onClick,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-gray-800/50 hover:bg-gray-700/50',
    glass: 'bg-white/10 hover:bg-white/20',
    elevated: 'bg-gray-800 hover:bg-gray-700 shadow-lg'
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      whileTap={{ scale: onClick ? 0.99 : 1 }}
      className={`
        flex items-center space-x-3 p-4 rounded-xl transition-all duration-200
        ${variantClasses[variant]}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {icon && (
        <div className="flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{title}</h3>
        {subtitle && (
          <p className="text-gray-400 text-sm truncate">{subtitle}</p>
        )}
      </div>
      {rightContent && (
        <div className="flex-shrink-0">
          {rightContent}
        </div>
      )}
    </motion.div>
  );
};

// Mobile Section Component
export interface MobileSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export const MobileSection: React.FC<MobileSectionProps> = ({
  title,
  subtitle,
  children,
  className = ''
}) => {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || subtitle) && (
        <div className="px-4">
          {title && (
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

// Mobile Grid Component
export interface MobileGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className = ''
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={`
      grid ${columnClasses[columns]} ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Mobile Spacer Component
export interface MobileSpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const MobileSpacer: React.FC<MobileSpacerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12'
  };

  return <div className={`${sizeClasses[size]} ${className}`} />;
};

// Mobile Divider Component
export const MobileDivider: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  return (
    <div className={`h-px bg-gray-700/50 ${className}`} />
  );
};
