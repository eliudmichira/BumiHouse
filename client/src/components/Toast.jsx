import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, X, Info } from 'lucide-react';
import { createRoot } from 'react-dom/client';

const ToastContext = React.createContext(null);

let toastTimeout;

export const showToast = (message, type = 'success', duration = 3000) => {
    const event = new CustomEvent('show-toast', { detail: { message, type, duration } });
    window.dispatchEvent(event);
};

export const ToastContainer = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const handleToast = (event) => {
            const { message, type, duration } = event.detail;
            setToast({ message, type });

            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                setToast(null);
            }, duration);
        };

        window.addEventListener('show-toast', handleToast);
        return () => window.removeEventListener('show-toast', handleToast);
    }, []);

    if (!toast) return null;

    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[99999] transition-all duration-300 animate-in fade-in slide-in-from-top-4`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 ${toast.type === 'error' ? 'bg-red-500/90 text-white' :
                    toast.type === 'success' ? 'bg-emerald-500/90 text-white' :
                        'bg-blue-500/90 text-white'
                }`}>
                {toast.type === 'success' && <Check size={18} />}
                {toast.type === 'error' && <AlertCircle size={18} />}
                {toast.type === 'info' && <Info size={18} />}

                <span className="font-medium text-sm">{toast.message}</span>

                <button
                    onClick={() => setToast(null)}
                    className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};
