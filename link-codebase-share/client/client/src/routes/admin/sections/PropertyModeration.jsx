import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { 
  Home, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  AlertCircle,
  Star,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  User,
  Shield,
  Download,
  Upload,
  MoreVertical
} from 'lucide-react';

const PropertyModeration = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Load real properties from Firestore
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const rows = snapshot.docs.map((d) => {
          const data = d.data();
          const submittedAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          const rawLoc = data.location;
          const loc = typeof rawLoc === 'string'
            ? rawLoc
            : (rawLoc && typeof rawLoc === 'object')
              ? [rawLoc.address, rawLoc.city, rawLoc.state].filter(Boolean).join(', ')
              : [data.city, data.state].filter(Boolean).join(', ');
          const title = data.title || (typeof data.address === 'string' ? data.address : (data.address?.address || 'Untitled'));
          return {
            id: d.id,
            title,
            price: data.price || 0,
            location: loc,
            status: data.status || 'pending',
            submittedBy: data.submittedBy || data.ownerEmail || data.owner || data.agentEmail || '',
            submittedAt,
            images: Array.isArray(data.images) && data.images.length ? data.images : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'],
            bedrooms: data.bedrooms || data.beds || 0,
            bathrooms: data.bathrooms || data.baths || 0,
            area: data.area || data.sqft || 0,
            description: data.description || '',
            verified: !!data.verified,
            rejectionReason: data.rejectionReason || ''
          };
        });
        setProperties(rows);
        setFilteredProperties(rows);
      } catch (e) {
        setProperties([]);
        setFilteredProperties([]);
      }
    };
    loadProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, statusFilter]);

  const filterProperties = () => {
    let filtered = properties;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }

    setFilteredProperties(filtered);
  };

  const handleApprove = async (propertyId) => {
    try {
      await updateDoc(doc(db, 'properties', propertyId), { status: 'approved', rejectionReason: '' });
      setProperties(properties.map(property => property.id === propertyId ? { ...property, status: 'approved', rejectionReason: '' } : property));
    } catch (e) {
      console.error('Error approving property:', e);
    }
  };

  const handleReject = async (propertyId) => {
    if (!rejectionReason.trim()) return;
    try {
      await updateDoc(doc(db, 'properties', propertyId), { status: 'rejected', rejectionReason });
      setProperties(properties.map(property => property.id === propertyId ? { ...property, status: 'rejected', rejectionReason } : property));
    } catch (e) {
      console.error('Error rejecting property:', e);
    } finally {
      setRejectionReason('');
      setShowPropertyModal(false);
      setSelectedProperty(null);
    }
  };

  const handleDelete = async (propertyId) => {
    try {
      await deleteDoc(doc(db, 'properties', propertyId));
      setProperties(properties.filter(property => property.id !== propertyId));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (e) {
      console.error('Error deleting property:', e);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) return;

    try {
      await Promise.all(selectedProperties.map(id => deleteDoc(doc(db, 'properties', id))));
      setProperties(properties.filter(property => !selectedProperties.includes(property.id)));
    } catch (e) {
      console.error('Error performing bulk delete:', e);
    } finally {
      setSelectedProperties([]);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProperties.length === 0) return;

    try {
      if (action === 'approve') {
        await Promise.all(selectedProperties.map(id => updateDoc(doc(db, 'properties', id), { status: 'approved', rejectionReason: '' })));
        setProperties(properties.map(property => selectedProperties.includes(property.id) ? { ...property, status: 'approved', rejectionReason: '' } : property));
      } else if (action === 'reject') {
        await Promise.all(selectedProperties.map(id => updateDoc(doc(db, 'properties', id), { status: 'rejected', rejectionReason: 'Bulk rejection' })));
        setProperties(properties.map(property => selectedProperties.includes(property.id) ? { ...property, status: 'rejected', rejectionReason: 'Bulk rejection' } : property));
      } else if (action === 'delete') {
        await handleBulkDelete();
      }
    } catch (e) {
      console.error('Error performing bulk action:', e);
    } finally {
      setSelectedProperties([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const handleSelectProperty = (propertyId) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const propertyStats = {
    total: properties.length,
    pending: properties.filter(p => p.status === 'pending').length,
    approved: properties.filter(p => p.status === 'approved').length,
    rejected: properties.filter(p => p.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Property Moderation</h2>
          <p className="text-gray-600 dark:text-gray-400">Approve, reject, and manage property listings</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={propertyStats.total}
          icon={<Home className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Pending Review"
          value={propertyStats.pending}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          color="bg-yellow-100 dark:bg-yellow-900/30"
        />
        <StatCard
          title="Approved"
          value={propertyStats.approved}
          icon={<Check className="w-6 h-6 text-green-600" />}
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Rejected"
          value={propertyStats.rejected}
          icon={<X className="w-6 h-6 text-red-600" />}
          color="bg-red-100 dark:bg-red-900/30"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties by title, location, or submitter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-800 dark:text-blue-200">
              {selectedProperties.length} property(ies) selected
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Reject All
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => handleSelectProperty(property.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-16 rounded-lg object-cover"
                        src={property.images[0]}
                        alt={property.title}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {property.location}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          Ksh {property.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {property.submittedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {property.submittedAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowPropertyModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {property.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(property.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProperty(property);
                              setShowPropertyModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setPropertyToDelete(property);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-800 hover:text-red-900 dark:text-red-600 dark:hover:text-red-500"
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Detail Modal */}
      {showPropertyModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Property Details
              </h3>
              <button
                onClick={() => setShowPropertyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <img
                src={selectedProperty.images[0]}
                alt={selectedProperty.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedProperty.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedProperty.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{selectedProperty.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-green-600">Ksh {selectedProperty.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{selectedProperty.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{selectedProperty.bathrooms} bathrooms</span>
                </div>
              </div>

              {selectedProperty.status === 'pending' && (
                <div className="border-t border-gray-200 dark:border-dark-700 pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                    rows="3"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowPropertyModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setPropertyToDelete(selectedProperty);
                    setShowDeleteModal(true);
                    setShowPropertyModal(false);
                  }}
                  className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                {selectedProperty.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedProperty.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedProperty.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && propertyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Property</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{propertyToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(propertyToDelete.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPropertyToDelete(null);
                  }}
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

export default PropertyModeration; 