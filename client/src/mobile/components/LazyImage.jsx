import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LazyImage = ({
    src,
    alt,
    className = '',
    containerClassName = '',
    blurhash,
    aspectRatio = '16/9',
    objectFit = 'cover',
    ...props
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [inView, setInView] = useState(false);
    const imgRef = useRef(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Start loading 50px before entering viewport
                threshold: 0.01,
            }
        );

        observer.observe(imgRef.current);

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${containerClassName}`}
            style={{ aspectRatio }}
        >
            <AnimatePresence mode="wait">
                {!loaded && !error && (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]"
                    />
                )}
            </AnimatePresence>

            {inView && (
                <motion.img
                    src={src}
                    alt={alt}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${className}`}
                    style={{ objectFit }}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={() => {
                        setError(true);
                        setLoaded(true);
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loaded && !error ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    {...props}
                />
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <svg
                            className="w-12 h-12 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="text-sm">Image not available</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LazyImage;
