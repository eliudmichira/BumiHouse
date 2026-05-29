import React from 'react';
import { Shield } from 'lucide-react';
import { useTheme } from '../src/context/ThemeContext';

const Privacy: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <section className={`py-16 ${isDark ? 'bg-[#0a0c19]' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-[#51faaa]" />
          <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Privacy Policy</h1>
        </div>
        <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} mb-8`}>
          Your privacy matters. This policy explains what information we collect, how we use it, and your rights.
        </p>

        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#10121e] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Information We Collect</h2>
          <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 space-y-2`}>
            <li>Account details (name, email) when you register</li>
            <li>Usage data for improving our services</li>
            <li>Optional location data for map features</li>
          </ul>
        </div>

        <div className={`rounded-2xl p-6 mt-6 ${isDark ? 'bg-[#10121e] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>How We Use Data</h2>
          <p className={`${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            We use data to personalise recommendations, secure your account, and improve platform performance.
          </p>
        </div>

        <div className={`rounded-2xl p-6 mt-6 ${isDark ? 'bg-[#10121e] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Rights</h2>
          <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 space-y-2`}>
            <li>Access, correct, or delete your data</li>
            <li>Opt out of marketing communications</li>
            <li>Contact us at privacy@hamaestate.co.ke for requests</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Privacy;

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-accentGreen mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-xl text-gray-300">
              Last updated: January 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2>1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include:
              </p>
              <ul>
                <li>Name, email address, and contact information</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely by our payment providers)</li>
                <li>Order history and preferences</li>
                <li>Communications with our customer service team</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Provide customer support</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties except:
              </p>
              <ul>
                <li>To service providers who assist us in operating our business</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
                <li>With your explicit consent</li>
              </ul>

              <h2>4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>

              <h2>5. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.
              </p>

              <h2>6. Your Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>

              <h2>7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
              </p>

              <h2>8. Children's Privacy</h2>
              <p>
                Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
              </p>

              <h2>9. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than Kenya. We ensure appropriate safeguards are in place to protect your data during such transfers.
              </p>

              <h2>10. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2>11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <ul>
                <li>Email: privacy@hamaestate.co.ke</li>
                <li>Phone: +254 700 123 456</li>
                <li>Address: Kiambaa, Central Kenya</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
