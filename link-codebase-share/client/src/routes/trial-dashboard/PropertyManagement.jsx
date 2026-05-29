import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Users,
  Calendar,
  ArrowLeft,
  Camera,
  Bed,
  Bath,
  Square,
  Eye,
  Settings
} from 'lucide-react';

const PropertyManagement = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    type: 'apartment',
    units: 1,
    monthlyRent: '',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: '',
    description: '',
    amenities: [],
    images: []
  });

  // Load properties from localStorage (trial data)
  useEffect(() => {
    const trialSession = sessionStorage.getItem('trial_session');
    if (!trialSession) {
      navigate('/trial-login');
      return;
    }

    const savedProperties = localStorage.getItem(`trial_properties_${JSON.parse(trialSession).trialId}`);
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    } else {
      // Initialize with demo properties
      const demoProperties = [
        {
          id: '1',
          name: 'Sunset Apartments',
          address: '123 Sunset Blvd, Nairobi',
          type: 'apartment',
          units: 12,
          monthlyRent: 25000,
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 950,
          description: 'Modern apartment complex with great amenities',
          amenities: ['parking', 'gym', 'pool'],
          occupancy: 10,
          revenue: 250000,
          images: []
        },
        {
          id: '2',
          name: 'Green Valley House',
          address: '456 Valley Road, Karen',
          type: 'house',
          units: 1,
          monthlyRent: 80000,
          bedrooms: 4,
          bathrooms: 3,
          squareFeet: 2200,
          description: 'Spacious family house in quiet neighborhood',
          amenities: ['garden', 'parking', 'security'],
          occupancy: 1,
          revenue: 80000,
          images: []
        }
      ];
      setProperties(demoProperties);
      localStorage.setItem(`trial_properties_${JSON.parse(trialSession).trialId}`, JSON.stringify(demoProperties));
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProperty = (e) => {
    e.preventDefault();
    const trialSession = JSON.parse(sessionStorage.getItem('trial_session'));
    
    const property = {
      id: Date.now().toString(),
      ...newProperty,
      monthlyRent: parseFloat(newProperty.monthlyRent),
      squareFeet: parseFloat(newProperty.squareFeet),
      bedrooms: parseInt(newProperty.bedrooms),
      bathrooms: parseInt(newProperty.bathrooms),
      units: parseInt(newProperty.units),
      occupancy: 0,
      revenue: 0,
      createdAt: new Date().toISOString()
    };

    const updatedProperties = [...properties, property];
    setProperties(updatedProperties);
    localStorage.setItem(`trial_properties_${trialSession.trialId}`, JSON.stringify(updatedProperties));
    
    setNewProperty({
      name: '',
      address: '',
      type: 'apartment',
      units: 1,
      monthlyRent: '',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: '',
      description: '',
      amenities: [],
      images: []
    });
    setShowAddForm(false);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setNewProperty(property);
    setShowEditForm(true);
  };

  const handleViewProperty = (property) => {
    setViewingProperty(property);
    setShowViewModal(true);
  };

  const handleUpdateProperty = (e) => {
    e.preventDefault();
    const trialSession = JSON.parse(sessionStorage.getItem('trial_session'));
    
    const updatedProperty = {
      ...newProperty,
      monthlyRent: parseFloat(newProperty.monthlyRent),
      squareFeet: parseFloat(newProperty.squareFeet),
      bedrooms: parseInt(newProperty.bedrooms),
      bathrooms: parseInt(newProperty.bathrooms),
      units: parseInt(newProperty.units),
    };

    const updatedProperties = properties.map(p => 
      p.id === editingProperty.id ? updatedProperty : p
    );
    setProperties(updatedProperties);
    localStorage.setItem(`trial_properties_${trialSession.trialId}`, JSON.stringify(updatedProperties));
    
    setNewProperty({
      name: '',
      address: '',
      type: 'apartment',
      units: 1,
      monthlyRent: '',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: '',
      description: '',
      amenities: [],
      images: []
    });
    setShowEditForm(false);
    setEditingProperty(null);
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      const trialSession = JSON.parse(sessionStorage.getItem('trial_session'));
      const updatedProperties = properties.filter(p => p.id !== propertyId);
      setProperties(updatedProperties);
      localStorage.setItem(`trial_properties_${trialSession.trialId}`, JSON.stringify(updatedProperties));
    }
  };

  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const totalRevenue = properties.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const averageRent = totalProperties > 0 ? properties.reduce((sum, p) => sum + p.monthlyRent, 0) / totalProperties : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/trial-dashboard')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#111]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Property Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your rental properties
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => setShowAddForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProperties}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Units</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUnits}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {averageRent.toLocaleString()}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/20 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Property Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-500" />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{property.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.address}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewProperty(property)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditProperty(property)}
                      className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                      title="Edit Property"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProperty(property.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete Property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-500 mb-1">
                      <Bed className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{property.bedrooms}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Beds</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-500 mb-1">
                      <Bath className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{property.bathrooms}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Baths</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-500 mb-1">
                      <Square className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{property.squareFeet}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Sq Ft</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-[#51faaa]">KSh {property.monthlyRent.toLocaleString()}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">per month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{property.units} units</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{property.occupancy || 0} occupied</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* View Property Modal */}
      {showViewModal && viewingProperty && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Property Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Image */}
              <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-500" />
              </div>
              
              {/* Property Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{viewingProperty.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {viewingProperty.address}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{viewingProperty.type}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Units</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProperty.units}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</p>
                    <p className="font-medium text-gray-900 dark:text-white">KSh {viewingProperty.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Square Feet</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProperty.squareFeet}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Bed className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProperty.bedrooms}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Bath className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProperty.bathrooms}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Square className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProperty.squareFeet}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sq Ft</p>
                  </div>
                </div>
                
                {viewingProperty.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{viewingProperty.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Property Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Property</h2>
            
            <form onSubmit={handleAddProperty} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newProperty.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Type
                  </label>
                  <select
                    name="type"
                    value={newProperty.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={newProperty.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Units
                  </label>
                  <input
                    type="number"
                    name="units"
                    value={newProperty.units}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Rent (KSh)
                  </label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={newProperty.monthlyRent}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={newProperty.bedrooms}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={newProperty.bathrooms}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Square Feet
                </label>
                <input
                  type="number"
                  name="squareFeet"
                  value={newProperty.squareFeet}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newProperty.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Add Property
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Property Modal */}
      {showEditForm && editingProperty && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Property</h2>
            
            <form onSubmit={handleUpdateProperty} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newProperty.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Type
                  </label>
                  <select
                    name="type"
                    value={newProperty.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={newProperty.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Units
                  </label>
                  <input
                    type="number"
                    name="units"
                    value={newProperty.units}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Rent (KSh)
                  </label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={newProperty.monthlyRent}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={newProperty.bedrooms}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={newProperty.bathrooms}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Square Feet
                </label>
                <input
                  type="number"
                  name="squareFeet"
                  value={newProperty.squareFeet}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newProperty.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingProperty(null);
                    setNewProperty({
                      name: '',
                      address: '',
                      type: 'apartment',
                      units: 1,
                      monthlyRent: '',
                      bedrooms: 1,
                      bathrooms: 1,
                      squareFeet: '',
                      description: '',
                      amenities: [],
                      images: []
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Update Property
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;
