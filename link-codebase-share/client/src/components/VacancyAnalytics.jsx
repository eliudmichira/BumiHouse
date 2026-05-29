import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertCircle,
  BarChart3,
  Calendar,
  Target,
  DollarSign,
  Activity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const VacancyAnalytics = ({ properties = [] }) => {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Calculate analytics
  const calculateAnalytics = () => {
    const totalUnits = properties.reduce((sum, prop) => sum + (prop.totalUnits || 0), 0);
    const availableUnits = properties.reduce((sum, prop) => sum + (prop.availableUnits || 0), 0);
    const occupiedUnits = totalUnits - availableUnits;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;
    const vacancyRate = totalUnits > 0 ? ((availableUnits / totalUnits) * 100).toFixed(1) : 0;

    // Categorize properties by vacancy status
    const fullProperties = properties.filter(p => p.availableUnits === 0);
    const limitedProperties = properties.filter(p => p.availableUnits > 0 && p.availableUnits <= Math.ceil(p.totalUnits * 0.2));
    const lastUnitProperties = properties.filter(p => p.availableUnits === 1);
    const availableProperties = properties.filter(p => p.availableUnits > 1 && p.availableUnits > Math.ceil(p.totalUnits * 0.2));

    // Calculate revenue impact
    const avgRent = properties.reduce((sum, prop) => sum + (prop.price || 0), 0) / properties.length;
    const potentialRevenue = availableUnits * avgRent;
    const lostRevenue = occupiedUnits * avgRent * 0.05; // Assuming 5% vacancy cost

    return {
      totalUnits,
      availableUnits,
      occupiedUnits,
      occupancyRate,
      vacancyRate,
      fullProperties: fullProperties.length,
      limitedProperties: limitedProperties.length,
      lastUnitProperties: lastUnitProperties.length,
      availableProperties: availableProperties.length,
      potentialRevenue,
      lostRevenue,
      avgRent
    };
  };

  const analytics = calculateAnalytics();

  // Generate mock trend data
  const generateTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        occupancy: Math.max(70, Math.min(95, 85 + Math.sin(i * 0.1) * 10)),
        applications: Math.floor(Math.random() * 20) + 5,
        inquiries: Math.floor(Math.random() * 50) + 10
      });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  const getStatusColor = (rate) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (rate) => {
    if (rate >= 90) return TrendingUp;
    if (rate >= 80) return Clock;
    return TrendingDown;
  };

  const StatusIcon = getStatusIcon(analytics.occupancyRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Vacancy Analytics
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time occupancy tracking and performance insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              isDark 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy Rate */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Users className={`w-5 h-5 ${getStatusColor(analytics.occupancyRate)}`} />
            </div>
            <StatusIcon className={`w-5 h-5 ${getStatusColor(analytics.occupancyRate)}`} />
          </div>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Occupancy Rate
          </h3>
          <p className={`text-2xl font-bold ${getStatusColor(analytics.occupancyRate)}`}>
            {analytics.occupancyRate}%
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {analytics.occupiedUnits} of {analytics.totalUnits} units occupied
          </p>
        </div>

        {/* Vacancy Rate */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <UserX className="w-5 h-5 text-red-500" />
            </div>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Vacancy Rate
          </h3>
          <p className="text-2xl font-bold text-red-500">
            {analytics.vacancyRate}%
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {analytics.availableUnits} units available
          </p>
        </div>

        {/* Potential Revenue */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Potential Revenue
          </h3>
          <p className="text-2xl font-bold text-green-500">
            KES {analytics.potentialRevenue.toLocaleString()}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Monthly from available units
          </p>
        </div>

        {/* Lost Revenue */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <TrendingDown className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Lost Revenue
          </h3>
          <p className="text-2xl font-bold text-orange-500">
            KES {analytics.lostRevenue.toLocaleString()}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Monthly from vacancies
          </p>
        </div>
      </div>

      {/* Property Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Property Status Distribution
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-green-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Available
                </span>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold">
                {analytics.availableProperties}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Limited Availability
                </span>
              </div>
              <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                {analytics.limitedProperties}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Last Unit
                </span>
              </div>
              <span className="text-orange-600 dark:text-orange-400 font-semibold">
                {analytics.lastUnitProperties}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserX className="w-5 h-5 text-red-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Fully Occupied
                </span>
              </div>
              <span className="text-red-600 dark:text-red-400 font-semibold">
                {analytics.fullProperties}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
          
          <div className="space-y-3">
            <button className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Set Occupancy Targets</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            
            <button className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className="font-medium">Schedule Viewings</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            
            <button className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
            }`}>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Generate Reports</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            
            <button className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Manage Waitlist</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className={`p-6 rounded-xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Occupancy Trend ({timeRange})
        </h3>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {trendData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t">
                <div 
                  className="bg-gradient-to-t from-[#51faaa] to-[#dbd5a4] rounded-t transition-all duration-300"
                  style={{ height: `${data.occupancy}%` }}
                />
              </div>
              <span className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {index % 7 === 0 ? new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#51faaa] rounded-full" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Occupancy Rate
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Applications
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Inquiries
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacancyAnalytics;
