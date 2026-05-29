import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "makao-648bd.firebaseapp.com",
  projectId: "makao-648bd",
  storageBucket: "makao-648bd.firebasestorage.app",
  messagingSenderId: "142667530803",
  appId: "1:142667530803:web:d635acdf583356dda21946",
  measurementId: "G-QSSV2V096Q"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app, 'gs://makao-648bd.firebasestorage.app');

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Initialize Analytics (only in production)
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}

// Authentication functions
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await userCredential.user.reload();

    if (!userCredential.user.emailVerified) {
      await auth.signOut();
      throw new Error("Please verify your email to proceed.");
    }

    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await sendEmailVerification(user);
    console.log("✅ Verification email sent to:", user.email);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    if (error.code === 'auth/popup-blocked') {
      return { 
        success: false, 
        error: 'Popup was blocked. Please allow popups for this site and try again.' 
      };
    } else if (error.code === 'auth/popup-closed-by-user') {
      return { 
        success: false, 
        error: 'Sign-in was cancelled. Please try again.' 
      };
    } else if (error.code === 'auth/cancelled-popup-request') {
      return { 
        success: false, 
        error: 'Multiple sign-in attempts detected. Please wait a moment and try again.' 
      };
    }
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { analytics, googleProvider };
export default app;
