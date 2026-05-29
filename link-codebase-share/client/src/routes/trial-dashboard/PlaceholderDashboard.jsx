import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

const PlaceholderDashboard = ({ title, description, icon: Icon }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/trial-dashboard')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#111]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-12 border border-white/20 dark:border-gray-700/20 text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-[#111]" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title} Coming Soon!
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            This feature is currently being developed. In the full version of RentaKenya, 
            you'll have access to comprehensive {title.toLowerCase()} tools and analytics.
          </p>
          
          <div className="bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What to expect:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#51faaa] rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300">Real-time data and analytics</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#51faaa] rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300">Advanced filtering and search</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#51faaa] rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300">Automated workflows</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#51faaa] rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300">Mobile app integration</p>
              </div>
            </div>
          </div>
          
          <motion.button
            onClick={() => navigate('/trial-dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceholderDashboard;
