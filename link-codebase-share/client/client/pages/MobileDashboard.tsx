import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Home,
  Building,
  Heart,
  Eye,
  Search,
  Filter,
  Plus,
  Settings,
  User,
  LogOut,
  Calendar,
  TrendingUp,
  Star,
  MapPin,
  Bed,
  Bath,
  Loader2,
  RefreshCw,
  X
} from "lucide-react";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import { useProperties } from "../src/hooks/useProperties";
import { formatKes } from "../src/services/aiInsights";

const MobileDashboard = () => {
  const { isDark } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { data: propertiesData, isLoading, isError, refetch } = useProperties();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'favorites' | 'profile'>('overview');
  const [favorites, setFavorites] = useState(new Set());
  const [recentViews, setRecentViews] = useState<string[]>([]);

  // Get properties from the API
  const properties = (propertiesData as any)?.properties || (propertiesData as any)?.data || [];

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('propertyFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    // Load recent views from localStorage
    const savedViews = localStorage.getItem('recentPropertyViews');
    if (savedViews) {
      setRecentViews(JSON.parse(savedViews));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      
      // Save to localStorage
      localStorage.setItem('propertyFavorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  const handlePropertyClick = (propertyId: string) => {
    // Add to recent views
    setRecentViews(prev => {
      const newViews = [propertyId, ...prev.filter(id => id !== propertyId)].slice(0, 10);
      localStorage.setItem('recentPropertyViews', JSON.stringify(newViews));
      return newViews;
    });
    
    navigate(`/property/${propertyId}`);
  };

  const getPropertyImage = (property: any) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property.image) {
      return property.image;
    }
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop';
  };

  const getPropertyName = (property: any) => {
    return property.name || property.title || 'Property';
  };

  const getPropertyLocation = (property: any) => {
    if (property.location) {
      // Handle location object with nested properties
      if (typeof property.location === 'object') {
        if (property.location.city) {
          return property.location.city;
        }
        if (property.location.address) {
          return property.location.address;
        }
        // If it's an object but no city/address, try to stringify safely
        return 'Location not specified';
      }
      // Handle string location
      return property.location;
    }
    if (property.address) {
      return property.address;
    }
    return 'Location not specified';
  };

  const formatPrice = (price: any) => {
    if (!price) return 'Price on request';
    if (typeof price === 'string') return price;
    return formatKes(price);
  };

  const getFavoriteProperties = () => {
    return properties.filter((property: any) => favorites.has(property.id));
  };

  const getRecentViewedProperties = () => {
    return properties.filter((property: any) => recentViews.includes(property.id));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access your dashboard
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-2 bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#45e695] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Something went wrong while loading your data
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#45e695] transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          
          <button
            onClick={() => setActiveTab('profile')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </header>

      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#51faaa] rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-[#111]">
              {currentUser.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Welcome back!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser.email}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex px-4">
          {[
            { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
            { id: 'properties', label: 'Properties', icon: <Building className="w-4 h-4" /> },
            { id: 'favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" /> },
            { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#51faaa] border-b-2 border-[#51faaa]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main className="pb-20">
        {activeTab === 'overview' && (
          <div className="p-4 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center w-12 h-12 bg-[#51faaa]/20 rounded-lg mx-auto mb-3">
                  <Building className="w-6 h-6 text-[#51faaa]" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                  {properties.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Total Properties
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg mx-auto mb-3">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                  {favorites.size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Favorites
                </div>
              </div>
            </div>

            {/* Recent Views */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recently Viewed
              </h3>
              {recentViews.length > 0 ? (
                <div className="space-y-3">
                  {getRecentViewedProperties().slice(0, 3).map((property: any) => (
                    <div
                      key={property.id}
                      onClick={() => handlePropertyClick(property.id)}
                      className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-3">
                        <img
                          src={getPropertyImage(property)}
                          alt={getPropertyName(property)}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {getPropertyName(property)}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                            {getPropertyLocation(property)}
                          </p>
                          <div className="text-[#51faaa] font-bold text-sm">
                            {formatPrice(property.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No recently viewed properties
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/search')}
                  className="flex items-center gap-3 p-4 bg-[#51faaa] text-[#111] rounded-xl font-medium hover:bg-[#45e695] transition-colors"
                >
                  <Search className="w-5 h-5" />
                  Search Properties
                </button>
                
                <button
                  onClick={() => setActiveTab('favorites')}
                  className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  View Favorites
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#51faaa] animate-spin" />
              </div>
            ) : properties.length > 0 ? (
              <div className="space-y-4">
                {properties.map((property: any) => (
                  <div
                    key={property.id}
                    onClick={() => handlePropertyClick(property.id)}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex">
                      <img
                        src={getPropertyImage(property)}
                        alt={getPropertyName(property)}
                        className="w-24 h-24 object-cover"
                      />
                      <div className="flex-1 p-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                          {getPropertyName(property)}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                          {getPropertyLocation(property)}
                        </p>
                        <div className="text-[#51faaa] font-bold text-sm mb-2">
                          {formatPrice(property.price)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          {(property.bedrooms || property.bedroom) && (
                            <span className="flex items-center gap-1">
                              <Bed className="w-3 h-3" />
                              {property.bedrooms || property.bedroom}
                            </span>
                          )}
                          {(property.bathrooms || property.bathroom) && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-3 h-3" />
                              {property.bathrooms || property.bathroom}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No properties available
                </p>
                <button
                  onClick={() => navigate('/search')}
                  className="px-6 py-2 bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#45e695] transition-colors"
                >
                  Browse Properties
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="p-4">
            {favorites.size > 0 ? (
              <div className="space-y-4">
                {getFavoriteProperties().map((property: any) => (
                  <div
                    key={property.id}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex">
                      <img
                        src={getPropertyImage(property)}
                        alt={getPropertyName(property)}
                        className="w-24 h-24 object-cover"
                      />
                      <div className="flex-1 p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {getPropertyName(property)}
                          </h4>
                          <button
                            onClick={() => toggleFavorite(property.id)}
                            className="p-1 text-red-500"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                          {getPropertyLocation(property)}
                        </p>
                        <div className="text-[#51faaa] font-bold text-sm mb-2">
                          {formatPrice(property.price)}
                        </div>
                        <button
                          onClick={() => handlePropertyClick(property.id)}
                          className="w-full bg-[#51faaa] text-[#111] py-2 rounded-lg text-xs font-medium hover:bg-[#45e695] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No favorite properties yet
                </p>
                <button
                  onClick={() => navigate('/search')}
                  className="px-6 py-2 bg-[#51faaa] text-[#111] rounded-lg font-medium hover:bg-[#45e695] transition-colors"
                >
                  Discover Properties
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4 space-y-6">
            {/* Profile Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Profile Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {currentUser.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {currentUser.metadata?.creationTime 
                      ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/search')}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                  Browse Properties
                </button>
                
                <button
                  onClick={() => setActiveTab('favorites')}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  My Favorites
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-[#51faaa] transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={() => navigate('/search')}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:text-[#51faaa] transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Search</span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-1 p-2 text-[#51faaa]"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileDashboard;
