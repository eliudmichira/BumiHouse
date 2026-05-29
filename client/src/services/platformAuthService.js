import { Capacitor } from '@capacitor/core';

export const platformAuthService = {
    /**
     * Triggers native Google Sign-In flow for Firebase (returns ID token)
     */
    async signInWithGoogle() {
        try {
            // Lazy load the standard plugin
            const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
            const result = await FirebaseAuthentication.signInWithGoogle({ mode: 'popup' });

            if (result.credential?.idToken) {
                return result.credential.idToken;
            } else {
                throw new Error('No ID token returned from Google Sign-In');
            }
        } catch (error) {
            console.error('[PlatformAuth] Google Sign-In failed:', error);
            throw error;
        }
    },

    /**
     * Helper to check if we are on a native platform
     */
    isNative() {
        return Capacitor.isNativePlatform();
    }
};
