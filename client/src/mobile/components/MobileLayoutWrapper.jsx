import React from 'react';
import MobileNavigation from './MobileNavigation';
import ErrorBoundary from '../../components/ErrorBoundary';

// Mobile Layout Wrapper with Top and Bottom Navigation
const MobileLayoutWrapper = ({ children, title = "BumiHouse", subtitle, showNav = true }) => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900" role="main" aria-label={title}>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden lg:pb-0 relative">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          {/* Spacer so last content can scroll above the bottom nav (single spacer; nav is ~80px) */}
          <div className="h-32 pointer-events-none w-full shrink-0" aria-hidden="true" />
        </main>

        {/* Bottom Navigation */}
        {showNav && <MobileNavigation />}
      </div>
    </ErrorBoundary>
  );
};

export default MobileLayoutWrapper;

