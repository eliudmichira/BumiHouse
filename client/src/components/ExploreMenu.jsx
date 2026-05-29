import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Search, Building2, Key, Heart,
    Settings, LogOut, X, UserCircle, Users, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Corrected path

const ExploreMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { logout, currentUser } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const menuItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search Properties', path: '/search' },
        { icon: Users, label: 'Agents', path: '/desktop/agents' },
        { icon: BookOpen, label: 'Blog', path: '/desktop/blog' },
        { icon: Building2, label: 'Buy', path: '/properties?type=sale' },
        { icon: Key, label: 'Rent', path: '/properties?type=rent' },
        { icon: Heart, label: 'Saved', path: '/favorites' },
        // { icon: MessageSquare, label: 'Messages', path: '/messages' },
    ];

    const bottomItems = [
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: LogOut, label: 'Log Out', action: handleLogout },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold text-xl">
                                    <UserCircle size={32} />
                                </div>
                                {currentUser ? (
                                    <div>
                                        <h2 className="font-bold text-lg">{currentUser.name || 'Welcome Back'}</h2>
                                        <p className="text-sm text-gray-500">{currentUser.email}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="font-bold text-lg">Welcome</h2>
                                        <p className="text-sm text-gray-500">Sign in to sync data</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 text-gray-500">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="px-4 space-y-1">
                                {menuItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (item.path) navigate(item.path);
                                            onClose();
                                        }}
                                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left text-gray-700 dark:text-gray-200"
                                    >
                                        <item.icon size={22} className="text-gray-500" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
                            {bottomItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (item.path) navigate(item.path);
                                        if (item.action) item.action();
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left text-gray-500"
                                >
                                    <item.icon size={22} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ExploreMenu;
