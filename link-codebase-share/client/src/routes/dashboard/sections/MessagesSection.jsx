import React, { useState, useEffect } from 'react';
import { messagesAPI } from '../../../lib/firebaseAPI';
import { MessageCircle, User, Calendar, Phone, Mail, Star, Check, X, Reply, Archive, Flag, Loader2 } from 'lucide-react';

const MessagesSection = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch messages from Firebase
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        // For now, we'll use mock data since messages are not fully implemented
        // In a real app, you would fetch from Firebase
        const mockMessages = [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            phone: "+254 700 123 456",
            property: "Modern Apartment in Westlands",
            message: "Hi, I'm interested in viewing this property. Is it still available?",
            status: "unread",
            date: "2 hours ago",
            rating: 5,
            priority: "high"
          },
          {
            id: 2,
            name: "Sarah Kimani",
            email: "sarah@example.com",
            phone: "+254 711 234 567",
            property: "Family Home in Karen",
            message: "Could you please send me more photos of the kitchen and living room?",
            status: "read",
            date: "1 day ago",
            rating: 4,
            priority: "medium"
          },
          {
            id: 3,
            name: "Mike Ochieng",
            email: "mike@example.com",
            phone: "+254 722 345 678",
            property: "Studio in Kilimani",
            message: "What's the exact location and are there any parking facilities?",
            status: "unread",
            date: "3 days ago",
            rating: 5,
            priority: "low"
          }
        ];
        
        setMessages(mockMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleReply = () => {
    if (replyText.trim() && selectedMessage) {
      // In a real app, this would send the reply via API
      // Mark message as replied
      setMessages(messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, status: 'replied' }
          : msg
      ));
      
      setReplyText('');
      setShowReplyModal(false);
      setSelectedMessage(null);
    }
  };

  const handleMarkAsRead = (messageId) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'read' }
        : msg
    ));
  };

  const handleArchive = (messageId) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
  };

  const filteredMessages = messages.filter(message => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'unread') return message.status === 'unread';
    if (filterStatus === 'replied') return message.status === 'replied';
    return message.status === 'read';
  });

  const stats = {
    totalMessages: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    avgRating: (messages.reduce((sum, m) => sum + m.rating, 0) / messages.length).toFixed(1),
    repliedToday: messages.filter(m => m.status === 'replied').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Messages & Inquiries
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage property inquiries and customer communications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
            {stats.unread} unread
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="ml-2 text-gray-600 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600 dark:text-red-400">{error}</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">No messages found.</div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${
              message.status === 'unread' ? 'ring-2 ring-blue-500/20' : ''
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{message.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{message.property}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < message.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{message.date}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300">{message.message}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {message.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {message.phone}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    message.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    message.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {message.priority}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {message.status === 'unread' && (
                    <button 
                      onClick={() => handleMarkAsRead(message.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm"
                    >
                      <Check className="w-3 h-3" />
                      Mark Read
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedMessage(message);
                      setShowReplyModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm"
                  >
                    <Reply className="w-3 h-3" />
                    Reply
                  </button>
                  <button 
                    onClick={() => handleArchive(message.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Archive className="w-3 h-3" />
                    Archive
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalMessages}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Messages</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.unread}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgRating}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.repliedToday}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Replied</div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reply to {selectedMessage.name}</h3>
              <button onClick={() => setShowReplyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Original message:</strong>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {selectedMessage.message}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Reply
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows="4"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Reply
              </button>
              <button
                onClick={() => setShowReplyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesSection; 