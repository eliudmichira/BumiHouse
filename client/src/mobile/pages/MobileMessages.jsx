import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    Search,
    Send,
    ChevronLeft,
    Check,
    CheckCheck,
    Clock,
    Loader2,
    Home,
    Paperclip,
    Smile,
    X,
    MoreVertical,
    Ban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { messagesAPI, storageAPI } from '../../lib/firebaseAPI';
import { reportsAPI } from '../../lib/reportsAPI';
import { auth } from '../../lib/firebase';
import { MobilePage } from '../components/PropertyMobileLayout';

const EMOJI_LIST = ['😀', '😊', '😂', '❤️', '👍', '👋', '🎉', '🔥', '✅', '🙏', '😍', '🤔', '😅', '💯', '✨', '🏠', '📍', '💰'];

const MobileMessages = () => {
    const navigate = useNavigate();
    const { currentUser, conversations } = useAuth();
    const { isDark } = useTheme();

    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleBlockUser = async () => {
        if (!selectedConversation || !userId) return;
        const confirmBlock = window.confirm('Are you sure you want to block this user? You will no longer receive messages from them.');
        if (!confirmBlock) return;

        const userToBlock = selectedConversation.user?.id || selectedConversation.user?.uid;
        if (!userToBlock) return;

        try {
            await reportsAPI.blockUser(userToBlock);
            // Submit a report automatically as well
            await reportsAPI.submitReport({
                type: 'user',
                targetId: userToBlock,
                reason: 'Blocked User',
                description: 'User was blocked by reporter.'
            });
            alert('User blocked.');
            setSelectedConversation(null);
            // Ideally refresh conversations to filter out blocked user
            window.location.reload();
        } catch (error) {
            console.error('Failed to block user:', error);
            alert('Failed to block user.');
        }
    };

    const userId = currentUser?.id || auth.currentUser?.uid;

    // Use haptic feedback if available
    const hapticLight = () => {
        if ('vibrate' in navigator) navigator.vibrate(10);
    };

    // Update online status
    useEffect(() => {
        if (!userId) return;

        messagesAPI.updateUserOnlineStatus(userId, true).catch((err) => {
            if (import.meta.env.DEV) {
                console.error('Failed to update online status:', err);
            }
        });

        return () => {
            messagesAPI.updateUserOnlineStatus(userId, false).catch((err) => {
                if (import.meta.env.DEV) {
                    console.error('Failed to update offline status:', err);
                }
            });
        };
    }, [userId]);

    // Real-time messages for selected conversation
    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }

        const unsubscribe = messagesAPI.subscribeToMessages(
            selectedConversation.id,
            (newMessages) => {
                setMessages(newMessages);
            },
            (err) => {
                if (import.meta.env.DEV) {
                    console.error('Message subscription error:', err);
                }
            }
        );

        // Mark as read
        messagesAPI.markConversationAsRead(selectedConversation.id, userId).catch((err) => {
            if (import.meta.env.DEV) {
                console.error('Failed to mark conversation as read:', err);
            }
        });

        return () => unsubscribe();
    }, [selectedConversation, userId]);

    // Automatic scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessageWithPayload = async (payload) => {
        if (!selectedConversation || sendingMessage) return;
        const { text = '', imageUrl } = payload;
        if (!text.trim() && !imageUrl) return;

        const displayText = text.trim() || (imageUrl ? 'Sent an image' : '');
        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            id: tempId,
            senderId: userId,
            text: displayText,
            imageUrl: imageUrl || null,
            timestamp: new Date(),
            status: 'sending'
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setSendingMessage(true);
        hapticLight();

        try {
            await messagesAPI.sendMessage(selectedConversation.id, {
                senderId: userId,
                text: displayText,
                ...(imageUrl && { imageUrl })
            });
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Error sending message:', err);
            }
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setNewMessage(text || '');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        await sendMessageWithPayload({ text: newMessage.trim() });
    };

    const handleAttachmentChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;
        if (!file.type.startsWith('image/')) {
            if (import.meta.env.DEV) console.warn('Please select an image file');
            return;
        }
        e.target.value = '';
        setUploadingAttachment(true);
        hapticLight();
        try {
            const path = `messages/${selectedConversation.id}/${userId}/${Date.now()}-${file.name}`;
            const downloadURL = await storageAPI.uploadImage(file, path);
            await sendMessageWithPayload({ text: '', imageUrl: downloadURL });
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Attachment upload failed:', err);
            }
        } finally {
            setUploadingAttachment(false);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
        hapticLight();
    };

    const [blockedUsers, setBlockedUsers] = useState([]);

    // Fetch blocked users on mount
    useEffect(() => {
        if (!userId) return;
        const fetchBlocked = async () => {
            try {
                const blocked = await reportsAPI.getBlockedUsers();
                setBlockedUsers(blocked);
            } catch (err) {
                console.error('Error fetching blocked users:', err);
            }
        };
        fetchBlocked();
    }, [userId]);

    const filteredConversations = conversations.filter(conv => {
        // Check if other participant is blocked
        const otherUserId = conv.user?.id || conv.user?.uid;
        if (blockedUsers.includes(otherUserId)) return false;

        return (
            (conv.user?.name || conv.user?.username || 'User').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (conv.property?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = (now - date) / 1000;
        if (diff < 60) return 'now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <MobilePage
            showHeader={false}
            padding="none"
            scrollable={false}
            showBottomNav={!selectedConversation}
        >
            <div className="h-full overflow-hidden">
                <AnimatePresence mode="wait">
                    {!selectedConversation ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="h-full"
                        >
                            <div className="flex flex-col h-full bg-white dark:bg-[#0a0c19]">
                                <div className="px-4 pb-4 relative overflow-hidden" style={{ paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/10 via-transparent to-[#06b6d4]/10 opacity-50" />
                                    <div className="relative z-10 flex flex-col gap-4">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white font-outfit tracking-tight">Messages</h2>

                                        <div className="relative">
                                            <div className="absolute inset-0 bg-[#3b82f6]/5 blur-xl rounded-full" />
                                            <div className="relative flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 px-4 py-3 focus-within:border-[#3b82f6]/50 transition-all">
                                                <Search className="w-5 h-5 text-gray-400 mr-3" />
                                                <input
                                                    type="text"
                                                    placeholder="Search conversations..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-0 text-gray-900 dark:text-white font-outfit"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 no-scrollbar">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-40">
                                            <Loader2 className="w-6 h-6 animate-spin text-[#3b82f6]" />
                                        </div>
                                    ) : filteredConversations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-64 px-8 text-center">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                <MessageCircle className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No messages yet</h3>
                                            <p className="text-gray-500 text-sm">When you contact agents about properties, your conversations will appear here.</p>
                                        </div>
                                    ) : (
                                        filteredConversations.map(conv => (
                                            <motion.div
                                                key={conv.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    hapticLight();
                                                    setSelectedConversation(conv);
                                                }}
                                                className="px-4 py-3 flex gap-4 hover:bg-white dark:hover:bg-gray-800/40 transition-all group relative overflow-hidden"
                                            >
                                                {/* Unread Indicator Vertical Bar */}
                                                {conv.unreadCount > 0 && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-[#3b82f6] rounded-r-full shadow-[0_0_8px_rgba(81,250,170,0.5)]" />
                                                )}

                                                <div className="relative flex-shrink-0">
                                                    <div className="w-14 h-14 rounded-full overflow-hidden relative shadow-lg group-hover:shadow-[#3b82f6]/20 transition-all duration-300">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] opacity-80" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-[#0a0c19] font-black text-xl">
                                                                {(conv.user?.name || conv.user?.username || 'U')[0]}
                                                            </span>
                                                        </div>
                                                        {conv.user?.avatar && (
                                                            <img src={conv.user.avatar} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                                        )}
                                                    </div>
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0a0c19] shadow-md ${conv.user?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                </div>

                                                <div className="flex-1 min-w-0 py-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className="font-bold text-gray-900 dark:text-white truncate text-base tracking-tight">
                                                            {conv.user?.name || conv.user?.username || 'Unknown Agent'}
                                                        </h4>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatTime(conv.lastMessageTime)}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                        {conv.lastMessage || 'Sent a property inquiry'}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="px-2 py-0.5 bg-[#3b82f6]/10 rounded-md flex items-center gap-1.5 border border-[#3b82f6]/20">
                                                            <Home className="w-3 h-3 text-[#3b82f6]" />
                                                            <span className="text-[10px] font-black text-[#3b82f6] truncate max-w-[120px] uppercase tracking-tighter">
                                                                {conv.property?.title || 'General Inquiry'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                    {/* Spacer for bottom nav */}
                                    <div className="h-32" />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="h-full"
                        >
                            <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-gray-900">
                                {/* Immersive Header - Chat View */}
                                <div className="px-4 pb-4 relative overflow-hidden border-b border-gray-100 dark:border-gray-800" style={{ paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/10 via-transparent to-[#06b6d4]/10 opacity-30" />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    hapticLight();
                                                    setSelectedConversation(null);
                                                }}
                                                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                                            </button>
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full overflow-hidden relative shadow-lg">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] opacity-80" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[#0a0c19] pt-10 font-black text-lg">
                                                            {(selectedConversation.user?.name || selectedConversation.user?.username || 'U')[0]}
                                                        </span>
                                                    </div>
                                                    {selectedConversation.user?.avatar && (
                                                        <img src={selectedConversation.user.avatar} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0a0c19] ${selectedConversation.user?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-gray-900 dark:text-white text-base tracking-tight truncate">
                                                    {selectedConversation.user?.name || selectedConversation.user?.username || 'Agent'}
                                                </h4>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedConversation.user?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedConversation.user?.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                                        {selectedConversation.user?.isOnline ? 'Active Now' : 'Offline'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowMenu(!showMenu)}
                                                className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </button>

                                            <AnimatePresence>
                                                {showMenu && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        className={`absolute right-0 top-10 w-48 rounded-xl shadow-xl border overflow-hidden z-[100] ${isDark
                                                            ? 'bg-gray-800 border-gray-700'
                                                            : 'bg-white border-gray-100'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={handleBlockUser}
                                                            className="w-full px-4 py-3 mb-4 flex items-center gap-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                            Block User
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                {/* Property Context Bar */}
                                <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={selectedConversation.property?.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=100&h=100'}
                                            className="w-full h-full object-cover"
                                            alt="Property"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Inquiry for</p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{selectedConversation.property?.title || 'Unknown Property'}</p>
                                    </div>
                                </div>

                                {/* Messages Feed */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar" ref={chatContainerRef}>
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center p-8 opacity-40">
                                            <MessageCircle size={48} className="mb-4" />
                                            <p className="text-sm font-medium">Start the conversation</p>
                                        </div>
                                    ) : (
                                        <AnimatePresence>
                                            {messages.map((msg) => {
                                                const isOwn = msg.senderId === userId;

                                                return (
                                                    <motion.div
                                                        key={msg.id}
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm relative ${isOwn
                                                            ? 'bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] text-[#0a0c19] rounded-tr-none'
                                                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700/50 rounded-tl-none'
                                                            }`}>
                                                            {msg.imageUrl && (
                                                                <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden mb-2 max-w-[240px]">
                                                                    <img src={msg.imageUrl} alt="Attachment" className="w-full h-auto object-cover" />
                                                                </a>
                                                            )}
                                                            {msg.text ? <p className="text-sm font-medium leading-relaxed">{msg.text}</p> : null}
                                                            <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                                                                <span className="text-[9px] font-bold">
                                                                    {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                                                        msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '刚刚'}
                                                                </span>
                                                                {isOwn && (
                                                                    msg.status === 'sending' ? <Clock size={10} className="animate-pulse" /> :
                                                                        msg.read ? <CheckCheck size={10} className="text-blue-500" /> : <Check size={10} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Premium Input Area */}
                                <div className="px-4 pt-4 bg-white dark:bg-[#0a0c19] border-t border-gray-100 dark:border-gray-800" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))' }}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAttachmentChange}
                                    />
                                    {showEmojiPicker && (
                                        <div className="flex flex-wrap gap-1.5 p-2 mb-2 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                                            {EMOJI_LIST.map((emoji, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => handleEmojiSelect(emoji)}
                                                    className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-[#3b82f6]/20 transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setShowEmojiPicker(false)}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-end gap-3 p-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 focus-within:border-[#3b82f6]/50 transition-all shadow-inner">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingAttachment}
                                            className="p-3 text-gray-400 hover:text-[#3b82f6] transition-colors disabled:opacity-50"
                                            aria-label="Attach image"
                                        >
                                            {uploadingAttachment ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                                        </button>
                                        <textarea
                                            rows={1}
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                // Auto-resize logic
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                                            }}
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-gray-900 dark:text-white font-outfit resize-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <div className="flex items-center gap-0.5 pr-1 h-full py-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowEmojiPicker(prev => !prev);
                                                    hapticLight();
                                                }}
                                                className={`p-3 rounded-xl transition-colors ${showEmojiPicker ? 'text-[#3b82f6] bg-[#3b82f6]/10' : 'text-gray-400 hover:text-[#3b82f6]'}`}
                                                aria-label="Insert emoji"
                                            >
                                                <Smile size={20} />
                                            </button>
                                            {newMessage.trim() && (
                                                <motion.button
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    onClick={handleSendMessage}
                                                    disabled={sendingMessage}
                                                    className="p-3 bg-[#3b82f6] text-[#0a0c19] rounded-xl shadow-lg hover:shadow-[#3b82f6]/30 transition-shadow"
                                                >
                                                    {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MobilePage >
    );
};

export default MobileMessages;
