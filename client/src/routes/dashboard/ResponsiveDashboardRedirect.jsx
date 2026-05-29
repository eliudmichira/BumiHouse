import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from './dashboard';

const ResponsiveDashboardRedirect = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Dashboard />;
};

export default ResponsiveDashboardRedirect;
