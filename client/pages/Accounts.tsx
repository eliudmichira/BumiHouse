import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Package, 
  CreditCard, 
  MapPin, 
  Settings, 
  Bell, 
  Heart, 
  LogOut, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Shield,
  Calendar,
  RefreshCw,
  Camera,
  Mail,
  Phone,
  ShoppingBag,
  Briefcase,
  Truck,
  X,
  Search,
  DollarSign,
  Star,
  Check,
  Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForms from './Accounts/components/AuthForms';
import { useCart } from '../context/CartContext';

// Sample user data - in a real app this would come from your backend OR Firebase Auth
// We will adapt this to use currentUser from useAuth
const defaultUserData = {
  name: "Guest User",
  email: "guest@example.com",
  phone: "N/A",
  joinDate: "N/A",
  avatarUrl: "/placeholder-avatar.png", // Generic placeholder
  orders: [],
  savedItems: [],
  paymentMethods: [],
  addresses: [],
  notifications: {
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    productUpdates: true
  }
};

// Loading component
const AccountLoadingSpinner: React.FC = () => (
  <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center text-center p-8">
    <div className="w-12 h-12 border-4 border-primaryRed border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading Account Details...</p>
  </div>
);

// Account Page Component
const AccountPage: React.FC = () => {
  const { currentUser, loading, signOutUser } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('overview');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [mobileNav, setMobileNav] = useState(false);
  
  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileNav(false);
      }
    };
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/'); // Redirect to home page after sign out
    } catch (error) {
      console.error("Failed to sign out", error);
      // Optionally show an error message to the user
    }
  };
  
  // Dynamically create userData based on currentUser
  const currentDisplayUser = currentUser 
    ? {
        ...defaultUserData, // Start with defaults
        name: currentUser.displayName || "Hama Estate User",
        email: currentUser.email || "No email provided",
        avatarUrl: currentUser.photoURL || defaultUserData.avatarUrl,
        // joinDate can be derived from currentUser.metadata.creationTime if needed
        // For orders, savedItems, etc., you'd fetch this from your backend using currentUser.uid
      }
    : defaultUserData;

  const tabContent = {
    overview: <AccountOverview userData={currentDisplayUser} setActiveTab={setActiveTab} />,
    orders: <OrderHistory orders={currentDisplayUser.orders} />,
    saved: <SavedItems items={currentDisplayUser.savedItems} />,
    payment: <PaymentMethods paymentMethods={currentDisplayUser.paymentMethods} />,
    addresses: <AddressBook addresses={currentDisplayUser.addresses} />,
    settings: <AccountSettings userData={currentDisplayUser} />
  };
  
  if (loading) {
    return <AccountLoadingSpinner />;
  }

  if (!currentUser) {
    // User is not logged in, show AuthForms centered on the page
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <AuthForms />
      </div>
    );
  }

  // User is logged in, show account management UI
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      {/* Page header */}
      <header className={`sticky top-16 z-20 transition-all duration-300 ${isScrolled ? 'py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm' : 'py-6 bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primaryRed to-berry overflow-hidden">
                <img 
                  src={currentDisplayUser.avatarUrl} 
                  alt={currentDisplayUser.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  My Account
                  {isMobile && (
                    <button 
                      onClick={() => setMobileNav(!mobileNav)}
                      className="ml-2 p-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <ChevronRight className={`w-4 h-4 transform transition-transform ${mobileNav ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {currentDisplayUser.name.split(' ')[0]}
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <Link 
                to="/products"  // Changed from /shop
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
              <button 
                onClick={handleSignOut} // Use new sign out handler
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Drawer */}
          <AnimatePresence>
            {mobileNav && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden mt-4 overflow-hidden"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {renderMobileNavItems(activeTab, setActiveTab, setMobileNav, handleSignOut)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={currentDisplayUser.avatarUrl} 
                      alt={currentDisplayUser.name}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-accentGreen rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{currentDisplayUser.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {currentDisplayUser.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <nav className="p-2">
                <ul className="space-y-1">
                  {renderNavItems(activeTab, setActiveTab)}
                </ul>
              </nav>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={handleSignOut} // Use new sign out handler
                  className="w-full py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </div>
          </aside>
          
          {/* Main Content Area */}
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {tabContent[activeTab as keyof typeof tabContent]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Items Renderer
const renderNavItems = (activeTab: string, setActiveTab: (tab: string) => void) => {
  const navItems = [
    { id: 'overview', label: 'Account Overview', icon: <User className="w-5 h-5" /> },
    { id: 'orders', label: 'Order History', icon: <Package className="w-5 h-5" /> },
    { id: 'saved', label: 'Saved Items', icon: <Heart className="w-5 h-5" /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'addresses', label: 'Address Book', icon: <MapPin className="w-5 h-5" /> },
    { id: 'settings', label: 'Account Settings', icon: <Settings className="w-5 h-5" /> }
  ];
  
  return navItems.map(item => (
    <li key={item.id}>
      <button
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
          activeTab === item.id
            ? 'bg-primaryRed/10 text-primaryRed dark:bg-primaryRed/20 dark:text-primaryRed/90'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
        {activeTab === item.id && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-primaryRed dark:bg-primaryRed/90"
          />
        )}
      </button>
    </li>
  ));
};

// Mobile Navigation Items Renderer
const renderMobileNavItems = (
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  setMobileNav: (isOpen: boolean) => void,
  handleSignOut: () => void
) => {
  const navItems = [
    { id: 'overview', label: 'Account Overview', icon: <User className="w-5 h-5" /> },
    { id: 'orders', label: 'Order History', icon: <Package className="w-5 h-5" /> },
    { id: 'saved', label: 'Saved Items', icon: <Heart className="w-5 h-5" /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'addresses', label: 'Address Book', icon: <MapPin className="w-5 h-5" /> },
    { id: 'settings', label: 'Account Settings', icon: <Settings className="w-5 h-5" /> }
  ];
  
  return (
    <>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            setMobileNav(false);
          }}
          className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
            activeTab === item.id
              ? 'bg-primaryRed/10 text-primaryRed dark:bg-primaryRed/20 dark:text-primaryRed/90'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>
      ))}
      <button 
        onClick={() => {
          handleSignOut();
          setMobileNav(false);
        }}
        className="w-full flex items-center gap-3 p-4 text-left text-red-500 dark:text-red-400"
      >
        <LogOut className="w-5 h-5" />
        <span>Log Out</span>
      </button>
    </>
  );
};

// Account Overview Component with enhanced dashboard features
const AccountOverview: React.FC<{ userData: any; setActiveTab: (tab: string) => void }> = ({ userData, setActiveTab }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [recentOrders, setRecentOrders] = useState([
    { 
      id: 'ORD-2024-001', 
      date: '2024-01-15', 
      total: 240.00, 
      status: 'delivered', 
      items: 3,
      trackingNumber: 'TN892847392',
      estimatedDelivery: '2024-01-18',
      products: ['Strawberry Yogurt 150ml', 'Vanilla Yogurt 500ml', 'Probiotic Supplement']
    },
    { 
      id: 'ORD-2024-002', 
      date: '2024-01-10', 
      total: 180.00, 
      status: 'shipped', 
      items: 2,
      trackingNumber: 'TN892847393',
      estimatedDelivery: '2024-01-16',
      products: ['Berry Yogurt 1L', 'Vanilla Yogurt 150ml']
    },
    { 
      id: 'ORD-2024-003', 
      date: '2024-01-05', 
      total: 320.00, 
      status: 'processing', 
      items: 4,
      trackingNumber: 'TN892847394',
      estimatedDelivery: '2024-01-17',
      products: ['Mixed Yogurt Pack', 'Probiotic Capsules', 'Organic Honey']
    },
  ]);

  const [favoriteProducts, setFavoriteProducts] = useState([
    { 
      id: 1, 
      name: 'Strawberry Yogurt 150ml', 
      price: 120.00, 
      image: '/src/assets/red cup with strawberries beside it.jpg',
      rating: 4.8,
      reviews: 124,
      inStock: true,
      discount: 10
    },
    { 
      id: 2, 
      name: 'Vanilla Yogurt 500ml', 
      price: 320.00, 
      image: '/src/assets/vanilla with fruits beside the cup.jpg',
      rating: 4.9,
      reviews: 89,
      inStock: true,
      discount: 0
    },
    { 
      id: 3, 
      name: 'Probiotic Berry Mix', 
      price: 450.00, 
      image: '/src/assets/berry red cup image.jpg',
      rating: 4.7,
      reviews: 156,
      inStock: false,
      discount: 15
    },
  ]);

  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [nextRewardAt, setNextRewardAt] = useState(1500);
  const [healthMetrics, setHealthMetrics] = useState({
    weeklyConsumption: 8,
    totalProbiotics: 24,
    healthScore: 85,
    streakDays: 12
  });

  const [activityData, setActivityData] = useState([
    { month: 'Sep', orders: 3, amount: 540 },
    { month: 'Oct', orders: 5, amount: 890 },
    { month: 'Nov', orders: 4, amount: 720 },
    { month: 'Dec', orders: 6, amount: 1140 },
    { month: 'Jan', orders: 3, amount: 740 }
  ]);

  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([
    {
      id: 1,
      title: "Continue Your Probiotic Journey",
      description: "Based on your purchase history, we recommend maintaining your daily probiotic intake",
      action: "Shop Probiotics",
      icon: "🦠",
      priority: "high"
    },
    {
      id: 2,
      title: "Vitamin D Boost",
      description: "Winter months call for extra Vitamin D. Try our fortified yogurt varieties",
      action: "Explore Options",
      icon: "☀️",
      priority: "medium"
    },
    {
      id: 3,
      title: "Loyalty Reward Coming Soon",
      description: `You're only ${nextRewardAt - loyaltyPoints} points away from your next reward!`,
      action: "View Rewards",
      icon: "🎁",
      priority: "low"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'border-l-green-400 bg-green-50 dark:bg-green-900/10';
      default: return 'border-l-gray-400 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const handleAddToCart = (product: any) => {
    if (!product.inStock) {
      alert('Sorry, this product is currently out of stock.');
      return;
    }

    const finalPrice = product.discount > 0 
      ? product.price * (1 - product.discount / 100) 
      : product.price;

    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      quantity: 1
    });
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      ${product.name} added to cart!
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const handleTrackOrder = (orderId: string) => {
    setActiveTab('orders');
  };

  const handleViewAllOrders = () => {
    setActiveTab('orders');
  };

  const calculateSavings = () => {
    return favoriteProducts.reduce((total, product) => {
      if (product.discount > 0) {
        return total + (product.price * product.discount / 100);
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section with Health Metrics */}
      <motion.div
        className="bg-gradient-to-r from-primaryRed via-red-500 to-red-600 dark:from-accentGreen dark:via-green-500 dark:to-green-600 rounded-2xl p-8 text-white overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-2">Welcome back, {userData.name.split(' ')[0]}! 👋</h2>
              <p className="text-white/90 text-lg">Your health journey continues</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-white/80">{healthMetrics.streakDays} day streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-white/80">Health Score: {healthMetrics.healthScore}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-sm text-white/80 mb-1">Loyalty Points</p>
                <p className="text-2xl font-bold">{loyaltyPoints.toLocaleString()}</p>
                <p className="text-xs text-white/70">{nextRewardAt - loyaltyPoints} to next reward</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-sm text-white/80 mb-1">This Month</p>
                <p className="text-2xl font-bold">{healthMetrics.weeklyConsumption}</p>
                <p className="text-xs text-white/70">yogurt servings</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => setActiveTab('orders')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentOrders.length}</p>
              <p className="text-xs text-green-600 dark:text-green-400">+2 this month</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                KES {recentOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Saved KES {calculateSavings().toFixed(2)} with discounts
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => setActiveTab('saved')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
              <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{favoriteProducts.length}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {favoriteProducts.filter(p => p.inStock).length} in stock
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthMetrics.healthScore}%</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">+5% this week</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Personalized Recommendations */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personalized for You</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recommendations based on your health goals and purchase history</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {personalizedRecommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 text-sm bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors"
                  >
                    {rec.action}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders with Enhanced Detail */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
              <button 
                onClick={handleViewAllOrders}
                className="text-sm text-primaryRed dark:text-accentGreen hover:underline flex items-center gap-1"
              >
                View All Orders <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleTrackOrder(order.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">{order.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">KES {order.total.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>{order.items} items • {order.date}</p>
                    <p className="font-mono text-xs">Tracking: {order.trackingNumber}</p>
                    <p className="text-xs">{order.products.join(', ')}</p>
                    {order.status === 'shipped' && (
                      <p className="text-green-600 dark:text-green-400 text-xs font-medium">
                        📦 Expected delivery: {order.estimatedDelivery}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Favorite Products */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Favorites</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quick access to your most loved products</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {favoriteProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    {product.discount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        -{product.discount}%
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{product.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">({product.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-sm font-medium text-primaryRed dark:text-accentGreen">
                            KES {(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            KES {product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-primaryRed dark:text-accentGreen">
                          KES {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      product.inStock
                        ? 'bg-primaryRed text-white hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Quick Actions */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/products')}
          className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-primaryRed dark:hover:border-accentGreen transition-colors group"
        >
          <div className="p-3 bg-primaryRed/10 dark:bg-accentGreen/10 rounded-full group-hover:bg-primaryRed/20 dark:group-hover:bg-accentGreen/20 transition-colors">
            <ShoppingBag className="w-6 h-6 text-primaryRed dark:text-accentGreen" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white text-sm">Shop Now</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('orders')}
          className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-primaryRed dark:hover:border-accentGreen transition-colors group"
        >
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white text-sm">Track Orders</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('saved')}
          className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-primaryRed dark:hover:border-accentGreen transition-colors group"
        >
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
            <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white text-sm">Wishlist</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('settings')}
          className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-primaryRed dark:hover:border-accentGreen transition-colors group"
        >
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white text-sm">Settings</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

// Enhanced Order History Component with comprehensive tracking
const OrderHistory: React.FC<{ orders: any[] }> = ({ orders: initialOrders }) => {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Enhanced mock orders with detailed information
  const [orders, setOrders] = useState([
    {
      id: 'ORD-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 420.00,
      items: [
        { id: 1, name: 'Strawberry Yogurt 150ml', price: 120.00, quantity: 2, image: '/src/assets/red cup with strawberries beside it.jpg' },
        { id: 2, name: 'Vanilla Yogurt 500ml', price: 180.00, quantity: 1, image: '/src/assets/vanilla with fruits beside the cup.jpg' }
      ],
      trackingNumber: 'TN892847392',
      estimatedDelivery: '2024-01-18',
      actualDelivery: '2024-01-17',
      shippingAddress: 'Westlands, Nairobi',
      paymentMethod: 'M-Pesa',
      deliveryFee: 50.00,
      discount: 30.00,
      notes: 'Left at reception',
      rating: 5,
      reviewed: true
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-10',
      status: 'shipped',
      total: 380.00,
      items: [
        { id: 3, name: 'Berry Yogurt 1L', price: 320.00, quantity: 1, image: '/src/assets/berry red cup image.jpg' },
        { id: 4, name: 'Probiotic Supplement', price: 250.00, quantity: 1, image: '/src/assets/products/original/mango.jpg' }
      ],
      trackingNumber: 'TN892847393',
      estimatedDelivery: '2024-01-16',
      shippingAddress: 'Karen, Nairobi',
      paymentMethod: 'Card',
      deliveryFee: 60.00,
      discount: 0.00,
      notes: 'Call on arrival',
      rating: null,
      reviewed: false
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-05',
      status: 'processing',
      total: 690.00,
      items: [
        { id: 5, name: 'Mixed Yogurt Pack (6x)', price: 480.00, quantity: 1, image: '/src/assets/vanilla with fruits beside the cup.jpg' },
        { id: 6, name: 'Organic Honey 250ml', price: 350.00, quantity: 1, image: '/src/assets/red cup with strawberries beside it.jpg' },
        { id: 7, name: 'Probiotic Capsules', price: 180.00, quantity: 1, image: '/src/assets/berry red cup image.jpg' }
      ],
      trackingNumber: 'TN892847394',
      estimatedDelivery: '2024-01-17',
      shippingAddress: 'CBD, Nairobi',
      paymentMethod: 'M-Pesa',
      deliveryFee: 40.00,
      discount: 60.00,
      notes: 'Office delivery',
      rating: null,
      reviewed: false
    },
    {
      id: 'ORD-2023-045',
      date: '2023-12-20',
      status: 'delivered',
      total: 520.00,
      items: [
        { id: 8, name: 'Greek Yogurt 500ml', price: 280.00, quantity: 2, image: '/src/assets/vanilla with fruits beside the cup.jpg' },
        { id: 9, name: 'Organic Granola 250g', price: 180.00, quantity: 1, image: '/src/assets/red cup with strawberries beside it.jpg' }
      ],
      trackingNumber: 'TN892847391',
      estimatedDelivery: '2023-12-23',
      actualDelivery: '2023-12-22',
      shippingAddress: 'Kilimani, Nairobi',
      paymentMethod: 'Card',
      deliveryFee: 50.00,
      discount: 40.00,
      notes: 'Christmas delivery',
      rating: 4,
      reviewed: true
    },
    {
      id: 'ORD-2023-038',
      date: '2023-12-05',
      status: 'cancelled',
      total: 280.00,
      items: [
        { id: 10, name: 'Coconut Yogurt 300ml', price: 160.00, quantity: 2, image: '/src/assets/berry red cup image.jpg' }
      ],
      trackingNumber: 'TN892847390',
      shippingAddress: 'Kasarani, Nairobi',
      paymentMethod: 'M-Pesa',
      deliveryFee: 80.00,
      discount: 0.00,
      notes: 'Cancelled due to stock unavailability',
      rating: null,
      reviewed: false,
      cancelledDate: '2023-12-06',
      refundAmount: 280.00,
      refundStatus: 'processed'
    },
    {
      id: 'ORD-2023-025',
      date: '2023-11-18',
      status: 'delivered',
      total: 640.00,
      items: [
        { id: 11, name: 'Family Pack Yogurt (12x)', price: 720.00, quantity: 1, image: '/src/assets/vanilla with fruits beside the cup.jpg' }
      ],
      trackingNumber: 'TN892847389',
      estimatedDelivery: '2023-11-21',
      actualDelivery: '2023-11-20',
      shippingAddress: 'Runda, Nairobi',
      paymentMethod: 'Card',
      deliveryFee: 100.00,
      discount: 80.00,
      notes: 'Bulk order discount applied',
      rating: 5,
      reviewed: true
    }
  ]);

  // Analytics data calculation
  const getAnalyticsData = () => {
    const monthlySpending = orders.reduce((acc, order) => {
      if (order.status !== 'cancelled') {
        const month = new Date(order.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        acc[month] = (acc[month] || 0) + order.total;
      }
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgOrderValue = orders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0) / orders.filter(order => order.status !== 'cancelled').length;

    const totalSavings = orders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + (order.discount || 0), 0);

    const favoriteProducts = orders
      .flatMap(order => order.items)
      .reduce((acc, item) => {
        const existing = acc.find(p => p.name === item.name);
        if (existing) {
          existing.quantity += item.quantity;
          existing.totalSpent += item.price * item.quantity;
        } else {
          acc.push({
            name: item.name,
            quantity: item.quantity,
            totalSpent: item.price * item.quantity,
            image: item.image
          });
        }
        return acc;
      }, [] as any[])
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    return {
      monthlySpending: Object.entries(monthlySpending).map(([month, amount]) => ({ month, amount })),
      statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({ status, count })),
      avgOrderValue,
      totalSavings,
      favoriteProducts,
      totalOrders: orders.length,
      totalSpent: orders.filter(order => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0)
    };
  };

  const analytics = getAnalyticsData();

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesDate = dateRange === 'all' || 
                          (dateRange === '30d' && new Date(order.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                          (dateRange === '6m' && new Date(order.date) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000));
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount-asc': return a.total - b.total;
        case 'amount-desc': return b.total - a.total;
        default: return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Check className="w-4 h-4 text-green-600" />;
      case 'shipped': return <Truck className="w-4 h-4 text-blue-600" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'cancelled': return <X className="w-4 h-4 text-red-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleTrackPackage = (trackingNumber: string) => {
    // In a real app, this would open a tracking modal or redirect to courier site
    alert(`Tracking package: ${trackingNumber}`);
  };

  const handleReorderItems = (order: any) => {
    order.items.forEach((item: any) => {
      addToCart({
        id: item.id.toString(),
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      });
    });
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = `${order.items.length} items added to cart!`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const handleLeaveReview = (orderId: string) => {
    alert(`Review functionality for order ${orderId} would be implemented here`);
  };

  const handleDownloadInvoice = (orderId: string) => {
    // Simulate invoice download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `invoice-${orderId}.pdf`;
    link.click();
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = `Invoice ${orderId} downloaded!`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const OrderDetailModal = ({ order, onClose }: { order: any; onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">#{order.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Order Status & Tracking */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Order placed on {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {order.trackingNumber && order.status !== 'cancelled' && (
                <button
                  onClick={() => handleTrackPackage(order.trackingNumber)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Track Package
                </button>
              )}
            </div>
            
            {order.status === 'shipped' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  📦 Your order is on the way!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expected delivery: {order.estimatedDelivery}
                </p>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In transit</p>
                </div>
              </div>
            )}

            {order.status === 'delivered' && order.actualDelivery && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">
                  ✅ Delivered successfully!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Delivered on {order.actualDelivery}
                </p>
                {order.notes && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Note: {order.notes}
                  </p>
                )}
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                  ❌ Order cancelled
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Cancelled on {order.cancelledDate}
                </p>
                {order.refundStatus && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Refund: KES {order.refundAmount} ({order.refundStatus})
                  </p>
                )}
                {order.notes && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Reason: {order.notes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity} × KES {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      KES {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Delivery Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Address:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{order.shippingAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tracking:</span>
                  <span className="text-gray-900 dark:text-white font-mono">{order.trackingNumber}</span>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expected:</span>
                    <span className="text-gray-900 dark:text-white">{order.estimatedDelivery}</span>
                  </div>
                )}
                {order.actualDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivered:</span>
                    <span className="text-gray-900 dark:text-white font-medium text-green-600">{order.actualDelivery}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">
                    KES {(order.total - (order.deliveryFee || 0) + (order.discount || 0)).toFixed(2)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                    <span className="text-green-600 dark:text-green-400">-KES {order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                  <span className="text-gray-900 dark:text-white">KES {(order.deliveryFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">KES {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDownloadInvoice(order.id)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Download Invoice
            </motion.button>
            {order.status === 'delivered' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReorderItems(order)}
                className="flex-1 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors"
              >
                Reorder Items
              </motion.button>
            )}
            {order.status === 'delivered' && !order.reviewed && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLeaveReview(order.id)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Leave Review
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Analytics Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order History</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredOrders.length} of {orders.length} orders • Total spent: KES {analytics.totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              showAnalytics 
                ? 'bg-primaryRed text-white dark:bg-accentGreen' 
                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </motion.button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your purchasing patterns and insights</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Orders</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.totalOrders}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Avg Order Value</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">KES {analytics.avgOrderValue.toFixed(0)}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">KES {analytics.totalSavings.toFixed(0)}</p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <Heart className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>

              {/* Favorite Products */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Top Products</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.favoriteProducts.map((product, index) => (
                    <motion.div
                      key={product.name}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">{product.name}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{product.quantity} orders</span>
                          <span className="text-xs text-primaryRed dark:text-accentGreen font-medium">
                            KES {product.totalSpent.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primaryRed dark:focus:ring-accentGreen focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primaryRed dark:focus:ring-accentGreen focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primaryRed dark:focus:ring-accentGreen focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primaryRed dark:focus:ring-accentGreen focus:border-transparent"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Enhanced Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(order.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{order.id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {order.status === 'delivered' && order.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < order.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {new Date(order.date).toLocaleDateString()} • {order.items.length} items • {order.shippingAddress}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mb-2">
                    Tracking: {order.trackingNumber}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                      <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {item.name}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-gray-500">+{order.items.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">KES {order.total.toFixed(2)}</p>
                  {order.discount > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400">Saved KES {order.discount.toFixed(2)}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500">{order.paymentMethod}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  {order.status === 'delivered' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderItems(order);
                      }}
                      className="px-3 py-1 text-xs bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors"
                    >
                      Reorder
                    </motion.button>
                  )}
                  {order.trackingNumber && order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackPackage(order.trackingNumber);
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Track
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
              ? 'Try adjusting your search or filter criteria.' 
              : 'You haven\'t placed any orders yet.'}
          </p>
          {!searchTerm && statusFilter === 'all' && dateRange === 'all' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/products'}
              className="px-6 py-3 bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors"
            >
              Start Shopping
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SavedItems: React.FC<{ items: any[] }> = ({ items: initialItems }) => {
  const { addToCart } = useCart();
  const [savedItems, setSavedItems] = useState([
    {
      id: 1,
      name: 'Strawberry Yogurt 150ml',
      price: 120.00,
      image: '/src/assets/products/berry/strawberry.jpg',
      dateAdded: '2024-01-10'
    },
    {
      id: 2,
      name: 'Vanilla Yogurt 500ml',
      price: 320.00,
      image: '/src/assets/products/vanilla/vanilla.jpg',
      dateAdded: '2024-01-08'
    },
    {
      id: 3,
      name: 'Mango Yogurt 1L',
      price: 550.00,
      image: '/src/assets/products/original/mango.jpg',
      dateAdded: '2024-01-05'
    }
  ]);
  
  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = `${item.name} added to cart!`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const handleRemoveFromSaved = (itemId: number) => {
    setSavedItems(prev => prev.filter(item => item.id !== itemId));
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = 'Item removed from saved items!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };
   if (!savedItems || savedItems.length === 0) {
    return (
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Heart className="w-5 h-5 mr-2 text-primaryRed dark:text-primaryRed/90" />
          Saved Items
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">You have no saved items.</p>
         <Link to="/products" className="mt-4 inline-flex items-center px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 transition-colors gap-1.5">
            <ShoppingBag className="w-4 h-4" /> Browse Products
          </Link>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Heart className="w-5 h-5 mr-2 text-primaryRed dark:text-primaryRed/90" />
          Saved Items
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Products you've saved for later</p>
      </div>
      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {savedItems.map(item => (
            <motion.div 
              key={item.id}
              className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-all"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                />
                <button 
                  onClick={() => handleRemoveFromSaved(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primaryRed hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
              
              <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Added {item.dateAdded}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="font-bold text-primaryRed dark:text-primaryRed/90">KES {item.price.toFixed(2)}</div>
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="p-2 rounded-full bg-primaryRed/10 text-primaryRed hover:bg-primaryRed/20 dark:bg-primaryRed/20 dark:text-primaryRed/90 dark:hover:bg-primaryRed/30 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
    </div>
  );
};

const PaymentMethods: React.FC<{ paymentMethods: any[] }> = ({ paymentMethods: initialMethods }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expiry: '12/26',
      holderName: 'Mich Michira',
      isDefault: true
    },
    {
      id: '2',
      type: 'Mastercard',
      last4: '8888',
      expiry: '09/25',
      holderName: 'Mich Michira',
      isDefault: false
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    isDefault: false
  });

  const getCardTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      default: return '💳';
    }
  };

  const handleAddPaymentMethod = () => {
    setShowAddForm(true);
    setEditingMethod(null);
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
      isDefault: false
    });
  };

  const handleEditPaymentMethod = (method: any) => {
    setEditingMethod(method);
    setShowAddForm(true);
    setFormData({
      cardNumber: `****-****-****-${method.last4}`,
      expiryMonth: method.expiry.split('/')[0],
      expiryYear: method.expiry.split('/')[1],
      cvv: '',
      holderName: method.holderName,
      isDefault: method.isDefault
    });
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Payment method deleted successfully!';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    }
  };

  const handleSubmitPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMethod) {
      // Update existing method
      setPaymentMethods(prev => prev.map(method => 
        method.id === editingMethod.id 
          ? {
              ...method,
              holderName: formData.holderName,
              expiry: `${formData.expiryMonth}/${formData.expiryYear}`,
              isDefault: formData.isDefault
            }
          : method
      ));
    } else {
      // Add new method
      const newMethod = {
        id: Date.now().toString(),
        type: formData.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
        last4: formData.cardNumber.slice(-4),
        expiry: `${formData.expiryMonth}/${formData.expiryYear}`,
        holderName: formData.holderName,
        isDefault: formData.isDefault
      };
      
      setPaymentMethods(prev => {
        if (formData.isDefault) {
          // Set all others to non-default
          return [...prev.map(method => ({ ...method, isDefault: false })), newMethod];
        }
        return [...prev, newMethod];
      });
    }
    
    setShowAddForm(false);
    setEditingMethod(null);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = editingMethod ? 'Payment method updated!' : 'Payment method added successfully!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId
    })));
  };
  
   if (!paymentMethods || paymentMethods.length === 0) {
    return (
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-primaryRed dark:text-primaryRed/90" />
          Payment Methods
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">You have no saved payment methods.</p>
        <button 
          onClick={handleAddPaymentMethod}
          className="mt-4 w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primaryRed hover:border-primaryRed dark:hover:text-primaryRed/90 dark:hover:border-primaryRed/90 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Payment Method
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-primaryRed dark:text-primaryRed/90" />
          Payment Methods
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your payment information</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 mb-6">
          {paymentMethods.map(method => (
            <div 
              key={method.id}
              className={`border rounded-xl p-4 transition-colors ${
                method.isDefault 
                  ? 'border-primaryRed dark:border-primaryRed/90' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-xl">
                    {getCardTypeIcon(method.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {method.type} •••• {method.last4}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Expires {method.expiry}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {method.isDefault && (
                    <span className="px-2 py-0.5 text-xs bg-primaryRed/10 text-primaryRed dark:bg-primaryRed/20 dark:text-primaryRed/90 rounded-full">
                      Default
                    </span>
                  )}
                  <button 
                    onClick={() => handleEditPaymentMethod(method)}
                    className="p-2 text-gray-400 hover:text-primaryRed dark:hover:text-primaryRed/90 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleAddPaymentMethod}
          className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primaryRed hover:border-primaryRed dark:hover:text-primaryRed/90 dark:hover:border-primaryRed/90 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Payment Method
        </button>
        
        {/* Payment Method Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                    </h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleSubmitPaymentMethod} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                      required
                      disabled={!!editingMethod}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expiry Month
                      </label>
                      <select
                        value={formData.expiryMonth}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                        required
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expiry Year
                      </label>
                      <select
                        value={formData.expiryYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiryYear: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                        required
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                            {new Date().getFullYear() + i}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={formData.holderName}
                      onChange={(e) => setFormData(prev => ({ ...prev, holderName: e.target.value }))}
                      placeholder="Mich Michira"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Set as default payment method
                    </label>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors"
                    >
                      {editingMethod ? 'Update' : 'Add'} Payment Method
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AddressBook: React.FC<{ addresses: any[] }> = ({ addresses: initialAddresses }) => {
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      type: 'Home',
      street: '123 Main Street, Apt 4B',
      city: 'Nairobi',
      state: 'Nairobi County',
      postal: '00100',
      country: 'Kenya',
      isDefault: true
    },
    {
      id: '2',
      type: 'Work',
      street: '456 Business Plaza, Floor 8',
      city: 'Mombasa',
      state: 'Mombasa County',
      postal: '80100',
      country: 'Kenya',
      isDefault: false
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: '',
    street: '',
    city: '',
    state: '',
    postal: '',
    country: 'Kenya',
    isDefault: false
  });

  const handleAddAddress = () => {
    setShowAddForm(true);
    setEditingAddress(null);
    setFormData({
      type: '',
      street: '',
      city: '',
      state: '',
      postal: '',
      country: 'Kenya',
      isDefault: false
    });
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowAddForm(true);
    setFormData({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      postal: address.postal,
      country: address.country,
      isDefault: address.isDefault
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(address => address.id !== addressId));
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Address deleted successfully!';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    }
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(prev => prev.map(address => ({
      ...address,
      isDefault: address.id === addressId
    })));
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = 'Default address updated!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(address => 
        address.id === editingAddress.id 
          ? { ...address, ...formData }
          : address
      ));
    } else {
      // Add new address
      const newAddress = {
        id: Date.now().toString(),
        ...formData
      };
      
      setAddresses(prev => {
        if (formData.isDefault) {
          // Set all others to non-default
          return [...prev.map(address => ({ ...address, isDefault: false })), newAddress];
        }
        return [...prev, newAddress];
      });
    }
    
    setShowAddForm(false);
    setEditingAddress(null);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = editingAddress ? 'Address updated!' : 'Address added successfully!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };
   if (!addresses || addresses.length === 0) {
    return (
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-primaryRed dark:text-primaryRed/90" />
          Address Book
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">You have no saved addresses.</p>
        <button 
          onClick={handleAddAddress}
          className="mt-4 w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primaryRed hover:border-primaryRed dark:hover:text-primaryRed/90 dark:hover:border-primaryRed/90 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-primaryRed dark:text-primaryRed/90" />
          Address Book
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your delivery addresses</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {addresses.map(address => (
            <div 
              key={address.id} 
              className={`border rounded-xl p-5 transition-colors ${
                address.isDefault 
                  ? 'border-primaryRed dark:border-primaryRed/90' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{address.type}</span>
                  {address.isDefault && (
                    <span className="px-2 py-0.5 text-xs bg-primaryRed/10 text-primaryRed dark:bg-primaryRed/20 dark:text-primaryRed/90 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEditAddress(address)}
                    className="p-1.5 text-gray-400 hover:text-primaryRed dark:hover:text-primaryRed/90 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(address.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <div>{address.street}</div>
                <div>{address.city}, {address.state} {address.postal}</div>
                <div>{address.country}</div>
              </div>
              
              {!address.isDefault && (
                <button 
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-4 text-sm text-primaryRed dark:text-primaryRed/90 hover:text-berry dark:hover:text-berry/90 font-medium"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleAddAddress}
          className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primaryRed hover:border-primaryRed dark:hover:text-primaryRed/90 dark:hover:border-primaryRed/90 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
        
        {/* Address Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleSubmitAddress} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="123 Main Street, Apt 4B"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Nairobi"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State/County
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Nairobi County"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postal}
                        onChange={(e) => setFormData(prev => ({ ...prev, postal: e.target.value }))}
                        placeholder="00100"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                        required
                      >
                        <option value="Kenya">Kenya</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Rwanda">Rwanda</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefaultAddress"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                    />
                    <label htmlFor="isDefaultAddress" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Set as default address
                    </label>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors"
                    >
                      {editingAddress ? 'Update' : 'Add'} Address
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AccountSettings: React.FC<{ userData: any }> = ({ userData }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Password update functionality would be implemented here');
  };

  const handleNotificationSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Notification preferences saved!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion would be processed here');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primaryRed dark:text-primaryRed/90" />
            Security Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account security preferences</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
            <form className="space-y-4" onSubmit={handlePasswordUpdate}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                    placeholder="Enter current password" 
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                  placeholder="Enter new password" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryRed dark:focus:ring-primaryRed/90"
                  placeholder="Confirm new password" 
                />
              </div>
              
              <button type="submit" className="px-6 py-2.5 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 dark:bg-primaryRed/90 dark:hover:bg-primaryRed/80 transition-colors">
                Update Password
              </button>
            </form>
          </div>
          
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300">Enhance your account security with 2FA</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get a verification code sent to your phone or email</p>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="twoFactorToggle" 
                  className="peer sr-only" 
                />
                <label 
                  htmlFor="twoFactorToggle"
                  className="block w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-accentGreen peer-checked:dark:bg-accentGreen/80 cursor-pointer transition-colors"
                >
                  <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bell className="w-5 h-5 mr-2 text-primaryRed dark:text-primaryRed/90" />
            Notification Preferences
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage how we contact you</p>
        </div>
        
        <form className="p-6 space-y-4" onSubmit={handleNotificationSave}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Order Updates</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Get notified about your order status changes</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="orderEmail" 
                  className="w-4 h-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                  defaultChecked={userData.notifications.orderUpdates} 
                />
                <label htmlFor="orderEmail" className="text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="orderSMS" 
                  className="w-4 h-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                  defaultChecked={userData.notifications.orderUpdates} 
                />
                <label htmlFor="orderSMS" className="text-sm text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Promotions & Offers</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Receive updates about sales and special offers</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="promoEmail" 
                  className="w-4 h-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                  defaultChecked={userData.notifications.promotions} 
                />
                <label htmlFor="promoEmail" className="text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="promoSMS" 
                  className="w-4 h-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                  defaultChecked={userData.notifications.promotions} 
                />
                <label htmlFor="promoSMS" className="text-sm text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Newsletter</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Receive our monthly newsletter with health tips</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="newsEmail" 
                  className="w-4 h-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                  defaultChecked={userData.notifications.newsletter} 
                />
                <label htmlFor="newsEmail" className="text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Product Updates</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Get notified when we launch new products</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="productEmail" 
                  className="w-4 h-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                  defaultChecked={userData.notifications.productUpdates} 
                />
                <label htmlFor="productEmail" className="text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="productSMS" 
                  className="w-4 h-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                  defaultChecked={userData.notifications.productUpdates} 
                />
                <label htmlFor="productSMS" className="text-sm text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-6 mt-4 flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 dark:bg-primaryRed/90 dark:hover:bg-primaryRed/80 transition-colors">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-6 border border-red-100 dark:border-red-900/50">
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Delete Account</h3>
        <p className="text-sm text-red-500 dark:text-red-400 mb-4">
          This will permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button 
          onClick={handleDeleteAccount}
          className="px-4 py-2 text-sm bg-white dark:bg-gray-800 text-red-500 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
};

export default AccountPage;