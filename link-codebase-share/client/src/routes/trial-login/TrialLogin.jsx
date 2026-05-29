import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Building2, ArrowRight } from 'lucide-react';
import { trialAPI } from '../../lib/firebaseAPI';

const TrialLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    trialId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting trial login...');
      
      // Known demo trial credentials
      const validTrials = {
        'trial_1757407257560_y9ghqa2d5': {
          password: 'ATY9xKdnc4av',
          userData: {
            fullName: 'eliud michira',
            email: 'eliudsamwels7@gmail.com',
            phone: '0705893137',
            business: 'individual',
            location: 'other',
            status: 'active',
            trialExpiryDate: new Date('2025-10-09'),
            createdAt: new Date()
          }
        },
        'trial_1757418828228_azapkmc0j': {
          password: 'GvCc6qbC93MB',
          userData: {
            fullName: 'eliudsamwel',
            email: 'eliudsamwels7@gmail.com',
            phone: '0705893137',
            business: 'individual',
            location: 'other',
            status: 'active',
            trialExpiryDate: new Date('2025-10-09'),
            createdAt: new Date()
          }
        },
        'trial_1757420372075_4glqwjkk5': {
          password: 'E4mxcTRZVhBN',
          userData: {
            fullName: 'BUMI',
            email: 'bumihouseke@gmail.com',
            phone: '0705893137',
            business: 'individual',
            location: 'other',
            status: 'active',
            trialExpiryDate: new Date('2025-10-09'),
            createdAt: new Date()
          }
        },
        'trial_1757421386518_t4bbuc9qx': {
          password: 'uKq6F9nhW46v',
          userData: {
            fullName: 'New Trial User',
            email: 'user@example.com',
            phone: '0705893137',
            business: 'individual',
            location: 'other',
            status: 'active',
            trialExpiryDate: new Date('2025-10-09'),
            createdAt: new Date()
          }
        }
      };

      // Try to get trial signup data from Firestore FIRST
      try {
        console.log('🔍 Looking up trial in Firestore:', formData.trialId);
        const trialData = await trialAPI.getStatus(formData.trialId);
        console.log('📊 Firestore trial data:', trialData);
        
        if (trialData && trialData.exists) {
          console.log('✅ Found trial in Firestore - prioritizing cloud data');
          
          if (trialData.tempPassword !== formData.password) {
            throw new Error('Invalid password');
          }

          if (trialData.status !== 'active') {
            throw new Error('Trial account is not active');
          }

          // Check if trial has expired
          const now = new Date();
          const expiryDate = trialData.trialExpiryDate?.toDate();
          if (expiryDate && now > expiryDate) {
            throw new Error('Trial has expired');
          }

          console.log('✅ Firestore trial login successful');
          
          // Store trial session data
          sessionStorage.setItem('trial_session', JSON.stringify({
            trialId: formData.trialId,
            userData: {
              fullName: trialData.fullName,
              email: trialData.email,
              phone: trialData.phone,
              business: trialData.businessType,
              location: trialData.location,
              status: trialData.status,
              trialExpiryDate: expiryDate,
              createdAt: trialData.createdAt?.toDate()
            },
            loginTime: new Date().toISOString(),
            isFirestoreTrial: true
          }));

          // Navigate to trial dashboard
          navigate('/trial-dashboard');
          return;
        } else {
          console.log('❌ Trial not found in Firestore, checking fallback...');
        }
      } catch (firestoreError) {
        console.error('❌ Firestore trial lookup failed:', firestoreError);
        console.log('🔄 Falling back to hardcoded trials...');
      }

      // Fallback: Check hardcoded demo trials for backward compatibility
      const demoTrial = validTrials[formData.trialId];
      if (demoTrial && demoTrial.password === formData.password) {
        console.log('✅ Fallback demo trial login successful');
        
        sessionStorage.setItem('trial_session', JSON.stringify({
          trialId: formData.trialId,
          userData: demoTrial.userData,
          loginTime: new Date().toISOString(),
          isFallbackTrial: true
        }));

        navigate('/trial-dashboard');
        return;
      }

      // If no trial found anywhere, throw error
      throw new Error('Trial ID not found or invalid credentials');

    } catch (error) {
      console.error('❌ Trial login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-[#51faaa]/25 hover:shadow-xl hover:shadow-[#51faaa]/40 transition-all duration-300 group"
          >
            <Building2 className="w-8 h-8 text-[#111] group-hover:scale-110 transition-transform duration-300" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            RentaKenya Trial
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Sign in to your trial account
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white dark:bg-gray-800 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/20 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-[#51faaa]/10 transition-all duration-500"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trial ID Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Trial ID
              </label>
              <input
                type="text"
                name="trialId"
                value={formData.trialId}
                onChange={handleInputChange}
                placeholder="trial_xxxxxxxxx_xxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-all duration-300 hover:border-[#51faaa]/50"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your trial password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-all duration-300 hover:border-[#51faaa]/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#51faaa]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing In...
                </div>
              ) : (
                <>
                  <span>Access Trial Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </motion.button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Check your email for trial credentials or{' '}
              <button
                onClick={() => navigate('/rentakenya')}
                className="text-[#51faaa] hover:underline font-medium"
              >
                start a new trial
              </button>
            </p>
          </div>
        </motion.div>

        {/* Back to Main Site */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to main site
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TrialLogin;
