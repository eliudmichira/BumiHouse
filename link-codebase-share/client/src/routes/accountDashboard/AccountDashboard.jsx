import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Settings, Heart, Home, MessageCircle, LogOut, 
  Edit, Phone, Mail, MapPin, Calendar, Star, Eye,
  Plus, Search, Filter, Bookmark, Share2, MessageSquare,
  Shield, CreditCard, Bell, HelpCircle, FileText, AlertCircle, Trash2, ChevronRight,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { accountDashboardAPI } from '../../lib/firebaseAPI';
import { DashboardLoader } from '../../components/Preloader';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AccountDashboard = () => {
  // Removed useSearchParams to fix React 19 compatibility issue
  const { logout, currentUser, getUserRole, isVerifiedAgent } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    name: 'User',
    email: 'user@example.com',
    phone: '+254 700 000 000',
    avatar: null,
    joinDate: '2024-01-15',
    verified: true,
    role: 'Property Seeker',
    location: 'Nairobi, Kenya',
    bio: 'Passionate about real estate and helping people find their perfect home.',
    preferences: {
      notifications: true,
      emailAlerts: true,
      smsAlerts: false,
      marketingEmails: false
    }
  });
  const [favorites, setFavorites] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalViews: 0,
    totalInquiries: 0,
    averageRating: 0,
    conversionRate: 0,
    properties: 0
  });
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingReviews: 0
  });
  const [loading, setLoading] = useState(true);

  const userRole = getUserRole ? getUserRole() : 'user';
  const isAgent = userRole === 'agent' || isVerifiedAgent;
  const isAdmin = userRole === 'admin';
  
  const tabs = isAdmin ? [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'admin-panel', label: 'Admin Panel', icon: Shield },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'property-moderation', label: 'Property Moderation', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] : isAgent ? [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'my-properties', label: 'My Properties', icon: Home },
    { id: 'inquiries', label: 'Inquiries', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] : [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'searches', label: 'Saved Searches', icon: Search },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Load user data and dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const userRole = getUserRole ? getUserRole() : 'user';
        const isAgent = userRole === 'agent' || isVerifiedAgent;
        const isAdmin = userRole === 'admin';
        
        // Update user info
        setUser(prevUser => ({
          ...prevUser,
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || 'user@example.com',
          avatar: currentUser.photoURL || null,
          joinDate: currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toISOString() : '2024-01-15',
          verified: isAgent || isAdmin || currentUser.verified,
          role: isAdmin ? 'Administrator' : isAgent ? 'Verified Agent' : 'Property Seeker',
          bio: isAdmin 
            ? 'System administrator with full access to manage the platform, users, and properties.'
            : isAgent 
              ? 'Professional real estate agent with expertise in Kenyan property market. Helping clients find their perfect homes and investment opportunities.'
              : 'Passionate about real estate and helping people find their perfect home.',
        }));

        // Load user's properties
        const userProperties = await accountDashboardAPI.getUserProperties(currentUser.id);
        setMyProperties(userProperties);

        // Load user's favorites
        const userFavorites = await accountDashboardAPI.getUserFavorites(currentUser.id);
        setFavorites(userFavorites);

        // Load user's bookings
        const userBookings = await accountDashboardAPI.getUserBookings(currentUser.id);
        setBookings(userBookings);

        // If agent, load additional data
        if (isAgent) {
          const agentInquiries = await accountDashboardAPI.getAgentInquiries(currentUser.id);
          setInquiries(agentInquiries);

          const agentAnalytics = await accountDashboardAPI.getAgentAnalytics(currentUser.id);
          setAnalytics(agentAnalytics);
        }

        // If admin, load platform stats
        if (isAdmin) {
          try {
            const [usersSnap, propertiesSnap] = await Promise.all([
              getDocs(collection(db, 'users')),
              getDocs(collection(db, 'properties'))
            ]);
            
            const totalUsers = usersSnap.docs.length;
            const totalProperties = propertiesSnap.docs.length;
            const pendingReviews = propertiesSnap.docs.filter(doc => doc.data().status === 'pending').length;
            
            setAdminStats({
              totalUsers,
              totalProperties,
              pendingReviews
            });
          } catch (error) {
            console.error('Error loading admin stats:', error);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser, getUserRole, isVerifiedAgent]);

  // Temporarily remove URL parameter handling
  // useEffect(() => {
  //   const tabFromUrl = searchParams.get('tab');
  //   if (tabFromUrl && tabs.some(tab => tab.id === tabFromUrl)) {
  //     setActiveTab(tabFromUrl);
  //   }
  // }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Temporarily remove URL search params update
    // setSearchParams({ tab: tabId });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-8 border`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-[#111]" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#51faaa] rounded-full flex items-center justify-center border-2 border-[#10121e]">
              <Edit className="w-4 h-4 text-[#111]" />
            </div>
          </div>
          
                     {/* User Info */}
           <div className="flex-1">
             <div className="flex items-center gap-3 mb-2">
               <h3 className={`text-2xl font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{user.name}</h3>
               {user.verified && (
                 <div className="flex items-center px-3 py-1 bg-[#51faaa]/20 rounded-full">
                   <Shield className="w-4 h-4 text-[#51faaa] mr-1" />
                   <span className="text-[#51faaa] text-sm font-outfit font-medium">Verified</span>
                 </div>
               )}
             </div>
             <p className={`font-outfit text-lg mb-1 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{user.email}</p>
             <p className="text-[#51faaa] font-outfit font-medium">{user.role}</p>
           </div>
          
                     {/* Action Buttons */}
           <div className="flex gap-3">
             <button className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 transition-all duration-300 flex items-center gap-2">
               <Edit className="w-4 h-4" />
               <span>Edit Profile</span>
             </button>
             <button className={`${isDark ? 'bg-[#0a0c19]' : 'bg-gray-100'} text-[#51faaa] font-outfit font-semibold px-6 py-3 rounded-xl border border-[#51faaa]/30 hover:bg-[#51faaa]/10 transition-all duration-300`}>
               Share Profile
             </button>
           </div>
        </div>
        
                 {/* Bio */}
         <div className="mb-6">
           <h4 className={`text-lg font-outfit font-semibold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>About</h4>
           <p className={`font-outfit leading-relaxed ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{user.bio}</p>
         </div>
        
                 {/* Contact & Details Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)]' : 'bg-gray-50 border-gray-200'}`}>
             <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
               <Phone className="w-5 h-5 text-[#51faaa]" />
             </div>
             <div>
               <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Phone</p>
               <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{user.phone}</p>
             </div>
           </div>
           
           <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)]' : 'bg-gray-50 border-gray-200'}`}>
             <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
               <MapPin className="w-5 h-5 text-[#51faaa]" />
             </div>
             <div>
               <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Location</p>
               <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{user.location}</p>
             </div>
           </div>
           
           <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)]' : 'bg-gray-50 border-gray-200'}`}>
             <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
               <Calendar className="w-5 h-5 text-[#51faaa]" />
             </div>
             <div>
               <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Member Since</p>
               <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
           </div>
         </div>
      </div>

             {/* Account Stats */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {isAgent ? (
           <>
                           <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border text-center`}>
                <div className="w-12 h-12 bg-[#51faaa]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Home className="w-6 h-6 text-[#51faaa]" />
                </div>
                <h4 className={`text-2xl font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{analytics.properties}</h4>
                <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Active Listings</p>
              </div>
              
              <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border text-center`}>
                <div className="w-12 h-12 bg-[#51faaa]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-[#51faaa]" />
                </div>
                <h4 className={`text-2xl font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{analytics.totalViews.toLocaleString()}</h4>
                <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Total Views</p>
              </div>
              
              <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border text-center`}>
                <div className="w-12 h-12 bg-[#51faaa]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-[#51faaa]" />
                </div>
                <h4 className={`text-2xl font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{analytics.totalInquiries}</h4>
                <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Inquiries</p>
              </div>
              
              <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border text-center`}>
                <div className="w-12 h-12 bg-[#51faaa]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-[#51faaa]" />
                </div>
                <h4 className={`text-2xl font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{analytics.averageRating}</h4>
                <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Rating</p>
              </div>
           </>
         ) : (
           <>
             <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border text-center`}>
               <div className="w-12 h-12 bg-[#51faaa]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <Heart className="w-6 h-6 text-[#51faaa]" />
               </div>
               <h4 className={`text-2xl font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{favorites.length}</h4>
               <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Favorites</p>
             </div>
             
             <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border text-center`}>
               <div className="w-12 h-12 bg-[#51faaa]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <Home className="w-6 h-6 text-[#51faaa]" />
               </div>
               <h4 className={`text-2xl font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{myProperties.length}</h4>
               <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Properties</p>
             </div>
             
             <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border text-center`}>
               <div className="w-12 h-12 bg-[#51faaa]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <Calendar className="w-6 h-6 text-[#51faaa]" />
               </div>
               <h4 className={`text-2xl font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{bookings.length}</h4>
               <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Bookings</p>
             </div>
             
             <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border text-center`}>
               <div className="w-12 h-12 bg-[#51faaa]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <MessageCircle className="w-6 h-6 text-[#51faaa]" />
               </div>
               <h4 className={`text-2xl font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>0</h4>
               <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Messages</p>
             </div>
           </>
         )}
       </div>
    </div>
  );

  const renderFavoritesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-outfit font-bold text-[#feffff]">Favorite Properties</h3>
        <Link to="/desktop/properties" className="text-[#51faaa] font-outfit hover:underline">
          Browse More Properties
        </Link>
      </div>
      
      {favorites.length === 0 ? (
        <div className="bg-[#10121e] rounded-2xl p-8 text-center border border-[rgba(81,250,170,0.2)]">
          <Heart className="w-16 h-16 text-[#51faaa] mx-auto mb-4" />
          <h4 className="text-lg font-outfit font-semibold text-[#feffff] mb-2">No favorites yet</h4>
          <p className="text-[#ccc] font-outfit mb-4">Start exploring properties and save your favorites</p>
          <Link to="/desktop/properties" className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Favorite property cards would go here */}
        </div>
      )}
    </div>
  );

  const renderSearchesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-outfit font-bold text-[#feffff]">Saved Searches</h3>
        <Link to="/desktop/properties" className="text-[#51faaa] font-outfit hover:underline">
          Start New Search
        </Link>
      </div>
      
      <div className="bg-[#10121e] rounded-2xl p-8 text-center border border-[rgba(81,250,170,0.2)]">
        <Search className="w-16 h-16 text-[#51faaa] mx-auto mb-4" />
        <h4 className="text-lg font-outfit font-semibold text-[#feffff] mb-2">No saved searches yet</h4>
        <p className="text-[#ccc] font-outfit mb-4">Save your search criteria to get notified about new properties</p>
        <Link to="/desktop/properties" className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
          Start Searching
        </Link>
      </div>
    </div>
  );

  const renderMyPropertiesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-outfit font-bold text-[#feffff]">My Properties</h3>
        <Link to="/properties/add" className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Property</span>
        </Link>
      </div>
      
      {myProperties.length === 0 ? (
        <div className="bg-[#10121e] rounded-2xl p-8 text-center border border-[rgba(81,250,170,0.2)]">
          <Home className="w-16 h-16 text-[#51faaa] mx-auto mb-4" />
          <h4 className="text-lg font-outfit font-semibold text-[#feffff] mb-2">No properties listed</h4>
          <p className="text-[#ccc] font-outfit mb-4">Start listing your properties to reach potential tenants</p>
          <Link to="/properties/add" className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
            List Your Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My property cards would go here */}
        </div>
      )}
    </div>
  );

  const renderBookingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-outfit font-bold text-[#feffff]">My Bookings</h3>
      
      {bookings.length === 0 ? (
        <div className="bg-[#10121e] rounded-2xl p-8 text-center border border-[rgba(81,250,170,0.2)]">
          <Calendar className="w-16 h-16 text-[#51faaa] mx-auto mb-4" />
          <h4 className="text-lg font-outfit font-semibold text-[#feffff] mb-2">No bookings yet</h4>
          <p className="text-[#ccc] font-outfit mb-4">Book property viewings to see your appointments here</p>
          <Link to="/desktop/properties" className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Booking cards would go here */}
        </div>
      )}
    </div>
  );

  const renderMessagesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-outfit font-bold text-[#feffff]">Messages</h3>
        <Link to="/messages" className="text-[#51faaa] font-outfit hover:underline">
          View All Messages
        </Link>
      </div>
      
      <div className="bg-[#10121e] rounded-2xl p-8 text-center border border-[rgba(81,250,170,0.2)]">
        <MessageCircle className="w-16 h-16 text-[#51faaa] mx-auto mb-4" />
        <h4 className="text-lg font-outfit font-semibold text-[#feffff] mb-2">No messages yet</h4>
        <p className="text-[#ccc] font-outfit mb-4">Your conversations with agents and landlords will appear here</p>
        <Link to="/desktop/properties" className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
          Start Browsing
        </Link>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className={`text-2xl font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Account Settings</h3>
        <button className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 transition-all duration-300">
          Save Changes
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications Settings */}
        <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border`}>
          <h4 className={`text-xl font-outfit font-semibold mb-6 flex items-center gap-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
            <Bell className="w-6 h-6 text-[#51faaa]" />
            Notifications
          </h4>
          
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              isDark 
                ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)]' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#51faaa]" />
                <div>
                  <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Email Notifications</p>
                  <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Receive updates via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={user.preferences.emailAlerts} />
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#51faaa] ${
                  isDark ? 'bg-[#0a0c19]' : 'bg-gray-300'
                }`}></div>
              </label>
            </div>
            
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              isDark 
                ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)]' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#51faaa]" />
                <div>
                  <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Push Notifications</p>
                  <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Get instant alerts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={user.preferences.notifications} />
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#51faaa] ${
                  isDark ? 'bg-[#0a0c19]' : 'bg-gray-300'
                }`}></div>
              </label>
            </div>
            
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              isDark 
                ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)]' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#51faaa]" />
                <div>
                  <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>SMS Alerts</p>
                  <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Receive text messages</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={user.preferences.smsAlerts} />
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#51faaa] ${
                  isDark ? 'bg-[#0a0c19]' : 'bg-gray-300'
                }`}></div>
              </label>
            </div>
            
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              isDark 
                ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)]' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#51faaa]" />
                <div>
                  <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Marketing Emails</p>
                  <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Receive promotional content</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={user.preferences.marketingEmails} />
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#51faaa] ${
                  isDark ? 'bg-[#0a0c19]' : 'bg-gray-300'
                }`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border`}>
          <h4 className={`text-xl font-outfit font-semibold mb-6 flex items-center gap-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
            <Shield className="w-6 h-6 text-[#51faaa]" />
            Security & Privacy
          </h4>
          
          <div className="space-y-4">
            <button className={`w-full text-left flex items-center justify-between p-4 rounded-xl transition-colors border ${
              isDark 
                ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)] hover:bg-[rgba(81,250,170,0.1)]' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#51faaa]" />
                <div>
                  <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Change Password</p>
                  <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Update your password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#51faaa]" />
            </button>
            
            <button className={`w-full text-left flex items-center justify-between p-4 rounded-xl transition-colors border ${
              isDark 
                ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)] hover:bg-[rgba(81,250,170,0.1)]' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#51faaa]" />
                <div>
                  <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Payment Methods</p>
                  <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Manage your cards</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#51faaa]" />
            </button>
            
            <button className={`w-full text-left flex items-center justify-between p-4 rounded-xl transition-colors border ${
              isDark 
                ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)] hover:bg-[rgba(81,250,170,0.1)]' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#51faaa]" />
                <div>
                  <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Privacy Settings</p>
                  <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Control your data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#51faaa]" />
            </button>
          </div>
        </div>
      </div>

      {/* Support & Help */}
      <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border`}>
        <h4 className={`text-xl font-outfit font-semibold mb-6 flex items-center gap-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
          <HelpCircle className="w-6 h-6 text-[#51faaa]" />
          Support & Help
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className={`text-left flex items-center justify-between p-4 rounded-xl transition-colors border ${
            isDark 
              ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)] hover:bg-[rgba(81,250,170,0.1)]' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#51faaa]" />
              <div>
                <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Help Center</p>
                <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Find answers quickly</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#51faaa]" />
          </button>
          
          <button className={`text-left flex items-center justify-between p-4 rounded-xl transition-colors border ${
            isDark 
              ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.1)] hover:bg-[rgba(81,250,170,0.1)]' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#51faaa]" />
              <div>
                <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Terms & Privacy</p>
                <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Read our policies</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#51faaa]" />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={`${isDark ? 'bg-[#10121e]' : 'bg-white'} rounded-2xl p-6 border border-red-500/20 shadow-lg`}>
        <h4 className="text-xl font-outfit font-semibold text-red-400 mb-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          Danger Zone
        </h4>
        
        <div className="space-y-4">
          <button className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 font-outfit font-semibold px-6 py-3 rounded-xl border border-red-500/30 hover:bg-red-500/20 transition-all duration-300">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          
          <button className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-400 font-outfit font-semibold px-6 py-3 rounded-xl border border-red-600/30 hover:bg-red-600/20 transition-all duration-300">
            <Trash2 className="w-5 h-5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderInquiriesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-outfit font-bold text-[#feffff]">Client Inquiries</h3>
        <span className="text-sm text-[#ccc]">{inquiries.length} total inquiries</span>
      </div>
      
      {inquiries.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-outfit font-semibold text-[#feffff] mb-2">No inquiries yet</h3>
          <p className="text-[#ccc] font-outfit mb-4">
            Client inquiries from your property listings will appear here
          </p>
          <p className="text-sm text-[#666] font-outfit">
            Start listing properties to receive inquiries from potential clients
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className={`font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                    {inquiry.clientName || 'Anonymous Client'}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                    {inquiry.clientEmail || 'No email provided'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  inquiry.status === 'responded' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {inquiry.status || 'new'}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'} mb-3`}>
                {inquiry.message || 'No message provided'}
              </p>
              <div className="flex justify-between items-center text-xs text-[#666]">
                <span>Property: {inquiry.propertyTitle || 'Unknown Property'}</span>
                <span>{inquiry.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-outfit font-bold text-[#feffff]">Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="text-2xl font-bold">KES {analytics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Conversion Rate</p>
              <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Average Rating</p>
              <p className="text-2xl font-bold">{analytics.averageRating}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
          <h4 className={`text-lg font-outfit font-semibold mb-4 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Performance Overview</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Total Views</span>
              <span className="font-semibold text-[#51faaa]">{analytics.totalViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Total Inquiries</span>
              <span className="font-semibold text-[#51faaa]">{analytics.totalInquiries}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Active Properties</span>
              <span className="font-semibold text-[#51faaa]">{analytics.properties}</span>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
          <h4 className={`text-lg font-outfit font-semibold mb-4 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Recent Activity</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#51faaa] rounded-full"></div>
              <span className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                {analytics.properties} properties listed
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                {analytics.totalInquiries} inquiries received
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                {analytics.conversionRate}% conversion rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminPanelTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-outfit font-bold text-[#feffff]">Admin Panel</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Total Users</p>
              <p className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Total Properties</p>
              <p className="text-2xl font-bold">{adminStats.totalProperties.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Pending Reviews</p>
              <p className="text-2xl font-bold">{adminStats.pendingReviews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#10121e] rounded-2xl p-8 text-center border border-[rgba(81,250,170,0.2)]">
        <Shield className="w-16 h-16 text-[#51faaa] mx-auto mb-4" />
        <h4 className="text-lg font-outfit font-semibold text-[#feffff] mb-2">Admin Dashboard</h4>
        <p className="text-[#ccc] font-outfit mb-4">Manage the platform, users, and properties from here</p>
        <Link to="/admin" className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
          Go to Admin Dashboard
        </Link>
      </div>
    </div>
  );

  const renderUserManagementTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-outfit font-bold text-[#feffff]">User Management</h3>
      
      <div className="bg-[#10121e] rounded-2xl p-8 text-center border border-[rgba(81,250,170,0.2)]">
        <Users className="w-16 h-16 text-[#51faaa] mx-auto mb-4" />
        <h4 className="text-lg font-outfit font-semibold text-[#feffff] mb-2">User Management</h4>
        <p className="text-[#ccc] font-outfit mb-4">Manage user accounts, roles, and permissions</p>
        <Link to="/admin/users" className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
          Manage Users
        </Link>
      </div>
    </div>
  );

  const renderPropertyModerationTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-outfit font-bold text-[#feffff]">Property Moderation</h3>
      
      <div className="bg-[#10121e] rounded-2xl p-8 text-center border border-[rgba(81,250,170,0.2)]">
        <Home className="w-16 h-16 text-[#51faaa] mx-auto mb-4" />
        <h4 className="text-lg font-outfit font-semibold text-[#feffff] mb-2">Property Moderation</h4>
        <p className="text-[#ccc] font-outfit mb-4">Review and moderate property listings</p>
        <Link to="/admin/properties" className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
          Moderate Properties
        </Link>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'favorites':
        return renderFavoritesTab();
      case 'searches':
        return renderSearchesTab();
      case 'messages':
        return renderMessagesTab();
      case 'my-properties':
        return renderMyPropertiesTab();
      case 'inquiries':
        return renderInquiriesTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'admin-panel':
        return renderAdminPanelTab();
      case 'user-management':
        return renderUserManagementTab();
      case 'property-moderation':
        return renderPropertyModerationTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderProfileTab();
    }
  };

  if (loading || !currentUser) {
    return (
      <div className={`min-h-screen pt-32 pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DashboardLoader text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-32 pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className={`text-4xl font-outfit font-bold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>My Account</h1>
          <p className={`font-outfit text-lg ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Manage your profile, properties, and preferences</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border sticky top-32`}>
              <div className="mb-6">
                <h3 className={`text-lg font-outfit font-semibold mb-2 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Account Menu</h3>
                <p className={`font-outfit text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Navigate your account settings</p>
              </div>
              
              <nav className="space-y-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                                         <button
                       key={tab.id}
                       onClick={() => handleTabChange(tab.id)}
                       className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-outfit transition-all duration-300 group ${
                         activeTab === tab.id
                           ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] shadow-lg shadow-[#51faaa]/25'
                           : isDark 
                             ? 'text-[#ccc] hover:bg-[rgba(81,250,170,0.1)] hover:text-[#51faaa]'
                             : 'text-gray-600 hover:bg-[rgba(81,250,170,0.1)] hover:text-[#51faaa]'
                       }`}
                     >
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                         activeTab === tab.id
                           ? 'bg-[#111]/20'
                           : 'bg-[#51faaa]/10 group-hover:bg-[#51faaa]/20'
                       }`}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                         <span className="font-medium">{tab.label}</span>
                       </div>
                     </button>
                  );
                })}
              </nav>
              
                                             {/* Quick Stats */}
                <div className={`mt-8 pt-6 border-t ${isDark ? 'border-[rgba(81,250,170,0.2)]' : 'border-gray-200'}`}>
                  <h4 className={`text-sm font-outfit font-semibold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Quick Stats</h4>
                                     <div className="space-y-2">
                     {isAdmin ? (
                       <>
                         <div className="flex justify-between items-center text-sm">
                           <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Total Users</span>
                           <span className="text-[#51faaa] font-medium">{adminStats.totalUsers.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Total Properties</span>
                           <span className="text-[#51faaa] font-medium">{adminStats.totalProperties.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Pending Reviews</span>
                           <span className="text-[#51faaa] font-medium">{adminStats.pendingReviews.toLocaleString()}</span>
                         </div>
                       </>
                     ) : isAgent ? (
                       <>
                         <div className="flex justify-between items-center text-sm">
                           <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Properties</span>
                           <span className="text-[#51faaa] font-medium">{analytics.properties}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Inquiries</span>
                           <span className="text-[#51faaa] font-medium">{analytics.totalInquiries}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Views</span>
                           <span className="text-[#51faaa] font-medium">{analytics.totalViews.toLocaleString()}</span>
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="flex justify-between items-center text-sm">
                           <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Favorites</span>
                           <span className="text-[#51faaa] font-medium">{favorites.length}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Saved Searches</span>
                           <span className="text-[#51faaa] font-medium">0</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className={isDark ? 'text-[#ccc]' : 'text-gray-600'}>Messages</span>
                           <span className="text-[#51faaa] font-medium">0</span>
                         </div>
                       </>
                     )}
                   </div>
                </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
