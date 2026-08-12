import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserDashboard from './UserDashboard';
import AgentDashboard from './AgentDashboard';
import MobileProfileScreen from '../../mobile/pages/MobileProfileScreen';
import MobileAgentProfile from '../../mobile/pages/MobileAgentProfile';
import MobileLayoutWrapper from '../../mobile/components/MobileLayoutWrapper';
import { DashboardLoader } from '../../components/Preloader';
import { Loader2 } from 'lucide-react';
import FloatingDashboardNav from '../../components/FloatingDashboardNav';
import logoPadded from '../../assets/logo_padded.png';

const DashboardRouter = () => {
  const { currentUser, getUserRole, isVerifiedAgent, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isRoleDetermining, setIsRoleDetermining] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const determineUserRole = async () => {
      // If auth is still loading, don't determine role yet
      if (authLoading) return;

      if (!currentUser) {
        setIsRoleDetermining(false);
        return;
      }

      try {
        // Get user role
        const role = getUserRole ? getUserRole() : 'user';
        console.log('DashboardRouter: User role determined as:', role);
        setUserRole(role);
      } catch (error) {
        console.error('Error determining user role:', error);
        setUserRole('user');
      } finally {
        setIsRoleDetermining(false);
      }
    };

    determineUserRole();
  }, [getUserRole, isVerifiedAgent, currentUser, authLoading]);

  // Show loading while determining role or waiting for auth
  if (authLoading || isRoleDetermining) {
    if (isMobile) {
      // Mobile-friendly loader: centered spinner with logo
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-[#51faaa]/20 border-t-[#51faaa] animate-spin" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-3 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden shadow-inner">
              <img src={logoPadded} alt="HomesKE" className="w-10 h-10 object-contain" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
            Loading your profile...
          </p>
        </div>
      );
    }
    return <DashboardLoader text="Loading dashboard..." />;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/desktop/login" replace />;
  }

  // Route based on user role
  switch (userRole) {
    case 'admin':
      // Redirect to admin panel
      return <Navigate to="/admin" replace />;

    case 'agent':
      // Check if user is a verified agent
      if (isVerifiedAgent) {
        if (isMobile) {
          return <MobileAgentProfile />;
        }
        return (
          <div className="relative">
            <FloatingDashboardNav variant="agent" />
            <AgentDashboard />
          </div>
        );
      } else {
        // Show agent verification request or pending status
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-20">
            <div className="max-w-md mx-auto text-center p-8">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Agent Verification Pending
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your agent verification request is being reviewed. You'll have access to the agent dashboard once approved.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }

    case 'user':
    default:
      // Show regular user dashboard
      if (isMobile) {
        return (
          <MobileLayoutWrapper title="Dashboard" subtitle="Manage your account">
            <MobileProfileScreen />
          </MobileLayoutWrapper>
        );
      }
      return (
        <div className="relative">
          <FloatingDashboardNav variant="user" />
          <UserDashboard />
        </div>
      );
  }
};

export default DashboardRouter;
