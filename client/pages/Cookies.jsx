import React from 'react';
import { Cookie } from 'lucide-react';
import { useTheme } from '../src/context/ThemeContext';

const Cookies = () => {
  const { isDark } = useTheme();
  return (
    <section className={`pt-40 pb-0 min-h-screen ${isDark ? 'bg-[#0a0c19]' : 'bg-white'}`}>
      <div className="max-w-3xl mx-auto px-6">
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Cookie Policy</h1>
        <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} mb-8`}>
          We use cookies to personalise content, provide social features, and analyse traffic.
        </p>

        <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>What Are Cookies?</h2>
        <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} mb-3`}>
          Cookies are small text files stored on your device. They help us remember your preferences and improve your experience.
        </p>
        <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 mb-8 space-y-2`}>
          <li><strong className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Essential cookies:</strong> required for core features like authentication and security.</li>
          <li><strong className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Functional cookies:</strong> remember preferences such as language, theme, and saved filters.</li>
          <li><strong className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics cookies:</strong> help us understand usage to improve performance and reliability.</li>
          <li><strong className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Advertising cookies:</strong> only where applicable and subject to your consent.</li>
        </ul>

        <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Managing Cookies</h2>
        <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} mb-3`}>
          You can control cookies through your browser settings. Disabling cookies may affect site functionality.
        </p>
        <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 space-y-2`}>
          <li>Clear cookies or set site‑specific permissions in your browser.</li>
          <li>Use private browsing modes to limit cookie storage.</li>
          <li>On supported platforms, manage consent within your account preferences.</li>
        </ul>
      </div>
    </section>
  );
};

export default Cookies;


