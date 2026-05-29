import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Award, 
  MapPin, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  Shield,
  Star
} from 'lucide-react';

const AgentVerificationRequest = ({ onClose, onSuccess }) => {
  const { currentUser, requestAgentVerification } = useAuth();
  const { isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phoneNumber: '',
    company: '',
    licenseNumber: '',
    yearsOfExperience: '',
    specialization: '',
    countyOfOperation: '',
    bio: ''
  });

  // Kenyan counties for dropdown
  const kenyanCounties = [
    'Nairobi', 'Kiambu', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
    'Machakos', 'Kakamega', 'Bungoma', 'Uasin Gishu', 'Nyeri', 'Meru',
    'Embu', 'Kirinyaga', 'Murang\'a', 'Nandi', 'Trans Nzoia', 'West Pokot',
    'Samburu', 'Turkana', 'Marsabit', 'Isiolo', 'Garissa', 'Wajir',
    'Mandera', 'Tana River', 'Lamu', 'Taita Taveta', 'Kwale', 'Kilifi',
    'Tana River', 'Kitui', 'Makueni', 'Kajiado', 'Narok', 'Bomet',
    'Kericho', 'Nandi', 'Vihiga', 'Busia', 'Siaya', 'Homa Bay',
    'Migori', 'Kisii', 'Nyamira', 'Nyandarua', 'Laikipia', 'Nakuru',
    'Baringo', 'Elgeyo Marakwet', 'Kericho', 'Bomet', 'Narok', 'Kajiado'
  ];

  // Specialization options
  const specializations = [
    'Apartments & Condominiums',
    'Commercial Properties',
    'Land Sales & Development',
    'Holiday Rentals',
    'Affordable Housing',
    'Mixed-use Developments',
    'Luxury Properties',
    'Student Housing',
    'Industrial Properties',
    'Agricultural Land',
    'Beachfront Properties',
    'Mountain View Properties'
  ];

  // Experience options
  const experienceOptions = [
    { value: '0-1', label: '0-1 years (New Agent)' },
    { value: '2-5', label: '2-5 years (Experienced)' },
    { value: '6-10', label: '6-10 years (Senior Agent)' },
    { value: '10+', label: '10+ years (Veteran Agent)' }
  ];

  // Validation functions
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+254[17]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const validateLicenseNumber = (license) => {
    // Basic validation - can be enhanced based on actual license formats
    return license.length >= 5 && /^[A-Z0-9-]+$/.test(license);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Kenyan phone number (e.g., +254712345678)';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    } else if (!validateLicenseNumber(formData.licenseNumber)) {
      newErrors.licenseNumber = 'Please enter a valid license number';
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Years of experience is required';
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.countyOfOperation) {
      newErrors.countyOfOperation = 'County of operation is required';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Professional bio is required';
    } else if (formData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await requestAgentVerification({
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      });

      if (result.success) {
        setSubmitStatus('success');
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose && onClose();
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting verification request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneInput = (value) => {
    // Auto-format phone number
    let formatted = value.replace(/\D/g, '');
    
    if (formatted.startsWith('254')) {
      formatted = '+' + formatted;
    } else if (formatted.startsWith('0')) {
      formatted = '+254' + formatted.substring(1);
    } else if (formatted.length > 0 && !formatted.startsWith('+')) {
      formatted = '+254' + formatted;
    }
    
    handleInputChange('phoneNumber', formatted);
  };

  if (submitStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Request Submitted Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your agent verification request has been submitted. We'll review your application and contact you within 2-3 business days.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>What happens next?</strong><br />
              • Admin review of your credentials<br />
              • Verification of license and experience<br />
              • Email notification of approval status
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`max-w-2xl w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#111]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Agent Verification Request
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🇰🇪 Kenya Edition
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Notice */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Professional Verification Required
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                To access the agent dashboard and manage property listings, you must first be verified as a registered real estate agent in Kenya. 
                Please provide your professional details below.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    errors.fullName 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-[#51faaa]'
                  } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-[#51faaa]'
                  } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number (Safaricom / Airtel / Telkom) *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handlePhoneInput(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  errors.phoneNumber 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-[#51faaa]'
                } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                placeholder="+254712345678"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Format: +254 followed by 9 digits (e.g., +254712345678)
              </p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5" />
              Professional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company/Agency
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors border-gray-300 dark:border-gray-600 focus:border-[#51faaa] ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                  }`}
                  placeholder="Your company or agency name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Number (EPRA / Estate Agents Board) *
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    errors.licenseNumber 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-[#51faaa]'
                  } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                  placeholder="e.g., EA-2024-001234"
                />
                {errors.licenseNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Years of Experience *
                </label>
                <select
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    errors.yearsOfExperience 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-[#51faaa]'
                  } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                >
                  <option value="">Select experience level</option>
                  {experienceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.yearsOfExperience && (
                  <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specialization *
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    errors.specialization 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-[#51faaa]'
                  } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                >
                  <option value="">Select specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                {errors.specialization && (
                  <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                County of Operation *
              </label>
              <select
                value={formData.countyOfOperation}
                onChange={(e) => handleInputChange('countyOfOperation', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  errors.countyOfOperation 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-[#51faaa]'
                } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
              >
                <option value="">Select county</option>
                {kenyanCounties.map(county => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
              {errors.countyOfOperation && (
                <p className="text-red-500 text-sm mt-1">{errors.countyOfOperation}</p>
              )}
            </div>
          </div>

          {/* Professional Bio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Professional Bio
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tell us about your experience in Kenyan real estate *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  errors.bio 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-[#51faaa]'
                } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                placeholder="Describe your experience, achievements, and why you want to join our platform. Include any notable properties you've handled, client testimonials, or industry recognition..."
              />
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum 50 characters. Share your expertise and achievements.
              </p>
            </div>
          </div>

          {/* Submit Status */}
          {submitStatus === 'error' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">
                There was an error submitting your request. Please try again.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Verification Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentVerificationRequest;
