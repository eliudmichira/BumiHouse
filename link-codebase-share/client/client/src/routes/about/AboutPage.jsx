import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Shield, Zap, Globe, ArrowRight, Check, Users, Award, 
  MapPin, Phone, Mail, MessageCircle, Star, Building2,
  Lock, Eye, Globe2, Clock, TrendingUp, Heart, Sparkles,
  Target, Lightbulb, ChevronDown, Play, ArrowLeft, Cpu,
  Database, Wifi, BarChart3, Headphones
} from 'lucide-react';
import Navbar from '../../components/navbar/Navbar';

// Custom hook for intersection observer
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

const AboutPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('overview');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [stats] = useState({
    properties: 15000,
    customers: 12000,
    agents: 500,
    counties: 47
  });

  // Intersection observers for animations
  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 });
  const [statsRef, statsInView] = useIntersectionObserver({ threshold: 0.3 });
  const [featuresRef, featuresInView] = useIntersectionObserver({ threshold: 0.2 });

  useEffect(() => {
    // Handle URL query parameters for section navigation
    const sectionFromUrl = searchParams.get('section');
    if (sectionFromUrl && ['overview', 'security', 'technology', 'reach'].includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
      setTimeout(() => {
        const element = document.getElementById(sectionFromUrl);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Handle URL hash for section navigation (fallback)
      const hash = window.location.hash.replace('#', '');
      if (hash && ['overview', 'security', 'technology', 'reach'].includes(hash)) {
        setActiveSection(hash);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [searchParams]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
    setSearchParams({ section });
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartSearching = () => {
    window.location.href = '/list';
  };

  const handleContactUs = () => {
    window.location.href = '/contact';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 dark:from-[#0a0c19] dark:via-[#0e1320] dark:to-[#0a0c19]">
      {/* Main Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[calc(100vh-80px)] pt-32 pb-16 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-[#dbd5a4]/15"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.emerald.500/20),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(219,213,164,0.25),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className={`text-center transition-all duration-1000 ${
            heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-white/20 dark:border-gray-700/20 mb-8">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-emerald-500 to-[#dbd5a4] bg-clip-text text-transparent">
                Kenya's #1 Real Estate Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
              <span className="text-slate-900 dark:text-white">Revolutionizing</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-[#dbd5a4] bg-clip-text text-transparent">
                Real Estate in Kenya
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12">
              Hama Estate is Kenya's leading AI-powered real estate platform, connecting thousands of families 
              with their dream homes across all 47 counties through cutting-edge technology and personalized service.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <button 
                onClick={handleStartSearching}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-[#dbd5a4] text-[#111] font-semibold rounded-2xl hover:shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <Building2 className="w-5 h-5" />
                Explore Properties
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="group flex items-center gap-3 px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-slate-700 dark:text-slate-300 font-semibold rounded-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </div>
                Watch Our Story
              </button>
            </div>

            {/* Inline Stats inside Hero */}
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { value: '15K+', label: 'Properties Listed', icon: Building2 },
                  { value: '12K+', label: 'Happy Customers', icon: Users },
                  { value: '500+', label: 'Expert Agents', icon: Award },
                  { value: '47', label: 'Counties Covered', icon: MapPin }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className={`text-center group transform transition-all duration-700 ${
                      heroInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 120}ms` }}
                  >
                    <div className="relative rounded-2xl p-6 bg-white/70 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/30 backdrop-blur-xl">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-[#dbd5a4]/10"></div>
                      <div className="relative flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-[#dbd5a4] mb-3">
                          <stat.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Navigation Tabs */}
      <nav className="sticky top-20 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-y border-white/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center space-x-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Company Overview', icon: Building2 },
              { id: 'security', label: 'Security & Trust', icon: Shield },
              { id: 'technology', label: 'AI Technology', icon: Zap },
              { id: 'reach', label: 'Kenya-wide Reach', icon: Globe }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSectionClick(tab.id)}
                className={`flex items-center gap-3 py-4 px-6 font-semibold transition-all duration-300 border-b-3 whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-emerald-50/40 dark:hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content Sections */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Overview Section */}
        <section id="overview" className={`${activeSection === 'overview' ? 'block' : 'hidden'}`}>
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 dark:text-white mb-8">
              Our Story & Mission
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 text-center max-w-4xl mx-auto leading-relaxed">
              Founded with the vision of making home ownership accessible to every Kenyan, 
              Hama Estate combines innovative technology with deep local expertise to transform 
              how people buy, sell, and rent properties across Kenya.
            </p>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/20">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  To make finding the perfect home in Kenya effortless, secure, and enjoyable through 
                  cutting-edge technology, transparent processes, and personalized service that puts our customers first.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/20">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Vision</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  To become the most trusted and innovative real estate platform in Kenya, empowering every 
                  family to achieve their homeownership dreams while building stronger, more connected communities.
                </p>
              </div>
            </div>
          </div>

          {/* Company Values */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">Our Core Values</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: 'Trust & Transparency', desc: 'Every transaction is conducted with complete transparency and integrity' },
                { icon: Zap, title: 'Innovation', desc: 'Continuously pushing boundaries with cutting-edge technology solutions' },
                { icon: Heart, title: 'Customer First', desc: 'Your success and satisfaction are at the heart of everything we do' }
              ].map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <value.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{value.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className={`${activeSection === 'security' ? 'block' : 'hidden'}`}>
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-[#dbd5a4] rounded-full flex items-center justify-center mx-auto mb-8">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Bank-Level Security & Trust
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Your security and peace of mind are our top priorities. We implement enterprise-grade 
              security measures to protect your data, transactions, and personal information.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-16">
            <div className="space-y-8">
              {[
                {
                  icon: Lock,
                  color: 'from-blue-500 to-cyan-500',
                  title: '256-bit SSL Encryption',
                  desc: 'All data transmitted through our platform is encrypted using military-grade 256-bit SSL encryption, ensuring your information remains completely secure.'
                },
                {
                  icon: Eye,
                  color: 'from-emerald-500 to-teal-500',
                  title: 'ID-Verified Agents',
                  desc: 'Every agent undergoes comprehensive identity verification, background checks, and continuous monitoring to ensure you work with trusted professionals.'
                },
                {
                  icon: Shield,
                  color: 'from-purple-500 to-pink-500',
                  title: 'Escrow Protection',
                  desc: 'All transactions are secured by professional escrow services, protecting your funds until successful deal completion with full legal compliance.'
                },
                {
                  icon: Award,
                  color: 'from-orange-500 to-red-500',
                  title: 'Legal Compliance',
                  desc: 'Full compliance with Kenyan real estate laws, Central Bank regulations, and international data protection standards.'
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-6 group">
                  <div className={`w-16 h-16 bg-gradient-to-r from-emerald-500 to-[#dbd5a4] rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-[#dbd5a4] rounded-3xl blur-xl opacity-20"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Advanced Security Features</h3>
                <div className="space-y-4">
                  {[
                    'Two-factor authentication (2FA) for all accounts',
                    'Real-time fraud detection and prevention',
                    'Encrypted document storage and sharing',
                    'Regular third-party security audits',
                    'GDPR and Kenya Data Protection Act compliant',
                    '24/7 security monitoring and incident response',
                    'Secure API integration with banks',
                    'Biometric verification for high-value transactions'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-gray-700 rounded-xl">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section id="technology" ref={featuresRef} className={`${activeSection === 'technology' ? 'block' : 'hidden'}`}>
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-[#dbd5a4] rounded-full flex items-center justify-center mx-auto mb-8">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              AI-Powered Technology Stack
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Powered by cutting-edge artificial intelligence and machine learning algorithms, 
              our platform delivers lightning-fast results and hyper-personalized recommendations.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Cpu,
                title: 'AI Matching Engine',
                desc: 'Advanced algorithms analyze your preferences to find perfect property matches',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Database,
                title: 'Big Data Analytics',
                desc: 'Process millions of data points for accurate market insights and pricing',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: BarChart3,
                title: 'Predictive Models',
                desc: 'Machine learning predicts market trends and property value changes',
                color: 'from-emerald-500 to-teal-500'
              }
            ].map((tech, index) => (
              <div 
                key={index}
                className={`group transform transition-all duration-700 ${
                  featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/20 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                  <div className={`w-16 h-16 bg-gradient-to-r from-emerald-500 to-[#dbd5a4] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <tech.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{tech.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-[#dbd5a4] rounded-3xl p-12 text-[#111]">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Smart Features Powered by AI</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    'Instant property matching',
                    'Price prediction accuracy',
                    'Market trend analysis',
                    'Virtual tour integration',
                    'Automated scheduling',
                    'Smart search filters',
                    'Neighborhood insights',
                    'Investment recommendations'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium opacity-90">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-white/30 backdrop-blur-sm rounded-full mb-6">
                  <Zap className="w-16 h-16 text-emerald-600" />
                </div>
                <p className="text-xl opacity-90 text-[#111]">
                  <span className="text-3xl font-bold block">98%</span>
                  Accuracy Rate in Property Matching
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Kenya-wide Reach Section */}
        <section id="reach" className={`${activeSection === 'reach' ? 'block' : 'hidden'}`}>
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-[#dbd5a4] rounded-full flex items-center justify-center mx-auto mb-8">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              From Coast to Coast
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              From the bustling streets of Nairobi to the pristine beaches of Mombasa, 
              from the highlands of Central Kenya to the vast savannas of Northern Kenya - 
              we connect you with properties in every corner of our beautiful country.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-16">
            <div className="space-y-8">
              {[
                {
                  icon: MapPin,
                  color: 'from-emerald-500 to-teal-500',
                  title: 'All 47 Counties',
                  desc: 'Complete coverage across Kenya with local expertise in every region, from urban centers to rural communities.'
                },
                {
                  icon: Globe2,
                  color: 'from-blue-500 to-cyan-500',
                  title: 'Multi-Language Support',
                  desc: 'Full platform support in English, Kiswahili, and major local languages for accessibility across communities.'
                },
                {
                  icon: Users,
                  color: 'from-purple-500 to-pink-500',
                  title: 'Local Market Experts',
                  desc: 'Network of regional specialists with deep knowledge of local markets, customs, and opportunities.'
                },
                {
                  icon: Headphones,
                  color: 'from-orange-500 to-red-500',
                  title: '24/7 Customer Support',
                  desc: 'Round-the-clock assistance in multiple languages, ensuring help is always available when you need it.'
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-6 group">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Top Property Regions</h3>
                <div className="space-y-4">
                  {[
                    { region: 'Nairobi County', desc: 'Capital & Business Hub', properties: '3,200+' },
                    { region: 'Mombasa County', desc: 'Coastal Paradise', properties: '1,800+' },
                    { region: 'Kiambu County', desc: 'Suburban Excellence', properties: '2,100+' },
                    { region: 'Nakuru County', desc: 'Rift Valley Center', properties: '1,400+' },
                    { region: 'Machakos County', desc: 'Eastern Highlands', properties: '900+' },
                    { region: 'Kajiado County', desc: 'Maasai Territory', properties: '700+' }
                  ].map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-xl group hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{area.region}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{area.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 dark:text-blue-400">{area.properties}</p>
                        <p className="text-xs text-slate-500">properties</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-[#faf7e6] dark:from-emerald-900/20 dark:to-[#4a4528]/30 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-700/30">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Regional Coverage Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">47</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Counties</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">290+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Sub-Counties</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#dbd5a4]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(81,250,170,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(219,213,164,0.18),transparent_50%)]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center text-white px-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full mb-8">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Trusted by thousands across Kenya</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Find your next<br />home in Kenya
          </h2>
          <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-3xl mx-auto">
            Join 5,000+ families across 47 counties — AI-powered matching, verified agents,
            and secure transactions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={handleStartSearching}
              className="group px-10 py-5 bg-white text-slate-900 font-bold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg"
            >
              <Building2 className="w-6 h-6" />
              Start Your Search
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleContactUs}
              className="px-10 py-5 bg-transparent border-2 border-white/50 backdrop-blur-sm text-white font-bold rounded-full hover:bg-white/10 hover:border-white transform hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg"
            >
              <MessageCircle className="w-6 h-6" />
              Talk to an Expert
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-80">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Bank‑level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Award‑winning Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">24/7 Expert Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">4.9/5 Customer Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsVideoPlaying(false)}>
          <div className="relative max-w-4xl w-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              ×
            </button>
            <div className="aspect-video bg-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Company Story Video</p>
                <p className="text-sm opacity-70">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;