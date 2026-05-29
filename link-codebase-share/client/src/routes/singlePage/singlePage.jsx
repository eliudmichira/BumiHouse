import React, { useContext, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { MapPin, Heart, MessageCircle, Share2, Home, Car, Utensils, GraduationCap, Bus, Users, Bath, Bed, Ruler, DollarSign, Star, Shield, Building2, CheckCircle, AlertCircle } from "lucide-react";
import Slider from "../../components/Slider/Slider";
import Map from "../../components/map/Map";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import DOMPurify from "dompurify";
import { useTheme } from '../../context/ThemeContext';
import { messagesAPI } from '../../lib/firebaseAPI';

// Toast notification system
const showToast = (options) => {
  const toast = document.createElement('div');
  toast.className = `fixed top-6 right-6 z-[9999] transform transition-all duration-500 ease-out`;
  
  toast.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl p-5 min-w-[300px] max-w-[400px] ${
      options.type === 'error' 
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
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-sm tracking-wide mb-1">${options.title}</div>
          <div class="text-xs opacity-90 leading-relaxed">${options.message}</div>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div class="h-full bg-white/60 animate-[progress_4s_linear]"></div>
      </div>
    </div>
  `;
  
  // Add custom CSS for progress animation
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initial position (off-screen)
  toast.style.transform = 'translateX(120%) scale(0.8)';
  toast.style.opacity = '0';
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0) scale(1)';
    toast.style.opacity = '1';
  }, 50);
  
  // Animate out
  setTimeout(() => {
    toast.style.transform = 'translateX(120%) scale(0.8)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 500);
  }, 4000);
};

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post?.isSaved || false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme } = useTheme ? useTheme() : { theme: 'light' };
  const isDark = (theme === 'dark' || (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));

  // Add error handling for missing data
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaved((prev) => !prev);
    if (!currentUser) {
      navigate("/desktop/login");
    }
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (error) {
      setSaved((prev) => !prev);
    }
  };

  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!currentUser) {
      showToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to send a message to the agent.'
      });
      navigate("/desktop/login", { state: { from: window.location.pathname } });
      return;
    }

    // Check if we have agent information
    if (!post.userId) {
      showToast({
        type: 'error',
        title: 'Agent Not Found',
        message: 'Agent information is not available for this property.'
      });
      return;
    }

    setIsSending(true);

    try {
      // Check if conversation already exists
      const existingConversations = await messagesAPI.getConversations(currentUser.uid);
      let conversationId = null;

      // Look for existing conversation with this agent
      for (const conv of existingConversations.conversations) {
        if (conv.participants && conv.participants.includes(post.userId)) {
          conversationId = conv.id;
          break;
        }
      }

      // Create new conversation if none exists
      if (!conversationId) {
        conversationId = await messagesAPI.createConversation([currentUser.uid, post.userId], post.id);
      }

      // Send initial message
      const initialMessage = {
        senderId: currentUser.uid,
        text: `Hi! I'm interested in the property "${post.title}". Could you please provide more information?`,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      await messagesAPI.sendMessage(conversationId, initialMessage);

      showToast({
        type: 'success',
        title: 'Message Sent Successfully!',
        message: `Your message has been sent to ${post.username || 'the agent'}. You can view your conversations in the Messages section.`
      });

      // Navigate to messages page after a short delay
      setTimeout(() => {
        navigate('/messages');
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: 'error',
        title: 'Failed to Send Message',
        message: 'There was an error sending your message. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleShareProperty = () => {
    const shareData = {
      title: post.title,
      text: `Check out this amazing property: ${post.title} - $${post.price.toLocaleString()}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} - ${shareData.url}`);
      showNotification({
        type: 'success',
        title: 'Link Copied',
        message: 'Property link copied to clipboard!',
        duration: 3000
      });
    }
  };

  // Notification function
  const showNotification = (options) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      options.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="font-semibold">${options.title}</div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-white/80 hover:text-white">×</button>
      </div>
      <div class="text-sm mt-1">${options.message}</div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, options.duration || 3000);
  };

  return (
    <div className={`singlePage min-h-screen relative overflow-hidden bg-gray-50 dark:bg-[#0a1f16] transition-colors duration-300${isDark ? ' darker' : ''}`}>
      {/* Mesh blobs for green glassmorphic dark theme */}
      {isDark && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="mesh-blob" style={{top: '10%', left: '5%', width: '420px', height: '420px', background: 'radial-gradient(circle, #059669 0%, transparent 70%)', position: 'absolute'}} />
          <div className="mesh-blob" style={{top: '60%', left: '70%', width: '500px', height: '500px', background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', position: 'absolute'}} />
          <div className="mesh-blob" style={{top: '30%', left: '60%', width: '320px', height: '320px', background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', position: 'absolute'}} />
        </div>
      )}

      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-700">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Property Images */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-dark-800/80 border border-white/30 dark:border-dark-700 shadow-2xl rounded-3xl p-6 mb-8 transition-colors duration-300">
            <Slider images={post.images || [post.img]} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Header */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-dark-800/80 border border-white/30 dark:border-dark-700 shadow-2xl rounded-3xl p-8 transition-colors duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                      {post.title}
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">{post.address}</span>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Ksh {post.price?.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* User Info */}
                  {post.user && (
                    <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-dark-700/50 rounded-2xl border border-white/30 dark:border-dark-600 transition-colors duration-300">
                      <img 
                        src={post.user.avatar || "/noavatar.jpg"} 
                        alt={post.user.username}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/50 dark:border-dark-600 shadow-lg"
                      />
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">{post.user.username}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Property Owner</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Description */}
              {post.postDetail?.desc && (
                <div className="backdrop-blur-xl bg-white/70 dark:bg-dark-800/80 border border-white/30 dark:border-dark-700 shadow-2xl rounded-3xl p-8 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Property Description</h2>
                  <div 
                    className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.postDetail.desc) }}
                  />
                </div>
              )}

              {/* Property Features */}
              {post.postDetail && (
                <div className="backdrop-blur-xl bg-white/70 dark:bg-dark-800/80 border border-white/30 dark:border-dark-700 shadow-2xl rounded-3xl p-8 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Property Features</h2>
                  
                  {/* General Features */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">General</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <FeatureCard 
                          icon={Shield}
                          title="Utilities"
                          description={post.postDetail.utilities === "owner" ? "Owner is responsible" : "Tenant is responsible"}
                          color="blue"
                        />
                        <FeatureCard 
                          icon={Home}
                          title="Pet Policy"
                          description={post.postDetail.pet === "Allowed" ? "Pets allowed" : "Pets not allowed"}
                          color="green"
                        />
                        <FeatureCard 
                          icon={DollarSign}
                          title="Property Fees"
                          description="Must have 3x the rent in total household income"
                          color="purple"
                        />
                      </div>
                    </div>

                    {/* Sizes */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Sizes</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <SizeCard 
                          icon={Ruler}
                          value={post.postDetail.size}
                          label="Size"
                          color="blue"
                        />
                        <SizeCard 
                          icon={Bed}
                          value={`${post.bedroom} bedroom`}
                          label="Bedrooms"
                          color="purple"
                        />
                        <SizeCard 
                          icon={Bath}
                          value={`${post.bathroom} bathroom`}
                          label="Bathrooms"
                          color="pink"
                        />
                      </div>
                    </div>

                    {/* Nearby Places */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Nearby Places</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <NearbyCard 
                          icon={GraduationCap}
                          title="School"
                          distance={post.postDetail.school > 999 ? `${post.postDetail.school/1000}km` : `${post.postDetail.school}m`}
                          color="blue"
                        />
                        <NearbyCard 
                          icon={Bus}
                          title="Bus Stop"
                          distance={`${post.postDetail.bus}m`}
                          color="green"
                        />
                        <NearbyCard 
                          icon={Utensils}
                          title="Restaurant"
                          distance={`${post.postDetail.restaurant}m`}
                          color="orange"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Location</h2>
                <div className="h-96 rounded-2xl overflow-hidden">
                  <Map propertyData={[post]} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl rounded-3xl p-6">
                <div className="space-y-4">
                  <button 
                    onClick={handleSendMessage}
                    disabled={isSending}
                    className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
                      isSending 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {isSending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        Send a Message
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleSave}
                    className={`w-full flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
                      saved 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg transform scale-105' 
                        : 'bg-white/80 border border-white/30 text-gray-700 hover:bg-white hover:shadow-lg'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                    {saved ? "Place Saved" : "Save the Place"}
                  </button>
                  
                  <button 
                    onClick={handleShareProperty}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    <Share2 className="w-5 h-5" />
                    Share Property
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl rounded-3xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-semibold text-gray-800">{post.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bedrooms</span>
                    <span className="font-semibold text-gray-800">{post.bedroom}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bathrooms</span>
                    <span className="font-semibold text-gray-800">{post.bathroom}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Size</span>
                    <span className="font-semibold text-gray-800">{post.postDetail?.size}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, color }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    orange: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-dark-700/50 rounded-2xl border border-white/30 dark:border-dark-600 transition-colors duration-300">
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="font-semibold text-gray-800 dark:text-gray-100">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{description}</div>
      </div>
    </div>
  );
}

// Size Card Component
function SizeCard({ icon: Icon, value, label, color }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    pink: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30'
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-dark-700/50 rounded-2xl border border-white/30 dark:border-dark-600 transition-colors duration-300">
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="font-semibold text-gray-800 dark:text-gray-100">{value}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
      </div>
    </div>
  );
}

// Nearby Card Component
function NearbyCard({ icon: Icon, title, distance, color }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    orange: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-dark-700/50 rounded-2xl border border-white/30 dark:border-dark-600 transition-colors duration-300">
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="font-semibold text-gray-800 dark:text-gray-100">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{distance} away</div>
      </div>
    </div>
  );
}

export default SinglePage;