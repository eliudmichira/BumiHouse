import React, { useState, useEffect } from 'react';
import { propertiesAPI } from '../../../lib/firebaseAPI';
import { Home, Eye, MessageCircle, Star, Edit, Trash2, Plus, Filter, Search, X, Calendar, MapPin, DollarSign, Bed, Bath, Square, Loader2, CheckCircle } from 'lucide-react';

// Toast notification system
const showToast = (options) => {
  const toast = document.createElement('div');
  toast.className = `fixed top-6 right-6 z-[9999] transform transition-all duration-500 ease-out`;
  
  toast.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl p-5 min-w-[300px] max-w-[400px] ${
      options.type === 'error' 
        ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' 
        : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600'
    } text-white shadow-2xl backdrop-blur-xl border border-white/20">
      <!-- Animated background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]"></div>
      </div>
      
      <!-- Content -->
      <div class="relative flex items-start gap-4">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-sm tracking-wide mb-1">${options.title}</div>
          <div class="text-xs opacity-90 leading-relaxed">${options.message}</div>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div class="h-full bg-white/60 animate-[progress_4s_linear]"></div>
      </div>
    </div>
  `;
  
  // Add custom CSS for progress animation
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initial position (off-screen)
  toast.style.transform = 'translateX(120%) scale(0.8)';
  toast.style.opacity = '0';
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0) scale(1)';
    toast.style.opacity = '1';
  }, 50);
  
  // Animate out
  setTimeout(() => {
    toast.style.transform = 'translateX(120%) scale(0.8)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 500);
  }, 4000);
};

const PropertiesSection = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [newProperty, setNewProperty] = useState({
    title: '',
    type: 'Apartment',
    price: '',
    location: '',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    description: ''
  });

  // Fetch properties from Firebase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await propertiesAPI.getAll();
        const fetchedProperties = response.properties || [];
        
        // Transform data to match dashboard format
        const transformedProperties = fetchedProperties.map(property => ({
          id: property.id,
          title: property.title || property.name,
          type: property.property_type || 'Property',
          price: property.price || 0,
          status: property.status || 'active',
          views: property.views || Math.floor(Math.random() * 500) + 50,
          inquiries: Math.floor(Math.random() * 20) + 5,
          rating: property.rating || 4.5,
          image: property.images?.[0] || property.img || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
          location: property.city || property.address || 'Nairobi, Kenya',
          bedrooms: property.bedrooms || property.bedroom || 2,
          bathrooms: property.bathrooms || property.bathroom || 2,
          area: property.area || property.size || 120,
          description: property.description || property.desc || 'Beautiful property with great amenities',
          listedDate: property.createdAt ? new Date(property.createdAt.toDate()).toISOString().split('T')[0] : '2024-01-15'
        }));
        
        setProperties(transformedProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleAddProperty = async () => {
    if (newProperty.title && newProperty.price && newProperty.location) {
      try {
        const property = {
          ...newProperty,
          price: parseInt(newProperty.price),
          area: parseInt(newProperty.area),
          status: 'Pending',
          views: 0,
          inquiries: 0,
          rating: 0,
          image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
          listedDate: new Date().toISOString().split('T')[0]
        };
        await propertiesAPI.create(property);
        setProperties(prev => [...prev, { id: Date.now(), ...property }]); // Add a temporary ID for local state
        setNewProperty({
          title: '',
          type: 'Apartment',
          price: '',
          location: '',
          bedrooms: 1,
          bathrooms: 1,
          area: '',
          description: ''
        });
        setShowAddModal(false);
        showToast({
          type: 'success',
          title: 'Property Added',
          message: `Property "${property.title}" has been added.`
        });
      } catch (err) {
        console.error('Error adding property:', err);
        setError('Failed to add property. Please try again.');
      }
    }
  };

  const handleEditProperty = async () => {
    if (selectedProperty && selectedProperty.title && selectedProperty.price) {
      try {
        await propertiesAPI.update(selectedProperty.id, {
          ...selectedProperty,
          price: parseInt(selectedProperty.price)
        });
        setProperties(properties.map(p => 
          p.id === selectedProperty.id ? { ...selectedProperty, price: parseInt(selectedProperty.price) } : p
        ));
        setShowEditModal(false);
        setSelectedProperty(null);
        showToast({
          type: 'success',
          title: 'Property Updated',
          message: `Property "${selectedProperty.title}" has been updated.`
        });
      } catch (err) {
        console.error('Error editing property:', err);
        setError('Failed to edit property. Please try again.');
      }
    }
  };

  const handleDeleteProperty = async () => {
    if (selectedProperty) {
      try {
        await propertiesAPI.delete(selectedProperty.id);
        setProperties(properties.filter(p => p.id !== selectedProperty.id));
        setShowDeleteModal(false);
        setSelectedProperty(null);
        showToast({
          type: 'success',
          title: 'Property Deleted',
          message: `Property "${selectedProperty.title}" has been deleted.`
        });
      } catch (err) {
        console.error('Error deleting property:', err);
        setError('Failed to delete property. Please try again.');
      }
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalProperties: properties.length,
    activeListings: properties.filter(p => p.status === 'Active').length,
    totalViews: properties.reduce((sum, p) => sum + p.views, 0),
    totalInquiries: properties.reduce((sum, p) => sum + p.inquiries, 0)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="ml-2 text-gray-600 dark:text-gray-400">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Properties
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your property listings and track performance
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative h-48">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  property.status === 'Active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {property.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                  {property.title}
                </h4>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{property.rating}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{property.type}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-3">KSh {property.price.toLocaleString()}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  {property.bedrooms}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-3 h-3" />
                  {property.bathrooms}
                </span>
                <span className="flex items-center gap-1">
                  <Square className="w-3 h-3" />
                  {property.area}m²
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {property.views} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {property.inquiries} inquiries
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setSelectedProperty(property);
                    setShowEditModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => {
                    setSelectedProperty(property);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center justify-center w-8 h-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalProperties}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Properties</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeListings}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Listings</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalViews}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalInquiries}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Inquiries</div>
        </div>
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Property</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Property Title"
                value={newProperty.title}
                onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={newProperty.type}
                onChange={(e) => setNewProperty({...newProperty, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Studio">Studio</option>
                <option value="Villa">Villa</option>
              </select>
              <input
                type="number"
                placeholder="Monthly Rent (KSh)"
                value={newProperty.price}
                onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Location"
                value={newProperty.location}
                onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Bedrooms"
                  value={newProperty.bedrooms}
                  onChange={(e) => setNewProperty({...newProperty, bedrooms: parseInt(e.target.value)})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Bathrooms"
                  value={newProperty.bathrooms}
                  onChange={(e) => setNewProperty({...newProperty, bathrooms: parseInt(e.target.value)})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Area (m²)"
                  value={newProperty.area}
                  onChange={(e) => setNewProperty({...newProperty, area: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <textarea
                placeholder="Description"
                value={newProperty.description}
                onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows="3"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddProperty}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Property
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {showEditModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Property</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Property Title"
                value={selectedProperty.title}
                onChange={(e) => setSelectedProperty({...selectedProperty, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={selectedProperty.type}
                onChange={(e) => setSelectedProperty({...selectedProperty, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Studio">Studio</option>
                <option value="Villa">Villa</option>
              </select>
              <input
                type="number"
                placeholder="Monthly Rent (KSh)"
                value={selectedProperty.price}
                onChange={(e) => setSelectedProperty({...selectedProperty, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Location"
                value={selectedProperty.location}
                onChange={(e) => setSelectedProperty({...selectedProperty, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEditProperty}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Property</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedProperty.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteProperty}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesSection; 