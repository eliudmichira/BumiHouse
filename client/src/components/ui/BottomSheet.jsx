import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomSheet = ({
    isOpen,
    onClose,
    children,
    snapPoints = ['50%'],
    initialSnap = 0
}) => {
    // Simple implementation for now, can be enhanced with use-drag-controls later if needed
    // Using Framer Motion for smooth transitions

    // If not open, don't render (or use AnimatePresence logic)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        style={{ height: snapPoints[initialSnap] || 'auto' }}
                    >
                        {/* Handle bar */}
                        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-4 pb-8">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;
