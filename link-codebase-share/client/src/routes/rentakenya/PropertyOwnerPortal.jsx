import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Zap, Shield, TrendingUp, Users, Smartphone, 
  ArrowRight, Check, Star, Crown, Target, 
  BarChart3, Clock, DollarSign, FileText, 
  Home, CreditCard, Lock, Eye, 
  LogIn, UserPlus, Briefcase, PlayCircle,
  MapPin, Calendar, Award, CheckCircle
} from 'lucide-react';
import Navbar from '../../components/navbar/Navbar';
import TrialSignupModal from '../../components/modals/TrialSignupModal';

const PropertyOwnerPortal = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('owner');
  const [showTrialModal, setShowTrialModal] = useState(false);

  // Platform statistics
  const platformStats = [
    { label: "Active Properties", value: "2,500+", icon: Building2, color: "[#51faaa]" },
    { label: "Monthly Collections", value: "KSh 850M", icon: DollarSign, color: "[#dbd5a4]" },
    { label: "Happy Landlords", value: "1,200+", icon: Users, color: "[#51faaa]" },
    { label: "Uptime Guarantee", value: "99.9%", icon: Shield, color: "[#dbd5a4]" }
  ];

  // Access plans for different user types
  const accessPlans = [
    {
      id: "owner",
      title: "Property Owner",
      subtitle: "Individual Landlords",
      description: "Perfect for managing your rental properties professionally",
      icon: Crown,
      gradient: "from-purple-600 via-pink-600 to-red-500",
      price: "Free Trial",
      period: "30 days",
      features: [
        "Up to 10 properties",
        "Tenant management",
        "M-Pesa rent collection", 
        "Financial analytics",
        "Maintenance tracking",
        "Legal compliance tools"
      ],
      action: () => setShowTrialModal(true),
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      id: "agent",
      title: "Property Agent",
      subtitle: "Real Estate Professionals", 
      description: "Manage multiple client properties with advanced tools",
      icon: Briefcase,
      gradient: "from-blue-600 via-cyan-600 to-teal-500",
      price: "Commission Based",
      period: "2.5% per transaction",
      features: [
        "Unlimited properties",
        "Client portfolio management",
        "Commission tracking",
        "Performance analytics",
        "White-label branding",
        "Priority support"
      ],
      action: () => navigate('/agent-verification'),
      buttonText: "Become Agent",
      popular: false
    },
    {
      id: "enterprise",
      title: "Enterprise",
      subtitle: "Property Management Companies",
      description: "Large-scale property management with custom solutions",
      icon: Building2,
      gradient: "from-emerald-600 via-green-600 to-lime-500",
      price: "Custom Pricing",
      period: "Contact sales",
      features: [
        "Unlimited everything",
        "Multi-company management",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantees",
        "On-premise deployment"
      ],
      action: () => window.location.href = 'mailto:enterprise@rentakenya.com',
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  // Key platform features
  const keyFeatures = [
    {
      icon: Smartphone,
      title: "M-Pesa Integration",
      description: "One-click rent payments for tenants via STK Push",
      color: "from-[#51faaa] to-[#51faaa]"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "AI-powered insights for better property decisions",
      color: "from-[#dbd5a4] to-[#dbd5a4]"
    },
    {
      icon: Shield,
      title: "Legal Compliance",
      description: "KRA-ready reports and Kenya-specific agreements",
      color: "from-[#51faaa] to-[#dbd5a4]"
    },
    {
      icon: Users,
      title: "Tenant Portal",
      description: "Self-service platform for rent payments and requests",
      color: "from-[#dbd5a4] to-[#51faaa]"
    }
  ];

  // Success stories
  const testimonials = [
    {
      name: "Mary Wanjiku",
      title: "Property Owner, Nairobi",
      properties: "8 units",
      quote: "CRIBBY transformed how I manage my rentals. Collection rate increased from 78% to 96%!",
      revenue: "+23% monthly revenue",
      avatar: "MW"
    },
    {
      name: "John Kariuki", 
      title: "Real Estate Agent",
      properties: "45 units",
      quote: "Managing client properties is now effortless. My clients love the transparency.",
      revenue: "+40% client retention",
      avatar: "JK"
    },
    {
      name: "Grace Mutua",
      title: "Property Manager",
      properties: "120 units", 
      quote: "The automated reminders and M-Pesa integration saved us 20 hours per week.",
      revenue: "+15% efficiency",
      avatar: "GM"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#51faaa]/10 via-[#51faaa]/5 to-[#dbd5a4]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#dbd5a4]/10 to-[#51faaa]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-[#51faaa]/5 to-[#dbd5a4]/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 text-[#51faaa] dark:text-[#51faaa] border border-[#51faaa]/20 dark:border-[#51faaa]/30">
                <Crown className="w-4 h-4 mr-2" />
                Property Owner Portal
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Manage Your
              <span className="block bg-gradient-to-r from-[#51faaa] via-[#51faaa] to-[#dbd5a4] bg-clip-text text-transparent">
                Properties Like a Pro
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8"
            >
              The only platform you need to manage rentals, collect payments, and grow your property business in Kenya
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={() => setShowTrialModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-bold rounded-2xl shadow-2xl hover:shadow-[#51faaa]/25 transition-all duration-300 flex items-center gap-3 group"
              >
                <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate('/trial-login')}
                className="px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Already Have Account?
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Are you a tenant? 
                <button
                  onClick={() => navigate('/tenant-login')}
                  className="ml-2 text-[#51faaa] hover:text-[#51faaa]/80 font-medium underline"
                >
                  Access Tenant Portal →
                </button>
              </p>
            </motion.div>
          </div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {platformStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Access Plans Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Choose Your Access Level
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300"
            >
              Whether you own 1 property or manage 1000, we have the perfect solution
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {accessPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative p-8 rounded-3xl bg-white dark:bg-gray-800 border-2 transition-all duration-300 hover:shadow-2xl group ${
                  plan.popular ? 'border-purple-500 shadow-purple-500/10' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{plan.subtitle}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{plan.period}</div>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#51faaa] mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.action}
                  className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/25'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Why Property Owners Choose CRIBBY
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300"
            >
              Built specifically for the Kenyan market with local payment methods and compliance
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Success Stories
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300"
            >
              Join thousands of property owners who transformed their business with CRIBBY
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.title}</p>
                    <p className="text-xs text-gray-500">{testimonial.properties}</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {testimonial.revenue}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Transform Your Property Business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-white/90 mb-8"
          >
            Join over 1,200 property owners who chose CRIBBY to modernize their rental management
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button 
              onClick={() => setShowTrialModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-[#51faaa] transition-all duration-300 flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Trial Signup Modal */}
      {showTrialModal && (
        <TrialSignupModal 
          isOpen={showTrialModal}
          onClose={() => setShowTrialModal(false)}
        />
      )}
    </div>
  );
};

export default PropertyOwnerPortal;
