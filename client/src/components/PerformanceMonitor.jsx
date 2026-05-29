import { useEffect } from 'react';

const isDev = import.meta.env.DEV;

const PerformanceMonitor = () => {
  useEffect(() => {
    if (!isDev) return; // Only in development; avoid console noise in production
    // Track Core Web Vitals
    const trackWebVitals = () => {
      // Track LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Track FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log('FID:', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Track CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          console.log('CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Track FCP (First Contentful Paint)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log('FCP:', entry.startTime);
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      }
    };

    // Track resource loading performance
    const trackResourcePerformance = () => {
      if ('PerformanceObserver' in window) {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 1000) { // Log slow resources (>1s)
              console.warn('Slow resource:', {
                name: entry.name,
                duration: entry.duration,
                size: entry.transferSize
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      }
    };

    // Track long tasks
    const trackLongTasks = () => {
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime
            });
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      }
    };

    // Initialize performance tracking
    trackWebVitals();
    trackResourcePerformance();
    trackLongTasks();

    // Track page load time
    window.addEventListener('load', () => {
      const t = performance.timing;
      const loadTime = t.loadEventEnd > 0 && t.navigationStart >= 0
        ? Math.max(0, t.loadEventEnd - t.navigationStart)
        : 0;
      console.log('Page load time:', loadTime + 'ms');
    });

  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
