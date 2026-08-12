import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const StepAmenities = ({ formData, handleAmenityToggle }) => {
    const { isDark } = useTheme();

    const amenityGroups = [
        {
            title: '🛠 Utilities & Essentials',
            items: [
                { value: 'reliable-water', label: 'Reliable Water Supply 💧' },
                { value: 'backup-power', label: 'Backup Generator ⚡' },
                { value: 'secure-compound', label: 'Secure Compound 🔒' },
                { value: 'garbage-collection', label: 'Garbage Collection ♻️' },
                { value: 'fibre-internet', label: 'Fibre Internet 🌐' },
                { value: 'wifi', label: 'WiFi 📶' },
            ]
        },
        {
            title: '🏢 Apartment Features',
            items: [
                { value: 'ensuite-bedrooms', label: 'En-suite Bedrooms 🛏' },
                { value: 'modern-kitchen', label: 'Modern Kitchen 🍳' },
                { value: 'spacious-balcony', label: 'Spacious Balcony 🌿' },
                { value: 'laundry-area', label: 'Laundry Area 🧺' },
                { value: 'water-heater', label: 'Water Heater 🚿' },
                { value: 'dsq', label: 'DSQ 👩‍🍳' },
                { value: 'elevator', label: 'Lift/Elevator 🛗' },
                { value: 'ample-parking', label: 'Ample Parking 🚗' },
            ]
        },
        {
            title: '🌟 Comfort & Lifestyle',
            items: [
                { value: 'gym', label: 'Gym 💪' },
                { value: 'swimming-pool', label: 'Swimming Pool 🏊' },
                { value: 'garden-lawns', label: 'Garden/Lawns 🌱' },
                { value: 'clubhouse', label: 'Clubhouse 🏠' },
                { value: 'play-area', label: "Play Area 🛝" },
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#10121e]' : 'bg-white shadow-sm'}`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Check className="w-6 h-6 text-[#51faaa]" /> Select Amenities
                </h2>

                <div className="space-y-8">
                    {amenityGroups.map(group => (
                        <div key={group.title}>
                            <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {group.title}
                            </h4>
                            <div className="flex flex-wrap gap-2.5">
                                {group.items.map(item => {
                                    const isSelected = formData.amenities.includes(item.value);
                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => handleAmenityToggle(item.value)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${isSelected
                                                ? 'bg-[#51faaa] text-[#0a0c19] border-[#51faaa] shadow-lg shadow-[#51faaa]/20 transform scale-105'
                                                : isDark
                                                    ? 'bg-[#1a1d2d] text-gray-300 border-gray-700 hover:border-gray-500'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StepAmenities;
