import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AgentVerificationRequest from '../../components/AgentVerificationRequest';
import { 
  Building2, 
  Shield, 
  CheckCircle, 
  Clock, 
  Star,
  ArrowLeft,
  Users,
  Award,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react';

const AgentVerificationPage = () => {
  const navigate = useNavigate();
  const { currentUser, isVerifiedAgent, verificationStatus } = useAuth();
  const { isDark } = useTheme();
  const [showForm, setShowForm] = useState(false);


  // If user is already verified, redirect to dashboard
  if (isVerifiedAgent) {
    navigate('/desktop/dashboard');
    return null;
  }

  const handleVerificationSuccess = () => {
    // Redirect to dashboard after successful submission
    navigate('/desktop/dashboard');
  };


  const benefits = [
    {
      icon: Building2,
      title: 'Property Management',
      description: 'Add, edit, and manage your property listings with full control'
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Handle client inquiries and manage your professional relationships'
    },
    {
      icon: Award,
      title: 'Professional Profile',
      description: 'Build your professional reputation with verified agent status'
    },
    {
      icon: Star,
      title: 'Priority Support',
      description: 'Get priority customer support and faster response times'
    }
  ];

  const requirements = [
    'Valid real estate license (EPRA / Estate Agents Board)',
    'Professional experience in Kenyan real estate market',
    'Valid Kenyan phone number and email address',
    'Professional bio and specialization details',
    'County of operation information'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#111]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Become a Verified Agent
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Join our professional network of real estate agents in Kenya
                  </p>
                </div>
              </div>
            </div>
            
            {/* Profile Button */}
            <button
              onClick={() => navigate('/desktop/dashboard')}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#51faaa] to-[#4fd69c] p-0.5">
                <img 
                  src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=51faaa&color=0a0c19`}
                  alt={currentUser?.name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  View Dashboard
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-[#111]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Professional Verification Required
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  To access the agent dashboard and manage property listings, you must first be verified as a registered real estate agent in Kenya.
                </p>
                
                {verificationStatus === 'pending' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                        Your verification request is being reviewed
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-8 py-4 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Start Verification Process
                  </button>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Benefits of Becoming a Verified Agent
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#51faaa]/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-[#51faaa]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Requirements for Verification
              </h3>
              <div className="space-y-3">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#51faaa]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-[#51faaa]" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {requirement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Process Steps */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Verification Process
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#51faaa] text-[#111] flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Submit Application</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fill out the verification form with your professional details
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Admin Review</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our team reviews your credentials and experience
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Approval</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get access to agent dashboard and features
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    support@hamaestate.com
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    +254 700 123 456
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Nairobi, Kenya
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Platform Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verified Agents</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">150+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Properties Listed</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">2,500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Successful Sales</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">800+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Form Modal */}
      {showForm && (
        <AgentVerificationRequest
          onClose={() => setShowForm(false)}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  );
};

export default AgentVerificationPage;
