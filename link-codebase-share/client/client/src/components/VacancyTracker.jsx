import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertCircle, 
  Bell, 
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const VacancyTracker = ({ property, onVacancyUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // Calculate vacancy percentage
  const vacancyPercentage = property.totalUnits > 0 
    ? Math.round((property.availableUnits / property.totalUnits) * 100)
    : 0;

  // Determine vacancy status
  const getVacancyStatus = () => {
    if (property.availableUnits === 0) {
      return {
        status: 'full',
        text: 'Fully Occupied',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        icon: UserX,
        urgency: 'high'
      };
    } else if (property.availableUnits === 1) {
      return {
        status: 'last',
        text: 'Last Unit Available',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        icon: AlertCircle,
        urgency: 'high'
      };
    } else if (vacancyPercentage <= 20) {
      return {
        status: 'limited',
        text: 'Limited Availability',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        icon: Clock,
        urgency: 'medium'
      };
    } else {
      return {
        status: 'available',
        text: 'Available',
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        icon: UserCheck,
        urgency: 'low'
      };
    }
  };

  const vacancyStatus = getVacancyStatus();
  const StatusIcon = vacancyStatus.icon;

  // Handle vacancy update (for agents/admins)
  const handleVacancyUpdate = async (action) => {
    if (!currentUser || !['agent', 'admin'].includes(currentUser.role)) return;
    
    setIsUpdating(true);
    try {
      let newAvailableUnits = property.availableUnits;
      
      switch (action) {
        case 'occupy':
          newAvailableUnits = Math.max(0, property.availableUnits - 1);
          break;
        case 'vacate':
          newAvailableUnits = Math.min(property.totalUnits, property.availableUnits + 1);
          break;
        case 'mark_full':
          newAvailableUnits = 0;
          break;
        case 'mark_available':
          newAvailableUnits = property.totalUnits;
          break;
      }

      if (onVacancyUpdate) {
        await onVacancyUpdate(property.id, newAvailableUnits);
      }
    } catch (error) {
      console.error('Error updating vacancy:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle waitlist signup
  const handleWaitlistSignup = async (e) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;

    try {
      // Add to waitlist logic here
      console.log('Adding to waitlist:', waitlistEmail, property.id);
      setShowWaitlistModal(false);
      setWaitlistEmail('');
    } catch (error) {
      console.error('Error adding to waitlist:', error);
    }
  };

  return (
    <>
      {/* Main Vacancy Display */}
      <div className={`p-4 rounded-xl border ${vacancyStatus.bgColor} ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-5 h-5 ${vacancyStatus.color}`} />
            <span className={`font-semibold text-sm ${vacancyStatus.color}`}>
              {vacancyStatus.text}
            </span>
          </div>
          
          {/* Urgency Indicator */}
          {vacancyStatus.urgency === 'high' && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-500 font-medium">High Demand</span>
            </div>
          )}
        </div>

        {/* Vacancy Counter */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {property.availableUnits} of {property.totalUnits} units available
            </span>
            <span className={`text-sm font-medium ${vacancyStatus.color}`}>
              {vacancyPercentage}% vacancy rate
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                vacancyStatus.status === 'full' ? 'bg-red-500' :
                vacancyStatus.status === 'last' ? 'bg-orange-500' :
                vacancyStatus.status === 'limited' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${vacancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Next Availability */}
        {property.nextVacancyDate && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Next vacancy: {new Date(property.nextVacancyDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {property.availableUnits > 0 ? (
            <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-lg font-semibold text-sm transition-all hover:shadow-lg">
              <CheckCircle className="w-4 h-4" />
              <span>Apply Now</span>
            </button>
          ) : (
            <button 
              onClick={() => setShowWaitlistModal(true)}
              className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm transition-all hover:bg-blue-600"
            >
              <Bell className="w-4 h-4" />
              <span>Join Waitlist</span>
            </button>
          )}
          
          <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
            <Users className="w-4 h-4" />
          </button>
        </div>

        {/* Agent/Admin Controls */}
        {currentUser && ['agent', 'admin'].includes(currentUser.role) && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Actions:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleVacancyUpdate('occupy')}
                disabled={isUpdating || property.availableUnits === 0}
                className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-xs font-medium transition-colors hover:bg-red-200 dark:hover:bg-red-900/40 disabled:opacity-50"
              >
                <UserX className="w-3 h-3" />
                <span>Occupy Unit</span>
              </button>
              
              <button
                onClick={() => handleVacancyUpdate('vacate')}
                disabled={isUpdating || property.availableUnits === property.totalUnits}
                className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-xs font-medium transition-colors hover:bg-green-200 dark:hover:bg-green-900/40 disabled:opacity-50"
              >
                <UserCheck className="w-3 h-3" />
                <span>Vacate Unit</span>
              </button>
              
              <button
                onClick={() => handleVacancyUpdate('mark_full')}
                disabled={isUpdating || property.availableUnits === 0}
                className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-xs font-medium transition-colors hover:bg-red-200 dark:hover:bg-red-900/40 disabled:opacity-50"
              >
                <XCircle className="w-3 h-3" />
                <span>Mark Full</span>
              </button>
              
              <button
                onClick={() => handleVacancyUpdate('mark_available')}
                disabled={isUpdating || property.availableUnits === property.totalUnits}
                className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-xs font-medium transition-colors hover:bg-green-200 dark:hover:bg-green-900/40 disabled:opacity-50"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Mark Available</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWaitlistModal(false)} />
          <div className={`relative w-full max-w-md p-6 rounded-2xl shadow-2xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Join Waitlist
              </h3>
              <button
                onClick={() => setShowWaitlistModal(false)}
                className={`p-1 rounded-lg ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Get notified when a unit becomes available at {property.title}.
            </p>
            
            <form onSubmit={handleWaitlistSignup} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51faaa] ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-lg font-semibold transition-all hover:shadow-lg"
                >
                  Join Waitlist
                </button>
                <button
                  type="button"
                  onClick={() => setShowWaitlistModal(false)}
                  className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VacancyTracker;
