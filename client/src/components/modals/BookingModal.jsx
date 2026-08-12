import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { accountDashboardAPI, notificationsAPI } from '../../lib/firebaseAPI';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const BookingModal = ({ isOpen, onClose, property, agent }) => {
    const { currentUser } = useAuth();
    const { isDark } = useTheme();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', 
        '12:00 PM', '02:00 PM', '03:00 PM', 
        '04:00 PM', '05:00 PM'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            setError('Please log in to book a viewing');
            return;
        }

        if (!date || !time) {
            setError('Please select both date and time');
            return;
        }

        const agentId = agent?.id || agent?.userId || agent?.agentId || property?.agentId || property?.userId;
        
        if (!agentId) {
            setError('Agent information is missing. Cannot book viewing.');
            console.error('Missing agentId:', { agent, property });
            return;
        }

        setLoading(true);
        setError('');

        try {
            const bookingData = {
                propertyId: property.id,
                propertyTitle: property.title || 'Property',
                propertyImage: property.images?.[0] || property.image || '',
                userId: currentUser.id,
                userName: currentUser.displayName || currentUser.name || 'Anonymous',
                userEmail: currentUser.email,
                userPhoto: currentUser.photoURL || '',
                agentId: agentId,
                agentName: agent.name || 'Agent',
                viewingDate: date,
                viewingTime: time,
                status: 'pending'
            };

            console.log('Attempting to create booking:', bookingData);
            const result = await accountDashboardAPI.createBooking(bookingData);
            console.log('Booking created successfully:', result);

            // Send notification to agent
            try {
                await notificationsAPI.create(agentId, {
                    type: 'booking',
                    title: 'New Viewing Request',
                    message: `${bookingData.userName} requested a viewing for "${bookingData.propertyTitle}" on ${date} at ${time}.`,
                    propertyId: property.id,
                    bookingDate: date,
                    bookingTime: time,
                    url: '/dashboard?section=bookings'
                });
                console.log('Notification sent to agent:', agentId);
            } catch (notifErr) {
                console.error('Failed to send notification to agent:', notifErr);
                // Don't fail the whole booking if just notification fails
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setDate('');
                setTime('');
            }, 3000);
        } catch (err) {
            console.error('Booking error:', err);
            setError(err.message || 'Failed to book viewing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen && !success) return null;

    return (
        <AnimatePresence>
            {(isOpen || success) && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`relative w-full max-w-lg overflow-hidden rounded-t-[32px] sm:rounded-[32px] border shadow-2xl ${
                            isDark ? 'bg-[#0a0c19] border-white/10' : 'bg-white border-gray-100'
                        }`}
                    >
                        {success ? (
                            <div className="p-12 text-center space-y-6">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <CheckCircle2 size={40} className="text-emerald-500" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Request Sent!</h2>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        The agent will be notified and will contact you shortly to confirm the appointment.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 sm:p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Book a Viewing
                                    </h2>
                                    <button 
                                        onClick={onClose}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                            isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                        }`}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#51faaa]/5 border border-[#51faaa]/10">
                                    <img 
                                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&h=300'} 
                                        alt="" 
                                        className="w-16 h-16 rounded-xl object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {property.title}
                                        </p>
                                        <p className="text-xs text-[#51faaa] font-medium">{property.location?.city || 'Nairobi'}</p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className={`text-xs font-black uppercase tracking-widest ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            Select Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#51faaa]" size={18} />
                                            <input 
                                                type="date" 
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className={`w-full h-14 pl-12 pr-4 rounded-2xl border outline-none transition-all ${
                                                    isDark 
                                                    ? 'bg-white/5 border-white/10 text-white focus:border-[#51faaa]/50' 
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#51faaa]'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className={`text-xs font-black uppercase tracking-widest ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            Select Time
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {timeSlots.map((slot) => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setTime(slot)}
                                                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                                                        time === slot
                                                        ? 'bg-[#51faaa] border-[#51faaa] text-[#0a0c19]'
                                                        : (isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-600')
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading || !date || !time}
                                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#51faaa] to-[#45e89a] text-[#0a0c19] font-black shadow-lg shadow-[#51faaa]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 size={20} />
                                                <span>Confirm Booking</span>
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </div>
                        )}
                        
                        {/* Safe area spacer for mobile */}
                        <div className="h-[env(safe-area-inset-bottom,20px)] sm:hidden" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingModal;
