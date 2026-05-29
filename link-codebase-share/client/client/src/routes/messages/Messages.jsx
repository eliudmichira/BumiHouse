import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { messagesAPI } from '../../lib/firebaseAPI';
import { auth } from '../../lib/firebase';
import { 
  MessageCircle, 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image, 
  Paperclip,
  Smile,
  User,
  Check,
  CheckCheck,
  Clock,
  Archive,
  Trash2,
  Star,
  StarOff,
  Loader2,
  Home,
  Calendar,
  Circle
} from 'lucide-react';

const Messages = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);

  // Function to fetch conversations from Firebase
  const fetchConversations = async () => {
    // Get user ID from context or Firebase Auth directly
    let userId = currentUser?.uid;
    
    if (!userId) {
      console.log('No current user UID from context, trying Firebase Auth directly...');
      userId = auth.currentUser?.uid;
    }
    
    if (!userId) {
      console.log('No current user UID available from any source');
      setLoading(false);
      setConversations([]);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching conversations for user:', userId);
      
      const response = await messagesAPI.getConversations(userId);
      console.log('Fetched conversations response:', response);
      
      setConversations(response.conversations || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const response = await messagesAPI.getMessages(conversationId);
      console.log('Fetched messages:', response);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  // Function to check online status
  const checkOnlineStatus = async (userId) => {
    try {
      const userDoc = await messagesAPI.getUserDetails(userId);
      if (userDoc && userDoc.lastSeen) {
        const lastSeen = userDoc.lastSeen.toDate ? userDoc.lastSeen.toDate() : new Date(userDoc.lastSeen);
        const now = new Date();
        const timeDiff = now - lastSeen;
        // Consider user online if last seen within 5 minutes
        return timeDiff < 5 * 60 * 1000;
      }
      return false;
    } catch (error) {
      console.error('Error checking online status:', error);
      return false;
    }
  };

  // Function to update online status
  const updateOnlineStatus = async () => {
    const userId = currentUser?.uid || auth.currentUser?.uid;
    if (userId) {
      try {
        await messagesAPI.updateUserOnlineStatus(userId, true);
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    fetchConversations();
    updateOnlineStatus();
    
    // Update online status every 30 seconds
    const interval = setInterval(updateOnlineStatus, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser?.uid, auth.currentUser?.uid]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check online status for conversation participants
  useEffect(() => {
    const checkParticipantsOnlineStatus = async () => {
      const onlineSet = new Set();
      
      for (const conversation of conversations) {
        if (conversation.user?.id) {
          const isOnline = await checkOnlineStatus(conversation.user.id);
          if (isOnline) {
            onlineSet.add(conversation.user.id);
          }
        }
      }
      
      setOnlineUsers(onlineSet);
    };

    if (conversations.length > 0) {
      checkParticipantsOnlineStatus();
    }
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    // Get user ID from context or Firebase Auth directly
    let userId = currentUser?.id || currentUser?.uid || auth.currentUser?.uid;
    if (!userId) {
      console.error('No user ID available for sending message');
      return;
    }

    const text = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Fire-and-forget send; UI already cleared
    messagesAPI
      .sendMessage(selectedConversation.id, { senderId: userId, text })
      .then(() => {
        // Optionally refresh in background
        fetchMessages(selectedConversation.id);
        fetchConversations();
      })
      .catch((err) => {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
      })
      .finally(() => setSendingMessage(false));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Test function to create a sample conversation

  const filteredConversations = conversations.filter(conv =>
    (conv.user?.name || conv.user?.username || 'Unknown User').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.property?.title || 'Unknown Property').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-[#51faaa]" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString();
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };
  if (loading) {
    return (
      <div className={`min-h-screen pt-32 pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#51faaa]" />
            <p className={`mt-4 font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen pt-32 pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className={`text-red-500 mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </div>
            <button 
              onClick={fetchConversations}
              className="bg-[#51faaa] text-[#0a0c19] px-4 py-2 rounded-lg font-outfit font-medium hover:bg-[#51faaa]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-32 pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-4xl font-outfit font-bold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                Messages
              </h1>
              <p className={`font-outfit text-lg ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                Manage your property inquiries and communications
              </p>
            </div>
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={fetchConversations}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-outfit font-medium hover:bg-blue-600 transition-colors"
              >
                Refresh Conversations
              </button>
              {/* Removed Create Test Conversation for production */}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)]">
          {/* Conversations List */}
          <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl border overflow-hidden`}>
            {/* Search */}
            <div className={`p-4 border-b ${isDark ? 'border-[rgba(81,250,170,0.1)]' : 'border-gray-200'}`}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                    isDark 
                      ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="overflow-y-auto h-[calc(100%-80px)]">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-16 h-16 mx-auto text-[#51faaa] mb-4" />
                  <h4 className={`text-lg font-outfit font-semibold mb-2 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                    No conversations yet
                  </h4>
                  <p className={`text-[#ccc] font-outfit mb-4`}>
                    Start a conversation by contacting an agent about a property
                  </p>
                  <div className="text-xs text-gray-500">
                    Conversations: {conversations.length}
                  </div>
                </div>
              ) : (
                filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? isDark 
                        ? 'bg-[rgba(81,250,170,0.1)] border-[rgba(81,250,170,0.2)]'
                        : 'bg-[rgba(81,250,170,0.05)] border-[rgba(81,250,170,0.2)]'
                      : isDark
                        ? 'border-[rgba(81,250,170,0.1)] hover:bg-[rgba(81,250,170,0.05)]'
                        : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
                        <span className="text-[#111] font-outfit font-bold text-lg">
                          {(conversation.user?.name || conversation.user?.username || 'U')[0]}
                        </span>
                      </div>
                      {isUserOnline(conversation.user?.id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#51faaa] border-2 border-white dark:border-[#0a0c19] rounded-full">
                          <div className="w-full h-full bg-[#51faaa] rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-outfit font-semibold truncate ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                          {conversation.user?.name || conversation.user?.username || 'Unknown User'}
                        </h3>
                        <span className={`text-xs font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-500'}`}>
                          {formatLastMessageTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      
                      <p className={`text-sm font-outfit truncate mb-2 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded flex items-center justify-center">
                            <Home className="w-4 h-4 text-[#111]" />
                          </div>
                          <span className={`text-xs font-outfit truncate ${isDark ? 'text-[#ccc]' : 'text-gray-500'}`}>
                            {conversation.property?.title || 'Property Inquiry'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isUserOnline(conversation.user?.id) && (
                            <div className="flex items-center gap-1">
                              <Circle className="w-2 h-2 text-[#51faaa] fill-current" />
                              <span className="text-xs text-[#51faaa] font-outfit">Online</span>
                            </div>
                          )}
                          
                          {conversation.unreadCount > 0 && (
                            <span className="bg-[#51faaa] text-[#111] text-xs font-outfit font-semibold rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`lg:col-span-2 ${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl border overflow-hidden flex flex-col`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className={`p-4 border-b ${isDark ? 'border-[rgba(81,250,170,0.1)]' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center">
                          <span className="text-[#111] font-outfit font-bold text-sm">
                            {(selectedConversation.user?.name || selectedConversation.user?.username || 'U')[0]}
                          </span>
                        </div>
                        {isUserOnline(selectedConversation.user?.id) && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#51faaa] border-2 border-white dark:border-[#0a0c19] rounded-full">
                            <div className="w-full h-full bg-[#51faaa] rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className={`font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                          {selectedConversation.user?.name || selectedConversation.user?.username || 'Unknown User'}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isUserOnline(selectedConversation.user?.id) ? (
                            <>
                              <Circle className="w-2 h-2 text-[#51faaa] fill-current" />
                              <p className={`text-sm font-outfit text-[#51faaa]`}>Online</p>
                            </>
                          ) : (
                            <p className={`text-sm font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-500'}`}>
                              Offline
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-[#ccc] hover:text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                          : 'text-gray-400 hover:text-[#51faaa] hover:bg-gray-100'
                      }`}>
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-[#ccc] hover:text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                          : 'text-gray-400 hover:text-[#51faaa] hover:bg-gray-100'
                      }`}>
                        <Video className="w-5 h-5" />
                      </button>
                      <button className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-[#ccc] hover:text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                          : 'text-gray-400 hover:text-[#51faaa] hover:bg-gray-100'
                      }`}>
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                      <p className={`text-sm font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-500'}`}>
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isOwnMessage = message.senderId === (currentUser?.uid || auth.currentUser?.uid);
                      const showTimestamp = index === 0 || 
                        (messages[index - 1] && 
                         Math.abs((message.timestamp?.toDate ? message.timestamp.toDate() : new Date(message.timestamp)) - 
                                 (messages[index - 1].timestamp?.toDate ? messages[index - 1].timestamp.toDate() : new Date(messages[index - 1].timestamp))) > 5 * 60 * 1000);
                      
                      return (
                        <div key={message.id}>
                          {showTimestamp && (
                            <div className="text-center my-4">
                              <span className={`text-xs font-outfit px-3 py-1 rounded-full ${
                                isDark ? 'bg-[#0a0c19] text-[#ccc]' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {formatMessageTime(message.timestamp)}
                              </span>
                            </div>
                          )}
                          
                          <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl font-outfit ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111]'
                                  : isDark
                                    ? 'bg-[#0a0c19] text-[#feffff] border border-[rgba(81,250,170,0.2)]'
                                    : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <div className={`flex items-center justify-end gap-1 mt-1 ${
                                isOwnMessage ? 'text-[#111]/70' : isDark ? 'text-[#ccc]' : 'text-gray-500'
                              }`}>
                                <span className="text-xs">
                                  {message.timestamp?.toDate ? 
                                    new Date(message.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                                    new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                  }
                                </span>
                                {isOwnMessage && getMessageStatusIcon(message.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className={`p-4 border-t ${isDark ? 'border-[rgba(81,250,170,0.1)]' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <button className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-[#ccc] hover:text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                        : 'text-gray-400 hover:text-[#51faaa] hover:bg-gray-100'
                    }`}>
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-[#ccc] hover:text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                        : 'text-gray-400 hover:text-[#51faaa] hover:bg-gray-100'
                    }`}>
                      <Image className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={sendingMessage}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit pr-10 ${
                          isDark 
                            ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        } ${sendingMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <button className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-[#ccc] hover:text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)]' 
                          : 'text-gray-400 hover:text-[#51faaa] hover:bg-gray-100'
                      }`}>
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="p-2 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-outfit font-semibold"
                    >
                      {sendingMessage ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-outfit font-semibold mb-2 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                    Select a conversation
                  </h3>
                  <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 