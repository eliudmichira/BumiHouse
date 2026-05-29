import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../../../assets/android-chrome-512x512.png';
import { useTheme } from '../../context/ThemeContext';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { platformAuthService } from '../../services/platformAuthService';
import { useAuth } from '../../context/AuthContext'; // Use AuthContext
import { Chrome, Loader2, X, Sun, Moon, ArrowLeft, Check, AlertCircle, User, UserCheck, Briefcase } from 'lucide-react';
import { showToast, ToastContainer } from '../../components/Toast';
import { Capacitor } from '@capacitor/core';
import Logo from '../../components/Logo';
import { useNavigate } from 'react-router-dom';
import AgentVerificationRequest from '../../components/AgentVerificationRequest';
import Privacy from '../../../pages/Privacy';
import Terms from '../../../pages/Terms';

// Placeholder Views for Terms and Privacy
const TermsOfServiceView = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b dark:border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold">Terms of Service</h2>
                <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 content-viewer">
                <Terms embedded={true} />
            </div>
        </div>
    </div>
);

const PrivacyPolicyView = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b dark:border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold">Privacy Policy</h2>
                <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 content-viewer">
                <Privacy embedded={true} />
            </div>
        </div>
    </div>
);

// Memoized Background Component (Restored orbs for Sign Up preference)
const AnimatedBackground = React.memo(({ isDark, showGradients }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {showGradients && (
            <>
                {/* Large coral orb - top right */}
                <div
                    className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
                        top: '-15%',
                        right: '-10%',
                        animation: 'float 8s ease-in-out infinite'
                    }}
                />
                {/* Blue orb - bottom left */}
                <div
                    className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                        bottom: '-10%',
                        left: '-15%',
                        animation: 'float 10s ease-in-out infinite reverse'
                    }}
                />
            </>
        )}
        <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        25% { transform: translateY(-20px) translateX(10px); }
        50% { transform: translateY(-10px) translateX(-10px); }
        75% { transform: translateY(-30px) translateX(5px); }
      }
    `}</style>
    </div>
));

const MobileLayoutWrapper = ({ children, title = "BumiHouse", subtitle, showNav = true }) => {
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <div className={`w-full min-h-screen fixed inset-0 flex flex-col items-center justify-start p-4 lg:p-6 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-white'}`}>
            <AnimatedBackground isDark={isDark} />
            <ToastContainer />

            {showNav && (
                <nav className="relative z-10 w-full max-w-md flex justify-between items-center py-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <ArrowLeft size={24} className="text-black dark:text-white" />
                    </button>
                    {/* Redundant toggle removed from here as it's now in the illustration */}
                </nav>
            )}

            <div className="relative z-10 flex flex-col items-center justify-center flex-grow w-full max-w-md px-4 pb-8">
                <div className="mb-8">
                    <Logo isDark={isDark} />
                </div>
                <h1 className="text-4xl font-extrabold text-center mb-2 text-black dark:text-white">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-lg text-center mb-8 text-black/70 dark:text-white/70">
                        {subtitle}
                    </p>
                )}
                {children}
            </div>
        </div>
    );
};

const MobileAuth = () => {
    const { isDark, toggleTheme } = useTheme();
    const { signInWithGoogleAuth, signUp: contextSignUp, signIn: contextSignIn } = useAuth();
    const navigate = useNavigate();

    // Debug log to confirm module load
    useEffect(() => {
        console.log('MobileAuth module loaded');
    }, []);

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userType, setUserType] = useState('user'); // 'user' or 'agent'
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    // Validation State
    const [emailError, setEmailError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('weak');

    // Mobile Keyboard Fix
    useEffect(() => {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover'
            );
        }
    }, []);

    // Password Strength Check
    useEffect(() => {
        if (!password) {
            setPasswordStrength('weak');
            return;
        }
        if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            setPasswordStrength('strong');
        } else if (password.length >= 6) {
            setPasswordStrength('medium');
        } else {
            setPasswordStrength('weak');
        }
    }, [password]);

    // Email Validation
    const validateEmail = (emailStr) => {
        if (!emailStr) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) return 'Invalid email format';
        return '';
    };

    const handleBlurEmail = () => {
        setEmailError(validateEmail(email));
    };

    const isCapacitor = () => Capacitor.isNativePlatform();

    const waitForTokenSettlement = async (user) => {
        const maxAttempts = 5;
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const token = await user.getIdToken(false);
                if (token) {
                    console.log('✅ Token settled');
                    return true;
                }
            } catch (error) {
                console.warn(`Token not ready (attempt ${i + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
            }
        }
        return false;
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            // Use AuthContext which handles Native/Web switching and profile creation
            const result = await signInWithGoogleAuth();

            if (result.success && result.user) {
                // 🔥 CRITICAL FIX: Explicitly wait for token to be settled
                await waitForTokenSettlement(result.user);

                if (userType === 'agent') {
                    // If user selected Agent toggle, show verification modal
                    // The modal handles the "upgrade" logic via requestAgentVerification
                    setShowVerificationModal(true);
                } else {
                    showToast(`Welcome, ${result.user.displayName || 'User'}!`, 'success');
                    navigate('/dashboard');
                }
            } else {
                throw new Error(result.error || 'Google Sign In Failed');
            }
        } catch (error) {
            console.error('Google Auth Error:', error);
            showToast(error?.message || 'Failed to sign in with Google', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Safety cleanup for infinite loading states
    useEffect(() => {
        let timeout;
        if (isLoading) {
            timeout = setTimeout(() => {
                if (isLoading) {
                    setIsLoading(false);
                    showToast('Sign-in timed out. Please try again.', 'error');
                }
            }, 15000); // 15s timeout
        }
        return () => clearTimeout(timeout);
    }, [isLoading]);

    const handleEmailAuth = async () => {
        const emailValidationElement = validateEmail(email);
        if (emailValidationElement) {
            setEmailError(emailValidationElement);
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (isSignUp && !acceptedTerms) {
            showToast('Please accept the Terms of Service', 'error');
            return;
        }

        setIsLoading(true);
        try {
            if (isSignUp) {
                // Pass role if agent selected
                const additionalData = userType === 'agent' ? { role: 'agent' } : {};
                const result = await contextSignUp(email, password, additionalData);

                if (result.success) {
                    // Sign-up sends a verification email.
                    // Sign the user out so they must verify before using the app.
                    const { signOutUser } = await import('../../lib/firebase');
                    await signOutUser();
                    showToast('Account created! Please check your inbox and verify your email before signing in.', 'success');
                    setIsSignUp(false); // Switch to sign-in view
                    setPassword('');
                    setConfirmPassword('');
                } else {
                    throw new Error(result.error);
                }
            } else {
                const result = await contextSignIn(email, password);

                if (result.success) {
                    await waitForTokenSettlement(result.user);
                    showToast('Signed in successfully!', 'success');
                    navigate('/dashboard');
                } else {
                    throw new Error(result.error);
                }
            }
        } catch (error) {
            console.error('Email Auth Error:', error);
            let errorMessage = 'Failed to authenticate.';
            const msg = error.message || '';
            if (msg.includes('wrong-password') || msg.includes('user-not-found') || msg.includes('invalid-credential')) {
                errorMessage = 'Invalid email or password.';
            } else if (msg.includes('email-already-in-use')) {
                errorMessage = 'Email already in use.';
            } else if (msg.includes('weak-password')) {
                errorMessage = 'Password is too weak.';
            }
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!resetEmail) {
            showToast('Please enter your email', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            showToast('Password reset email sent!', 'success');
            setShowForgotPassword(false);
            setResetEmail('');
        } catch (error) {
            showToast('Failed to send reset email', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper for input classes
    const inputBaseClass = `peer w-full border-2 rounded-xl py-4 px-4 placeholder-transparent focus:outline-none focus:border-emerald-500 transition-all duration-300 text-[15px] lg:text-base ${isDark
        ? 'bg-zinc-900/50 border-white/20 text-white'
        : 'bg-gray-100 border-black/10 text-black'
        }`;

    const labelBaseClass = `absolute left-4 top-4 transition-all duration-300 pointer-events-none peer-focus:top-1 peer-focus:left-3 peer-focus:text-xs peer-focus:text-emerald-500 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs ${isDark
        ? 'text-white/50 peer-[:not(:placeholder-shown)]:text-white/70'
        : 'text-black/50 peer-[:not(:placeholder-shown)]:text-black/70'
        }`;

    return (
        <div className={`w-full min-h-screen flex flex-col items-center justify-center overflow-y-auto p-6 lg:p-8 transition-colors duration-300 relative ${isDark ? 'bg-black' : 'bg-white'}`}>
            <ToastContainer />
            <div className="fixed inset-0 pointer-events-none">
                <AnimatedBackground isDark={isDark} showGradients={isSignUp && !showForgotPassword} />
            </div>

            {/* Top Controls */}
            <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-6 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${isDark
                        ? 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                        : 'bg-black/5 border-black/5 text-black hover:bg-black/10'
                        }`}
                    aria-label="Back"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-sm lg:max-w-md relative z-10 pt-4 lg:pt-10 pb-12 overflow-visible">
                {/* Dynamic Illustration */}
                <AuthIllustration
                    mode={showForgotPassword ? 'forgot_password' : (isSignUp ? 'register' : 'login')}
                    isDark={isDark}
                    onToggleTheme={toggleTheme}
                />

                {/* Header Text */}
                <div className="text-center mb-6 lg:mb-8">
                    <h1 className={`text-2xl lg:text-3xl font-bold mb-1 lg:mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        {showForgotPassword
                            ? 'Reset Password'
                            : (isSignUp ? 'Create your account' : 'Sign in to BumiHouse')
                        }
                    </h1>
                    <p className={`${isDark ? 'text-white/40' : 'text-black/60'} text-sm mt-2 max-w-[80%] mx-auto`}>
                        {showForgotPassword
                            ? 'Enter your email to receive a reset link'
                            : (isSignUp
                                ? <span>Join <span className="text-emerald-500 font-semibold">thousands</span> of home seekers</span>
                                : <span>Welcome back! Your <span className="text-emerald-500 font-semibold">dream home</span> is waiting</span>
                            )
                        }
                    </p>
                </div>

                {/* User Type Selection (Pill Toggle) */}
                <div className="mb-6 animate-in slide-in-from-top-2">
                    <div className={`flex rounded-full p-1 border transition-all duration-300 ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-gray-100 border-black/5'
                        }`}>
                        <button
                            type="button"
                            onClick={() => setUserType('user')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all duration-300 ${userType === 'user'
                                ? (isDark ? 'bg-zinc-800 text-white shadow-lg' : 'bg-white text-black shadow-md')
                                : (isDark ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black')
                                }`}
                        >
                            <User size={16} />
                            <span>Regular User</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('agent')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all duration-300 ${userType === 'agent'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : (isDark ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black')
                                }`}
                        >
                            <UserCheck size={16} />
                            <span>Agent/Landlord</span>
                        </button>
                    </div>

                    {userType === 'agent' && (
                        <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 transition-colors ${isDark ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'
                            }`}>
                            <Briefcase className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-emerald-200/80' : 'text-emerald-700'}`}>
                                {isSignUp
                                    ? "Agent registration includes a brief verification process. You'll be asked to provide your professional details after creating your account."
                                    : "Sign in to access your agent dashboard and manage your listings."}
                            </p>
                        </div>
                    )}
                </div>

                <div className="relative my-6 lg:my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${isDark ? 'border-white/20' : 'border-black/10'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className={`px-4 ${isDark ? 'bg-black text-white/60' : 'bg-white text-black/60'}`}>or continue with email</span>
                    </div>
                </div>

                {/* Email Form */}
                {!showForgotPassword ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleEmailAuth(); }} className="space-y-5">
                        {/* Email */}
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                placeholder=" "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={handleBlurEmail}
                                className={inputBaseClass}
                            />
                            <label htmlFor="email" className={labelBaseClass}>Email address</label>
                            {emailError && (
                                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs animate-in slide-in-from-top-1">
                                    <AlertCircle size={12} />
                                    <span>{emailError}</span>
                                </div>
                            )}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete={isSignUp ? "new-password" : "current-password"}
                                placeholder=" "
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputBaseClass}
                            />
                            <label htmlFor="password" className={labelBaseClass}>Password</label>
                            {/* Strength Meter (Sign Up Only) */}
                            {isSignUp && password && (
                                <div className="flex gap-1 mt-2 px-1">
                                    <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength === 'weak' ? 'bg-red-500' : 'bg-zinc-700'}`} />
                                    <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength !== 'weak' ? (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-zinc-700'}`} />
                                    <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-zinc-700'}`} />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password (Sign Up Only) */}
                        {isSignUp && (
                            <div className="relative">
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    placeholder=" "
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputBaseClass}
                                    required
                                />
                                <label htmlFor="confirmPassword" className={labelBaseClass}>Confirm Password</label>
                            </div>
                        )}

                        {/* Google Auth (Moved Inside Form) */}
                        <div className="mb-6 animate-in slide-in-from-top-2">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full relative group rounded-full py-4 px-6 font-semibold text-[15px] flex items-center justify-between transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)',
                                    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.3), inset 0px 2px 0px rgba(255, 255, 255, 0.9), inset 0px -2px 4px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <div className={`flex items-center gap-3 text-black transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                    <Chrome size={20} />
                                    <span>Continue with Google</span>
                                </div>
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 size={16} className="animate-spin-smooth text-black" />
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Terms Checkbox (Sign Up Only) */}
                        {isSignUp && (
                            <div className="flex items-start gap-3 pt-1 px-1">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="peer appearance-none w-5 h-5 border-2 border-white/30 rounded bg-transparent checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer transition-colors"
                                    />
                                    <Check size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <label htmlFor="terms" className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                    I agree to the{' '}
                                    <button type="button" onClick={() => setShowTerms(true)} className="text-emerald-500 hover:underline">Terms of Service</button>
                                    {' '}and{' '}
                                    <button type="button" onClick={() => setShowPrivacy(true)} className="text-emerald-500 hover:underline">Privacy Policy</button>
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !email || !password || (isSignUp && (!confirmPassword || password !== confirmPassword || !acceptedTerms))}
                            className="w-full py-4 px-6 font-bold text-[15px] lg:text-base text-white rounded-full border-0 outline-none cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            style={{
                                background: 'linear-gradient(180deg, #3b82f6 0%, #3b82f6 50%, #2563eb 100%)', // Emerald gradient
                                boxShadow: `0px 8px 20px ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)'}, inset 0px 1px 0px rgba(255, 255, 255, 0.4)`
                            }}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.style.boxShadow = '0px 0px 0px 2px #ffffff, 0px 12px 25px rgba(0, 0, 0, 0.5)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 20px rgba(0, 0, 0, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {isLoading ? (
                                <Loader2 size={16} className="animate-spin-smooth mx-auto" />
                            ) : (
                                isSignUp ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>
                ) : (
                    /* Forgot Password */
                    <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-5">
                        <div className="relative">
                            <input
                                type="email"
                                id="resetEmail"
                                placeholder=" "
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className={inputBaseClass}
                            />
                            <label htmlFor="resetEmail" className={labelBaseClass}>Enter your email</label>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !resetEmail}
                            className="w-full py-4 px-4 font-bold text-[15px] lg:text-base text-white rounded-xl border-0 outline-none cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(180deg, #3b82f6 0%, #3b82f6 50%, #2563eb 100%)', // Emerald gradient
                                boxShadow: `0px 8px 20px ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)'}, inset 0px 1px 0px rgba(255, 255, 255, 0.4)`
                            }}
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin-smooth mx-auto" /> : 'Send Reset Link'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowForgotPassword(false); setResetEmail(''); }}
                            className={`w-full mt-4 text-sm lg:text-base transition-colors ${isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
                        >
                            ← Back to sign in
                        </button>
                    </form>
                )}

                {/* Footer Actions */}
                {!showForgotPassword && (
                    <div className="mt-8 text-center space-y-6">
                        {!isSignUp && (
                            <button
                                onClick={() => setShowForgotPassword(true)}
                                className="text-emerald-500 hover:text-emerald-400 font-medium text-sm transition-all duration-200"
                            >
                                Forgot your password?
                            </button>
                        )}

                        <p className={`${isDark ? 'text-white/60' : 'text-black/60'} text-sm`}>
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setEmail('');
                                    setPassword('');
                                    setConfirmPassword('');
                                    setUserType('user'); // Reset user type
                                    setAcceptedTerms(false);
                                    setShowForgotPassword(false);
                                }}
                                className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
                            >
                                {isSignUp ? 'Sign in' : 'Sign up'}
                            </button>
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showTerms && <TermsOfServiceView onClose={() => setShowTerms(false)} />}
            {showPrivacy && <PrivacyPolicyView onClose={() => setShowPrivacy(false)} />}

            {showVerificationModal && (
                <AgentVerificationRequest
                    onClose={() => {
                        setShowVerificationModal(false);
                        navigate('/dashboard');
                    }}
                    onSuccess={() => {
                        setShowVerificationModal(false);
                        navigate('/dashboard');
                    }}
                />
            )}
        </div>
    );
};

// SVG Illustration Component
const AuthIllustration = ({ mode, isDark, onToggleTheme }) => {
    const primaryColor = isDark ? "#3b82f6" : "#3b82f6"; // Emerald-400 : Emerald-500
    const secondaryColor = isDark ? "#064e3b" : "#d1fae5"; // Emerald-900 : Emerald-100
    const accentColor = isDark ? "#fbbf24" : "#f59e0b"; // Amber-400 : Amber-500

    const springConfig = { type: "spring", stiffness: 300, damping: 30 };

    const renderCelestialBody = () => (
        <motion.g
            layout
            onClick={onToggleTheme}
            className="cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <foreignObject x="175" y="25" width="30" height="30">
                <div className="flex items-center justify-center w-full h-full">
                    {isDark ? (
                        <Sun size={24} className="text-[#fbbf24] animate-[spin_10s_linear_infinite]" />
                    ) : (
                        <Moon size={24} className="text-black" />
                    )}
                </div>
            </foreignObject>
        </motion.g>
    );

    if (mode === 'login') {
        return (
            <div className="w-full h-44 relative flex items-center justify-center mb-4 overflow-hidden">
                <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-xl">
                    {/* Ground */}
                    <path d="M40 160H200" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.3" />

                    {/* Modern House Body */}
                    <motion.rect
                        x="70" y="60" width="100" height="100" rx="4"
                        animate={{
                            fill: isDark ? '#18181b' : '#ffffff',
                            stroke: primaryColor
                        }}
                        transition={springConfig}
                        strokeWidth="3"
                    />
                    <motion.path
                        d="M60 60L120 20L180 60"
                        animate={{
                            fill: isDark ? '#18181b' : '#ffffff',
                            stroke: primaryColor
                        }}
                        transition={springConfig}
                        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    />

                    {/* Doorway */}
                    <rect x="105" y="110" width="30" height="50" rx="1" fill={secondaryColor} stroke={primaryColor} strokeWidth="0" />
                    <rect x="105" y="110" width="30" height="50" rx="1" stroke={primaryColor} strokeWidth="2" />
                    <circle cx="130" cy="135" r="2" fill={accentColor} />

                    {/* Window Lights */}
                    <motion.rect
                        x="85" y="80" width="20" height="20" rx="1"
                        animate={{
                            fill: isDark ? '#3b82f6' : '#f4f4f5',
                            stroke: isDark ? '#3b82f6' : primaryColor,
                        }}
                        transition={springConfig}
                        strokeWidth="2"
                    />
                    <path d="M95 80V100M85 90H105" stroke={isDark ? "#064e3b" : primaryColor} strokeWidth="1" opacity="0.5" />

                    {/* Celestial Body Toggle */}
                    {renderCelestialBody()}

                    {/* Plants/Nature */}
                    <path d="M150 160V140" stroke={primaryColor} strokeWidth="2" />
                    <circle cx="150" cy="135" r="8" fill={primaryColor} opacity="0.8" />

                    {/* Welcome Mat */}
                    <rect x="100" y="160" width="40" height="3" rx="1.5" fill={accentColor} />
                </svg>
            </div>
        );
    }

    if (mode === 'register') {
        const joinColor = isDark ? "#3b82f6" : "#2563eb";
        return (
            <div className="w-full h-44 relative flex items-center justify-center mb-4 overflow-hidden">
                <motion.div
                    className="absolute w-40 h-40 rounded-full opacity-10"
                    style={{ background: primaryColor, top: '5%', right: '10%' }}
                    animate={{ scale: isDark ? 1.3 : 1 }}
                />

                <svg width="240" height="150" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-lg">
                    {/* Background Circle */}
                    <motion.circle
                        cx="120" cy="75" r="50"
                        animate={{ fill: secondaryColor }}
                        opacity="0.5"
                    />

                    {/* Person 1 (Background Member) */}
                    <motion.circle
                        cx="75" cy="65" r="15"
                        animate={{ fill: isDark ? '#27272a' : '#f4f4f5' }}
                        stroke={primaryColor} strokeWidth="2"
                    />
                    <motion.path
                        d="M75 85C60 85 50 95 50 110H100C100 95 90 85 75 85Z"
                        animate={{ fill: isDark ? '#27272a' : '#f4f4f5' }}
                        stroke={primaryColor} strokeWidth="2"
                    />

                    {/* Person 2 (The New Member being created) */}
                    <motion.circle
                        cx="120" cy="65" r="18"
                        animate={{ fill: joinColor }}
                        stroke={isDark ? "white" : "none"} strokeWidth="1"
                    />
                    <motion.path
                        d="M120 88C140 88 155 98 155 115H85C85 98 100 88 120 88Z"
                        animate={{ fill: joinColor }}
                    />

                    {/* Plus Badge on the New Member */}
                    <motion.circle
                        cx="145" cy="60" r="10"
                        fill={accentColor}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                    />
                    <motion.path
                        d="M145 55V65M140 60H150"
                        stroke={isDark ? "black" : "white"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />

                    {/* Small Celebration Sparkles */}
                    <motion.g animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 1] }}>
                        <path d="M170 40L175 45M180 35L175 30" stroke={accentColor} strokeWidth="2" />
                        <circle cx="185" cy="50" r="2" fill={accentColor} />
                    </motion.g>
                    <motion.g animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 1], delay: 1 }}>
                        <path d="M60 40L55 45M50 35L55 30" stroke={primaryColor} strokeWidth="2" />
                        <circle cx="45" cy="50" r="2" fill={primaryColor} />
                    </motion.g>

                    {/* Dash-Member (The next space) */}
                    <circle cx="165" cy="65" r="12" stroke={primaryColor} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                    <path d="M165 85C155 85 145 92 145 105H185C185 92 175 85 165 85Z" stroke={primaryColor} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />

                    {/* Interaction Hook - Theme Toggle */}
                    <motion.g onClick={onToggleTheme} className="cursor-pointer" whileTap={{ scale: 0.9 }}>
                        <foreignObject x="180" y="30" width="30" height="30">
                            <div className="flex items-center justify-center w-full h-full">
                                {isDark ? (
                                    <Sun size={20} className="text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                ) : (
                                    <Moon size={20} className="text-black" />
                                )}
                            </div>
                        </foreignObject>
                    </motion.g>
                </svg>
            </div>
        );
    }

    if (mode === 'forgot_password') {
        return (
            <div className="w-full h-44 relative flex items-center justify-center mb-4 overflow-hidden">
                <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-xl">
                    {/* Envelope */}
                    <motion.g animate={{ y: isDark ? 2 : 0 }} transition={{ duration: 0.5 }}>
                        <rect x="50" y="70" width="100" height="60" rx="4" fill={isDark ? '#27272a' : '#ffffff'} stroke={primaryColor} strokeWidth="2" />
                        <path d="M50 70L100 100L150 70" stroke={primaryColor} strokeWidth="2" strokeLinejoin="round" fill="none" />
                        <path d="M50 130L85 105M150 130L115 105" stroke={primaryColor} strokeWidth="1" opacity="0.3" />
                    </motion.g>

                    {/* The Interactive Key / Celestial Light */}
                    <motion.g
                        onClick={onToggleTheme}
                        className="cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <foreignObject x="85" y="25" width="30" height="30">
                            <div className="flex items-center justify-center w-full h-full">
                                {isDark ? (
                                    <Sun size={24} className="text-[#fbbf24]" />
                                ) : (
                                    <Moon size={24} className="text-black" />
                                )}
                            </div>
                        </foreignObject>
                    </motion.g>
                </svg>
            </div>
        );
    }

    return null;
};

export default MobileAuth;


