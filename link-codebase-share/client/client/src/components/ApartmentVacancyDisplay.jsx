import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertCircle, 
  Edit3,
  Save,
  X,
  TrendingUp,
  Home,
  Bed,
  Bath,
  Square,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Minus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ApartmentVacancyDisplay = ({ property, onVacancyUpdate, isEditable = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [vacancyData, setVacancyData] = useState({
    totalUnits: property.totalUnits || 0,
    availableUnits: property.availableUnits || 0,
    unitTypes: property.unitTypes || [],
    nextVacancyDate: property.nextVacancyDate || null,
    waitlistCount: property.waitlistCount || 0,
    averageRent: property.averageRent || 0
  });
  
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // Calculate vacancy metrics
  const vacancyPercentage = vacancyData.totalUnits > 0 
    ? Math.round((vacancyData.availableUnits / vacancyData.totalUnits) * 100)
    : 0;
  
  const occupancyRate = 100 - vacancyPercentage;
  const occupiedUnits = vacancyData.totalUnits - vacancyData.availableUnits;

  // Determine vacancy status
  const getVacancyStatus = () => {
    if (vacancyData.availableUnits === 0) {
      return {
        status: 'full',
        text: 'Fully Occupied',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: UserX,
        urgency: 'high',
        description: 'No units currently available'
      };
    } else if (vacancyData.availableUnits === 1) {
      return {
        status: 'last',
        text: 'Last Unit Available',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        icon: AlertCircle,
        urgency: 'high',
        description: 'Only one unit remaining'
      };
    } else if (vacancyPercentage <= 20) {
      return {
        status: 'limited',
        text: 'Limited Availability',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: Clock,
        urgency: 'medium',
        description: 'Few units remaining'
      };
    } else {
      return {
        status: 'available',
        text: 'Units Available',
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: UserCheck,
        urgency: 'low',
        description: 'Multiple units available'
      };
    }
  };

  const vacancyStatus = getVacancyStatus();
  const StatusIcon = vacancyStatus.icon;

  // Handle editing mode
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setVacancyData({
      totalUnits: property.totalUnits || 0,
      availableUnits: property.availableUnits || 0,
      unitTypes: property.unitTypes || [],
      nextVacancyDate: property.nextVacancyDate || null,
      waitlistCount: property.waitlistCount || 0,
      averageRent: property.averageRent || 0
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!onVacancyUpdate) return;
    
    setIsUpdating(true);
    try {
      await onVacancyUpdate(property.id, vacancyData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating vacancy data:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle unit type updates
  const addUnitType = () => {
    setVacancyData(prev => ({
      ...prev,
      unitTypes: [...prev.unitTypes, {
        id: Date.now(),
        type: '',
        bedrooms: 1,
        bathrooms: 1,
        area: 0,
        price: 0,
        available: 0,
        total: 0
      }]
    }));
  };

  const removeUnitType = (index) => {
    setVacancyData(prev => ({
      ...prev,
      unitTypes: prev.unitTypes.filter((_, i) => i !== index)
    }));
  };

  const updateUnitType = (index, field, value) => {
    setVacancyData(prev => ({
      ...prev,
      unitTypes: prev.unitTypes.map((unit, i) => 
        i === index ? { ...unit, [field]: value } : unit
      )
    }));
  };

  // Update total units when unit types change
  useEffect(() => {
    const total = vacancyData.unitTypes.reduce((sum, unit) => sum + (unit.total || 0), 0);
    const available = vacancyData.unitTypes.reduce((sum, unit) => sum + (unit.available || 0), 0);
    
    setVacancyData(prev => ({
      ...prev,
      totalUnits: total,
      availableUnits: available
    }));
  }, [vacancyData.unitTypes]);

  if (!vacancyData.totalUnits || vacancyData.totalUnits === 0) {
    return null; // Don't show for non-apartment properties
  }

  return (
    <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200'} rounded-2xl border shadow-lg transition-colors duration-300`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDark ? 'border-[rgba(81,250,170,0.1)]' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${vacancyStatus.bgColor}`}>
              <Building2 className={`w-6 h-6 ${vacancyStatus.color}`} />
            </div>
            <div>
              <h3 className={`text-xl font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                Apartment Complex Availability
              </h3>
              <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                {vacancyStatus.description}
              </p>
            </div>
          </div>
          
          {isEditable && currentUser && ['agent', 'admin'].includes(currentUser.role) && (
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-lg font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdating ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm transition-all hover:bg-blue-600"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Vacancy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl ${vacancyStatus.bgColor} border ${vacancyStatus.borderColor}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Users className={`w-5 h-5 ${vacancyStatus.color}`} />
              <span className={`text-sm font-medium ${vacancyStatus.color}`}>Total Units</span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {vacancyData.totalUnits}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${vacancyStatus.bgColor} border ${vacancyStatus.borderColor}`}>
            <div className="flex items-center space-x-2 mb-2">
              <UserCheck className={`w-5 h-5 ${vacancyStatus.color}`} />
              <span className={`text-sm font-medium ${vacancyStatus.color}`}>Available</span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {vacancyData.availableUnits}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${vacancyStatus.bgColor} border ${vacancyStatus.borderColor}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className={`w-5 h-5 ${vacancyStatus.color}`} />
              <span className={`text-sm font-medium ${vacancyStatus.color}`}>Occupancy Rate</span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {occupancyRate}%
            </div>
          </div>
        </div>

        {/* Vacancy Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
              Vacancy Rate: {vacancyPercentage}%
            </span>
            <span className={`text-sm font-medium ${vacancyStatus.color}`}>
              {vacancyData.availableUnits} of {vacancyData.totalUnits} units available
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${vacancyStatus.color.replace('text-', 'bg-')}`}
              style={{ width: `${vacancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Unit Types Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`text-lg font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              Unit Types & Availability
            </h4>
            {isEditing && (
              <button
                onClick={addUnitType}
                className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium transition-colors hover:bg-green-600"
              >
                <Plus className="w-4 h-4" />
                <span>Add Type</span>
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {vacancyData.unitTypes.map((unit, index) => (
              <div key={unit.id || index} className={`p-4 rounded-xl border ${
                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
              }`}>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <input
                      type="text"
                      value={unit.type}
                      onChange={(e) => updateUnitType(index, 'type', e.target.value)}
                      placeholder="Type (e.g., Studio, 1BR)"
                      className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa] ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      value={unit.bedrooms}
                      onChange={(e) => updateUnitType(index, 'bedrooms', parseInt(e.target.value))}
                      placeholder="Beds"
                      className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa] ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      value={unit.bathrooms}
                      onChange={(e) => updateUnitType(index, 'bathrooms', parseFloat(e.target.value))}
                      placeholder="Baths"
                      className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa] ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      value={unit.area}
                      onChange={(e) => updateUnitType(index, 'area', parseInt(e.target.value))}
                      placeholder="Sq Ft"
                      className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa] ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      value={unit.price}
                      onChange={(e) => updateUnitType(index, 'price', parseInt(e.target.value))}
                      placeholder="Price"
                      className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa] ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={unit.available}
                        onChange={(e) => updateUnitType(index, 'available', parseInt(e.target.value))}
                        placeholder="Available"
                        className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#51faaa] ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      <button
                        onClick={() => removeUnitType(index)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-gray-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {unit.type || 'Studio'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bed className="w-4 h-4 text-gray-500" />
                      <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>
                        {unit.bedrooms || 0} bed
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bath className="w-4 h-4 text-gray-500" />
                      <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>
                        {unit.bathrooms || 0} bath
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Square className="w-4 h-4 text-gray-500" />
                      <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>
                        {unit.area || 0} sqft
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${(unit.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-green-500" />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {unit.available || 0} available
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {vacancyData.unitTypes.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No unit types configured yet</p>
                {isEditing && (
                  <button
                    onClick={addUnitType}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors hover:bg-blue-600"
                  >
                    Add First Unit Type
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vacancyData.nextVacancyDate && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-blue-50'} border ${
              isDark ? 'border-gray-700' : 'border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Next Vacancy</span>
              </div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                {new Date(vacancyData.nextVacancyDate).toLocaleDateString()}
              </div>
            </div>
          )}
          
          {vacancyData.waitlistCount > 0 && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-orange-50'} border ${
              isDark ? 'border-gray-700' : 'border-orange-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Waitlist</span>
              </div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-orange-900'}`}>
                {vacancyData.waitlistCount} people
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="flex space-x-3">
          {vacancyData.availableUnits > 0 ? (
            <button className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-lg font-semibold text-sm transition-all hover:shadow-lg">
              <CheckCircle className="w-4 h-4" />
              <span>Apply Now</span>
            </button>
          ) : (
            <button className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-500 text-white rounded-lg font-semibold text-sm transition-all hover:bg-blue-600">
              <AlertCircle className="w-4 h-4" />
              <span>Join Waitlist</span>
            </button>
          )}
          
          <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApartmentVacancyDisplay;
