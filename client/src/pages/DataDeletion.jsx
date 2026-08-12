import React from 'react';
import { Trash2, AlertTriangle, Lock, Mail, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DataDeletion = () => {
    const { isDark } = useTheme();

    return (
        <div className={`pt-32 pb-20 min-h-screen ${isDark ? 'bg-[#0a0c19] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-3xl mx-auto px-6">
                {/* Header */}
                <div className="mb-10 text-center">
                    <a href="/" className="inline-flex items-center gap-2 text-sm font-medium hover:text-[#51faaa] mb-8 transition-colors">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
                    </a>

                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-4 font-outfit">Request Account Deletion</h1>
                    <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        We value your privacy. If you wish to permanently delete your account and all associated data, please follow the instructions below.
                    </p>
                </div>

                {/* Warning Card */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 mb-10">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-red-500 text-lg mb-2">Important Warning</h3>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Account deletion is <strong>permanent and irreversible</strong>. Once processed, you will lose access to:
                            </p>
                            <ul className={`list-disc pl-5 mt-2 space-y-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <li>Your profile and login credentials</li>
                                <li>All property listings you have posted</li>
                                <li>Saved properties, search history, and favorites</li>
                                <li>Chat history and messages with other users</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Deletion Methods */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Method 1: In-App */}
                    <div className={`p-8 rounded-3xl border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="w-10 h-10 rounded-full bg-[#51faaa]/10 flex items-center justify-center mb-4">
                            <Lock className="w-5 h-5 text-[#51faaa]" />
                        </div>
                        <h3 className="text-xl font-bold mb-4">Method 1: In-App Deletion</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            The fastest way to delete your data is directly through the mobile application.
                        </p>
                        <ol className={`space-y-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#51faaa] text-black font-bold text-xs flex items-center justify-center">1</span>
                                Open the HomesKE App
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#51faaa] text-black font-bold text-xs flex items-center justify-center">2</span>
                                Go to <strong>Profile</strong> &gt; <strong>Settings</strong>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#51faaa] text-black font-bold text-xs flex items-center justify-center">3</span>
                                Scroll down and tap <strong>Delete Account</strong>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#51faaa] text-black font-bold text-xs flex items-center justify-center">4</span>
                                Confirm your choice
                            </li>
                        </ol>
                    </div>

                    {/* Method 2: Email Request */}
                    <div className={`p-8 rounded-3xl border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <Mail className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-4">Method 2: Email Request</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            If you cannot access the app, you can request deletion via email.
                        </p>
                        <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                            <p className={`text-xs uppercase tracking-wider mb-2 font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Email To</p>
                            <a href="mailto:support@homeske.com" className="text-[#51faaa] font-bold text-lg hover:underline">support@homeske.com</a>
                        </div>
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                            <p className={`text-xs uppercase tracking-wider mb-2 font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Subject Line</p>
                            <p className="font-mono text-sm">Account Deletion Request: [Your Email]</p>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-12 text-center">
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Requests made via email will be processed within 30 days. <br />
                        For more details, please review our <a href="/privacy" className="text-[#51faaa] hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DataDeletion;
