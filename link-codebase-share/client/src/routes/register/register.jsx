import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Eye, EyeOff, ArrowRight, Building2, Check, Star, Shield, Sparkles, AlertCircle, Loader2, ChevronRight, Zap, Award, TrendingUp, UserCheck, Briefcase, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import AgentVerificationRequest from '../../components/AgentVerificationRequest';

// Enhanced notification system with modern animations
const showNotification = (options) => {
  const notification = document.createElement('div');
  notification.className = `fixed top-6 right-6 z-[9999] transform transition-all duration-500 ease-out`;
  
  notification.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl p-5 min-w-[300px] max-w-[400px] ${
      options.color === 'red' 
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
          <div class="w-3 h-3 rounded-full bg-white animate-pulse"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-sm tracking-wide mb-1">${options.title}</div>
          <div class="text-xs opacity-90 leading-relaxed">${options.message}</div>
        </div>
        <div class="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div class="h-full bg-white/60 animate-[progress_4s_linear]"></div>
      </div>
    </div>
  `;
  
  // Add custom CSS for progress animation
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initial position (off-screen)
  notification.style.transform = 'translateX(120%) scale(0.8)';
  notification.style.opacity = '0';
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0) scale(1)';
    notification.style.opacity = '1';
  }, 50);
  
  // Animate out
  setTimeout(() => {
    notification.style.transform = 'translateX(120%) scale(0.8)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 500);
  }, 4000);
};

// Premium Floating Input Component
function PremiumInput({ 
  label, 
  placeholder, 
  type = 'text', 
  icon: Icon, 
  value, 
  onChange, 
  error, 
  showPassword, 
  onTogglePassword,
  disabled = false }) {
  const [isFocused, setIsFocused] = useState(false);
  const { isDark } = useTheme();
  
  return (
    <div className="space-y-2">
      <label className={`block text-sm font-semibold tracking-wide transition-colors duration-300 ${
        isDark ? 'text-gray-200' : 'text-gray-700'
      }`}>
        {label}
      </label>
      
      <div className="relative group">
        <div className={`relative flex items-center border-2 rounded-full px-6 py-4 transition-all duration-700 ease-out backdrop-blur-xl ${
          isDark 
            ? 'bg-gray-800/50 border-gray-600/50 text-gray-100 placeholder-gray-400' 
            : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-500'
        } ${
          isFocused 
            ? isDark
              ? 'border-emerald-400/80 bg-gray-800/80 shadow-xl shadow-emerald-500/20' 
              : 'border-emerald-500/80 bg-white/90 shadow-xl shadow-emerald-500/20'
            : isDark
              ? 'hover:border-gray-500/70 hover:bg-gray-800/60' 
              : 'hover:border-gray-300/70 hover:bg-white/80'
        } ${
          error 
            ? isDark
              ? 'border-red-400/80 bg-red-900/20' 
              : 'border-red-500/80 bg-red-50/50'
            : ''
        }`}>
          {Icon && (
            <Icon className={`w-5 h-5 mr-4 transition-colors duration-700 ease-out ${
              isFocused 
                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                : isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
          )}
          
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={`flex-1 bg-transparent outline-none text-base font-medium tracking-wide transition-colors duration-700 ease-out ${
              isDark ? 'text-gray-100 placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          
          {type === 'password' && (
            <button
              type="button"
              onClick={onTogglePassword}
              disabled={disabled}
              className={`p-2 rounded-full transition-all duration-700 ease-out ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        
        {/* Floating label effect */}
        <div className={`absolute inset-0 pointer-events-none rounded-full transition-all duration-700 ease-out ${
          isFocused 
            ? isDark
              ? 'ring-2 ring-emerald-400/20 ring-offset-2 ring-offset-gray-900' 
              : 'ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-white'
            : ''
        }`}></div>
        
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Premium Button Component
function PremiumButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  fullWidth = false,
  size = 'lg',
  leftIcon = null,
  rightIcon = null 
}) {
  const { isDark } = useTheme();
  
  const sizeClasses = {
    md: "px-8 py-4 text-base",
    lg: "px-12 py-6 text-lg",
    xl: "px-16 py-8 text-xl"
  };
  
  const variantClasses = {
    primary: isDark
      ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold tracking-wide hover:from-emerald-700 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-700 ease-out shadow-xl shadow-emerald-600/20"
      : "bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold tracking-wide hover:from-emerald-700 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-700 ease-out shadow-xl shadow-emerald-600/20",
    secondary: isDark
      ? "border-2 border-gray-600 text-gray-200 font-semibold tracking-wide hover:bg-gray-800 hover:border-gray-500 transition-all duration-500 ease-out"
      : "border-2 border-gray-300 text-gray-700 font-semibold tracking-wide hover:bg-gray-50 hover:border-gray-400 transition-all duration-500 ease-out",
    accent: isDark
      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium tracking-wide hover:from-emerald-600 hover:to-teal-600 transition-all duration-500 ease-out"
      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium tracking-wide hover:from-emerald-600 hover:to-teal-600 transition-all duration-500 ease-out"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative overflow-hidden rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-3 ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

// Enhanced Register Component
function ModernRegister() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { signUp, signInWithGoogleAuth, isVerifiedAgent } = auth || {};
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user' or 'agent'
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Check if auth context is available
  if (!auth) {
    console.error('Auth context not available');
    return <div>Loading...</div>;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-set user type if user is already verified
  useEffect(() => {
    if (isVerifiedAgent) {
      setUserType('agent');
    }
  }, [isVerifiedAgent]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (signUp) {
        const result = await signUp(formData.email, formData.password);
        if (!result.success) {
          throw new Error(result.error || 'Registration failed');
        }
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      showNotification({
        title: "Account created!",
        message: "Welcome to LamaEstate community",
        color: "green",
      });
      
      setTimeout(() => {
        // If user selected agent type but is not already verified, show verification modal
        if (userType === 'agent' && !isVerifiedAgent) {
          setShowVerificationModal(true);
        } else {
          navigate('/desktop/login');
        }
      }, 1000);
    } catch (error) {
      showNotification({
        title: "Registration failed",
        message: "Please try again or contact support",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signInWithGoogleAuth) {
      showNotification({
        color: 'red',
        title: 'Sign up failed',
        message: 'Google sign-up is not available. Please try again.'
      });
      return;
    }

    setGoogleLoading(true);
    try {
      const result = await signInWithGoogleAuth();
      
      if (!result.success) {
        throw new Error(result.error || 'Google sign-up failed');
      }
      
      // Show success notification
      showNotification({
        color: 'green',
        title: 'Account created!',
        message: `Welcome! Your account has been created successfully.`
      });
      
      setTimeout(() => {
        // If user selected agent type but is not already verified, show verification modal
        if (userType === 'agent' && !isVerifiedAgent) {
          setShowVerificationModal(true);
        } else {
          navigate('/desktop/dashboard');
        }
      }, 2000);
      
    } catch (error) {
      showNotification({
        color: 'red',
        title: 'Sign up failed',
        message: error.message || 'Google sign-up failed. Please try again.'
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleTermsClick = () => {
    showNotification({
      type: 'info',
      title: 'Terms of Service',
      message: 'Terms of Service page will be available soon.',
      duration: 4000
    });
  };

  const handlePrivacyClick = () => {
    showNotification({
      type: 'info',
      title: 'Privacy Policy',
      message: 'Privacy Policy page will be available soon.',
      duration: 4000
    });
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-all duration-700 ease-out ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
    }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 opacity-30 ${
          isDark 
            ? 'bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(5,150,105,0.1),transparent_50%)]' 
            : 'bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(5,150,105,0.1),transparent_50%)]'
        }`}></div>
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]' 
            : 'bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]'
        }`}></div>
      </div>

      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => navigate('/desktop/login')}
          className={`px-8 py-4 font-semibold tracking-wide rounded-full transition-all duration-700 ease-out shadow-xl backdrop-blur-xl border ${
            isDark
              ? 'bg-gray-800/50 text-gray-200 border-gray-600/50 hover:bg-gray-700/50 hover:border-emerald-500/50 shadow-gray-900/20 hover:shadow-emerald-500/10'
              : 'bg-white/70 text-gray-700 border-gray-200/50 hover:bg-white/90 hover:border-emerald-500/50 shadow-gray-900/10 hover:shadow-emerald-500/10'
          }`}
        >
          Sign In
        </button>
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-4 rounded-full transition-all duration-700 ease-out shadow-xl backdrop-blur-xl border ${
            isDark
              ? 'bg-gray-800/50 text-gray-200 border-gray-600/50 hover:bg-gray-700/50 hover:border-emerald-500/50 shadow-gray-900/20 hover:shadow-emerald-500/10'
              : 'bg-white/70 text-gray-700 border-gray-200/50 hover:bg-white/90 hover:border-emerald-500/50 shadow-gray-900/10 hover:shadow-emerald-500/10'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-xl backdrop-blur-xl border transition-all duration-700 ease-out ${
              isDark
                ? 'bg-gray-800/50 border-gray-600/50 shadow-gray-900/20 hover:shadow-emerald-500/10'
                : 'bg-white/70 border-gray-200/50 shadow-gray-900/10 hover:shadow-emerald-500/10'
            }`}>
              <Building2 className={`w-8 h-8 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 transition-colors duration-700 ease-out ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Join Our Community
            </h1>
            <p className={`text-lg font-medium tracking-wide transition-colors duration-700 ease-out ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Create your account and discover premium properties
            </p>
          </div>

          {/* User Type Selection */}
                     <div className="mb-6">
             <div className={`rounded-full p-2 shadow-xl backdrop-blur-xl border transition-all duration-700 ease-out ${
               isDark
                 ? 'bg-gray-800/50 border-gray-600/50 shadow-gray-900/20'
                 : 'bg-white/70 border-gray-200/50 shadow-gray-900/10'
             }`}>
              <div className="flex">
                <button
                  onClick={() => setUserType('user')}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-full font-semibold tracking-wide transition-all duration-700 ease-out ${
                    userType === 'user'
                      ? isDark
                        ? 'bg-emerald-600/80 text-white shadow-xl shadow-emerald-500/20'
                        : 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20'
                      : isDark
                        ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Regular User
                </button>
                <button
                  onClick={() => setUserType('agent')}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-full font-semibold tracking-wide transition-all duration-700 ease-out ${
                    userType === 'agent'
                      ? isDark
                        ? 'bg-emerald-600/80 text-white shadow-xl shadow-emerald-500/20'
                        : 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20'
                      : isDark
                        ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  Agent
                </button>
              </div>
            </div>
            {userType === 'agent' && (
              <div className={`mt-4 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-700 ease-out ${
                isDark
                  ? 'bg-emerald-900/20 border-emerald-700/50'
                  : 'bg-emerald-50/50 border-emerald-200/50'
              }`}>
                <div className="flex items-start gap-3">
                  <Briefcase className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                  <p className={`text-sm leading-relaxed ${
                    isDark ? 'text-emerald-200' : 'text-emerald-700'
                  }`}>
                    {isVerifiedAgent 
                      ? 'You are a verified agent. You will be redirected to the agent dashboard after registration.'
                      : 'Agent registration includes verification process after account creation.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Register Form */}
          <div className="space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <PremiumInput
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                error={errors.email}
                disabled={isSubmitting}
              />

              <PremiumInput
                label="Password"
                placeholder="Create a strong password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                error={errors.password}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              />

              {/* Terms and conditions */}
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  className={`w-5 h-5 mt-1 border-2 rounded focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'text-emerald-400 border-gray-600 focus:ring-emerald-400/50 bg-gray-800'
                      : 'text-emerald-600 border-gray-300 focus:ring-emerald-500/50 bg-white'
                  }`}
                  disabled={isSubmitting}
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <div className="flex-1">
                  <span className={`text-sm font-medium tracking-wide transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/terms')}
                      className={`underline hover:no-underline transition-all duration-300 ${
                        isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                    >
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/privacy')}
                      className={`underline hover:no-underline transition-all duration-300 ${
                        isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                    >
                      Privacy Policy
                    </button>
                  </span>
                  {errors.terms && (
                    <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errors.terms}</span>
                    </div>
                  )}
                </div>
              </div>

              <PremiumButton
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                variant="primary"
                fullWidth
                size="md"
                rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : null}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </PremiumButton>
            </form>

            {/* Divider */}
            <div className="my-8 text-center">
              <span className={`text-sm font-medium tracking-wide transition-colors duration-700 ease-out ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>or continue with</span>
            </div>

            {/* Google sign up */}
            <PremiumButton
              onClick={handleGoogleSignIn}
              disabled={googleLoading || isSubmitting}
              loading={googleLoading}
              variant="secondary"
              fullWidth
              size="md"
              leftIcon={!googleLoading ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              ) : null}
            >
              {googleLoading ? 'Creating Account...' : 'Sign up with Google'}
            </PremiumButton>

            {/* Sign in link */}
            <div className={`text-center pt-6 border-t transition-all duration-700 ease-out ${
              isDark ? 'border-gray-700/50' : 'border-gray-200/50'
            }`}>
              <p className={`mb-4 text-sm transition-colors duration-700 ease-out ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Already have an account?</p>
              <button
                onClick={() => navigate('/desktop/login')}
                className={`text-base font-semibold tracking-wide transition-colors disabled:opacity-50 ${
                  isDark ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-600'
                }`}
                disabled={isSubmitting || googleLoading}
              >
                Sign in to your account →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Verification Modal */}
      {showVerificationModal && (
        <AgentVerificationRequest
          onClose={() => {
            setShowVerificationModal(false);
            navigate('/desktop/dashboard');
          }}
          onSuccess={() => {
            setShowVerificationModal(false);
            navigate('/desktop/dashboard');
          }}
        />
      )}
    </div>
  );
}

export default ModernRegister;
