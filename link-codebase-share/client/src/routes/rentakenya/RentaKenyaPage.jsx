import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Zap, Shield, TrendingUp, Users, Smartphone, 
  ArrowRight, Check, Star, Globe, Target, Lightbulb, 
  BarChart3, Clock, DollarSign, FileText, MessageSquare,
  Home, CreditCard, Calculator, PieChart, Phone,
  MapPin, Calendar, Award, Lock, Eye, Database, Cpu,
  ChevronDown, Play, ArrowLeft, Headphones, Mail,
  LogIn, UserPlus, Crown, Briefcase
} from 'lucide-react';
import Navbar from '../../components/navbar/Navbar';

const RentaKenyaPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Platform stats
  const platformStats = [
    { label: "Active Properties", value: "2,500+", icon: Building2, color: "blue" },
    { label: "Monthly Collections", value: "KSh 850M", icon: DollarSign, color: "green" },
    { label: "Happy Landlords", value: "1,200+", icon: Users, color: "purple" },
    { label: "Uptime Guarantee", value: "99.9%", icon: Shield, color: "emerald" }
  ];

  // Access options for property owners
  const accessOptions = [
    {
      title: "Property Owner Portal",
      description: "Full rental management platform for serious landlords",
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      features: ["Multi-property management", "Tenant screening", "Financial analytics", "Legal compliance"],
      action: () => navigate('/trial-login'),
      buttonText: "Access Dashboard",
      popular: true
    },
    {
      title: "Individual Landlord",
      description: "Perfect for managing 1-5 rental properties",
      icon: Home,
      color: "from-blue-500 to-cyan-500", 
      features: ["Property tracking", "Rent collection", "Maintenance logs", "Basic reports"],
      action: () => navigate('/trial-login'),
      buttonText: "Start Free Trial"
    },
    {
      title: "Property Agent",
      description: "Manage multiple client properties professionally",
      icon: Briefcase,
      color: "from-green-500 to-emerald-500",
      features: ["Client portfolios", "Commission tracking", "Performance analytics", "White-label options"],
      action: () => navigate('/agent-verification'),
      buttonText: "Become Agent"
    }
  ];

  // Core platform features
  const platformFeatures = [
    {
      icon: Smartphone,
      title: "M-Pesa Native Integration",
      description: "Auto-reconciliation with Safaricom API. Multi-channel collection from bank, cash, mobile money - all in one view.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: BarChart3,
      title: "Predictive Cash Flow",
      description: "AI-powered dashboard showing monthly income forecasts, payment patterns, and recommended actions.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Shield,
      title: "Legal Compliance",
      description: "KRA-ready reports, Kenya-specific tenancy agreements, and court-admissible documentation.",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: Users,
      title: "Tenant Portal",
      description: "Self-service payments, maintenance requests, and professional communication hub.",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Cpu,
      title: "AI Insights",
      description: "Vacancy optimization, tenant scoring, maintenance forecasting, and investment analytics.",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Globe,
      title: "Market Intelligence",
      description: "Real-time market data, rent pricing suggestions, and expansion recommendations.",
      color: "from-teal-500 to-cyan-600"
    }
  ];

  // Business model
  const revenueStreams = [
    {
      title: "SaaS Subscriptions",
      description: "KSh 999-4,999/month based on units",
      icon: CreditCard,
      color: "bg-gradient-to-br from-[#51faaa] to-[#3fd693]"
    },
    {
      title: "Transaction Fees",
      description: "0.5% on M-Pesa collections",
      icon: DollarSign,
      color: "bg-gradient-to-br from-[#dbd5a4] to-[#a59c47]"
    },
    {
      title: "Premium Services",
      description: "Legal docs, photography, market analysis",
      icon: Star,
      color: "bg-gradient-to-br from-purple-500 to-violet-600"
    },
    {
      title: "Marketplace Commissions",
      description: "5% from verified service providers",
      icon: Building2,
      color: "bg-gradient-to-br from-blue-500 to-cyan-600"
    }
  ];

  // Technical stack
  const techStack = [
    { name: "React.js + TypeScript", category: "Frontend" },
    { name: "Node.js + Express", category: "Backend" },
    { name: "PostgreSQL + Redis", category: "Database" },
    { name: "M-Pesa Daraja API", category: "Payments" },
    { name: "Africa's Talking", category: "SMS" },
    { name: "WhatsApp Business API", category: "Communication" },
    { name: "AWS/Google Cloud", category: "Infrastructure" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#51faaa]/5 via-transparent to-[#dbd5a4]/5" />
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#51faaa]/20 to-[#dbd5a4]/20 border border-[#51faaa]/30 mb-8">
              <Building2 className="w-4 h-4 text-[#51faaa]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Africa's First AI-Powered Rental Management Platform
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#51faaa] via-[#3fd693] to-[#dbd5a4] bg-clip-text text-transparent">
                RentaKenya
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              The Landlord's Digital Backbone
              <br />
              <span className="text-lg text-gray-500 dark:text-gray-400">
                Designed specifically for Kenya's unique property landscape
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setIsTrialModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-[#51faaa] to-[#3fd693] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-gray-800 dark:text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              The Critical Problem We're Solving
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Kenya's rental market is <span className="font-bold text-[#51faaa]">KSh 2.1 trillion annually</span>, 
              but 85% of landlords still operate like it's 1990
            </p>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {marketStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#51faaa] to-[#3fd693] flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pain Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Revenue Leakage: 23% of rent goes uncollected due to poor tracking",
              "Time Drain: Landlords spend 15+ hours/month chasing payments manually",
              "Legal Exposure: No proper documentation = disputes, evictions fail in court",
              "Cash Flow Chaos: Can't predict income, struggle with property investments",
              "Tenant Turnover: Poor communication = 40% higher vacancy rates",
              "Compliance Nightmares: KRA audits with no digital records = penalties"
            ].map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-br from-[#51faaa]/5 via-transparent to-[#dbd5a4]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              RentaKenya: The Complete Solution
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A hyper-local, AI-driven platform that turns rental management from chaos into a profit-optimized system
            </p>
          </div>

          {/* Core Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Bulletproof Business Model
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Multiple revenue streams with strong unit economics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {revenueStreams.map((stream, index) => {
              const IconComponent = stream.icon;
              return (
                <div
                  key={stream.title}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${stream.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {stream.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {stream.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Unit Economics */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-[#51faaa]/10 to-[#dbd5a4]/10 border border-[#51faaa]/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Unit Economics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Customer Acquisition Cost", value: "KSh 5,000" },
                { label: "Lifetime Value", value: "KSh 45,000" },
                { label: "Gross Margin", value: "85%" },
                { label: "Break-even", value: "Month 8" }
              ].map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-[#51faaa] mb-2">
                    {metric.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stack Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Production-Ready Technical Stack
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for scale, security, and performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, index) => (
              <div
                key={tech.name}
                className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {tech.name}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium bg-[#51faaa]/20 text-[#51faaa] rounded-full">
                    {tech.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#51faaa] to-[#3fd693]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Rental Business?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join the digital revolution in Kenya's rental market
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setIsTrialModalOpen(true)}
              className="px-8 py-4 bg-white text-[#51faaa] font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-xl border border-white/30 text-white font-semibold rounded-2xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Trial Signup Modal */}
      <TrialSignupModal 
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
      />
    </div>
  );
};

export default RentaKenyaPage;