import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

const ROOT_ROUTES = new Set(['/', '/desktop']);

/**
 * Global hook to handle the Android hardware back button.
 * Should be placed high in the component tree, inside the Router.
 */
export const useBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathnameRef = useRef(location.pathname);

    useEffect(() => {
        console.log('[BACK-BUTTON-V4] Hook mounted in AppContent');
    }, []);

    // Keep the ref current on every render without re-registering the listener
    useEffect(() => {
        console.log('[BACK-BUTTON-V4] Path: ' + location.pathname);
        pathnameRef.current = location.pathname;
    }, [location.pathname]);

    useEffect(() => {
        console.log('[BACK-BUTTON-V4] Registering listener...');
        // addListener returns a Promise in Capacitor 3+
        const backListenerPromise = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            const isRootRoute = ROOT_ROUTES.has(pathnameRef.current);
            console.log('[BACK-BUTTON-V4] Event: canGoBack=' + canGoBack + ', path=' + pathnameRef.current + ', isRoot=' + isRootRoute);

            if (!canGoBack || isRootRoute) {
                console.log('[BACK-BUTTON-V4] Exiting app...');
                CapacitorApp.exitApp();
            } else {
                console.log('[BACK-BUTTON-V4] Navigating back...');
                navigate(-1);
            }
        });

        return () => {
            console.log('[BACK-BUTTON-V4] Cleaning up listener...');
            backListenerPromise.then(handle => {
                if (handle && handle.remove) {
                    handle.remove();
                    console.log('[BACK-BUTTON-V4] Successfully removed.');
                }
            }).catch(err => {
                console.error('[BACK-BUTTON-V4] Error removing', err);
            });
        };
    }, []); // navigate is stable, no need to re-run
};