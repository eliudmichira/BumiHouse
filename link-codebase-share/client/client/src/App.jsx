import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketContextProvider } from './context/SocketContext';
import { Layout } from './routes/layout/layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for better performance
const HomePage = lazy(() => import('./routes/homePage/HomePage'));
const AboutPage = lazy(() => import('./routes/about/AboutPage'));
const Contact = lazy(() => import('./routes/contact/contact'));
const Agents = lazy(() => import('./routes/agents/Agents'));
const MobileResponsiveWrapper = lazy(() => import('./components/MobileResponsiveWrapper'));

// Mobile-specific pages
const MobilePropertySearch = lazy(() => import('../pages/MobilePropertySearch'));
const MobilePropertyDetails = lazy(() => import('../pages/MobilePropertyDetails'));
const MobileAuth = lazy(() => import('../pages/MobileAuth'));
const MobileDashboard = lazy(() => import('../pages/MobileDashboard'));

// Desktop pages
const PropertyDetails = lazy(() => import('./routes/propertyDetails/propertyDetails'));
const ListPage = lazy(() => import('./routes/listPage/listPage_fixed_useLocation'));
const Login = lazy(() => import('./routes/login/login'));
const Dashboard = lazy(() => import('./routes/dashboard/dashboard'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketContextProvider>
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
                  
                  {/* Mobile-specific routes */}
                  <Route path="/search" element={<MobilePropertySearch />} />
                  <Route path="/property/:id" element={<MobilePropertyDetails />} />
                  <Route path="/auth" element={<MobileAuth />} />
                  <Route path="/dashboard" element={<MobileDashboard />} />
                  
                  {/* Desktop routes with layout */}
                  <Route path="/desktop" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="agents" element={<Agents />} />
                    <Route path="properties" element={<ListPage />} />
                    <Route path="property/:id" element={<PropertyDetails />} />
                    <Route path="login" element={<Login />} />
                    <Route path="dashboard" element={<Dashboard />} />
                  </Route>
                  
                  {/* Catch all route - redirect to mobile home */}
                  <Route path="*" element={<MobileResponsiveWrapper />} />
                </Routes>
              </Suspense>
            </Router>
          </SocketContextProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;