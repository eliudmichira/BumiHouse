import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, MapPin, Send, ArrowLeft, Clock, Shield, Award, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

function ContactPage() {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactData, setContactData] = useState({
    propertyTitle: "Modern 3-Bedroom Apartment in Westlands",
    agentName: "Grace Wanjiku",
    agentEmail: "grace.wanjiku@kenyarealestate.co.ke"
  });
  
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    message: '',
    preferredContact: 'whatsapp',
    scheduleTour: false,
    tourDate: '',
    tourTime: ''
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Update form data when currentUser changes
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    // Simulate loading contact data (since localStorage isn't supported)
    // In a real app, this would come from props or URL parameters
    const mockContactData = {
      propertyTitle: "Modern 3-Bedroom Apartment in Westlands",
      agentName: "Grace Wanjiku",
      agentEmail: "grace.wanjiku@kenyarealestate.co.ke"
    };
    setContactData(mockContactData);
  }, []);

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all required fields.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success notification
      setNotification({
        type: 'success',
        title: 'Message Sent Successfully!',
        message: 'We\'ve received your inquiry and will get back to you within 24 hours.',
      });

      // Clear form
      setFormData({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: '',
        message: '',
        preferredContact: 'whatsapp',
        scheduleTour: false,
        tourDate: '',
        tourTime: ''
      });

    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Message Failed',
        message: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback if no history
      window.location.href = '/properties';
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className={`min-h-screen pt-32 pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-32 right-6 z-50 p-6 rounded-2xl shadow-2xl transform transition-all duration-500 max-w-md ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111]' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-[#111] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-outfit font-bold text-lg mb-1">{notification.title}</h4>
                <p className="text-sm opacity-90 font-outfit">{notification.message}</p>
              </div>
            </div>
            <button 
              onClick={closeNotification}
              className={`ml-4 transition-colors text-xl font-bold ${
                notification.type === 'success' ? 'text-[#111]/80 hover:text-[#111]' : 'text-white/80 hover:text-white'
              }`}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={handleBackNavigation}
            className={`flex items-center gap-3 mb-6 transition-colors group font-outfit ${
              isDark ? 'text-[#ccc] hover:text-[#51faaa]' : 'text-gray-600 hover:text-[#51faaa]'
            }`}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Property</span>
          </button>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className={`text-4xl font-outfit font-bold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              Contact Our Expert
            </h1>
            <p className={`font-outfit text-lg ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
              Ready to make your dream home a reality? Get in touch with our professional real estate team.
            </p>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="xl:col-span-2">
            <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-8 border transition-colors duration-300`}>
              <div className="mb-8">
                <h2 className={`text-2xl font-outfit font-bold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Send Us a Message</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-full"></div>
              </div>
              
              {contactData?.propertyTitle && (
                <div className={`${isDark ? 'bg-[rgba(81,250,170,0.1)] border-[rgba(81,250,170,0.2)]' : 'bg-blue-50 border-blue-200'} border-l-4 border-[#51faaa] rounded-xl p-6 mb-8 transition-colors duration-300`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#51faaa] rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#111]" />
                    </div>
                    <h3 className={`font-outfit font-bold text-lg ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Property Inquiry</h3>
                  </div>
                  <p className={`font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>{contactData.propertyTitle}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                        isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                        isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                        isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>Preferred Contact Method</label>
                    <select
                      value={formData.preferredContact}
                      onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                        isDark 
                          ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff]' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone Call</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>Your Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit resize-none ${
                      isDark 
                        ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Tell us about your interest in this property, your timeline, budget range, or any questions you have..."
                    required
                  />
                </div>

                <div className={`${isDark ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.2)]' : 'bg-gray-50 border-gray-200'} rounded-xl p-6 border transition-colors duration-300`}>
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="checkbox"
                      id="scheduleTour"
                      checked={formData.scheduleTour}
                      onChange={(e) => setFormData({ ...formData, scheduleTour: e.target.checked })}
                      className={`w-5 h-5 rounded focus:ring-2 focus:ring-[#51faaa] ${
                        isDark 
                          ? 'text-[#51faaa] bg-[#0a0c19] border-[rgba(81,250,170,0.3)] focus:ring-offset-[#0a0c19]' 
                          : 'text-[#51faaa] bg-white border-gray-300 focus:ring-offset-white'
                      }`}
                    />
                    <label htmlFor="scheduleTour" className={`text-lg font-outfit font-semibold flex items-center gap-2 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                      <Clock className="w-5 h-5 text-[#51faaa]" />
                      Schedule a Property Tour
                    </label>
                  </div>

                  {formData.scheduleTour && (
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="space-y-2">
                        <label className={`block text-sm font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>Preferred Date</label>
                        <input
                          type="date"
                          value={formData.tourDate}
                          onChange={(e) => setFormData({ ...formData, tourDate: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                            isDark 
                              ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff]' 
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-sm font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>Preferred Time</label>
                        <select
                          value={formData.tourTime}
                          onChange={(e) => setFormData({ ...formData, tourTime: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                            isDark 
                              ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff]' 
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                        >
                          <option value="">Select your preferred time</option>
                          <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                          <option value="afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                          <option value="evening">Evening (5:00 PM - 8:00 PM)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-[#111] border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Agent Info Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border transition-colors duration-300`}>
              <h2 className={`text-xl font-outfit font-bold mb-6 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Your Agent</h2>
              
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center shadow-lg mb-4">
                    <span className="text-[#111] font-outfit font-bold text-2xl">
                      {contactData?.agentName?.[0] || 'G'}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#51faaa] rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#111] rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className={`text-lg font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                  {contactData?.agentName || 'Grace Wanjiku'}
                </h3>
                <p className={`font-outfit font-medium ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Senior Real Estate Professional</p>
                <p className="text-sm text-[#51faaa] font-outfit font-semibold mt-1">● Available Now</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className={`flex items-center gap-4 p-3 rounded-xl transition-colors duration-300 ${
                  isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-[rgba(81,250,170,0.2)]' : 'bg-blue-100'
                  }`}>
                    <Mail className="w-5 h-5 text-[#51faaa]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-outfit font-medium truncate ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                      {contactData?.agentEmail || 'grace.wanjiku@kenyarealestate.co.ke'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-4 p-3 rounded-xl transition-colors duration-300 ${
                  isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-[rgba(81,250,170,0.2)]' : 'bg-green-100'
                  }`}>
                    <Phone className="w-5 h-5 text-[#51faaa]" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>+254 712 345 678</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-4 p-3 rounded-xl transition-colors duration-300 ${
                  isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-[rgba(81,250,170,0.2)]' : 'bg-purple-100'
                  }`}>
                    <MessageCircle className="w-5 h-5 text-[#51faaa]" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>WhatsApp: +254 712 345 678</p>
                  </div>
                </div>

                <div className={`flex items-center gap-4 p-3 rounded-xl transition-colors duration-300 ${
                  isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-[rgba(81,250,170,0.2)]' : 'bg-red-100'
                  }`}>
                    <MapPin className="w-5 h-5 text-[#51faaa]" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-outfit font-medium ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Nairobi, Kenya</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-blue-50'} rounded-xl p-4 text-center transition-colors duration-300`}>
                  <div className={`text-xl font-outfit font-bold ${isDark ? 'text-[#51faaa]' : 'text-blue-700'}`}>200+</div>
                  <div className={`text-sm font-outfit ${isDark ? 'text-[#ccc]' : 'text-blue-600'}`}>Properties Sold</div>
                </div>
                <div className={`${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-emerald-50'} rounded-xl p-4 text-center transition-colors duration-300`}>
                  <div className={`text-xl font-outfit font-bold ${isDark ? 'text-[#51faaa]' : 'text-emerald-700'}`}>4.8★</div>
                  <div className={`text-sm font-outfit ${isDark ? 'text-[#ccc]' : 'text-emerald-600'}`}>Client Rating</div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 border-blue-200'} rounded-2xl p-6 border transition-colors duration-300`}>
              <h3 className={`text-xl font-outfit font-bold mb-6 text-center ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Why Choose Our Team?</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-[#111]" />
                  </div>
                  <div>
                    <h4 className={`font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Market Expertise</h4>
                    <p className={`text-sm leading-relaxed font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Deep local market knowledge with 10+ years of experience</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#111]" />
                  </div>
                  <div>
                    <h4 className={`font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Personalized Service</h4>
                    <p className={`text-sm leading-relaxed font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Tailored approach to match your unique needs and timeline</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-[#111]" />
                  </div>
                  <div>
                    <h4 className={`font-outfit font-bold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>Trusted Partner</h4>
                    <p className={`text-sm leading-relaxed font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>Proven track record with 600+ satisfied clients</p>
                  </div>
                </div>
              </div>

              <div className={`mt-8 p-4 rounded-xl border transition-colors duration-300 ${
                isDark 
                  ? 'bg-[#0a0c19] border-[rgba(81,250,170,0.2)]' 
                  : 'bg-white/60 border-white/40'
              }`}>
                <p className={`text-center text-sm font-outfit font-medium ${
                  isDark ? 'text-[#ccc]' : 'text-gray-700'
                }`}>
                  <Clock className="w-4 h-4 inline-block mr-2 text-[#51faaa]" />
                  We typically respond within <strong>2 hours</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;