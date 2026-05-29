import React from 'react';
import { FileText } from 'lucide-react';
import { useTheme } from '../src/context/ThemeContext';

const Terms: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <section className={`py-16 ${isDark ? 'bg-[#0a0c19]' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-[#51faaa]" />
          <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Terms of Service</h1>
        </div>
        <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} mb-8`}>
          By using Hama Estate, you agree to these terms. Please read them carefully.
        </p>

        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#10121e] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Use of Service</h2>
          <ul className={`${isDark ? 'text-white/70' : 'text-gray-700'} list-disc pl-5 space-y-2`}>
            <li>Do not misuse the platform or interfere with others.</li>
            <li>Provide accurate information when creating an account.</li>
            <li>Respect intellectual property rights.</li>
          </ul>
        </div>

        <div className={`rounded-2xl p-6 mt-6 ${isDark ? 'bg-[#10121e] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Liability</h2>
          <p className={`${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            We provide the service “as is” without warranties. We are not liable for indirect or incidental damages.
          </p>
        </div>

        <div className={`rounded-2xl p-6 mt-6 ${isDark ? 'bg-[#10121e] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Changes</h2>
          <p className={`${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            We may update these terms from time to time. Continued use means you accept the updated terms.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Terms;

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, AlertCircle } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-primaryRed mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-xl text-gray-300">
              Last updated: January 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Hama Estate website and services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2>2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials on Hama Estate's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>

              <h2>3. Product Information</h2>
              <p>
                We strive to provide accurate product information, including ingredients, nutritional facts, and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>

              <h2>4. Orders and Payment</h2>
              <p>
                All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Payment must be received before products are shipped.
              </p>

              <h2>5. Shipping and Delivery</h2>
              <p>
                Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or circumstances beyond our control.
              </p>

              <h2>6. Returns and Refunds</h2>
              <p>
                Due to the perishable nature of our products, returns are only accepted for damaged or defective items. Please contact us within 24 hours of delivery for any issues.
              </p>

              <h2>7. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices.
              </p>

              <h2>8. Disclaimer</h2>
              <p>
                The materials on Hama Estate's website are provided on an 'as is' basis. Hama Estate makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>

              <h2>9. Limitations</h2>
              <p>
                In no event shall Hama Estate or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Hama Estate's website.
              </p>

              <h2>10. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of Kenya and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>

              <h2>11. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <ul>
                <li>Email: legal@hamaestate.co.ke</li>
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

export default Terms;
