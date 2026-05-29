import React, { useState } from 'react';
import { 
  Filter, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertCircle,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const VacancyFilter = ({ onFilterChange, activeFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();

  const filterOptions = [
    {
      key: 'available',
      label: 'Available Units',
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: 'Properties with available units'
    },
    {
      key: 'limited',
      label: 'Limited Availability',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      description: 'Less than 20% vacancy rate'
    },
    {
      key: 'last_unit',
      label: 'Last Unit',
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      description: 'Only 1 unit remaining'
    },
    {
      key: 'full',
      label: 'Fully Occupied',
      icon: UserX,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      description: 'No units available'
    },
    {
      key: 'waitlist',
      label: 'Waitlist Only',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'Join waitlist for future availability'
    }
  ];

  const handleFilterToggle = (filterKey) => {
    const newFilters = { ...activeFilters };
    
    if (newFilters[filterKey]) {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = true;
    }
    
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
          activeFilterCount > 0
            ? 'bg-[#51faaa] text-[#0a0c19] border-[#51faaa]'
            : isDark
              ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Vacancy Filter</span>
        {activeFilterCount > 0 && (
          <span className="bg-[#0a0c19] text-[#51faaa] text-xs font-bold px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 z-50">
          <div className={`rounded-xl shadow-2xl border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Filter by Availability
              </h3>
              <div className="flex items-center space-x-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded-lg ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="p-4 space-y-3">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isActive = activeFilters[option.key];
                
                return (
                  <button
                    key={option.key}
                    onClick={() => handleFilterToggle(option.key)}
                    className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? `${option.bgColor} border-2 border-[#51faaa]`
                        : isDark
                          ? 'hover:bg-gray-700 border border-gray-600'
                          : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? option.bgColor : isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${option.color}`} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm ${
                          isActive 
                            ? option.color 
                            : isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {option.label}
                        </span>
                        {isActive && (
                          <div className="w-2 h-2 bg-[#51faaa] rounded-full" />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${
                        isActive
                          ? option.color.replace('text-', 'text-').replace('-500', '-600')
                          : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onFilterChange({ available: true, limited: true, last_unit: true });
                    setIsOpen(false);
                  }}
                  className="text-xs py-2 px-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                >
                  Show Available Only
                </button>
                <button
                  onClick={() => {
                    onFilterChange({ full: true, waitlist: true });
                    setIsOpen(false);
                  }}
                  className="text-xs py-2 px-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                >
                  Show Waitlist Only
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.keys(activeFilters).map((filterKey) => {
            const option = filterOptions.find(opt => opt.key === filterKey);
            if (!option) return null;
            
            const Icon = option.icon;
            
            return (
              <div
                key={filterKey}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${option.bgColor} ${option.color}`}
              >
                <Icon className="w-3 h-3" />
                <span>{option.label}</span>
                <button
                  onClick={() => handleFilterToggle(filterKey)}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VacancyFilter;
