import React from 'react';

const LogoWithBackground = ({ className = "" }) => {
  return (
    <div className={`bg-gray-900 p-6 rounded-lg ${className}`}>
      <div className="font-bold text-white">
        <div className="leading-tight">
          <div className="text-3xl sm:text-4xl">Hama</div>
          <div className="text-3xl sm:text-4xl">Estate</div>
        </div>
      </div>
    </div>
  );
};

export default LogoWithBackground;
