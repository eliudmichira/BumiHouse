import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Building2, DollarSign, Star, Filter, SortAsc, SortDesc, Grid, List, Trash2, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Favorites() {
  const { favorites, removeFromFavorites, currentUser } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date-added');
  const [filterType, setFilterType] = useState('all');
  const [filteredFavorites, setFilteredFavorites] = useState(favorites);

  useEffect(() => {
    let filtered = [...favorites];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(fav => 
        fav.listing_type.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'date-added':
          return new Date(b.addedAt) - new Date(a.addedAt);
        case 'beds':
          return b.bedrooms - a.bedrooms;
        case 'sqft':
          return b.area - a.area;
        default:
          return 0;
      }
    });

    setFilteredFavorites(filtered);
  }, [favorites, sortBy, filterType]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleRemoveFavorite = (e, propertyId) => {
    e.stopPropagation();
    removeFromFavorites(propertyId);
  };

  const handleShare = (e, property) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title} - ${formatPrice(property.price)}`,
        url: `${window.location.origin}/property/${property.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
      alert('Link copied to clipboard!');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sign in to view favorites</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You need to be signed in to save and view your favorite properties.</p>
          <button 
            onClick={() => navigate('/desktop/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Favorites</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {filteredFavorites.length} saved {filteredFavorites.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/list')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse More Properties
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Filter by Type */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-900 dark:text-gray-100 transition-colors duration-300"
                >
                  <option value="all">All Types</option>
                  <option value="house">Houses</option>
                  <option value="condo">Condos</option>
                  <option value="apartment">Apartments</option>
                  <option value="townhouse">Townhouses</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-900 dark:text-gray-100 transition-colors duration-300"
                >
                  <option value="date-added">Date Added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="beds">Most Beds</option>
                  <option value="sqft">Largest</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 transition-colors duration-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No favorites yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start browsing properties and save your favorites to see them here.
            </p>
            <button 
              onClick={() => navigate('/list')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredFavorites.map((property) => (
              <div
                key={property.id}
                onClick={() => handlePropertyClick(property.id)}
                className={`bg-white dark:bg-dark-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-64 h-48' : 'h-48'}`}>
                  <img 
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    Saved
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={(e) => handleShare(e, property)}
                      className="w-8 h-8 bg-white/80 dark:bg-dark-700/80 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-dark-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={(e) => handleRemoveFavorite(e, property.id)}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(property.price)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(property.addedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <span className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <strong>{property.bedrooms}</strong> bds
                    </span>
                    <span className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <strong>{property.bathrooms}</strong> ba
                    </span>
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      <strong>{property.area.toLocaleString()}</strong> sqft
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                    {property.address}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {property.listing_type} • Listed by {property.agent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites; 