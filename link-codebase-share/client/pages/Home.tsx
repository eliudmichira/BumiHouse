import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Search,
  MapPin,
  Home,
  Building,
  Villa,
  TreePine,
  Star,
  Shield,
  Zap,
  Globe,
  Users,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
  ChevronRight,
  Heart,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  Award,
  Crown
} from "lucide-react";

// Main Home Component for Hama Estate
const Home = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: '',
    propertyType: '',
    priceRange: ''
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleFeaturedPropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleContactAgent = (propertyName) => {
    // You can implement contact functionality here
    console.log(`Contacting agent for ${propertyName}`);
  };

  const stats = [
    { value: "5,000+", label: "Properties Available" },
    { value: "30", label: "Counties Covered" },
    { value: "8,000+", label: "Happy Customers" },
    { value: "200+", label: "Expert Agents" }
  ];

  const propertyTypes = [
    { icon: <Building className="w-8 h-8" />, name: "Apartments", count: "2,500+" },
    { icon: <Home className="w-8 h-8" />, name: "Houses", count: "1,800+" },
    { icon: <Villa className="w-8 h-8" />, name: "Villas", count: "500+" },
    { icon: <TreePine className="w-8 h-8" />, name: "Land", count: "200+" }
  ];

  const features = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Security & Trust",
      description: "Bank-level encryption and verified listings ensure your peace of mind throughout the process.",
      highlights: ["256-bit SSL encryption", "ID-verified agents", "Escrow protection"]
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "AI Technology",
      description: "AI-powered matching and instant notifications help you never miss the perfect property.",
      highlights: ["Instant property matching", "Price prediction accuracy", "Market trend analysis"]
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Kenya-wide Reach",
      description: "From bustling Nairobi to pristine Mombasa beaches - we connect you with properties everywhere.",
      highlights: ["All 47 counties", "Multi-language support", "Local market experts"]
    }
  ];

  const testimonials = [
    {
      content: "Found my dream home in just 2 weeks! The platform made it so easy to compare properties and connect with agents.",
      author: "Grace Wanjiku",
      location: "Nairobi, Kenya",
      rating: 5
    },
    {
      content: "Excellent service from start to finish. The virtual tours saved me so much time, and the agent was incredibly helpful.",
      author: "David Kimani",
      location: "Mombasa, Kenya",
      rating: 5
    },
    {
      content: "The best real estate platform I've ever used. Transparent pricing and no hidden fees. Highly recommended!",
      author: "Sarah Johnson",
      location: "Kisumu, Kenya",
      rating: 5
    }
  ];

  const featuredProperties = [
    {
      id: 1,
      name: "Equity Afya⭐ Featured",
      location: "Juja",
      price: "Ksh 22,000",
      period: "per month",
      status: "Available Now",
      daysOnMarket: "3 days on market",
      features: ["WiFi", "Parking", "Garden"],
      rating: 4.8,
      beds: 2,
      baths: 1,
      sqft: "2,500",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Modern Apartment Complex",
      location: "Westlands",
      price: "Ksh 45,000",
      period: "per month",
      status: "Available Now",
      daysOnMarket: "1 day on market",
      features: ["Pool", "Gym", "Security"],
      rating: 4.9,
      beds: 3,
      baths: 2,
      sqft: "1,800",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop"
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search submitted:', searchData);
    // Handle search logic here
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-blue-200">Home in Kenya</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Discover premium properties across all 47 counties. From modern apartments to luxury villas, 
              find the perfect place to call home.
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={searchData.location}
                    onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white/90 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select location</option>
                    <option value="nairobi">Nairobi</option>
                    <option value="mombasa">Mombasa</option>
                    <option value="kisumu">Kisumu</option>
                    <option value="nakuru">Nakuru</option>
                  </select>
                </div>
                
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={searchData.propertyType}
                    onChange={(e) => setSearchData({...searchData, propertyType: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white/90 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={searchData.priceRange}
                    onChange={(e) => setSearchData({...searchData, priceRange: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white/90 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select range (KSh)</option>
                    <option value="0-50000">0 - 50,000</option>
                    <option value="50000-100000">50,000 - 100,000</option>
                    <option value="100000-200000">100,000 - 200,000</option>
                    <option value="200000+">200,000+</option>
                  </select>
    </div>
                
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search Properties
                </button>
              </div>
            </form>

            {/* Trust Badge */}
            <div className="text-center">
              <p className="text-blue-200 text-lg">
                Trusted by 10,000+ property seekers
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Home
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore different property types and find the one that matches your lifestyle
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {propertyTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {type.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {type.name}
                </h3>
                <p className="text-blue-600 font-semibold">
                  {type.count}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Premium Featured
            </h2>
            <h3 className="text-2xl text-gray-700 mb-4">
              Featured Properties
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our exclusive handpicked selection of premium properties across Kenya. 
              These featured listings receive maximum visibility and premium placement.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Daily Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">98%</div>
                <div className="text-gray-600">Response Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : (index % 2 === 0 ? -30 : 30) }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {property.status}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-yellow-700">
                        {property.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {property.price}
                    </div>
                    <div className="text-gray-500">
                      {property.period}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {property.beds} beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {property.baths} baths
                    </span>
                    <span className="flex items-center gap-1">
                      <TreePine className="w-4 h-4" />
                      {property.sqft} sqft
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{property.daysOnMarket}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      150 views
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleContactAgent(property.title)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-300"
                    >
                      Contact Agent
                    </button>
                    <button 
                      onClick={() => handleFeaturedPropertyClick(property.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2">
              View All Properties
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Hama Estate?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of real estate with our innovative platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-blue-600 mb-6 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
      </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers have to say about their experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
    <motion.div 
                key={index}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-50 rounded-2xl p-8 text-center"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 mb-1">
                    {testimonial.author}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.location}
      </div>
    </div>
              </motion.div>
            ))}
          </div>
  </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Start your journey today and discover the perfect property that matches your lifestyle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                Start Searching
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                Schedule a Call
              </button>
      </div>
    </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Hama Estate</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Kenya's premier real estate platform, connecting buyers and sellers across all 47 counties. 
                Find your dream home with us.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Properties</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">List Property</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Buy Property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rent Property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sell Property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Property Valuation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">M-Pesa Payments</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 Hama Estate. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
