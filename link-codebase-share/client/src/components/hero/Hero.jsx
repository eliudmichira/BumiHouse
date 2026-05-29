import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Home, TrendingUp, ChevronDown, Award, Newspaper, Building2, Users } from 'lucide-react';
import heroBg from '../../images/amani-nation-LTh5pGyvKAM-unsplash.jpg';
import LightRays from '../effects/LightRays';
import { useTheme } from '../../context/ThemeContext';

const Hero = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [init, setInit] = useState(true);
  const [statsInView, setStatsInView] = useState(false);
  const [counters, setCounters] = useState({ properties: 0, counties: 0, customers: 0, agents: 0 });
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    location: '',
    propertyType: '',
    priceRange: ''
  });

  // Aurora requires no engine initialization

  // Observe stats for counter animation
  useEffect(() => {
    const el = document.getElementById('hero-stats');
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsInView(true);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Animate counters when in view (slower speed, reduced targets)
  useEffect(() => {
    if (!statsInView) return;
    const targets = { properties: 5000, counties: 30, customers: 8000, agents: 200 };
    const start = performance.now();
    const duration = 3000;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setCounters({
        properties: Math.floor(targets.properties * t),
        counties: Math.floor(targets.counties * t),
        customers: Math.floor(targets.customers * t),
        agents: Math.floor(targets.agents * t)
      });
      if (t < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [statsInView]);

  const particlesLoaded = () => {};

  // Handle search form changes
  const handleSearchChange = (field, value) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchForm.location) params.append('location', searchForm.location);
    if (searchForm.propertyType) params.append('type', searchForm.propertyType);
    if (searchForm.priceRange) params.append('price', searchForm.priceRange);
    
    navigate(`/properties?${params.toString()}`);
  };

  // Particle configuration (unused with Aurora)
  const particlesOptions = useMemo(() => ({
    autoPlay: true,
    background: {
      color: {
        value: "transparent",
      },
      image: "",
      position: "",
      repeat: "",
      size: "",
      opacity: 1
    },
    backgroundMask: {
      composite: "destination-out",
      cover: {
        opacity: 1,
        color: {
          value: ""
        }
      },
      enable: false
    },
    clear: true,
    defaultThemes: {},
    delay: 0,
    fullScreen: {
      enable: false,
      zIndex: 0
    },
    detectRetina: true,
    duration: 0,
    fpsLimit: 120,
    interactivity: {
      detectsOn: "window",
      events: {
        onClick: {
          enable: true,
          mode: "push"
        },
        onDiv: {
          selectors: [],
          enable: false,
          mode: [],
          type: "circle"
        },
        onHover: {
          enable: true,
          mode: "repulse",
          parallax: {
            enable: false,
            force: 2,
            smooth: 10
          }
        },
        resize: {
          delay: 0.5,
          enable: true
        }
      },
      modes: {
        trail: {
          delay: 1,
          pauseOnStop: false,
          quantity: 1
        },
        attract: {
          distance: 200,
          duration: 0.4,
          easing: "ease-out-quad",
          factor: 1,
          maxSpeed: 50,
          speed: 1
        },
        bounce: {
          distance: 200
        },
        bubble: {
          distance: 200,
          duration: 0.4,
          mix: false,
          divs: {
            distance: 200,
            duration: 0.4,
            mix: false,
            selectors: []
          }
        },
        connect: {
          distance: 80,
          links: {
            opacity: 0.5
          },
          radius: 60
        },
        grab: {
          distance: 100,
          links: {
            blink: false,
            consent: false,
            opacity: 1
          }
        },
        push: {
          default: true,
          groups: [],
          quantity: 4
        },
        remove: {
          quantity: 2
        },
        repulse: {
          distance: 200,
          duration: 0.4,
          factor: 100,
          speed: 1,
          maxSpeed: 50,
          easing: "ease-out-quad",
          divs: {
            distance: 200,
            duration: 0.4,
            factor: 100,
            speed: 1,
            maxSpeed: 50,
            easing: "ease-out-quad",
            selectors: []
          }
        },
        slow: {
          factor: 3,
          radius: 200
        },
        particle: {
          replaceCursor: false,
          pauseOnStop: false,
          stopDelay: 0
        },
        light: {
          area: {
            gradient: {
              start: {
                value: "#ffffff"
              },
              stop: {
                value: "#000000"
              }
            },
            radius: 1000
          },
          shadow: {
            color: {
              value: "#000000"
            },
            length: 2000
          }
        }
      }
    },
    manualParticles: [],
    particles: {
      bounce: {
        horizontal: {
          value: 1
        },
        vertical: {
          value: 1
        }
      },
      collisions: {
        absorb: {
          speed: 2
        },
        bounce: {
          horizontal: {
            value: 1
          },
          vertical: {
            value: 1
          }
        },
        enable: false,
        maxSpeed: 50,
        mode: "bounce",
        overlap: {
          enable: true,
          retries: 0
        }
      },
              color: {
          value: isDark ? [
            "#51faaa",
            "#dbd5a4",
            "#4285f4",
            "#34A853"
          ] : [
            "#10b981",
            "#059669",
            "#047857",
            "#065f46"
          ],
        animation: {
          h: {
            count: 0,
            enable: true,
            speed: 20,
            decay: 0,
            delay: 0,
            sync: true,
            offset: 0
          },
          s: {
            count: 0,
            enable: false,
            speed: 1,
            decay: 0,
            delay: 0,
            sync: true,
            offset: 0
          },
          l: {
            count: 0,
            enable: false,
            speed: 1,
            decay: 0,
            delay: 0,
            sync: true,
            offset: 0
          }
        }
      },
      effect: {
        close: true,
        fill: true,
        options: {},
        type: []
      },
      groups: {},
      move: {
        angle: {
          offset: 0,
          value: 90
        },
        attract: {
          distance: 200,
          enable: false,
          rotate: {
            x: 3000,
            y: 3000
          }
        },
        center: {
          x: 50,
          y: 50,
          mode: "percent",
          radius: 0
        },
        decay: 0,
        distance: {},
        direction: "none",
        drift: 0,
        enable: true,
        gravity: {
          acceleration: 9.81,
          enable: false,
          inverse: false,
          maxSpeed: 50
        },
        path: {
          clamp: true,
          delay: {
            value: 0
          },
          enable: false,
          options: {}
        },
        outModes: {
          default: "bounce",
          bottom: "bounce",
          left: "bounce",
          right: "bounce",
          top: "bounce"
        },
        random: false,
        size: false,
        speed: 2,
        spin: {
          acceleration: 0,
          enable: false
        },
        straight: false,
        trail: {
          enable: false,
          length: 10,
          fill: {}
        },
        vibrate: false,
        warp: false
      },
      number: {
        density: {
          enable: true,
          width: 1920,
          height: 1080
        },
        limit: {
          mode: "delete",
          value: 0
        },
        value: 80
      },
      opacity: {
        value: 0.5,
        animation: {
          count: 0,
          enable: false,
          speed: 2,
          decay: 0,
          delay: 0,
          sync: false,
          mode: "auto",
          startValue: "random",
          destroy: "none"
        }
      },
      reduceDuplicates: false,
      shadow: {
        blur: 0,
        color: {
          value: "#000"
        },
        enable: false,
        offset: {
          x: 0,
          y: 0
        }
      },
      shape: {
        close: true,
        fill: true,
        options: {},
        type: "circle"
      },
      size: {
        value: {
          min: 1,
          max: 3
        },
        animation: {
          count: 0,
          enable: false,
          speed: 5,
          decay: 0,
          delay: 0,
          sync: false,
          mode: "auto",
          startValue: "random",
          destroy: "none"
        }
      },
      stroke: {
        width: 0
      },
      zIndex: {
        value: 0,
        opacityRate: 1,
        sizeRate: 1,
        velocityRate: 1
      },
      destroy: {
        bounds: {},
        mode: "none",
        split: {
          count: 1,
          factor: {
            value: 3
          },
          rate: {
            value: {
              min: 4,
              max: 9
            }
          },
          sizeOffset: true,
          particles: {}
        }
      },
      roll: {
        darken: {
          enable: false,
          value: 0
        },
        enable: false,
        enlighten: {
          enable: false,
          value: 0
        },
        mode: "vertical",
        speed: 25
      },
      tilt: {
        value: 0,
        animation: {
          enable: false,
          speed: 0,
          decay: 0,
          sync: false
        },
        direction: "clockwise",
        enable: false
      },
      twinkle: {
        lines: {
          enable: false,
          frequency: 0.05,
          opacity: 1
        },
        particles: {
          enable: false,
          frequency: 0.05,
          opacity: 1
        }
      },
      wobble: {
        distance: 5,
        enable: false,
        speed: {
          angle: 50,
          move: 10
        }
      },
      life: {
        count: 0,
        delay: {
          value: 0,
          sync: false
        },
        duration: {
          value: 0,
          sync: false
        }
      },
      rotate: {
        value: 0,
        animation: {
          enable: false,
          speed: 0,
          decay: 0,
          sync: false
        },
        direction: "clockwise",
        path: false
      },
      orbit: {
        animation: {
          count: 0,
          enable: false,
          speed: 1,
          decay: 0,
          delay: 0,
          sync: false
        },
        enable: false,
        opacity: 1,
        rotation: {
          value: 45
        },
        width: 1
      },
      links: {
        blink: false,
        color: {
          value: "#ffffff"
        },
        consent: false,
        distance: 150,
        enable: true,
        frequency: 1,
        opacity: 0.4,
        shadow: {
          blur: 5,
          color: {
            value: "#000"
          },
          enable: false
        },
        triangles: {
          enable: false,
          frequency: 1
        },
        width: 1,
        warp: false
      },
      repulse: {
        value: 0,
        enabled: false,
        distance: 1,
        duration: 1,
        factor: 1,
        speed: 1
      }
    },
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    responsive: [],
    smooth: false,
    style: {},
    themes: [],
    zLayers: 100,
    key: "basic",
    name: "Basic",
    motion: {
      disable: false,
      reduce: {
        factor: 4,
        value: true
      }
    }
  }), []);

    return (
          <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 ${
            isDark 
              ? 'bg-gradient-to-b from-[#0a0c19] via-[#0f1419] to-[#1a1f2e]' 
              : 'bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#d1fae5]'
          }`}>
        {/* Particle System Background */}
         <div className="absolute inset-0 z-0">
           {/* Background Image with overlay */}
           <div 
             className="absolute inset-0 bg-cover bg-center"
             style={{ backgroundImage: `url(${heroBg})` }}
           />
           <div className={`absolute inset-0 transition-colors duration-500 ${
             isDark 
               ? 'bg-black/50' 
               : 'bg-white/20'
           }`} />
           
           {/* Aurora Effect */}
           {init && (
             <div className="absolute inset-0">
              <LightRays 
                raysOrigin="top-center"
                raysColor={isDark ? "#FFC76A" : "#FFE3A3"}
                raysSpeed={1.2}
                lightSpread={0.85}
                rayLength={1.3}
                followMouse={true}
                mouseInfluence={0.08}
                noiseAmount={0.04}
                distortion={0.03}
                saturation={1.1}
              />
             </div>
           )}
         </div>

                                                       <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-24">
           <div className="text-center">
           
                                            {/* Enhanced Trust Badge */}
                          <motion.div 
                            className={`inline-flex items-center gap-2 px-8 py-4 backdrop-blur-2xl rounded-full mb-6 border shadow-2xl transition-all duration-500 ${
                              isDark 
                                ? 'bg-[#1a1b2e]/30 border-[rgba(255,255,255,0.1)] shadow-[#51faaa]/5 hover:shadow-[#51faaa]/10' 
                                : 'bg-white/30 border-[rgba(0,0,0,0.1)] shadow-[#10b981]/5 hover:shadow-[#10b981]/10'
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                <motion.div 
                  className={`w-2 h-2 rounded-full shadow-lg transition-colors duration-500 ${
                    isDark ? 'bg-[#51faaa] shadow-[#51faaa]/50' : 'bg-[#10b981] shadow-[#10b981]/50'
                  }`}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className={`font-semibold text-sm transition-colors duration-500 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Trusted by 10,000+ property seekers</span>
              </motion.div>

                                                                                       {/* Enhanced Main Heading */}
                          <motion.h1 
                            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight transition-colors duration-500 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                          >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Find Your Perfect
                </motion.span>
                <motion.span 
                  className="block bg-gradient-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent mt-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                >
                  Home in Kenya
                </motion.span>
              </motion.h1>

                        {/* Enhanced Subtitle */}
                          <motion.p 
                            className={`text-lg md:text-xl mb-8 max-w-4xl mx-auto leading-relaxed font-light transition-colors duration-500 ${
                              isDark ? 'text-[#ccc]' : 'text-gray-600'
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                          >
                Discover premium properties across all 47 counties. From modern apartments 
                to luxury villas, find the perfect place to call home.
              </motion.p>

                                                                                                                                                                               {/* Enhanced Premium Search Section */}
                          <motion.div 
                            className="p-0 md:p-0 mb-4 max-w-6xl mx-auto"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                          >
                                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               
                                                                                                                                                                                                                                              {/* Enhanced Location Search */}
                  <motion.div 
                    className="relative group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    whileHover={{ y: -2 }}
                  >
                                                                           <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                                                                             isDark ? 'text-white' : 'text-gray-900'
                                                                           }`}>Location</label>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MapPin className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-500 ${
                          isDark ? 'text-[#51faaa] group-focus-within:text-[#dbd5a4]' : 'text-[#10b981] group-focus-within:text-[#059669]'
                        }`} />
                      </motion.div>
                      <select 
                        value={searchForm.location}
                        onChange={(e) => handleSearchChange('location', e.target.value)}
                        className={`w-full pl-12 pr-10 py-4 backdrop-blur-2xl border rounded-2xl font-medium focus:outline-none appearance-none cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          isDark 
                            ? 'bg-[#0a0c19]/30 border-[rgba(255,255,255,0.2)] text-white focus:ring-2 focus:ring-[#51faaa]/20 focus:border-[#51faaa]/50 hover:border-[#51faaa]/30 hover:bg-[#0a0c19]/40 hover:shadow-[#51faaa]/10' 
                            : 'bg-white/40 border-[rgba(0,0,0,0.1)] text-gray-900 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 hover:border-[#10b981]/30 hover:bg-white/50 hover:shadow-[#10b981]/10'
                        }`}
                      >
                        <option value="">Select location</option>
                        <option value="kilimani">Kilimani, Nairobi</option>
                        <option value="westlands">Westlands, Nairobi</option>
                        <option value="ruaka">Ruaka, Nairobi</option>
                        <option value="lavington">Lavington, Nairobi</option>
                        <option value="karen">Karen, Nairobi</option>
                        <option value="nyali">Nyali, Mombasa</option>
                        <option value="bamburi">Bamburi, Mombasa</option>
                        <option value="eldoret">Eldoret</option>
                        <option value="nakuru">Nakuru</option>
                        <option value="kisumu">Kisumu</option>
                      </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                </div>
              </motion.div>

                                                                                                                                                                                                                                              {/* Enhanced Property Type */}
                  <motion.div 
                    className="relative group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    whileHover={{ y: -2 }}
                  >
                    <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Property Type</label>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Home className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-500 ${
                          isDark ? 'text-[#51faaa] group-focus-within:text-[#dbd5a4]' : 'text-[#10b981] group-focus-within:text-[#059669]'
                        }`} />
                      </motion.div>
                      <select 
                        value={searchForm.propertyType}
                        onChange={(e) => handleSearchChange('propertyType', e.target.value)}
                        className={`w-full pl-12 pr-10 py-4 backdrop-blur-2xl border rounded-2xl font-medium focus:outline-none appearance-none cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          isDark 
                            ? 'bg-[#0a0c19]/30 border-[rgba(255,255,255,0.2)] text-white focus:ring-2 focus:ring-[#51faaa]/20 focus:border-[#51faaa]/50 hover:border-[#51faaa]/30 hover:bg-[#0a0c19]/40 hover:shadow-[#51faaa]/10' 
                            : 'bg-white/40 border-[rgba(0,0,0,0.1)] text-gray-900 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 hover:border-[#10b981]/30 hover:bg-white/50 hover:shadow-[#10b981]/10'
                        }`}
                      >
                        <option value="">Select type</option>
                        <option value="bedsitter">Bedsitter</option>
                        <option value="single-room">Single Room</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="commercial">Commercial</option>
                      </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                </div>
              </motion.div>

                                                                                                                                                                                                                                              {/* Enhanced Price Range */}
                  <motion.div 
                    className="relative group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    whileHover={{ y: -2 }}
                  >
                    <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Price Range</label>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TrendingUp className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-500 ${
                          isDark ? 'text-[#51faaa] group-focus-within:text-[#dbd5a4]' : 'text-[#10b981] group-focus-within:text-[#059669]'
                        }`} />
                      </motion.div>
                      <select 
                        value={searchForm.priceRange}
                        onChange={(e) => handleSearchChange('priceRange', e.target.value)}
                        className={`w-full pl-12 pr-10 py-4 backdrop-blur-2xl border rounded-2xl font-medium focus:outline-none appearance-none cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          isDark 
                            ? 'bg-[#0a0c19]/30 border-[rgba(255,255,255,0.2)] text-white focus:ring-2 focus:ring-[#51faaa]/20 focus:border-[#51faaa]/50 hover:border-[#51faaa]/30 hover:bg-[#0a0c19]/40 hover:shadow-[#51faaa]/10' 
                            : 'bg-white/40 border-[rgba(0,0,0,0.1)] text-gray-900 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 hover:border-[#10b981]/30 hover:bg-white/50 hover:shadow-[#10b981]/10'
                        }`}
                      >
                        <option value="">Select range (KSh)</option>
                        <option value="0-15000">Under 15K/month</option>
                        <option value="15000-30000">15K - 30K/month</option>
                        <option value="30000-50000">30K - 50K/month</option>
                        <option value="50000-100000">50K - 100K/month</option>
                        <option value="100000+">100K+/month</option>
                      </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                </div>
              </motion.div>

                                                           {/* Enhanced Search Button */}
                <motion.div 
                  className="flex flex-col justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 2.0 }}
                >
                  <motion.button 
                    onClick={handleSearchSubmit}
                    className="w-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 text-base shadow-xl shadow-[#10b981]/30 relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.05, 
                      y: -2,
                      boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Shimmer Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Search className="w-6 h-6 relative z-10" />
                    </motion.div>
                    <span className="relative z-10">Search Properties</span>
                  </motion.button>
                </motion.div>
            </div>
          </motion.div>

                                                                                      {/* Enhanced Stats Section */}
                           <motion.div 
                             id="hero-stats" 
                             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                             initial={{ opacity: 0, y: 30 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ duration: 0.6, delay: 2.2 }}
                           >
                             <motion.div 
                               className="text-center group"
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ duration: 0.5, delay: 2.4 }}
                               whileHover={{ y: -5 }}
                             >
                <motion.div 
                  className="flex items-center justify-center gap-2 mb-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Home className="w-5 h-5 text-[#10b981]" />
                </motion.div>
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-[#10b981] to-[#059669] bg-clip-text text-transparent mb-1"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {counters.properties.toLocaleString()}+
                </motion.div>
                <div className={`font-semibold transition-colors duration-500 ${
                  isDark ? 'text-[#ccc]' : 'text-gray-900'
                } ${!isDark ? 'drop-shadow-sm' : ''}`}>Properties Available</div>
              </motion.div>
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.6 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="flex items-center justify-center gap-2 mb-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin className="w-5 h-5 text-[#10b981]" />
                </motion.div>
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-[#10b981] to-[#059669] bg-clip-text text-transparent mb-1"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {counters.counties}
                </motion.div>
                <div className={`font-semibold transition-colors duration-500 ${
                  isDark ? 'text-[#ccc]' : 'text-gray-900'
                } ${!isDark ? 'drop-shadow-sm' : ''}`}>Counties Covered</div>
              </motion.div>
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.8 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="flex items-center justify-center gap-2 mb-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="w-5 h-5 text-[#10b981]" />
                </motion.div>
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-[#10b981] to-[#059669] bg-clip-text text-transparent mb-1"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {counters.customers.toLocaleString()}+
                </motion.div>
                <div className={`font-semibold transition-colors duration-500 ${
                  isDark ? 'text-[#ccc]' : 'text-gray-900'
                } ${!isDark ? 'drop-shadow-sm' : ''}`}>Happy Customers</div>
              </motion.div>
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.0 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="flex items-center justify-center gap-2 mb-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <TrendingUp className="w-5 h-5 text-[#10b981]" />
                </motion.div>
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-[#10b981] to-[#059669] bg-clip-text text-transparent mb-1"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {counters.agents.toLocaleString()}+
                </motion.div>
                <div className={`font-semibold transition-colors duration-500 ${
                  isDark ? 'text-[#ccc]' : 'text-gray-900'
                } ${!isDark ? 'drop-shadow-sm' : ''}`}>Expert Agents</div>
              </motion.div>
           </motion.div>

                                           {/* Enhanced CTA Buttons */}
                         <motion.div 
                           className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.6, delay: 3.2 }}
                         >
                           <motion.div
                             whileHover={{ y: -3 }}
                             whileTap={{ scale: 0.98 }}
                           >
                             <Link 
                               to="/desktop/properties" 
                               className="px-8 py-3 bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-bold rounded-full shadow-lg shadow-[#10b981]/25 text-lg relative overflow-hidden block"
                             >
                               <motion.div
                                 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                 initial={{ x: '-100%' }}
                                 whileHover={{ x: '100%' }}
                                 transition={{ duration: 0.6 }}
                               />
                               <span className="relative z-10">Browse Properties</span>
                             </Link>
                           </motion.div>
                           <motion.div
                             whileHover={{ y: -3 }}
                             whileTap={{ scale: 0.98 }}
                           >
                             <Link 
                               to="/desktop/register" 
                               className={`px-8 py-3 border-2 font-bold rounded-full transition-all duration-300 text-lg relative overflow-hidden block ${
                                 isDark 
                                   ? 'border-[rgba(81,250,170,0.4)] text-[#51faaa] hover:bg-[rgba(81,250,170,0.1)] hover:border-[#51faaa]' 
                                   : 'border-[rgba(16,185,129,0.4)] text-[#10b981] hover:bg-[rgba(16,185,129,0.1)] hover:border-[#10b981]'
                               }`}
                             >
                               <motion.div
                                 className={`absolute inset-0 bg-gradient-to-r from-transparent via-current/10 to-transparent -skew-x-12 ${
                                   isDark ? 'text-[#51faaa]' : 'text-[#10b981]'
                                 }`}
                                 initial={{ x: '-100%' }}
                                 whileHover={{ x: '100%' }}
                                 transition={{ duration: 0.6 }}
                               />
                               <span className="relative z-10">List Your Property</span>
                             </Link>
                           </motion.div>
                         </motion.div>

                     
        </div>
      </div>

             
    </section>
  );
};

export default Hero;