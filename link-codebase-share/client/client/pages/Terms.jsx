import React from 'react';
import { FileText } from 'lucide-react';
import { useTheme } from '../src/context/ThemeContext';

const Terms = () => {
  const { isDark } = useTheme();
  return (
    <section className={`pt-40 pb-0 min-h-screen ${isDark ? 'bg-[#0a0c19]' : 'bg-white'}`}>
      <div className="max-w-3xl mx-auto px-6">
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Terms of Service</h1>
        <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} mb-8`}>
          By using Hama Estate, you agree to these terms. Please read them carefully.
        </p>

        <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Use of Service</h2>
        <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 mb-6 space-y-2`}>
          <li>Do not misuse the platform or interfere with others.</li>
          <li>Provide accurate information when creating an account and keep your credentials secure.</li>
          <li>Respect intellectual property rights and do not upload content you do not own or have permission to use.</li>
          <li>Do not attempt to reverse engineer, scrape, or overload the service.</li>
          <li>Use the platform only if you are 18+ or have legal capacity to contract in your jurisdiction.</li>
          <li>You are responsible for content you publish (listings, messages, reviews) and must ensure it is lawful and non‑misleading.</li>
        </ul>

        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Account & Termination</h3>
        <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 mb-8 space-y-2`}>
          <li>We may suspend or terminate accounts that violate these terms or applicable laws.</li>
          <li>You can close your account at any time from settings; data handling will follow our Privacy Policy.</li>
          <li>Some features may be provided by third parties; their terms may also apply.</li>
        </ul>

        <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Liability</h2>
        <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 mb-8 space-y-2`}>
          <li>The service is provided “as is” and “as available” without warranties of any kind.</li>
          <li>We do not guarantee listing accuracy, availability, pricing, or outcomes of transactions.</li>
          <li>To the maximum extent permitted by law, we are not liable for indirect, incidental, special, or consequential damages.</li>
          <li>You agree to indemnify us from claims arising out of content you submit or your misuse of the service.</li>
        </ul>

        
      </div>
    </section>
  );
};

export default Terms;


