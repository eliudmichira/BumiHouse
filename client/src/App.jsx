import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './routes/layout/layout';
import ErrorBoundary from './components/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';
import EnvironmentValidator from './components/EnvironmentValidator';
import { PageLoader } from './components/Preloader';
import { testFirebaseConnection } from './lib/firebase';
import { NotificationProvider } from './context/NotificationContext';
import { HelmetProvider } from 'react-helmet-async';
import { useBackButton } from './hooks/useBackButton';
import { useMobileDetection } from './hooks/useMobileDetection';

// Lazy load components for better performance
const HomePage = lazy(() => import('./routes/homePage/HomePage'));
const AreaDirectory = lazy(() => import('./routes/areaDirectory/AreaDirectory'));
const RentBuyKenyaPage = lazy(() => import('./routes/rentakenya/PropertyOwnerPortal'));
const Contact = lazy(() => import('./routes/contact/contact'));
const Agents = lazy(() => import('./routes/agents/Agents'));
const Blog = lazy(() => import('./routes/blog/Blog'));
const MobileResponsiveWrapper = lazy(() => import('./mobile/components/MobileResponsiveWrapper'));
const MobileLayoutWrapper = lazy(() => import('./mobile/components/MobileLayoutWrapper'));

// Legal pages
const Privacy = lazy(() => import('../pages/Privacy'));
const Terms = lazy(() => import('../pages/Terms'));
const Cookies = lazy(() => import('../pages/Cookies'));

// Direct import for critical legal page to avoid loading issues
import DataDeletion from './pages/DataDeletion';

// Mobile-specific pages
const MobilePropertyList = lazy(() => import('./mobile/pages/MobilePropertyList'));
const MobilePropertySearch = lazy(() => import('./routes/listPage/listPage_fixed_useLocation'));
const MobilePropertyDetails = lazy(() => import('./mobile/pages/MobilePropertyDetails'));
const MobileAuth = lazy(() => import('./mobile/pages/MobileAuth'));
const MobileDashboard = lazy(() => import('./routes/dashboard/dashboard'));
const MobileMessages = lazy(() => import('./mobile/pages/MobileMessages'));
const MobileProfileScreen = lazy(() => import('./mobile/pages/MobileProfileScreen'));
const MobileFavoritesPage = lazy(() => import('./mobile/pages/MobileFavoritesPage'));
const MobileSavedSearchesPage = lazy(() => import('./mobile/pages/MobileSavedSearchesPage'));
const MobileRecentlyViewedPage = lazy(() => import('./mobile/pages/MobileRecentlyViewedPage'));
const MobileActivityPage = lazy(() => import('./mobile/pages/MobileActivityPage'));
const MobileRecommendationsPage = lazy(() => import('./mobile/pages/MobileRecommendationsPage'));
const MobileInsightsPage = lazy(() => import('./mobile/pages/MobileInsightsPage'));
const MobilePriceAlertsPage = lazy(() => import('./mobile/pages/MobilePriceAlertsPage'));
const MobilePropertyMatchPage = lazy(() => import('./mobile/pages/MobilePropertyMatchPage'));
const MobileEditProfilePage = lazy(() => import('./mobile/pages/MobileEditProfilePage'));
const MobileEditAgentProfile = lazy(() => import('./mobile/pages/MobileEditAgentProfile'));
const MobileEditAgentBio = lazy(() => import('./mobile/pages/MobileEditAgentBio'));
const MobileEditAgentSocial = lazy(() => import('./mobile/pages/MobileEditAgentSocial'));
const MobileAgentProfile = lazy(() => import('./mobile/pages/MobileAgentProfile'));
const MobileSettingsPage = lazy(() => import('./mobile/pages/MobileSettingsPage'));
const MobileNotificationsPage = lazy(() => import('./mobile/pages/MobileNotificationsPage'));
const MobileSupportPage = lazy(() => import('./mobile/pages/MobileSupportPage'));
const MobileAddProperty = lazy(() => import('./mobile/pages/MobileAddProperty'));

// Desktop pages
const PropertyDetails = lazy(() => import('./routes/propertyDetails/propertyDetails'));
const ListPage = lazy(() => import('./routes/listPage/listPage_fixed_useLocation'));
// Desktop /login and /register now route to the shared <MobileAuth /> screen (see /auth).
const Dashboard = lazy(() => import('./routes/dashboard/dashboard'));
const ResponsiveDashboardRedirect = lazy(() => import('./routes/dashboard/ResponsiveDashboardRedirect'));
const ScrapingDashboard = lazy(() => import('./pages/ScrapingDashboard'));
const AdminPanel = lazy(() => import('./routes/admin/AdminPanel'));
const ProfilePage = lazy(() => import('./routes/profilePage/profilePage'));
const AgentVerificationPage = lazy(() => import('./routes/agent-verification/AgentVerificationPage'));
const AddProperty = lazy(() => import('./routes/properties/AddProperty'));
const TrialLogin = lazy(() => import('./routes/trial-login/TrialLogin'));
const TrialDashboard = lazy(() => import('./routes/trial-dashboard/TrialDashboard'));
const PropertyManagement = lazy(() => import('./routes/trial-dashboard/PropertyManagement'));
const TenantManagement = lazy(() => import('./routes/trial-dashboard/TenantManagement'));
const RentCollection = lazy(() => import('./routes/trial-dashboard/RentCollection'));
const MaintenanceManagement = lazy(() => import('./routes/trial-dashboard/MaintenanceManagement'));
const FinancialReports = lazy(() => import('./routes/trial-dashboard/FinancialReports'));
const DocumentStorage = lazy(() => import('./routes/trial-dashboard/DocumentStorage'));
const PaymentRecording = lazy(() => import('./routes/trial-dashboard/PaymentRecording'));

// Messages page
const Messages = lazy(() => import('./routes/messages/Messages'));

// Tenant Portal
const TenantLogin = lazy(() => import('./routes/tenant-portal/TenantLoginSimple'));
const TenantDashboardLayout = lazy(() => import('./routes/tenant-portal/TenantDashboardLayout'));
const TenantOverview = lazy(() => import('./routes/tenant-portal/overview/Overview'));
const TenantPayments = lazy(() => import('./routes/tenant-portal/payments/Payments'));
const TenantMaintenance = lazy(() => import('./routes/tenant-portal/maintenance/Maintenance'));
const TenantReceipts = lazy(() => import('./routes/tenant-portal/receipts/Receipts'));
const TenantSupport = lazy(() => import('./routes/tenant-portal/support/Support'));

const ResponsiveComponent = ({ desktopComponent, mobileComponent }) => {
  const { isMobile, isMounted } = useMobileDetection(1024);

  // Prevent hydration issues and flicker by not rendering until mounted
  if (!isMounted) return <PageLoader />;

  return isMobile ? mobileComponent : desktopComponent;
};



// Inner component to access router hooks
function AppContent() {
  useBackButton();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Critical Legal Page - Top Priority - Standalone to avoid Layout issues */}
        <Route path="/account-deletion" element={
          <div className="layout min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
            <DataDeletion />
          </div>
        } />

        {/* Responsive Aliases for common paths */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth?mode=signup" replace />} />
        <Route path="/add-property" element={
          <ResponsiveComponent
            desktopComponent={<AddProperty />}
            mobileComponent={
              <MobileLayoutWrapper title="Add Property" subtitle="List your property">
                <MobileAddProperty />
              </MobileLayoutWrapper>
            }
          />
        } />
        <Route path="/profile" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<Navigate to="/dashboard" replace />}
          />
        } />

        {/* Mobile route - no layout, no footer */}
        <Route path="/" element={<MobileResponsiveWrapper />} />

        {/* Mobile-specific routes with navigation wrapper */}
        <Route path="/search" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/properties" replace />}
            mobileComponent={
              <MobileLayoutWrapper title="Search Properties" subtitle="Find your perfect home">
                <MobilePropertySearch />
              </MobileLayoutWrapper>
            }
          />
        } />
        <Route path="/property/:id" element={
          <ResponsiveComponent
            desktopComponent={<PropertyDetails />}
            mobileComponent={<MobilePropertyDetails />}
          />
        } />
        <Route path="/agents" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/desktop/agents" replace />}
            mobileComponent={<MobileLayoutWrapper title="Agents"><MobileAgentProfile /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/blog" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/desktop/blog" replace />}
            mobileComponent={<MobileLayoutWrapper title="Blog"><Blog /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/auth" element={
          <ResponsiveComponent
            desktopComponent={<MobileAuth />}
            mobileComponent={
              <MobileLayoutWrapper title="Authentication" subtitle="Sign in to your account" showNav={false}>
                <MobileAuth />
              </MobileLayoutWrapper>
            }
          />
        } />
        <Route path="/dashboard" element={
          <ResponsiveComponent
            desktopComponent={<ResponsiveDashboardRedirect />}
            mobileComponent={<MobileDashboard />}
          />
        } />

        {/* New mobile-optimized routes with navigation wrapper */}
        <Route path="/properties" element={
          <ResponsiveComponent
            desktopComponent={<ListPage />}
            mobileComponent={
              <MobileLayoutWrapper title="Properties" subtitle="Browse all properties">
                <MobilePropertyList />
              </MobileLayoutWrapper>
            }
          />
        } />
        <Route path="/mobile-property/:id" element={
          <MobilePropertyDetails />
        } />
        <Route path="/agent/:id" element={<MobileAgentProfile />} />
        <Route path="/favorites" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account?tab=favorites" replace />}
            mobileComponent={
              <MobileLayoutWrapper title="Favorites" subtitle="Your saved properties">
                <MobileFavoritesPage />
              </MobileLayoutWrapper>
            }
          />
        } />

        {/* Profile sub-pages (functional) */}
        <Route path="/saved-searches" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Saved Searches"><MobileSavedSearchesPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/history" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Recently Viewed"><MobileRecentlyViewedPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/activity" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Activity"><MobileActivityPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/recommendations" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Recommendations"><MobileRecommendationsPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/insights" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Insights"><MobileInsightsPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/alerts" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Price Alerts"><MobilePriceAlertsPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/match" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Property Match"><MobilePropertyMatchPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/profile/edit" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Edit Profile"><MobileEditProfilePage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/profile/edit/agent" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Edit Agent Profile"><MobileEditAgentProfile /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/profile/edit/agent/bio" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Edit Bio"><MobileEditAgentBio /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/profile/edit/agent/social" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account" replace />}
            mobileComponent={<MobileLayoutWrapper title="Edit Social Links"><MobileEditAgentSocial /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/settings" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/account?tab=settings" replace />}
            mobileComponent={<MobileLayoutWrapper title="Settings"><MobileSettingsPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/notifications" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/dashboard" replace />}
            mobileComponent={<MobileLayoutWrapper title="Notifications"><MobileNotificationsPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/support" element={
          <ResponsiveComponent
            desktopComponent={<Navigate to="/contact" replace />}
            mobileComponent={<MobileLayoutWrapper title="Support"><MobileSupportPage /></MobileLayoutWrapper>}
          />
        } />
        <Route path="/contact" element={
          <ResponsiveComponent
            desktopComponent={
              <Layout>
                <Contact />
              </Layout>
            }
            mobileComponent={
              <MobileLayoutWrapper title="Contact"><Contact /></MobileLayoutWrapper>
            }
          />
        } />

        {/* Desktop routes WITH layout (navbar + footer) */}
        <Route path="/desktop" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="rentakenya" element={<RentBuyKenyaPage />} />
          <Route path="contact" element={<Contact />} />
          <Route path="agents" element={<Agents />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<Blog />} />
          <Route path="areas" element={<AreaDirectory />} />
        </Route>

        {/* Legal pages WITH layout */}
        <Route path="/privacy" element={<Layout />}>
          <Route index element={<Privacy />} />
        </Route>
        <Route path="/terms" element={<Layout />}>
          <Route index element={<Terms />} />
        </Route>
        <Route path="/cookies" element={<Layout />}>
          <Route index element={<Cookies />} />
        </Route>

        {/* Desktop routes WITHOUT layout (standalone pages) */}
        <Route path="/desktop/properties" element={<ListPage />} />
        <Route path="/scraping" element={<ScrapingDashboard />} />
        <Route path="/properties/add" element={<AddProperty />} />
        <Route path="/desktop/properties/add" element={<AddProperty />} />
        <Route path="/desktop/property/:id" element={<PropertyDetails />} />
        <Route path="/desktop/login" element={<Navigate to="/auth" replace />} />
        <Route path="/desktop/register" element={<Navigate to="/auth?mode=signup" replace />} />
        <Route path="/desktop/dashboard" element={<ResponsiveDashboardRedirect />} />

        {/* Account route (Responsive) */}
        <Route path="/account" element={
          <ResponsiveComponent
            desktopComponent={<Layout />}
            mobileComponent={<MobileProfileScreen />}
          />
        }>
          <Route index element={
            <ResponsiveComponent
              desktopComponent={<ProfilePage />}
              mobileComponent={null}
            />
          } />
        </Route>

        <Route path="/agent-verification" element={<AgentVerificationPage />} />

        {/* Messages route */}
        <Route path="/messages" element={
          <ResponsiveComponent desktopComponent={<Messages />} mobileComponent={<MobileMessages />} />
        } />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/desktop/admin" element={<AdminPanel />} />

        {/* Trial routes */}
        <Route path="/trial-login" element={<TrialLogin />} />
        <Route path="/trial-dashboard" element={<TrialDashboard />} />
        <Route path="/trial-dashboard/properties" element={<PropertyManagement />} />
        <Route path="/trial-dashboard/tenants" element={<TenantManagement />} />
        <Route path="/trial-dashboard/rent-collection" element={<RentCollection />} />
        <Route path="/trial-dashboard/maintenance" element={<MaintenanceManagement />} />
        <Route path="/trial-dashboard/reports" element={<FinancialReports />} />
        <Route path="/trial-dashboard/documents" element={<DocumentStorage />} />
        <Route path="/trial-dashboard/payments" element={<PaymentRecording />} />

        {/* Tenant Portal routes (nested) */}
        <Route path="/tenant-login" element={<TenantLogin />} />
        <Route path="/tenant-dashboard" element={<TenantDashboardLayout />}>
          <Route index element={<TenantOverview />} />
          <Route path="payments" element={<TenantPayments />} />
          <Route path="maintenance" element={<TenantMaintenance />} />
          <Route path="receipts" element={<TenantReceipts />} />
          <Route path="support" element={<TenantSupport />} />
        </Route>

        {/* 404 - Page Not Found */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-700 mb-4">404</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Page not found</p>
            <a href="/" className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
              Go Home
            </a>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

function App() {
  const [environmentValid, setEnvironmentValid] = useState(null);
  const [showEnvironmentValidator, setShowEnvironmentValidator] = useState(true);
  const [appWatchdogArmed, setAppWatchdogArmed] = useState(false);

  console.log('🚀 App rendering. Current path:', window.location.pathname);

  // Test Firebase connection on app start (DEV only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      const testConnection = async () => {
        const result = await testFirebaseConnection();
        if (result.success) {
          console.log('🎉 Firebase is connected and working!');
        } else {
          console.error('💥 Firebase connection failed:', result.error);
        }
      };
      testConnection();
    }
  }, []);

  // Safety watchdog: never let app initialization block forever
  useEffect(() => {
    if (appWatchdogArmed) return; // arm only once
    setAppWatchdogArmed(true);
    const watchdog = setTimeout(() => {
      if (environmentValid === null || showEnvironmentValidator) {
        if (import.meta.env.DEV) {
          console.warn('⏱️ App init watchdog: forcing UI to continue without waiting for env/analytics');
        }
        setShowEnvironmentValidator(false);
        if (environmentValid === null) {
          setEnvironmentValid(true);
        }
      }
    }, 8000); // 8s max wait
    return () => clearTimeout(watchdog);
  }, [environmentValid, showEnvironmentValidator, appWatchdogArmed]);

  // Retry failed analytics events periodically
  useEffect(() => {
    if (environmentValid) {
      const retryInterval = setInterval(() => {
        // Import analytics service and retry failed events
        import('./lib/analytics').then(({ default: analyticsService }) => {
          analyticsService.retryFailedEvents();
        });
      }, 30000); // Retry every 30 seconds

      return () => clearInterval(retryInterval);
    }
  }, [environmentValid]);

  const handleEnvironmentValidation = (results) => {
    setEnvironmentValid(results.isValid || results.forceContinue);
    setShowEnvironmentValidator(false);

    if (!results.isValid && !results.forceContinue) {
      if (import.meta.env.DEV) {
        console.error('❌ Environment validation failed:', results.errors);
      }
    } else {
      if (import.meta.env.DEV) {
        console.log('✅ Environment validation passed');
      }
    }
  };

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <PerformanceMonitor />
        {showEnvironmentValidator && (
          <EnvironmentValidator onValidationComplete={handleEnvironmentValidation} />
        )}
        <Router>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;