import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Home,
  Building,
  Star,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";

const MobileAuth = () => {
  const { isDark } = useTheme();
  const { currentUser, login, signup, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        await signup(formData.email, formData.password, {
          displayName: formData.name,
          phoneNumber: formData.phone
        });
        setSuccess('Account created successfully! Please check your email for verification.');
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Demo credentials - in production, you'd have a demo account
      await login('demo@hamaestate.com', 'demo123');
      setSuccess('Demo login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      setError('Demo login failed. Please use regular login.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: ''
    });
  };

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
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#51faaa] to-[#45e695] px-4 py-8 text-center text-white">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Hama Estate</h2>
        <p className="opacity-90">
          {isLogin 
            ? 'Sign in to access your personalized property dashboard' 
            : 'Join thousands of property seekers in Kenya'
          }
        </p>
      </section>

      {/* Auth Form */}
      <main className="p-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-transparent"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#111] text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Demo Login */}
          {isLogin && (
            <div className="mt-4">
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full border-2 border-[#51faaa] text-[#51faaa] py-3 rounded-lg font-semibold hover:bg-[#51faaa] hover:text-[#111] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Try Demo Account
              </button>
            </div>
          )}

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={toggleAuthMode}
              className="text-[#51faaa] font-medium hover:underline mt-1"
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              Why Choose Hama Estate?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-[#51faaa]" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">5,000+ Properties</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Wide selection across Kenya</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#51faaa]" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Trusted Platform</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Used by 8,000+ customers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-[#51faaa]/20 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-[#51faaa]" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Personalized Experience</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Save favorites and track views</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <Building className="w-5 h-5" />
            <span className="text-xs">Properties</span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-1 p-2 text-[#51faaa]"
          >
            <Star className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileAuth;
