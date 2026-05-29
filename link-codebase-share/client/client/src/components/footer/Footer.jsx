import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();
  
  return (
    <footer className={`transition-colors duration-500 ${
      isDark 
        ? 'bg-[#0a0c19] border-t border-[rgba(81,250,170,0.2)]' 
        : 'bg-gray-900 border-t border-gray-700'
    }`}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="rounded-[6px] bg-[#51faaa] flex items-center justify-center px-[10px] py-[4px]">
                <span className="text-[#111] text-[14px] font-outfit font-medium">H</span>
              </div>
              <span className="text-white text-[18px] leading-[22px] font-outfit font-semibold">
                Hama Estate
              </span>
            </div>
            <p className={`font-outfit leading-relaxed ${
              isDark ? 'text-[#ccc]' : 'text-gray-300'
            }`}>
              Kenya's premier real estate platform, connecting buyers and sellers across all 47 counties. 
              Find your dream home with us.
            </p>
            <div className="flex space-x-4">
              <a href="#" className={`hover:text-[#51faaa] transition-colors duration-300 ${
                isDark ? 'text-[#ccc]' : 'text-gray-300'
              }`}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className={`hover:text-[#51faaa] transition-colors duration-300 ${
                isDark ? 'text-[#ccc]' : 'text-gray-300'
              }`}>
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className={`hover:text-[#51faaa] transition-colors duration-300 ${
                isDark ? 'text-[#ccc]' : 'text-gray-300'
              }`}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className={`hover:text-[#51faaa] transition-colors duration-300 ${
                isDark ? 'text-[#ccc]' : 'text-gray-300'
              }`}>
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-outfit font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/register" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  List Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-white font-outfit font-semibold text-lg">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/buy" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  Buy Property
                </Link>
              </li>
              <li>
                <Link to="/rent" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  Rent Property
                </Link>
              </li>
              <li>
                <Link to="/sell" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  Sell Property
                </Link>
              </li>
              <li>
                <Link to="/valuation" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  Property Valuation
                </Link>
              </li>
              <li>
                <Link to="/mpesa" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  M-Pesa Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-white font-outfit font-semibold text-lg">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#51faaa] mt-1 flex-shrink-0" />
                <div>
                  <p className={`font-outfit text-sm ${
                    isDark ? 'text-[#ccc]' : 'text-gray-300'
                  }`}>
                    Nairobi, Kenya<br />
                    Westlands, 8th Floor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#51faaa] flex-shrink-0" />
                <a href="tel:+254700000000" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit text-sm ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  +254 700 000 000
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#51faaa] flex-shrink-0" />
                <a href="mailto:info@hamaestate.co.ke" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit text-sm ${
                  isDark ? 'text-[#ccc]' : 'text-gray-300'
                }`}>
                  info@hamaestate.co.ke
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className={`border-t pt-8 mb-8 ${
          isDark ? 'border-[rgba(81,250,170,0.2)]' : 'border-gray-700'
        }`}>
          <div className="max-w-md">
            <h3 className="text-white font-outfit font-semibold text-lg mb-4">Stay Updated</h3>
            <p className={`font-outfit text-sm mb-4 ${
              isDark ? 'text-[#ccc]' : 'text-gray-300'
            }`}>
              Subscribe to our newsletter for the latest property updates and market insights.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 px-4 py-2 rounded-lg font-outfit text-sm focus:outline-none focus:border-[#51faaa] transition-colors ${
                  isDark 
                    ? 'bg-[#10121e] border border-[rgba(81,250,170,0.2)] text-white' 
                    : 'bg-gray-800 border border-gray-600 text-white placeholder-gray-400'
                }`}
              />
              <button className="px-6 py-2 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#111] font-outfit font-semibold rounded-lg shadow-[0px_-2px_0px_rgba(17,17,17,0.32)_inset] hover:shadow-lg transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t pt-8 ${
          isDark ? 'border-[rgba(81,250,170,0.2)]' : 'border-gray-700'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`font-outfit text-sm ${
              isDark ? 'text-[#ccc]' : 'text-gray-300'
            }`}>
              © 2024 Hama Estate. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit text-sm ${
                isDark ? 'text-[#ccc]' : 'text-gray-300'
              }`}>
                Privacy Policy
              </Link>
              <Link to="/terms" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit text-sm ${
                isDark ? 'text-[#ccc]' : 'text-gray-300'
              }`}>
                Terms of Service
              </Link>
              <Link to="/cookies" className={`hover:text-[#51faaa] transition-colors duration-300 font-outfit text-sm ${
                isDark ? 'text-[#ccc]' : 'text-gray-300'
              }`}>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
