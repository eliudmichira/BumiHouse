import React from 'react';
import useAnalytics from '../hooks/useAnalytics';

const AnalyticsProvider = ({ children }) => {
  // Initialize analytics inside Router context
  useAnalytics();
  
  return <>{children}</>;
};

export default AnalyticsProvider;
