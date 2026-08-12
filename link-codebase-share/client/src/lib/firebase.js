import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration - Updated to use dwellmate project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dwellmate-285e8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dwellmate-285e8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dwellmate-285e8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "951413621891",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:951413621891:web:ab7a731b8db0e1a28687b6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JXTFE2L2T0"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('🔥 Firebase app already initialized');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize Firebase services with error handling
let auth, db, storage;
try {
  auth = getAuth(app);
  // Use initializeFirestore with long polling to avoid WebChannel 400s on some networks/dev
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
    ignoreUndefinedProperties: true
  });
  storage = getStorage(app, 'gs://dwellmate-285e8.firebasestorage.app');
  console.log('🔥 Firebase services initialized successfully');
} catch (error) {
  console.error('❌ Firebase services initialization failed:', error);
  throw error;
}

export { auth, db, storage };

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

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test Firestore connection
    const testDoc = await import('firebase/firestore').then(({ doc, getDoc }) => 
      getDoc(doc(db, 'test', 'connection'))
    );
    console.log('✅ Firestore connection successful');
    
    // Test Auth connection
    const authState = auth.currentUser;
    console.log('✅ Auth service connection successful');
    
    // Test Storage connection
    const storageRef = await import('firebase/storage').then(({ ref }) => 
      ref(storage, 'test/connection')
    );
    console.log('✅ Storage connection successful');
    
    return { success: true, message: 'All Firebase services connected successfully' };
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

export { analytics, googleProvider };
export default app;
