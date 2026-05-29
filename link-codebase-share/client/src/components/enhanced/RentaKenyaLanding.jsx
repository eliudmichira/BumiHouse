import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Building2, 
  Smartphone, 
  TrendingUp, 
  Shield, 
  Users, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Star,
  DollarSign,
  Clock,
  FileText,
  BarChart3,
  MessageSquare,
  CreditCard,
  Globe,
  Target,
  Rocket,
  Award,
  ChevronRight,
  Play,
  Download,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
  Instagram
} from 'lucide-react';

const RentaKenyaLanding = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [stats, setStats] = useState({
    landlords: 0,
    properties: 0,
    revenue: 0,
    satisfaction: 0
  });

  // Animated stats counter
  useEffect(() => {
    const targets = { landlords: 1250, properties: 8500, revenue: 2.1, satisfaction: 97 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setStats({
        landlords: Math.floor(targets.landlords * easeOut),
        properties: Math.floor(targets.properties * easeOut),
        revenue: (targets.revenue * easeOut).toFixed(1),
        satisfaction: Math.floor(targets.satisfaction * easeOut)
      });

      if (step >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "M-Pesa Native Integration",
      description: "Auto-reconciliation with Safaricom API. Collect rent through M-Pesa, bank transfers, and cash - all in one dashboard.",
      benefits: ["91% → 97% collection rate", "70% reduction in collection time", "Instant SMS receipts"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Predictive Cash Flow",
      description: "AI-powered forecasting shows you exactly what income to expect. Never be surprised by late payments again.",
      benefits: ["30-day income forecast", "Payment pattern analysis", "Smart reminder timing"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Legal Compliance",
      description: "KRA-ready reports, court-admissible documentation, and automated compliance with changing housing laws.",
      benefits: ["One-click tax filing", "Eviction documentation", "Regulatory updates"]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Tenant Portal",
      description: "Self-service payments, maintenance requests, and professional communication reduce conflicts and turnover.",
      benefits: ["40% lower vacancy rates", "Digital maintenance workflow", "Professional messaging"]
    }
  ];

  const testimonials = [
    {
      name: "Grace Wanjiku",
      role: "Property Owner, 15 Units",
      location: "Nairobi",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "RentaKenya transformed my rental business. I went from spending 20 hours a month chasing payments to just 3 hours. My collection rate is now 98%.",
      rating: 5
    },
    {
      name: "James Mwangi",
      role: "Real Estate Investor",
      location: "Kiambu",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "The cash flow predictions are incredibly accurate. I can now plan my property investments with confidence. The KRA reports save me hours every month.",
      rating: 5
    },
    {
      name: "Mary Akinyi",
      role: "Property Manager",
      location: "Mombasa",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "My tenants love the self-service portal. Maintenance requests are handled faster, and communication is much more professional.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "999",
      period: "month",
      description: "Perfect for small landlords",
      features: [
        "Up to 5 properties",
        "M-Pesa integration",
        "Basic reporting",
        "SMS reminders",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "2,499",
      period: "month",
      description: "Most popular for growing portfolios",
      features: [
        "Up to 20 properties",
        "AI cash flow predictions",
        "Tenant portal",
        "WhatsApp integration",
        "KRA tax reports",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "4,999",
      period: "month",
      description: "For large property portfolios",
      features: [
        "Unlimited properties",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated account manager",
        "API access",
        "White-label options"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#51faaa]/5 to-[#dbd5a4]/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#51faaa]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#dbd5a4]/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#51faaa]/10 border border-[#51faaa]/20 text-[#51faaa] text-sm font-medium mb-8"
            >
              <Award className="w-4 h-4" />
              Africa's First AI-Powered Rental Management Platform
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              The Landlord's{' '}
              <span className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] bg-clip-text text-transparent">
                Digital Backbone
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto"
            >
              Turn Kenya's KSh 2.1 trillion rental market from chaos into a profit-optimized system. 
              Built specifically for Kenyan landlords, tenants, and M-Pesa.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(81, 250, 170, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-[#51faaa] to-[#3fd693] text-white font-semibold rounded-2xl shadow-lg shadow-[#51faaa]/25 flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-gray-900 dark:text-white font-semibold rounded-2xl flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {[
                { value: `${stats.landlords}+`, label: "Active Landlords" },
                { value: `${stats.properties}+`, label: "Properties Managed" },
                { value: `KSh ${stats.revenue}T`, label: "Market Size" },
                { value: `${stats.satisfaction}%`, label: "Satisfaction Rate" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              The KSh 2.1T Problem
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              85% of Kenyan landlords still operate like it's 1990. Here's what's costing you money daily:
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <DollarSign className="w-8 h-8 text-red-500" />,
                title: "Revenue Leakage",
                stat: "23%",
                description: "of rent goes uncollected due to poor tracking"
              },
              {
                icon: <Clock className="w-8 h-8 text-orange-500" />,
                title: "Time Drain",
                stat: "15+ hours",
                description: "spent monthly chasing payments manually"
              },
              {
                icon: <Shield className="w-8 h-8 text-yellow-500" />,
                title: "Legal Exposure",
                stat: "40%",
                description: "higher vacancy rates due to poor communication"
              },
              {
                icon: <FileText className="w-8 h-8 text-blue-500" />,
                title: "Compliance Nightmares",
                stat: "KRA",
                description: "audits with no digital records = penalties"
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
                title: "Cash Flow Chaos",
                stat: "Unpredictable",
                description: "income makes property investments risky"
              },
              {
                icon: <Users className="w-8 h-8 text-green-500" />,
                title: "Tenant Turnover",
                stat: "40%",
                description: "higher vacancy rates due to poor experience"
              }
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-4 mb-4">
                  {problem.icon}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {problem.title}
                    </h3>
                    <div className="text-2xl font-bold text-red-500">
                      {problem.stat}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              The Complete Solution
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to transform your rental business from chaos into a profit-optimized system
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Tabs */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 border-2 border-[#51faaa] shadow-lg'
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-[#51faaa]/50'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      activeFeature === index
                        ? 'bg-[#51faaa] text-white'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.benefits.map((benefit, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-[#51faaa]/10 text-[#51faaa] text-sm rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Preview */}
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#51faaa] rounded-xl text-white">
                    {features[activeFeature].icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {features[activeFeature].title}
                  </h3>
                </div>
                
                {/* Mock Dashboard */}
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-[#51faaa]/10 rounded-xl">
                      <div className="text-2xl font-bold text-[#51faaa] mb-1">97%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Collection Rate</div>
                    </div>
                    <div className="p-4 bg-[#dbd5a4]/10 rounded-xl">
                      <div className="text-2xl font-bold text-[#dbd5a4] mb-1">3hrs</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Monthly Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Trusted by Kenyan Landlords
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how RentaKenya is transforming rental businesses across Kenya
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="p-8 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your portfolio. All plans include our core features with no hidden fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-[#51faaa]/10 to-[#dbd5a4]/10 border-[#51faaa] shadow-xl'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-2 bg-[#51faaa] text-white text-sm font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      KSh {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-2">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#51faaa] flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#51faaa] to-[#3fd693] text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Rental Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join 1,250+ landlords who've already digitized their rental management. 
              Start your free trial today - no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-[#51faaa] font-semibold rounded-2xl shadow-lg flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-2xl flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Brochure
              </motion.button>
            </div>

            <div className="mt-8 text-white/80 text-sm">
              <p>✓ 14-day free trial • ✓ No setup fees • ✓ Cancel anytime</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-900" />
                </div>
                <span className="text-2xl font-bold">RentaKenya</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Africa's first AI-powered rental management platform designed specifically for Kenya's unique property landscape.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 RentaKenya. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RentaKenyaLanding;
