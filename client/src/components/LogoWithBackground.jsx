import React from 'react';
import logoImage from '../../assets/android-chrome-512x512.png';

const LogoWithBackground = ({ className = "" }) => {
  return (
    <div className={`bg-gray-900 p-6 rounded-lg ${className}`}>
      <div className="font-bold text-white">
        <div className="leading-tight">
          <img src={logoImage} alt="BumiHouse" className="w-16 h-16 object-contain" />
        </div>
      </div>
    </div>
  );
};


export default LogoWithBackground;

