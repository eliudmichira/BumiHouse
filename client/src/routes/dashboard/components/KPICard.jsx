import React from 'react';
import { ArrowUp, ArrowDown, Clock } from 'lucide-react';

const KPICard = ({ title, value, change, changeType, period, icon, color, trend }) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `KSh ${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return val.toLocaleString();
      } else {
        return val.toString();
      }
    }
    return val;
  };

  const getChangeIcon = (changeType) => {
    if (changeType === 'increase') {
      return <ArrowUp className="w-4 h-4 text-emerald-500" />;
    } else if (changeType === 'decrease') {
      return <ArrowDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
            changeType === 'increase' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
              : changeType === 'decrease' 
                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {getChangeIcon(changeType)}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{formatValue(value)}</h3>
        <p className="text-gray-600 dark:text-gray-400 font-medium">{title}</p>
      </div>
      
      {period && (
        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {period}
        </p>
      )}

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${color} transition-all duration-1000`}
              style={{ width: `${trend}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500">{trend}%</span>
        </div>
      )}
    </div>
  );
};

export default KPICard; 