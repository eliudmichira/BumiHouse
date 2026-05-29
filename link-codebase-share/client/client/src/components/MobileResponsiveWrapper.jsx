import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import HomeMobile from '../../pages/HomeMobile';
import { useMobileDetection } from '../hooks/useMobileDetection';

const MobileResponsiveWrapper = () => {
  const { isMobile, isMounted } = useMobileDetection();
  const location = useLocation();

  // Don't render anything until we know the device type
  if (!isMounted) {
    return null;
  }

  // Show mobile version on mobile devices, desktop version on larger screens
  if (isMobile) {
    // Check if we're on a mobile-specific route
    const mobileRoutes = ['/search', '/property', '/auth', '/dashboard'];
    const isMobileRoute = mobileRoutes.some(route => location.pathname.startsWith(route));
    
    if (isMobileRoute) {
      // Let the mobile route handle itself
      return null;
    }
    
    // Show mobile home for root path
    if (location.pathname === '/') {
      return <HomeMobile />;
    }
    
    // For other paths, redirect to mobile home
    return <Navigate to="/" replace />;
  }

  // Desktop users get redirected to desktop route
  return <Navigate to="/desktop" replace />;
};

export default MobileResponsiveWrapper;
