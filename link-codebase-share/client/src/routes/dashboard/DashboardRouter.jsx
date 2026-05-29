import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserDashboard from './UserDashboard';
import AgentDashboard from './AgentDashboard';
import { DashboardLoader } from '../../components/Preloader';
import { Loader2 } from 'lucide-react';
import FloatingDashboardNav from '../../components/FloatingDashboardNav';

const DashboardRouter = () => {
  const { currentUser, getUserRole, isVerifiedAgent } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const determineUserRole = async () => {
      try {
        // Get user role
        const role = getUserRole ? getUserRole() : 'user';
        console.log('DashboardRouter: User role determined as:', role);
        console.log('DashboardRouter: isVerifiedAgent:', isVerifiedAgent);
        console.log('DashboardRouter: currentUser:', currentUser);
        setUserRole(role);
      } catch (error) {
        console.error('Error determining user role:', error);
        setUserRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    determineUserRole();
  }, [getUserRole, isVerifiedAgent, currentUser]);

  // Show loading while determining role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DashboardLoader text="Loading dashboard..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/desktop/login" replace />;
  }

  // Route based on user role
  switch (userRole) {
    case 'admin':
      // Redirect to admin panel
      return <Navigate to="/desktop/admin" replace />;
    
    case 'agent':
      // Check if user is a verified agent
      if (isVerifiedAgent) {
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
                <Loader2 className="w-8 h-8 text-yellow-500" />
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
      return (
        <div className="relative">
          <FloatingDashboardNav variant="user" />
          <UserDashboard />
        </div>
      );
  }
};

export default DashboardRouter;
