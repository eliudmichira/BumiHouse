import React, { useState } from 'react';
import { FileText, Bed, Bath, Square, Car, Layers, Plus, Trash2, X, Check, Home, Armchair } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const StepDetails = ({ formData, handleInputChange }) => {
    const { isDark } = useTheme();
    // Auto-expand if no units added yet
    const [showAddUnit, setShowAddUnit] = useState(!formData.units || formData.units.length === 0);

    // Kenyan Market Unit Types
    const UNIT_TYPES = [
        { id: 'bedsitter', label: 'Bedsitter', icon: Home, defaultBeds: 0, defaultBaths: 1 },
        { id: 'studio', label: 'Studio', icon: Armchair, defaultBeds: 0, defaultBaths: 1 },
        { id: '1-bedroom', label: '1 Bedroom', icon: Bed, defaultBeds: 1, defaultBaths: 1 },
        { id: '2-bedroom', label: '2 Bedroom', icon: Bed, defaultBeds: 2, defaultBaths: 2 },
        { id: '3-bedroom', label: '3 Bedroom', icon: Bed, defaultBeds: 3, defaultBaths: 2 },
        { id: '3-bedroom-dsq', label: '3 Bed + DSQ', icon: Bed, defaultBeds: 3, defaultBaths: 3 },
        { id: '4-bedroom', label: '4 Bedroom', icon: Bed, defaultBeds: 4, defaultBaths: 3 },
        { id: 'penthouse', label: 'Penthouse', icon: Layers, defaultBeds: 4, defaultBaths: 4 }
    ];

    const [newUnit, setNewUnit] = useState({
        type: '', // Preset ID
        name: '', // Display Name (geocoded or custom)
        price: '',
        rentPeriod: 'month', // month or year, mostly for rentals
        bedrooms: '',
        bathrooms: '',
        area: '',
        unitsAvailable: '1',
        features: '' // Simple comma separated string for key features
    });

    const selectUnitType = (typeObj) => {
        setNewUnit({
            ...newUnit,
            type: typeObj.id,
            name: typeObj.label,
            bedrooms: String(typeObj.defaultBeds),
            bathrooms: String(typeObj.defaultBaths)
        });
    };

    const handleAddUnit = () => {
        if (!newUnit.name || !newUnit.price) return;

        const updatedUnits = [...(formData.units || []), {
            ...newUnit,
            id: Date.now().toString(),
            // Ensure numbers are numbers
            price: Number(newUnit.price),
            bedrooms: Number(newUnit.bedrooms),
            bathrooms: Number(newUnit.bathrooms),
            area: Number(newUnit.area),
            unitsAvailable: Number(newUnit.unitsAvailable)
        }];

        handleInputChange('units', updatedUnits);

        // Reset
        setNewUnit({ type: '', name: '', price: '', bedrooms: '', bathrooms: '', area: '', unitsAvailable: '1', features: '' });
        setShowAddUnit(false);
    };

    const removeUnit = (id) => {
        const updatedUnits = formData.units.filter(u => u.id !== id);
        handleInputChange('units', updatedUnits);
    };

    // If Multi-Unit Mode is OFF, show standard details form
    if (!formData.hasMultipleUnits) {
        return (
            <div className="space-y-6">
                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#10121e]' : 'bg-white shadow-sm'}`}>
                    <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <FileText className="w-6 h-6 text-[#51faaa]" /> Property Details
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Bedrooms */}
                        <div>
                            <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Bedrooms
                            </label>
                            <div className="relative">
                                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={formData.details.bedrooms}
                                    onChange={(e) => handleInputChange('details.bedrooms', e.target.value)}
                                    className={`w-full p-3 pl-10 rounded-xl border text-center font-medium ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:ring-2 focus:ring-[#51faaa] outline-none`}
                                />
                            </div>
                        </div>

                        {/* Bathrooms */}
                        <div>
                            <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Bathrooms
                            </label>
                            <div className="relative">
                                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={formData.details.bathrooms}
                                    onChange={(e) => handleInputChange('details.bathrooms', e.target.value)}
                                    className={`w-full p-3 pl-10 rounded-xl border text-center font-medium ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:ring-2 focus:ring-[#51faaa] outline-none`}
                                />
                            </div>
                        </div>

                        {/* Area */}
                        <div>
                            <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Area (sq ft)
                            </label>
                            <div className="relative">
                                <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={formData.details.area}
                                    onChange={(e) => handleInputChange('details.area', e.target.value)}
                                    className={`w-full p-3 pl-10 rounded-xl border text-center font-medium ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:ring-2 focus:ring-[#51faaa] outline-none`}
                                />
                            </div>
                        </div>

                        {/* Parking */}
                        <div>
                            <label className={`text-xs uppercase font-bold tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Parking Spots
                            </label>
                            <div className="relative">
                                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={formData.details.parking}
                                    onChange={(e) => handleInputChange('details.parking', e.target.value)}
                                    className={`w-full p-3 pl-10 rounded-xl border text-center font-medium ${isDark ? 'bg-[#1a1d2d] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:ring-2 focus:ring-[#51faaa] outline-none`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Multi-Unit Mode
    return (
        <div className="space-y-6">
            <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#10121e]' : 'bg-white shadow-sm'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Layers className="w-6 h-6 text-[#51faaa]" /> Unit Configurations
                    </h2>
                    <button
                        onClick={() => setShowAddUnit(true)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${isDark ? 'bg-[#51faaa]/20 text-[#51faaa]' : 'bg-[#51faaa]/10 text-[#51faaa]'}`}
                    >
                        <Plus className="w-3 h-3" /> Add Unit
                    </button>
                </div>

                {/* List of Added Units */}
                <div className="space-y-3 mb-6">
                    {formData.units && formData.units.length > 0 ? (
                        formData.units.map((unit) => (
                            <div key={unit.id} className={`p-4 rounded-xl border relative group ${isDark ? 'bg-[#1a1d2d] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{unit.name}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                            {unit.unitsAvailable} Available
                                        </span>
                                    </div>
                                    <span className="text-[#51faaa] font-bold font-mono">KES {Number(unit.price).toLocaleString()}</span>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {unit.bedrooms || '-'}</span>
                                    <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {unit.bathrooms || '-'}</span>
                                    <span className="flex items-center gap-1"><Square className="w-3 h-3" /> {unit.area || '-'} ft²</span>
                                </div>
                                {unit.features && (
                                    <div className="mt-2 text-xs text-gray-400 italic truncate">
                                        {unit.features}
                                    </div>
                                )}
                                <button
                                    onClick={() => removeUnit(unit.id)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={`text-center py-8 border-2 border-dashed rounded-xl ${isDark ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
                            <p className="text-sm">No units added yet.</p>
                            <p className="text-xs mt-1">Add unit types like "Studio", "1 Bedroom", etc.</p>
                        </div>
                    )}
                </div>

                {/* Add Unit Modal/Form */}
                {showAddUnit && (
                    <div className={`p-4 rounded-xl border mb-4 animate-in fade-in slide-in-from-top-2 ${isDark ? 'bg-[#1a1d2d] border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>New Configuration</h3>
                            <button onClick={() => setShowAddUnit(false)}><X className="w-4 h-4 text-gray-500" /></button>
                        </div>

                        {/* Quick Select Presets */}
                        <div className="mb-4 overflow-x-auto no-scrollbar pb-2">
                            <div className="flex gap-2">
                                {UNIT_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => selectUnitType(type)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${newUnit.type === type.id
                                            ? 'bg-[#51faaa] text-[#0a0c19]'
                                            : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <type.icon className="w-3 h-3" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Unit Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2 Bedroom Apartment"
                                    value={newUnit.name}
                                    onChange={e => setNewUnit({ ...newUnit, name: e.target.value })}
                                    className={`w-full p-3 rounded-lg border text-sm ${isDark ? 'bg-[#0a0c19] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Price (KES)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={newUnit.price}
                                        onChange={e => setNewUnit({ ...newUnit, price: e.target.value })}
                                        className={`w-full p-3 rounded-lg border text-sm ${isDark ? 'bg-[#0a0c19] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Units Available</label>
                                    <input
                                        type="number"
                                        value={newUnit.unitsAvailable}
                                        onChange={e => setNewUnit({ ...newUnit, unitsAvailable: e.target.value })}
                                        className={`w-full p-3 rounded-lg border text-sm text-center ${isDark ? 'bg-[#0a0c19] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Beds</label>
                                    <input
                                        type="number"
                                        value={newUnit.bedrooms}
                                        onChange={e => setNewUnit({ ...newUnit, bedrooms: e.target.value })}
                                        className={`w-full p-3 rounded-lg border text-sm text-center ${isDark ? 'bg-[#0a0c19] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Baths</label>
                                    <input
                                        type="number"
                                        value={newUnit.bathrooms}
                                        onChange={e => setNewUnit({ ...newUnit, bathrooms: e.target.value })}
                                        className={`w-full p-3 rounded-lg border text-sm text-center ${isDark ? 'bg-[#0a0c19] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Sq Ft</label>
                                    <input
                                        type="number"
                                        value={newUnit.area}
                                        onChange={e => setNewUnit({ ...newUnit, area: e.target.value })}
                                        className={`w-full p-3 rounded-lg border text-sm text-center ${isDark ? 'bg-[#0a0c19] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Key Features (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ensuite, Balcony, Open Kitchen"
                                    value={newUnit.features}
                                    onChange={e => setNewUnit({ ...newUnit, features: e.target.value })}
                                    className={`w-full p-3 rounded-lg border text-sm ${isDark ? 'bg-[#0a0c19] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>

                            <button
                                onClick={handleAddUnit}
                                className="w-full py-3 rounded-lg bg-[#51faaa] text-[#0a0c19] font-bold text-sm hover:shadow-lg hover:shadow-[#51faaa]/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Configuration
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepDetails;
