import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    Heart,
    MessageCircle,
    Settings,
    LogOut,
    Sparkles,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../components/Logo';

const MobileMenuOverlay = ({ isOpen, onClose }) => {
    const { currentUser, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            onClose();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div
                className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-white/95'}`}
                onClick={onClose}
            />
            <div className="relative z-10 flex flex-col h-full pointer-events-none">
                <div className="pointer-events-auto flex flex-col h-full">
                    {/* Menu Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <Logo isDark={isDark} variant="premium" greenStyle="premium" glow="subtle" pulse="hover" className="text-xl" />
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg ${isDark ? 'text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Menu Content */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {currentUser ? (
                            <>
                                {/* User Info */}
                                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'
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
                                        onClick={onClose}
                                        className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isDark
                                            ? 'text-gray-300 hover:bg-gray-800'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <User className="w-5 h-5" />
                                        <span>My Dashboard</span>
                                    </Link>

                                    <Link
                                        to="/favorites"
                                        onClick={onClose}
                                        className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isDark
                                            ? 'text-gray-300 hover:bg-gray-800'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Heart className="w-5 h-5" />
                                        <span>Favorites</span>
                                    </Link>

                                    <Link
                                        to="/messages"
                                        onClick={onClose}
                                        className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isDark
                                            ? 'text-gray-300 hover:bg-gray-800'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span>Messages</span>
                                    </Link>

                                    <button
                                        onClick={toggleTheme}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${isDark
                                            ? 'text-gray-300 hover:bg-gray-800'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span>Toggle Theme</span>
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${isDark
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
                                <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#51faaa]" />
                                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Found your dream home?
                                    </h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Sign in to save properties, contact agents, and get personalized recommendations.
                                    </p>
                                    <div className="space-y-3">
                                        <Link
                                            to="/auth"
                                            onClick={onClose}
                                            className="block w-full py-3 px-4 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] rounded-xl font-bold shadow-lg text-center"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/auth"
                                            onClick={onClose}
                                            className={`block w-full py-3 px-4 rounded-xl font-bold border-2 text-center ${isDark
                                                ? 'border-[#51faaa] text-[#51faaa]'
                                                : 'border-gray-900 text-gray-900'
                                                }`}
                                        >
                                            Create Account
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileMenuOverlay;
