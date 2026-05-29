import React, { useState, useEffect, useRef } from 'react';
import {
    Search, MapPin, DollarSign, Home, Award, Users, Building2, Star, Shield, Sparkles,
    ChevronRight, Check, TrendingUp, Clock, Phone, Mail, MessageCircle, Play,
    ArrowRight, Zap, Globe, Heart, Eye, Bed, Bath, Square, Calendar,
    Wifi, Car, Trees, Mountain, Waves, Coffee, Dumbbell, ShoppingBag,
    ChevronLeft, X, ExternalLink, Share2, Bookmark, Filter, Map
} from 'lucide-react';

// Custom hooks
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

const useParallax = (speed = 0.5) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.pageYOffset * speed);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
};

// Modern Property Card Component
function ModernPropertyCard({ property, index, onClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleContactAgent = (agentId) => {
        window.location.href = `/contact?agent=${agentId}`;
    };

    return (
        <div
            className="group relative transform transition-all duration-500 cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-72 overflow-hidden">
                    <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Status Badge */}
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${property.status === 'Featured'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : property.status === 'New Listing'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-orange-500 text-white'
                            }`}>
                            {property.status}
                        </span>
                        {property.virtualTour && (
                            <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md text-white rounded-full text-xs font-semibold flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                Virtual Tour
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className={`absolute top-6 right-6 flex items-center gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                        }`}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSaved(!isSaved);
                            }}
                            className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        >
                            <Heart className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
                        </button>
                        <button className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                            <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Property Features Overlay */}
                    <div className={`absolute bottom-0 left-0 right-0 p-6 text-white transition-all duration-500 ${isHovered ? 'translate-y-0' : 'translate-y-full'
                        }`}>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                <Bed className="w-4 h-4" />
                                {property.beds} Beds
                            </span>
                            <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                <Bath className="w-4 h-4" />
                                {property.baths} Baths
                            </span>
                            <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                <Square className="w-4 h-4" />
                                {property.sqft} sqft
                            </span>
                        </div>
                    </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{property.price}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">${property.pricePerSqft}/sqft</p>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{property.rating}</span>
                        </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{property.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-4">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                    </p>

                    {/* Property Amenities */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                            {property.amenities?.slice(0, 4).map((amenity, i) => (
                                <span key={i} className="flex items-center gap-1" title={amenity.name}>
                                    <amenity.icon className="w-4 h-4" />
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleContactAgent(property.id);
                            }}
                            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                        >
                            Contact Agent
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const HomePage = () => {
    // Mock current user
    const currentUser = null;

    const [searchQuery, setSearchQuery] = useState({
        type: "buy",
        city: "",
        minPrice: "",
        maxPrice: "",
        beds: "",
        propertyType: ""
    });
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [selectedPropertyType, setSelectedPropertyType] = useState('all');
    const [loadingProperties, setLoadingProperties] = useState(true);
    const parallaxOffset = useParallax(0.3);

    // Theme handling
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    // Intersection observers for animations
    const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 });
    const [statsRef, statsInView] = useIntersectionObserver({ threshold: 0.3 });
    const [featuresRef, featuresInView] = useIntersectionObserver({ threshold: 0.2 });

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    //     }, 6000);
    //     return () => clearInterval(interval);
    // }, []);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoadingProperties(false), 1500);
    }, [selectedPropertyType]);

    const handleSearchChange = (e) => {
        setSearchQuery(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const switchType = (type) => {
        setSearchQuery(prev => ({ ...prev, type }));
    };

    // Navigation handlers
    const handleViewMap = () => {
        window.location.href = '/list?view=map';
    };

    const handlePropertyTypeClick = (type) => {
        setSelectedPropertyType(type);
        window.location.href = `/list?propertyType=${type}`;
    };

    const handlePropertyCardClick = (propertyId) => {
        window.location.href = `/property/${propertyId}`;
    };

    const handleVirtualTour = () => {
        setIsVideoModalOpen(true);
    };

    const handleStartSearching = () => {
        window.location.href = '/list';
    };

    const handleScheduleCall = () => {
        window.location.href = '/contact';
    };

    const handleLearnMore = (section) => {
        switch (section) {
            case 'secure':
                window.location.href = '/about?section=security';
                break;
            case 'ai':
                window.location.href = '/about?section=technology';
                break;
            case 'reach':
                window.location.href = '/about?section=reach';
                break;
            default:
                window.location.href = '/about';
        }
    };

    const handleGetStarted = () => {
        if (currentUser) {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/register';
        }
    };

    const popularSearches = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Mesh */}
                <div className="absolute inset-0">
                    <div
                        className="absolute top-0 -left-1/4 w-[800px] h-[800px] rounded-full"
                        style={{
                            background: isDark
                                ? 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
                            transform: `translateY(${parallaxOffset * 0.5}px)`,
                            filter: 'blur(40px)'
                        }}
                    />
                    <div
                        className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] rounded-full"
                        style={{
                            background: isDark
                                ? 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                            transform: `translateY(${-parallaxOffset * 0.3}px)`,
                            filter: 'blur(40px)'
                        }}
                    />
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 20}s`,
                                animationDuration: `${20 + Math.random() * 20}s`
                            }}
                        >
                            <div
                                className={`w-1 h-1 rounded-full ${i % 3 === 0 ? 'bg-blue-400/30' : i % 3 === 1 ? 'bg-purple-400/30' : 'bg-cyan-400/30'
                                    }`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Hero Section with Advanced Animations */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 py-24">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className={`space-y-8 ${heroInView ? 'animate-slide-in-left' : 'opacity-0'}`}>
                            {/* Live Badge */}
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-full border border-emerald-500/20 animate-pulse-soft">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                <span className="text-sm font-medium bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                    Live: 234 people searching now
                                </span>
                            </div>

                            {/* Main Heading with Enhanced Typography */}
                            <div className="space-y-6">
                                <h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight">
                                    <span className="text-gray-900 dark:text-white">Find Your</span>
                                    <br />
                                    <span className="relative inline-block mt-2">
                                        <span className="bg-gradient-to-br from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                                            Perfect Home
                                        </span>
                                        {/* Animated Underline */}
                                        <svg className="absolute -bottom-4 left-0 w-full" height="20" viewBox="0 0 400 20">
                                            <path
                                                d="M0,10 Q100,5 200,10 T400,10"
                                                stroke="url(#gradient-underline)"
                                                strokeWidth="3"
                                                fill="none"
                                                strokeLinecap="round"
                                                className="animate-draw"
                                            />
                                            <defs>
                                                <linearGradient id="gradient-underline" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3B82F6" />
                                                    <stop offset="50%" stopColor="#06B6D4" />
                                                    <stop offset="100%" stopColor="#8B5CF6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </span>
                                </h1>
                                <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl font-light">
                                    Discover extraordinary properties in Kenya with our AI-powered search.
                                    <span className="text-gray-900 dark:text-white font-medium"> Your dream home is just one click away.</span>
                                </p>
                            </div>

                            {/* Enhanced Search Component */}
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-3xl transition-all duration-500">
                                {/* Search Types */}
                                <div className="flex gap-2 mb-6">
                                    {["buy", "rent", "sell"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => switchType(type)}
                                            className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${searchQuery.type === type
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Main Search Input */}
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="Search by city, neighborhood, or area"
                                            value={searchQuery.city}
                                            onChange={handleSearchChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500"
                                        />
                                        {/* Quick Suggestions */}
                                        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 z-10">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">Popular searches</p>
                                            <div className="flex flex-wrap gap-2 p-2">
                                                {popularSearches.map((search) => (
                                                    <button
                                                        key={search}
                                                        onClick={() => setSearchQuery(prev => ({ ...prev, city: search }))}
                                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        {search}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Filters Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="relative">
                                            <select
                                                name="propertyType"
                                                value={searchQuery.propertyType}
                                                onChange={handleSearchChange}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
                                            >
                                                <option value="">Property Type</option>
                                                <option value="house">House</option>
                                                <option value="apartment">Apartment</option>
                                                <option value="condo">Condo</option>
                                                <option value="townhouse">Townhouse</option>
                                            </select>
                                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="minPrice"
                                                placeholder="Min Price (KSh)"
                                                value={searchQuery.minPrice}
                                                onChange={handleSearchChange}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                            />
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="maxPrice"
                                                placeholder="Max Price (KSh)"
                                                value={searchQuery.maxPrice}
                                                onChange={handleSearchChange}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                            />
                                        </div>

                                        <div className="relative">
                                            <select
                                                name="beds"
                                                value={searchQuery.beds}
                                                onChange={handleSearchChange}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
                                            >
                                                <option value="">Beds</option>
                                                <option value="1">1+</option>
                                                <option value="2">2+</option>
                                                <option value="3">3+</option>
                                                <option value="4">4+</option>
                                                <option value="5">5+</option>
                                            </select>
                                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Search Button */}
                                    <button
                                        onClick={() => window.location.href = `/list?type=${searchQuery.type}&city=${searchQuery.city}&minPrice=${searchQuery.minPrice}&maxPrice=${searchQuery.maxPrice}`}
                                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 px-8 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <Search className="w-5 h-5 relative z-10" />
                                        <span className="relative z-10">Search Properties</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                                    </button>
                                </div>
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        {[...Array(5)].map((_, i) => (
                                            <img
                                                key={i}
                                                src={`https://i.pravatar.cc/48?img=${i + 10}`}
                                                alt="User"
                                                className="w-12 h-12 rounded-full border-3 border-white dark:border-gray-800 shadow-lg"
                                            />
                                        ))}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white ml-1">4.9</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Trusted by 10,000+ families in Kenya</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleViewMap}
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <Map className="w-4 h-4" />
                                    View Map
                                </button>
                            </div>
                        </div>

                        {/* Right Visual - Modern Property Showcase */}
                        <div className={`relative lg:block ${heroInView ? 'animate-slide-in-right' : 'opacity-0'}`}>
                            <div className="relative">
                                {/* Main Property Card */}
                                <div className="relative group cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                                    <div className="relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                                        <div className="relative h-[400px] overflow-hidden">
                                            <img
                                                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
                                                alt="Luxury Property"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                            {/* Property Status Badge */}
                                            <div className="absolute top-6 left-6 flex items-center gap-3">
                                                <span className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full text-sm font-semibold text-gray-900 dark:text-white shadow-lg">
                                                    Just Listed
                                                </span>
                                                <span className="px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                                                    <Zap className="w-4 h-4" />
                                                    Hot Deal
                                                </span>
                                            </div>

                                            {/* Virtual Tour Button */}
                                            <button
                                                onClick={handleVirtualTour}
                                                className="absolute top-6 right-6 w-14 h-14 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform group/play"
                                            >
                                                <Play className="w-6 h-6 text-gray-900 dark:text-white ml-1 group-hover/play:text-blue-600 transition-colors" />
                                            </button>

                                            {/* Property Info Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                                <h3 className="text-2xl font-bold mb-2">Modern Luxury Villa</h3>
                                                <p className="text-lg opacity-90 mb-4">Karen, Nairobi</p>
                                                <div className="flex items-center gap-6">
                                                    <span className="flex items-center gap-2">
                                                        <Bed className="w-5 h-5" />
                                                        4 Beds
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Bath className="w-5 h-5" />
                                                        3 Baths
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Square className="w-5 h-5" />
                                                        3,200 sqft
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price and Action */}
                                        <div className="p-6 flex items-center justify-between">
                                            <div>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">KSh 85,000,000</p>
                                                <p className="text-gray-600 dark:text-gray-400">KSh 26,500/sqft</p>
                                            </div>
                                            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Stats Cards */}
                                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl animate-float-delayed">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">98%</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Match Rate</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl animate-float">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">2.5k+</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Happy Clients</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern CSS Animations */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(5px); }
          50% { transform: translateY(5px) translateX(-5px); }
          75% { transform: translateY(-10px) translateX(5px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-15px) translateX(-5px); }
          50% { transform: translateY(10px) translateX(5px); }
          75% { transform: translateY(-5px) translateX(-5px); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes draw {
          0% { stroke-dasharray: 0 1000; }
          100% { stroke-dasharray: 1000 0; }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 20s ease-in-out infinite;
          animation-delay: 5s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }
        
        .animate-draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2s ease forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out forwards;
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
        </div>
    );
};

// Data
const stats = [
    { value: "15K+", label: "Properties Listed" },
    { value: "12K+", label: "Happy Customers" },
    { value: "500+", label: "Expert Agents" },
    { value: "47+", label: "Counties Covered" }
];

const propertyTypes = [
    { id: 'house', name: 'Houses', icon: Home, count: '2,543' },
    { id: 'apartment', name: 'Apartments', icon: Building2, count: '1,876' },
    { id: 'villa', name: 'Villas', icon: Mountain, count: '432' },
    { id: 'condo', name: 'Condos', icon: Waves, count: '987' }
];






export default HomePage;