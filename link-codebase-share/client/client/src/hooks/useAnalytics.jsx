import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../lib/analytics';
import { incrementPageView } from '../lib/pageViews';

// Custom hook for analytics
export const useAnalytics = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Track page views automatically
  useEffect(() => {
    const pageName = location.pathname;
    const pageTitle = document.title;
    
    analyticsService.trackPageView(pageName, pageTitle);
    
    // Track page view in database
    incrementPageView(pageName);
    
    // Set user ID if logged in
    if (currentUser?.uid) {
      analyticsService.setUser(currentUser.uid, {
        email: currentUser.email,
        display_name: currentUser.displayName,
        user_type: currentUser.userType || 'user'
      });
    }
  }, [location.pathname, currentUser]);

  // Wrapper functions for common analytics events
  const trackPropertyView = useCallback((property) => {
    analyticsService.trackPropertyView(
      property.id || property.propertyId,
      property.title || property.name,
      property.price,
      property.location?.address || property.address
    );
  }, []);

  const trackSearch = useCallback((query, type = 'general', resultsCount = 0) => {
    analyticsService.trackSearch(query, type, resultsCount);
  }, []);

  const trackPropertyContact = useCallback((propertyId, method = 'inquiry') => {
    analyticsService.trackPropertyContact(propertyId, method);
  }, []);

  const trackFavorite = useCallback((propertyId, action = 'add') => {
    analyticsService.trackFavorite(propertyId, action);
  }, []);

  const trackFilter = useCallback((filterType, filterValue) => {
    analyticsService.trackFilter(filterType, filterValue);
  }, []);

  const trackCustomEvent = useCallback((eventName, parameters = {}) => {
    analyticsService.trackCustomEvent(eventName, parameters);
  }, []);

  const trackError = useCallback((errorType, errorMessage, context = {}) => {
    analyticsService.trackError(errorType, errorMessage, context);
  }, []);

  return {
    trackPropertyView,
    trackSearch,
    trackPropertyContact,
    trackFavorite,
    trackFilter,
    trackCustomEvent,
    trackError,
    analyticsService // Direct access to the service
  };
};

export default useAnalytics;
