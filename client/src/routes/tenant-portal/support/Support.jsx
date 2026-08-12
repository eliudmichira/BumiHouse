import React from 'react';
import { motion } from 'framer-motion';

const Support = () => {
  return (
    <motion.div initial={{opacity:0, x:30}} animate={{opacity:1, x:0}} transition={{delay:.1}} className="p-6 rounded-3xl bg-white/80 border border-gray-200/50 shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-3">🧩 Support</h3>
      <p className="text-gray-600 mb-4">Need help with payments, maintenance, or your account?</p>
      <div className="flex gap-3">
        <button className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">Help Center</button>
        <button className="flex-1 py-3 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-bold rounded-xl">Contact Support</button>
      </div>
    </motion.div>
  );
};

export default Support;


