import React from 'react';

const Logo = ({ className = "", isDark = true }) => {
  return (
    <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"} ${className}`}>
      <div className="leading-tight">
        <div className="text-xl sm:text-2xl lg:text-3xl">Hama</div>
        <div className="text-xl sm:text-2xl lg:text-3xl">Estate</div>
      </div>
    </div>
  );
};

export default Logo;
