import React from 'react';

const MaterialIcon = ({ 
  icon, 
  variant = 'outlined', 
  size = 24, 
  className = '', 
  style = {},
  onClick,
  ...props 
}) => {
  // Map variants to CSS classes
  const variantClasses = {
    filled: 'material-icons',
    outlined: 'material-icons-outlined',
    rounded: 'material-icons-round',
    sharp: 'material-icons-sharp',
    twoTone: 'material-icons-two-tone',
    // Material Symbols variants
    symbols: 'material-symbols-outlined',
    symbolsRounded: 'material-symbols-rounded',
    symbolsSharp: 'material-symbols-sharp'
  };

  const iconClass = variantClasses[variant] || 'material-icons-outlined';

  return (
    <span
      className={`${iconClass} ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      onClick={onClick}
      {...props}
    >
      {icon}
    </span>
  );
};

export default MaterialIcon;
