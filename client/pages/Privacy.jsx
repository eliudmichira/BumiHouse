import React from 'react';
import { Shield, Eye, Lock, Users, Settings, FileText, Calendar } from 'lucide-react';
import { useTheme } from '../src/context/ThemeContext';

const Privacy = ({ embedded = false }) => {
  const { isDark } = useTheme();

  return (
    <section className={`${embedded ? 'p-0 bg-transparent' : `pt-40 pb-20 min-h-screen ${isDark ? 'bg-[#0a0c19]' : 'bg-white'}`}`}>
      <div className={`max-w-3xl mx-auto ${embedded ? '' : 'px-6'}`}>
        <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Privacy Policy</h1>
        <p className={`text-sm mb-8 flex items-center gap-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Last updated: February 17, 2026</span>
          <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Version 2.2</span>
        </p>

        <div className={`${isDark ? 'text-white/70' : 'text-gray-700'} space-y-6`}>
          <p>
            At Bumihouse, we take your privacy seriously. This policy describes how we collect, use, and protect your information when you use our mobile application and web platform.
          </p>

          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>1. Information We Collect</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-1 flex items-center gap-2"><Lock className="w-4 h-4 text-[#51faaa]" /> Account Information</h3>
              <p>When you register using Firebase Authentication, we collect your email address and profile information to secure your account and personalize your experience.</p>
            </div>
            <div>
              <h3 className="font-bold mb-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#51faaa]" /> Location Data</h3>
              <p>With your consent, we use your device's geolocation to show properties near you and provide accurate map-based search results. You can disable this in your device settings at any time.</p>
            </div>
            <div>
              <h3 className="font-bold mb-1 flex items-center gap-2"><Eye className="w-4 h-4 text-[#51faaa]" /> Usage Data</h3>
              <p>We collect anonymized analytics regarding how you interact with property listings to improve our recommendation engine and platform performance.</p>
            </div>
          </div>

          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>2. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
            <li>To manage your Account: to manage your registration as a user of the Service.</li>
            <li>To contact you: regarding updates or informative communications related to the functionalities, products, or contracted services.</li>
            <li>To provide you with news, special offers, and general information about other goods and services we offer.</li>
          </ul>

          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>3. Data Security</h2>
          <p>
            We implement industry-standard security measures through Google Firebase to protect your data. Your authentication is handled securely, and sensitive information is encrypted at rest.
          </p>

          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>4. Your Rights</h2>
          <p>
            You have the right to access, update, or delete the information we have on you. You can manage most of this directly through your profile settings or by contacting our support team.
          </p>

          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>5. Contact Us</h2>
          <p className="flex items-center gap-2">
            If you have any questions about this Privacy Policy, you can contact us at:
            <a href="mailto:support@bumihouse.com" className="text-[#51faaa] hover:underline font-bold">support@bumihouse.com</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Privacy;