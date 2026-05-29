import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { 
  FileText, 
  Search, 
  Filter, 
  Star, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Image,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Upload,
  Download,
  Save,
  X,
  Check,
  AlertCircle,
  Settings,
  Globe,
  BookOpen,
  Tag
} from 'lucide-react';

const ContentManagement = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addSelection, setAddSelection] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const qAll = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
        const snapAll = await getDocs(qAll);
        const all = snapAll.docs.map((d) => {
          const data = d.data();
          const rawLoc = data.location;
          const loc = typeof rawLoc === 'string'
            ? rawLoc
            : (rawLoc && typeof rawLoc === 'object')
              ? [rawLoc.address, rawLoc.city, rawLoc.state].filter(Boolean).join(', ')
              : [data.city, data.state].filter(Boolean).join(', ');
          const title = data.title || (typeof data.address === 'string' ? data.address : (data.address?.address || 'Untitled'));
          const category = typeof data.category === 'string' ? data.category : (data.category?.name || 'house');
          return {
            id: d.id,
            title,
            price: data.price || 0,
            location: loc,
            category,
            featured: !!data.featured,
            featuredOrder: data.featuredOrder || null,
            images: Array.isArray(data.images) && data.images.length ? data.images : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'],
            bedrooms: data.bedrooms || data.beds || 0,
            bathrooms: data.bathrooms || data.baths || 0,
            area: data.area || data.sqft || 0,
            description: data.description || '',
            owner: data.ownerEmail || data.owner || data.agentEmail || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          };
        });
        const featured = all.filter((p) => p.featured).sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999));
        setAllProperties(all);
        setFeaturedProperties(featured);
      } catch (e) {
        setAllProperties([]);
        setFeaturedProperties([]);
      }
    };
    load();
  }, []);

  const handleAddToFeatured = async (propertyId) => {
    const nextOrder = Math.max(...featuredProperties.map(p => p.featuredOrder || 0), 0) + 1;
    try {
      await updateDoc(doc(db, 'properties', propertyId), { featured: true, featuredOrder: nextOrder });
      setAllProperties(list => list.map(p => p.id === propertyId ? { ...p, featured: true, featuredOrder: nextOrder } : p));
      const added = allProperties.find(p => p.id === propertyId);
      if (added) {
        setFeaturedProperties(prev => [...prev, { ...added, featured: true, featuredOrder: nextOrder }].sort((a,b)=>(a.featuredOrder||999)-(b.featuredOrder||999)));
      }
      setShowAddModal(false);
      setAddSelection('');
    } catch (e) {
      console.error('Error featuring property:', e);
    }
  };

  const handleRemoveFromFeatured = async (propertyId) => {
    try {
      await updateDoc(doc(db, 'properties', propertyId), { featured: false, featuredOrder: null });
      setAllProperties(list => list.map(p => p.id === propertyId ? { ...p, featured: false, featuredOrder: null } : p));
      setFeaturedProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (e) {
      console.error('Error un-featuring property:', e);
    }
  };

  const handleReorderFeatured = async (propertyId, newOrder) => {
    try {
      await updateDoc(doc(db, 'properties', propertyId), { featuredOrder: newOrder });
      setFeaturedProperties(prev => prev.map(p => p.id === propertyId ? { ...p, featuredOrder: newOrder } : p).sort((a,b)=>(a.featuredOrder||999)-(b.featuredOrder||999)));
      setAllProperties(list => list.map(p => p.id === propertyId ? { ...p, featuredOrder: newOrder } : p));
    } catch (e) {
      console.error('Error reordering featured property:', e);
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingProperty) return;

    setAllProperties(properties => 
      properties.map(property => 
        property.id === editingProperty.id 
          ? editingProperty
          : property
      )
    );

    setFeaturedProperties(prev => 
      prev.map(property => 
        property.id === editingProperty.id 
          ? editingProperty
          : property
      )
    );

    setShowEditModal(false);
    setEditingProperty(null);
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'luxury': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'apartment': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'house': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'studio': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const exportCSV = () => {
    const rows = [
      ['id','title','price','location','category','featured','featuredOrder','bedrooms','bathrooms','area','owner'],
      ...allProperties.map(p => [
        p.id,
        p.title,
        p.price,
        p.location,
        p.category,
        p.featured ? 'true' : 'false',
        p.featuredOrder ?? '',
        p.bedrooms,
        p.bathrooms,
        p.area,
        p.owner
      ])
    ];
    const csv = rows.map(r => r.map(v => String(v).replace(/"/g,'""')).map(v => /[",\n]/.test(v) ? `"${v}"` : v).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties.csv';
    a.click();
    URL.revokeObjectURL(url);
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

  const contentStats = {
    totalProperties: allProperties.length,
    featuredProperties: featuredProperties.length,
    categories: [...new Set(allProperties.map(p => p.category))].length,
    totalImages: allProperties.reduce((sum, p) => sum + p.images.length, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage featured properties and site content</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Featured
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={contentStats.totalProperties}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Featured Properties"
          value={contentStats.featuredProperties}
          icon={<Star className="w-6 h-6 text-yellow-600" />}
          color="bg-yellow-100 dark:bg-yellow-900/30"
        />
        <StatCard
          title="Categories"
          value={contentStats.categories}
          icon={<Tag className="w-6 h-6 text-green-600" />}
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Total Images"
          value={contentStats.totalImages}
          icon={<Image className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* Featured Properties Section */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Properties</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {featuredProperties.length} properties featured
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <div key={property.id} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
              <div className="relative">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    #{property.featuredOrder}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{property.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{property.location}</p>
                  <p className="text-lg font-bold text-green-600">Ksh {property.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {property.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      {property.area} sq ft
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(property.category)}`}>
                    {property.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditProperty(property)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromFeatured(property.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Order:</label>
                  <select
                    value={property.featuredOrder}
                    onChange={(e) => handleReorderFeatured(property.id, parseInt(e.target.value))}
                    className="text-xs border border-gray-300 dark:border-dark-600 rounded px-2 py-1 bg-white dark:bg-dark-800"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Properties Section */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Properties</h3>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="luxury">Luxury</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="studio">Studio</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {allProperties
                .filter(property => 
                  (categoryFilter === 'all' || property.category === categoryFilter) &&
                  (searchTerm === '' || 
                   property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   property.location.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
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
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(property.category)}`}>
                      {property.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      property.featured 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {property.featured ? 'Featured' : 'Regular'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {property.owner}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!property.featured ? (
                        <button
                          onClick={() => handleAddToFeatured(property.id)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveFromFeatured(property.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Property Modal */}
      {showEditModal && editingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Property
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingProperty.title}
                  onChange={(e) => setEditingProperty({...editingProperty, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingProperty.description}
                  onChange={(e) => setEditingProperty({...editingProperty, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={editingProperty.price}
                    onChange={(e) => setEditingProperty({...editingProperty, price: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={editingProperty.category}
                    onChange={(e) => setEditingProperty({...editingProperty, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                  >
                    <option value="luxury">Luxury</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Featured Property</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select property</label>
              <select value={addSelection} onChange={(e) => setAddSelection(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white">
                <option value="">-- Choose --</option>
                {allProperties.filter(p => !p.featured).map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors">Cancel</button>
                <button disabled={!addSelection} onClick={() => handleAddToFeatured(addSelection)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement; 