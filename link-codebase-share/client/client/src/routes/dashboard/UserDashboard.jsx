import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { accountDashboardAPI } from '../../lib/firebaseAPI';
import { 
  Home, 
  MessageCircle, 
  Settings, 
  Heart, 
  Search, 
  Eye, 
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Building2,
  User,
  Bell,
  Filter,
  Bookmark,
  Clock,
  DollarSign
} from 'lucide-react';
import { DashboardLoader } from '../../components/Preloader';

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, favorites, savedSearches, userPreferences } = useAuth();
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [userProperties, setUserProperties] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState({
    totalFavorites: 0,
    totalBookings: 0,
    totalProperties: 0,
    totalViews: 0
  });
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [viewedProperties, setViewedProperties] = useState([]);

  // Get section from URL params or default to overview
  const sectionFromUrl = searchParams.get('section');
  
  useEffect(() => {
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  // Update URL when section changes
  useEffect(() => {
    if (activeSection !== sectionFromUrl) {
      setSearchParams({ section: activeSection });
    }
  }, [activeSection, sectionFromUrl, setSearchParams]);

  // Load user data from Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.id) return;
      
      setIsLoading(true);
      try {
        // Load user's favorites
        const favorites = await accountDashboardAPI.getUserFavorites(currentUser.id);
        setUserFavorites(favorites);

        // Load user's bookings
        const bookings = await accountDashboardAPI.getUserBookings(currentUser.id);
        setUserBookings(bookings);

        // Load user's properties (if they own any)
        const properties = await accountDashboardAPI.getUserProperties(currentUser.id);
        setUserProperties(properties);

        // Set analytics based on real data
        setUserAnalytics({
          totalFavorites: favorites.length,
          totalBookings: bookings.length,
          totalProperties: properties.length,
          totalViews: properties.reduce((sum, prop) => sum + (prop.views || 0), 0)
        });

        // Mock viewed properties (could be replaced with real view tracking)
        setViewedProperties([
          {
            id: '1',
            title: 'Modern Apartment in Westlands',
            viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            title: 'Luxury Villa in Kilimani',
            viewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
          }
        ]);

        // Mock recommended properties (could be replaced with real recommendations)
        setRecommendedProperties([
          {
            id: '1',
            title: 'Modern Apartment in Westlands',
            price: 4500000,
            location: 'Westlands, Nairobi',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
            bedrooms: 2,
            bathrooms: 2,
            area: 120,
            rating: 4.5
          },
          {
            id: '2',
            title: 'Luxury Villa in Kilimani',
            price: 8500000,
            location: 'Kilimani, Nairobi',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
            bedrooms: 4,
            bathrooms: 3,
            area: 280,
            rating: 4.8
          },
          {
            id: '3',
            title: 'Cozy Studio in CBD',
            price: 2800000,
            location: 'CBD, Nairobi',
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
            bedrooms: 1,
            bathrooms: 1,
            area: 65,
            rating: 4.2
          }
        ]);

        // Mock recent activity (could be replaced with real activity tracking)
        setRecentActivity([
          {
            id: '1',
            type: 'favorite',
            property: 'Modern Apartment in Westlands',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            icon: Heart
          },
          {
            id: '2',
            type: 'search',
            query: '3 bedroom apartments in Kilimani',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            icon: Search
          },
          {
            id: '3',
            type: 'view',
            property: 'Luxury Villa in Lavington',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            icon: Eye
          }
        ]);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'Your dashboard summary'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      description: 'Your saved properties'
    },
    {
      id: 'searches',
      label: 'Saved Searches',
      icon: Search,
      description: 'Your search criteria'
    },
    {
      id: 'activity',
      label: 'Recent Activity',
      icon: Clock,
      description: 'Your recent actions'
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: Star,
      description: 'Properties for you'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'searches':
        return <SearchesSection />;
      case 'activity':
        return <ActivitySection />;
      case 'recommendations':
        return <RecommendationsSection />;
      default:
        return <OverviewSection />;
    }
  };

  // Overview Section Component
  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] flex items-center justify-center">
            <User className="w-8 h-8 text-[#111]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {currentUser?.name || 'User'}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening with your property search
            </p>
          </div>
        </div>
      </div>

             {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
               <Heart className="w-6 h-6 text-red-500" />
             </div>
             <div>
               <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
               <p className="text-2xl font-bold text-gray-900 dark:text-white">{userAnalytics.totalFavorites}</p>
             </div>
           </div>
         </div>

         <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
               <Search className="w-6 h-6 text-blue-500" />
             </div>
             <div>
               <p className="text-sm text-gray-600 dark:text-gray-400">Saved Searches</p>
               <p className="text-2xl font-bold text-gray-900 dark:text-white">{savedSearches?.length || 0}</p>
             </div>
           </div>
         </div>

         <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
               <Eye className="w-6 h-6 text-green-500" />
             </div>
             <div>
               <p className="text-sm text-gray-600 dark:text-gray-400">Properties Viewed</p>
               <p className="text-2xl font-bold text-gray-900 dark:text-white">{viewedProperties.length}</p>
             </div>
           </div>
         </div>

         <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
               <Star className="w-6 h-6 text-purple-500" />
             </div>
             <div>
               <p className="text-sm text-gray-600 dark:text-gray-400">Recommendations</p>
               <p className="text-2xl font-bold text-gray-900 dark:text-white">{recommendedProperties.length}</p>
             </div>
           </div>
         </div>
       </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/properties')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] hover:shadow-lg transition-all"
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Search Properties</span>
          </button>
          
          <button
            onClick={() => setActiveSection('favorites')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">View Favorites</span>
          </button>
          
          <button
            onClick={() => navigate('/messages')}
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Messages</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Favorites Section Component
  const FavoritesSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Favorites</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{userFavorites.length} properties</span>
        </div>
        
        {userFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userFavorites.slice(0, 6).map((property) => (
              <div key={property.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'}
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <button className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#51faaa] transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {property.location?.address || 'Location not specified'}
                  </p>
                  <p className="text-lg font-bold text-[#51faaa] mt-2">
                    KES {property.price?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start exploring properties and save your favorites
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Searches Section Component
  const SearchesSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Searches</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{savedSearches?.length || 0} searches</span>
        </div>
        
        {savedSearches && savedSearches.length > 0 ? (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <div key={search.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{search.query}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Saved {new Date(search.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#51faaa] text-[#111] rounded-lg hover:bg-[#45e595] transition-colors">
                  Search Again
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved searches</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your saved searches will appear here
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Start Searching
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Activity Section Component
  const ActivitySection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
        
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
              <div className="w-10 h-10 rounded-full bg-[#51faaa]/20 flex items-center justify-center">
                <activity.icon className="w-5 h-5 text-[#51faaa]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {activity.type === 'favorite' && `Added "${activity.property}" to favorites`}
                  {activity.type === 'search' && `Searched for "${activity.query}"`}
                  {activity.type === 'view' && `Viewed "${activity.property}"`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.timestamp.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Recommendations Section Component
  const RecommendationsSection = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recommended for You</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedProperties.map((property) => (
            <div key={property.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <button className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium">{property.rating}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#51faaa] transition-colors">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {property.location}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-lg font-bold text-[#51faaa]">
                    KES {property.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{property.bedrooms} beds</span>
                    <span>•</span>
                    <span>{property.bathrooms} baths</span>
                    <span>•</span>
                    <span>{property.area}m²</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DashboardLoader text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your property search and preferences
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-[#51faaa] text-[#111] shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
