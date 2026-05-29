import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const SimpleFooter = () => {
  const { isDark } = useTheme();
  
  return (
    <footer className={`transition-colors duration-500 ${
      isDark 
        ? 'bg-[#0a0c19] border-t border-[rgba(81,250,170,0.2)]' 
        : 'bg-gray-900 border-t border-gray-700'
    }`}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`font-outfit text-sm ${
            isDark ? 'text-[#ccc]' : 'text-gray-300'
          }`}>
            © 2024 Hama Estate. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit text-sm ${
              isDark ? 'text-[#ccc]' : 'text-gray-300'
            }`}>
              Privacy Policy
            </Link>
            <Link to="/terms" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit text-sm ${
              isDark ? 'text-[#ccc]' : 'text-gray-300'
            }`}>
              Terms of Service
            </Link>
            <Link to="/cookies" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit text-sm ${
              isDark ? 'text-[#ccc]' : 'text-gray-300'
            }`}>
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
