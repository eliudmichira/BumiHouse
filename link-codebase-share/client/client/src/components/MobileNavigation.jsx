import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Plus, 
  User, 
  Menu, 
  X, 
  MapPin, 
  Heart, 
  MessageCircle,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMobileDetection } from '../hooks/useMobileDetection';
import Logo from './Logo';

const MobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isMobile } = useMobileDetection(768);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/properties' },
    { icon: Plus, label: 'Add', path: '/properties/add' },
    { icon: User, label: 'Profile', path: '/dashboard' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };



  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden ${
        isDark ? 'bg-gray-900 border-t border-gray-700' : 'bg-white border-t border-gray-200'
      }`}>
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-[#51faaa] text-[#0a0c19] shadow-lg'
                  : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-white/95'}`} />
          <div className="relative z-10 flex flex-col h-full">
            {/* Search Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setIsSearchOpen(false)}
                className={`p-2 rounded-lg ${
                  isDark ? 'text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Search Properties
              </h2>
              <div className="w-10" />
            </div>

            {/* Search Form */}
            <div className="flex-1 p-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search by location, address, or ZIP"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#51faaa] ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                    autoFocus
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-semibold shadow-lg"
                >
                  Search Properties
                </button>
              </form>

              {/* Quick Search Suggestions */}
              <div className="mt-6">
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Popular Locations
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'].map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSearchQuery(location);
                        navigate(`/properties?search=${encodeURIComponent(location)}`);
                        setIsSearchOpen(false);
                      }}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        isDark 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <MapPin className="w-4 h-4 mb-1" />
                      <span className="text-sm font-medium">{location}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-white/95'}`} />
          <div className="relative z-10 flex flex-col h-full">
            {/* Menu Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <Logo isDark={isDark} />
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`p-2 rounded-lg ${
                  isDark ? 'text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 p-4 space-y-4">
              {currentUser ? (
                <>
                  {/* User Info */}
                  <div className={`p-4 rounded-xl ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-[#0a0c19]" />
                      </div>
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {currentUser.name || 'User'}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span>My Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/favorites"
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Favorites</span>
                    </Link>
                    
                    <Link
                      to="/messages"
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Messages</span>
                    </Link>
                    
                    <button
                      onClick={toggleTheme}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Toggle Theme</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="w-full py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-semibold text-center shadow-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`w-full py-3 border-2 rounded-xl font-semibold text-center transition-colors ${
                      isDark 
                        ? 'border-gray-700 text-white hover:bg-gray-800' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Search */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="fixed bottom-20 right-4 z-40 lg:hidden w-14 h-14 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-full shadow-lg flex items-center justify-center"
      >
        <Search className="w-6 h-6 text-[#0a0c19]" />
      </button>
    </>
  );
};

export default MobileNavigation;
