import React from 'react';
import { Shield, Eye, Lock, Users, Settings, FileText, Calendar } from 'lucide-react';
import { useTheme } from '../src/context/ThemeContext';

const Privacy = () => {
  const { isDark } = useTheme();

  return (
    <section className={`pt-40 pb-0 min-h-screen ${isDark ? 'bg-[#0a0c19]' : 'bg-white'}`}>
      <div className="max-w-3xl mx-auto px-6">
        <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Privacy Policy</h1>
        <p className={`text-sm mb-8 flex items-center gap-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Last updated: August 26, 2025</span>
          <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Version 2.1</span>
        </p>

        <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} mb-6`}>
          We respect your privacy. This page explains what we collect, why we collect it, and how you stay in control.
        </p>
        <div className={`${isDark ? 'border-white/10' : 'border-gray-200'} border-b mb-8`}></div>

        <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Information We Collect</h2>
        <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 mb-8 space-y-2`}>
          <li>Account details (name, email) when you register</li>
          <li>Usage data to improve our services and security</li>
          <li>Optional location data for map and nearby features</li>
        </ul>

        <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>How We Use Data</h2>
        <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} mb-8`}>
          Personalisation, account security, fraud prevention, and platform analytics.
        </p>

        <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Rights</h2>
        <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 space-y-2`}>
          <li>Access, correct, or delete your data</li>
          <li>Export a copy of your data</li>
          <li>Opt out of marketing communications</li>
          <li>Request support via privacy@hamaestate.co.ke</li>
        </ul>
      </div>
    </section>
  );
};

export default Privacy;