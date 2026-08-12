import React from 'react';
import { Building2, DollarSign, Home, Store, Landmark } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const StepBasics = ({ formData, handleInputChange, errors }) => {
    const { isDark } = useTheme();

    const propertyTypes = [
        { value: 'house', label: 'House', icon: Home },
        { value: 'apartment', label: 'Apartment', icon: Building2 },
        { value: 'commercial', label: 'Commercial', icon: Store },
        { value: 'land', label: 'Land', icon: Landmark }
    ];

    return (
        <div className="space-y-6">
            <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#10121e]' : 'bg-white shadow-sm'}`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Building2 className="w-6 h-6 text-[#51faaa]" /> Basic Details
                </h2>

                <div className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Property Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="e.g. Modern Apartment in Kileleshwa"
                            className={`w-full p-4 rounded-xl border font-medium ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-[#51faaa] outline-none transition-all`}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Property Type *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {propertyTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = formData.propertyType === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleInputChange('propertyType', type.value)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                                            ? 'border-[#51faaa] bg-[#51faaa]/10'
                                            : isDark
                                                ? 'border-gray-700 bg-[#1a1d2d] hover:border-gray-600'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                                        <span className={`font-medium ${isSelected ? 'text-[#51faaa]' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {type.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
                    </div>

                    {/* Multi-Unit Toggle (Only for Apartments/Commercial) */}
                    {(formData.propertyType === 'apartment' || formData.propertyType === 'commercial') && (
                        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${formData.hasMultipleUnits
                            ? 'bg-[#51faaa]/10 border-[#51faaa]/30'
                            : isDark ? 'bg-[#1a1d2d] border-gray-700' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-3">
                                <Building2 className={`w-5 h-5 ${formData.hasMultipleUnits ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                                <div>
                                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Multiple Unit Types?</h4>
                                    <p className="text-xs text-gray-500">e.g. 1 Bedroom, 2 Bedroom, Studio</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.hasMultipleUnits}
                                    onChange={(e) => handleInputChange('hasMultipleUnits', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#51faaa]"></div>
                            </label>
                        </div>
                    )}

                    {/* Status */}
                    <div>
                        <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Status *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {['for-sale', 'for-rent'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleInputChange('status', status)}
                                    className={`p-3 rounded-xl border-2 font-bold uppercase tracking-wide transition-all ${formData.status === status
                                        ? 'border-[#51faaa] bg-[#51faaa] text-[#0a0c19]'
                                        : isDark
                                            ? 'border-gray-700 bg-[#1a1d2d] text-gray-400'
                                            : 'border-gray-200 bg-gray-50 text-gray-500'
                                        }`}
                                >
                                    {status.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price - Only show if Single Unit */}
                    {!formData.hasMultipleUnits && (
                        <div>
                            <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Price (KES) *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full p-4 pl-12 rounded-xl border font-mono text-lg ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:ring-2 focus:ring-[#51faaa] outline-none`}
                                />
                            </div>
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Description *
                        </label>
                        <textarea
                            rows={6}
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe the key features, neighborhood, and selling points..."
                            className={`w-full p-4 rounded-xl border ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-[#51faaa] outline-none resize-none`}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepBasics;
