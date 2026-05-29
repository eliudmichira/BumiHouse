import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Building2, User, Mail, Phone, MapPin, 
  DollarSign, Home, Check, ArrowRight, Star,
  Smartphone, Shield, BarChart3, Zap
} from 'lucide-react';

const TrialSignupModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    
    // Business Info
    businessType: '',
    propertyCount: '',
    location: '',
    currentMethod: '',
    
    // Trial Preferences
    interests: [],
    timeline: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Property count options
  const propertyCountOptions = [
    { value: '1-5', label: '1-5 Properties', description: 'Perfect for getting started' },
    { value: '6-20', label: '6-20 Properties', description: 'Growing portfolio' },
    { value: '21-50', label: '21-50 Properties', description: 'Established business' },
    { value: '51+', label: '51+ Properties', description: 'Enterprise level' }
  ];

  // Business type options
  const businessTypes = [
    { value: 'individual', label: 'Individual Landlord', icon: User },
    { value: 'company', label: 'Property Management Company', icon: Building2 },
    { value: 'agent', label: 'Real Estate Agent', icon: Home },
    { value: 'investor', label: 'Property Investor', icon: DollarSign }
  ];

  // Interest areas
  const interestAreas = [
    { id: 'mpesa', label: 'M-Pesa Integration', icon: Smartphone },
    { id: 'analytics', label: 'Cash Flow Analytics', icon: BarChart3 },
    { id: 'compliance', label: 'Legal Compliance', icon: Shield },
    { id: 'automation', label: 'Payment Automation', icon: Zap }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Import Firebase trial API
      const { trialAPI } = await import('../../lib/firebaseAPI');
      
      // Create trial account via Firebase
      const result = await trialAPI.create(formData);
      
      if (result.success) {
        console.log('🎉 Trial signup successful:', result);
        setSubmitSuccess(true);
        setStep(4); // Success step
      } else {
        throw new Error(result.message || 'Failed to create trial account');
      }
    } catch (error) {
      console.error('❌ Trial signup error:', error);
      
      // Show error to user (you could add error state)
      alert('Sorry, there was an error creating your trial account. Please try again or contact support@rentakenya.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.phone;
      case 2:
        return formData.businessType && formData.propertyCount && formData.location;
      case 3:
        return formData.timeline;
      default:
        return true;
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.3 }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-3xl shadow-2xl"
        >
          {/* Header */}
          <div className="relative px-8 py-6 bg-gradient-to-r from-[#51faaa] to-[#3fd693]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Start Your Free Trial</h2>
                <p className="text-white/80">Join 500+ landlords transforming their business</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex-1">
                  <div className={`h-2 rounded-full transition-all duration-300 ${
                    stepNum <= step 
                      ? 'bg-white' 
                      : 'bg-white/30'
                  }`} />
                </div>
              ))}
            </div>
            
            <div className="mt-2 text-white/80 text-sm">
              Step {step} of 3
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 max-h-96 overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Let's get to know you
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Tell us about yourself to personalize your experience
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-[#51faaa] transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-[#51faaa] transition-all duration-200"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-[#51faaa] transition-all duration-200"
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Business Information */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Tell us about your business
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Help us customize RentaKenya for your specific needs
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Business Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        What describes you best? *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {businessTypes.map((type) => {
                          const IconComponent = type.icon;
                          return (
                            <button
                              key={type.value}
                              onClick={() => handleInputChange('businessType', type.value)}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                formData.businessType === type.value
                                  ? 'border-[#51faaa] bg-[#51faaa]/10'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-[#51faaa]/50'
                              }`}
                            >
                              <IconComponent className={`w-6 h-6 mb-2 ${
                                formData.businessType === type.value ? 'text-[#51faaa]' : 'text-gray-600 dark:text-gray-400'
                              }`} />
                              <div className={`font-medium text-sm ${
                                formData.businessType === type.value ? 'text-[#51faaa]' : 'text-gray-900 dark:text-white'
                              }`}>
                                {type.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Property Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        How many properties do you manage? *
                      </label>
                      <div className="space-y-2">
                        {propertyCountOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleInputChange('propertyCount', option.value)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              formData.propertyCount === option.value
                                ? 'border-[#51faaa] bg-[#51faaa]/10'
                                : 'border-gray-300 dark:border-gray-600 hover:border-[#51faaa]/50'
                            }`}
                          >
                            <div className={`font-medium ${
                              formData.propertyCount === option.value ? 'text-[#51faaa]' : 'text-gray-900 dark:text-white'
                            }`}>
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {option.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary Location *
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#51faaa] focus:border-[#51faaa] transition-all duration-200"
                      >
                        <option value="">Select your primary location</option>
                        <option value="nairobi">Nairobi</option>
                        <option value="mombasa">Mombasa</option>
                        <option value="kisumu">Kisumu</option>
                        <option value="nakuru">Nakuru</option>
                        <option value="eldoret">Eldoret</option>
                        <option value="thika">Thika</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Trial Preferences */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Customize your trial
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Let us know what matters most to you
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Interests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        What interests you most? (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {interestAreas.map((interest) => {
                          const IconComponent = interest.icon;
                          const isSelected = formData.interests.includes(interest.id);
                          return (
                            <button
                              key={interest.id}
                              onClick={() => handleInterestToggle(interest.id)}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                isSelected
                                  ? 'border-[#51faaa] bg-[#51faaa]/10'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-[#51faaa]/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <IconComponent className={`w-5 h-5 ${
                                  isSelected ? 'text-[#51faaa]' : 'text-gray-600 dark:text-gray-400'
                                }`} />
                                <span className={`font-medium text-sm ${
                                  isSelected ? 'text-[#51faaa]' : 'text-gray-900 dark:text-white'
                                }`}>
                                  {interest.label}
                                </span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#51faaa] ml-auto" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        When would you like to start? *
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'immediately', label: 'Immediately', description: 'I want to start right now' },
                          { value: 'this-week', label: 'This week', description: 'Within the next 7 days' },
                          { value: 'this-month', label: 'This month', description: 'Within the next 30 days' },
                          { value: 'exploring', label: 'Just exploring', description: 'Researching options' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleInputChange('timeline', option.value)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              formData.timeline === option.value
                                ? 'border-[#51faaa] bg-[#51faaa]/10'
                                : 'border-gray-300 dark:border-gray-600 hover:border-[#51faaa]/50'
                            }`}
                          >
                            <div className={`font-medium ${
                              formData.timeline === option.value ? 'text-[#51faaa]' : 'text-gray-900 dark:text-white'
                            }`}>
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {option.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && submitSuccess && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#51faaa] to-[#3fd693] rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Welcome to RentaKenya! 🎉
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Your 30-day free trial has been activated. Check your email for setup instructions.
                    </p>
                  </div>

                  <div className="space-y-4 text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white">What happens next:</h4>
                    <div className="space-y-3">
                      {[
                        'You\'ll receive login credentials via email within 5 minutes',
                        'Our team will contact you to schedule a personalized onboarding call',
                        'You\'ll get access to all premium features for 30 days',
                        'After the trial, choose a plan that fits your needs'
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#51faaa]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[#51faaa] text-sm font-bold">{index + 1}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {step < 4 && (
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    step === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Back
                </button>

                <button
                  onClick={nextStep}
                  disabled={!isStepValid() || isSubmitting}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    isStepValid() && !isSubmitting
                      ? 'bg-gradient-to-r from-[#51faaa] to-[#3fd693] text-white hover:shadow-lg'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Trial...
                    </>
                  ) : step === 3 ? (
                    <>
                      Start Trial
                      <Star className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Footer */}
          {step === 4 && submitSuccess && (
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="w-full px-8 py-3 bg-gradient-to-r from-[#51faaa] to-[#3fd693] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TrialSignupModal;
