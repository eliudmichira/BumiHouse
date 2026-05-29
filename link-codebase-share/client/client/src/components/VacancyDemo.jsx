import React, { useState } from 'react';
import ApartmentVacancyDisplay from './ApartmentVacancyDisplay';
import { useTheme } from '../context/ThemeContext';

const VacancyDemo = () => {
  const { isDark } = useTheme();
  const [demoProperty, setDemoProperty] = useState({
    id: 'demo-1',
    title: 'Luxury Apartment Complex',
    listing_type: 'apartment',
    totalUnits: 24,
    availableUnits: 8,
    unitTypes: [
      {
        id: '1',
        type: 'Studio',
        bedrooms: 0,
        bathrooms: 1,
        area: 450,
        price: 1200,
        available: 3,
        total: 8
      },
      {
        id: '2',
        type: '1BR',
        bedrooms: 1,
        bathrooms: 1,
        area: 650,
        price: 1600,
        available: 3,
        total: 10
      },
      {
        id: '3',
        type: '2BR',
        bedrooms: 2,
        bathrooms: 2,
        area: 950,
        price: 2200,
        available: 2,
        total: 6
      }
    ],
    nextVacancyDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    waitlistCount: 12,
    averageRent: 1667
  });

  const handleVacancyUpdate = async (propertyId, vacancyData) => {
    console.log('Updating vacancy data:', { propertyId, vacancyData });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the demo property
    setDemoProperty(prev => ({
      ...prev,
      ...vacancyData
    }));
    
    alert('Vacancy data updated successfully! Check the console for details.');
  };

  return (
    <div className={`min-h-screen pt-32 pb-8 ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-outfit font-bold mb-4 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
            Apartment Vacancy Display Demo
          </h1>
          <p className={`text-xl ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
            This demo shows how agents can manage and display vacancy information for apartment complexes
          </p>
        </div>

        <div className="space-y-8">
          {/* Demo Property */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'}`}>
            <h2 className={`text-2xl font-outfit font-bold mb-4 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              Demo Property: {demoProperty.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-blue-50'}`}>
                <div className={`text-2xl font-bold ${isDark ? 'text-[#51faaa]' : 'text-blue-600'}`}>
                  {demoProperty.totalUnits}
                </div>
                <div className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Total Units</div>
              </div>
              <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-green-50'}`}>
                <div className={`text-2xl font-bold ${isDark ? 'text-[#51faaa]' : 'text-green-600'}`}>
                  {demoProperty.availableUnits}
                </div>
                <div className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Available</div>
              </div>
              <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-purple-50'}`}>
                <div className={`text-2xl font-bold ${isDark ? 'text-[#51faaa]' : 'text-purple-600'}`}>
                  {Math.round(((demoProperty.totalUnits - demoProperty.availableUnits) / demoProperty.totalUnits) * 100)}%
                </div>
                <div className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Occupancy</div>
              </div>
              <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-orange-50'}`}>
                <div className={`text-2xl font-bold ${isDark ? 'text-[#51faaa]' : 'text-orange-600'}`}>
                  ${demoProperty.averageRent}
                </div>
                <div className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Avg Rent</div>
              </div>
            </div>
          </div>

          {/* Vacancy Display Component */}
          <ApartmentVacancyDisplay 
            property={demoProperty}
            onVacancyUpdate={handleVacancyUpdate}
            isEditable={true}
          />

          {/* Instructions */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'}`}>
            <h3 className={`text-xl font-outfit font-bold mb-4 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              How to Use
            </h3>
            <div className={`space-y-3 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#51faaa] rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Edit Mode:</strong> Click the "Edit" button to modify vacancy information
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#51faaa] rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Unit Types:</strong> Add, edit, or remove different unit configurations
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#51faaa] rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Availability:</strong> Update the number of available units for each type
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#51faaa] rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Real-time Updates:</strong> Changes are reflected immediately in the display
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'}`}>
            <h3 className={`text-xl font-outfit font-bold mb-4 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className={`font-semibold ${isDark ? 'text-[#51faaa]' : 'text-blue-600'}`}>For Agents</h4>
                <ul className={`space-y-2 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  <li>• Real-time vacancy updates</li>
                  <li>• Unit type management</li>
                  <li>• Availability tracking</li>
                  <li>• Waitlist management</li>
                  <li>• Notes and scheduling</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className={`font-semibold ${isDark ? 'text-[#51faaa]' : 'text-green-600'}`}>For Tenants</h4>
                <ul className={`space-y-2 ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  <li>• Clear availability status</li>
                  <li>• Unit type details</li>
                  <li>• Pricing information</li>
                  <li>• Waitlist signup</li>
                  <li>• Contact options</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacancyDemo;
