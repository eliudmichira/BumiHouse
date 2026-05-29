import React from 'react';
import { Cookie } from 'lucide-react';
import { useTheme } from '../src/context/ThemeContext';

const Cookies: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <section className={`py-16 ${isDark ? 'bg-[#0a0c19]' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Cookie className="w-6 h-6 text-[#51faaa]" />
          <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cookie Policy</h1>
        </div>
        <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} mb-8`}>
          We use cookies to personalise content, provide social media features, and analyse our traffic.
        </p>

        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#10121e] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>What Are Cookies?</h2>
          <p className={`${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            Cookies are small text files stored on your device. They help us remember your preferences and improve your experience.
          </p>
        </div>

        <div className={`rounded-2xl p-6 mt-6 ${isDark ? 'bg-[#10121e] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Managing Cookies</h2>
          <p className={`${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            You can control cookies through your browser settings. Disabling cookies may affect site functionality.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Cookies;


