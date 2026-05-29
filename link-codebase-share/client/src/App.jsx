import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './routes/layout/layout';
import ErrorBoundary from './components/ErrorBoundary';
import { testFirebaseConnection } from './lib/firebase';

// Lazy load components for better performance
const HomePage = lazy(() => import('./routes/homePage/HomePage'));
const RentaKenyaPage = lazy(() => import('./routes/rentakenya/PropertyOwnerPortal'));
const Contact = lazy(() => import('./routes/contact/contact'));
const Agents = lazy(() => import('./routes/agents/Agents'));
const MobileResponsiveWrapper = lazy(() => import('./components/MobileResponsiveWrapper'));
const MobileLayoutWrapper = lazy(() => import('./components/MobileLayoutWrapper'));

// Legal pages
const Privacy = lazy(() => import('../pages/Privacy'));
const Terms = lazy(() => import('../pages/Terms'));
const Cookies = lazy(() => import('../pages/Cookies'));

// Mobile-specific pages - using desktop components for now to avoid Router context issues
const MobilePropertySearch = lazy(() => import('./routes/listPage/listPage_fixed_useLocation'));
const MobilePropertyDetails = lazy(() => import('./routes/propertyDetails/propertyDetails'));
const MobileAuth = lazy(() => import('./routes/login/login'));
const MobileDashboard = lazy(() => import('./routes/dashboard/dashboard'));

// New mobile-optimized pages
const MobilePropertyList = lazy(() => import('./routes/mobile/MobilePropertyList'));
const MobilePropertyDetailsNew = lazy(() => import('./routes/mobile/MobilePropertyDetails'));

// Desktop pages
const PropertyDetails = lazy(() => import('./routes/propertyDetails/propertyDetails'));
const ListPage = lazy(() => import('./routes/listPage/listPage_fixed_useLocation'));
const Login = lazy(() => import('./routes/login/login'));
const Register = lazy(() => import('./routes/register/register'));
const Dashboard = lazy(() => import('./routes/dashboard/dashboard'));
const ScrapingDashboard = lazy(() => import('./pages/ScrapingDashboard'));
const AdminPanel = lazy(() => import('./routes/admin/AdminPanel'));
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
const TenantLogin = lazy(() => import('./routes/tenant-portal/TenantLogin'));
const TenantDashboard = lazy(() => import('./routes/tenant-portal/TenantDashboard'));

function App() {
  // Test Firebase connection on app start
  useEffect(() => {
    const testConnection = async () => {
      const result = await testFirebaseConnection();
      if (result.success) {
        console.log('🎉 Firebase is connected and working!');
      } else {
        console.error('💥 Firebase connection failed:', result.error);
      }
    };
    
    testConnection();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#51faaa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Welcome to Hama Estate</p>
            </div>
          </div>
        }>
          <Routes>
            {/* Mobile route - no layout, no footer */}
            <Route path="/" element={<MobileResponsiveWrapper />} />
            
            {/* Mobile-specific routes with navigation wrapper */}
            <Route path="/search" element={
              <MobileLayoutWrapper title="Search Properties" subtitle="Find your perfect home">
                <MobilePropertySearch />
              </MobileLayoutWrapper>
            } />
            <Route path="/property/:id" element={
              <MobileLayoutWrapper title="Property Details" subtitle="View property information">
                <MobilePropertyDetails />
              </MobileLayoutWrapper>
            } />
            <Route path="/auth" element={
              <MobileLayoutWrapper title="Authentication" subtitle="Sign in to your account">
                <MobileAuth />
              </MobileLayoutWrapper>
            } />
            <Route path="/dashboard" element={
              <MobileLayoutWrapper title="Dashboard" subtitle="Manage your account">
                <MobileDashboard />
              </MobileLayoutWrapper>
            } />
            
            {/* New mobile-optimized routes with navigation wrapper */}
            <Route path="/properties" element={
              <MobileLayoutWrapper title="Properties" subtitle="Browse all properties">
                <MobilePropertyList />
              </MobileLayoutWrapper>
            } />
            <Route path="/mobile-property/:id" element={
              <MobileLayoutWrapper title="Property Details" subtitle="View property information">
                <MobilePropertyDetailsNew />
              </MobileLayoutWrapper>
            } />
            <Route path="/favorites" element={
              <MobileLayoutWrapper title="Favorites" subtitle="Your saved properties">
                <div className="p-4 text-center">
                  <h2 className="text-xl font-semibold mb-2">Your Favorites</h2>
                  <p className="text-gray-600">No favorites yet. Start exploring properties!</p>
                </div>
              </MobileLayoutWrapper>
            } />
            
            {/* Desktop routes WITH layout (navbar + footer) */}
            <Route path="/desktop" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="rentakenya" element={<RentaKenyaPage />} />
              <Route path="contact" element={<Contact />} />
              <Route path="agents" element={<Agents />} />
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
            <Route path="/properties" element={<ListPage />} />
            <Route path="/scraping" element={<ScrapingDashboard />} />
            <Route path="/properties/add" element={<AddProperty />} />
            <Route path="/desktop/properties/add" element={<AddProperty />} />
            <Route path="/desktop/property/:id" element={<PropertyDetails />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/desktop/login" element={<Login />} />
            <Route path="/desktop/register" element={<Register />} />
            <Route path="/desktop/dashboard" element={<Dashboard />} />
            <Route path="/agent-verification" element={<AgentVerificationPage />} />

            {/* Messages route */}
            <Route path="/messages" element={<Messages />} />

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
            
            {/* Tenant Portal routes */}
            <Route path="/tenant-login" element={<TenantLogin />} />
            <Route path="/tenant-dashboard" element={<TenantDashboard />} />
            
            {/* Catch all route - redirect to mobile home */}
            <Route path="*" element={<MobileResponsiveWrapper />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;