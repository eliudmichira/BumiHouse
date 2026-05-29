import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle, Mail, ChevronRight, Calendar, ShieldCheck, CreditCard, ChevronDown, Phone, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MobileSupportPage = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqs = [
        { 
            q: "How do I book a property visit?", 
            a: "Find the property you like, click 'Contact Agent' and select 'Book Viewing'. You can then choose a convenient time from the agent's schedule.",
            icon: Calendar
        },
        { 
            q: "Is my payment information secure?", 
            a: "Absolutely. BumiHouse uses industry-standard SSL encryption and secure payment gateways (MPESA & Cards) to ensure your data is always protected.",
            icon: ShieldCheck
        },
        { 
            q: "How can I become a verified agent?", 
            a: "Go to your Profile > Business Profile and upload your KRA Pin and ID for verification. Our team will review it within 24-48 hours.",
            icon: CheckCircle
        },
        { 
            q: "What are the listing fees?", 
            a: "Standard listings are free for individuals. Agents can subscribe to premium plans starting from KES 2,500/month for unlimited featured listings.",
            icon: CreditCard
        }
    ];

    const ContactButton = ({ icon: Icon, label, subtitle, onClick, color = 'blue' }) => (
        <motion.button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-100 shadow-sm hover:bg-gray-50'
            }`}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isDark ? `bg-blue-500/10` : `bg-blue-50`
                }`}>
                    <Icon className={isDark ? `text-blue-400` : `text-blue-500`} size={22} />
                </div>
                <div className="text-left">
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{subtitle}</p>
                </div>
            </div>
            <ChevronRight size={18} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
        </motion.button>
    );

    return (
        <div className={`min-h-screen pb-32 ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-30 px-4 py-4 border-b backdrop-blur-2xl ${isDark ? 'bg-[#0a0c19]/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
                <div className="flex items-center gap-4">
                    <motion.button 
                        onClick={() => navigate(-1)} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-gray-100 text-gray-700'}`} 
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Help & Support</h1>
                </div>
            </div>

            <div className="p-6 space-y-8 max-w-lg mx-auto">
                {/* Search / Hero */}
                <div className="text-center space-y-2">
                    <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>How can we help?</h2>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Search our help center or contact our support team 24/7.</p>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Frequently Asked Questions
                    </h3>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <motion.div 
                                key={i}
                                className={`rounded-3xl border overflow-hidden transition-all ${
                                    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'
                                }`}
                            >
                                <button 
                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                            <faq.icon size={18} className="text-[#3b82f6]" />
                                        </div>
                                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{faq.q}</span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                                    >
                                        <ChevronDown size={18} className="text-gray-500" />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {expandedFaq === i && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-5 pb-5 ml-14"
                                        >
                                            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {faq.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-4">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Direct Contact
                    </h3>
                    <div className="space-y-3">
                        <ContactButton 
                            icon={MessageCircle} 
                            label="Live Chat" 
                            subtitle="Typically responds in 5m"
                            onClick={() => {}} 
                            color="blue"
                        />
                        <ContactButton 
                            icon={Mail} 
                            label="Email Support" 
                            subtitle="support@bumihouse.com"
                            onClick={() => window.location.href = 'mailto:support@bumihouse.com'} 
                            color="purple"
                        />
                        <ContactButton 
                            icon={Phone} 
                            label="Call Us" 
                            subtitle="+254 700 000 000"
                            onClick={() => window.location.href = 'tel:+254700000000'} 
                            color="emerald"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileSupportPage;
