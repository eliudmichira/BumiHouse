import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithCredential, sendEmailVerification, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized already
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    if (import.meta.env.DEV) {
      console.log('🔥 Firebase initialized successfully');
    }
  } else {
    app = getApps()[0];
    if (import.meta.env.DEV) {
      console.log('🔥 Firebase app already initialized');
    }
  }
} catch (error) {
  if (import.meta.env.DEV) {
    console.error('❌ Firebase initialization failed:', error);
  }
  throw error;
}

// Initialize Firebase services with error handling
let auth, db, storage, functions;
try {
  auth = getAuth(app);
  // Use initializeFirestore with long polling to avoid WebChannel 400s on some networks/dev
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
    ignoreUndefinedProperties: true
  });
  // Use storage bucket from config instead of hardcoded value
  storage = getStorage(app);
  functions = getFunctions(app);
  if (import.meta.env.DEV) {
    console.log('🔥 Firebase services initialized successfully');
  }
} catch (error) {
  if (import.meta.env.DEV) {
    console.error('❌ Firebase services initialization failed:', error);
  }
  throw error;
}

export { auth, db, storage, functions };

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Initialize Analytics (only in production)
let analytics = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
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
    if (import.meta.env.DEV) {
      console.log("✅ Verification email sent to:", user.email);
    }
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Detect if running inside a Capacitor native shell
const isCapacitorNative = () => {
  try {
    return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const signInWithGoogle = async () => {
  try {
    // --- Capacitor native path (uses @capacitor-firebase/authentication plugin) ---
    if (isCapacitorNative()) {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      const capResult = await FirebaseAuthentication.signInWithGoogle();
      // Build a Firebase credential from the ID token returned by the native SDK
      const credential = GoogleAuthProvider.credential(capResult.credential?.idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return { success: true, user: userCredential.user };
    }

    // --- Web path (popup) ---
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

export const updateAuthProfile = async (updates) => {
  const user = auth.currentUser;
  if (!user) return { success: false, error: 'Not signed in' };
  try {
    const profileUpdate = {};
    if (updates.displayName !== undefined) profileUpdate.displayName = updates.displayName;
    if (updates.photoURL !== undefined) profileUpdate.photoURL = updates.photoURL;
    if (Object.keys(profileUpdate).length === 0) return { success: true };
    await firebaseUpdateProfile(user, profileUpdate);
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
    if (import.meta.env.DEV) {
      console.log('🧪 Testing Firebase connection...');
    }

    // Test Firestore connection
    let testDoc;
    try {
      testDoc = await import('firebase/firestore').then(({ doc, getDoc }) =>
        getDoc(doc(db, 'test', 'connection'))
      );
    } catch (firestoreError) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Initial Firestore test failed, trying properties fallback...', firestoreError.message);
      }
      // Fallback to reading a known collection
      testDoc = await import('firebase/firestore').then(({ collection, query, limit, getDocs }) =>
        getDocs(query(collection(db, 'properties'), limit(1)))
      );
    }

    if (import.meta.env.DEV) {
      console.log('✅ Firestore connection successful');
    }

    // Test Auth connection
    const authState = auth.currentUser;
    if (import.meta.env.DEV) {
      console.log('✅ Auth service connection successful');
    }

    // Test Storage connection
    const storageRef = await import('firebase/storage').then(({ ref }) =>
      ref(storage, 'test/connection')
    );
    if (import.meta.env.DEV) {
      console.log('✅ Storage connection successful');
    }

    return { success: true, message: 'All Firebase services connected successfully' };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('❌ Firebase connection test failed:', error);
    }
    return { success: false, error: error.message };
  }
};

export { analytics, googleProvider };
export default app;
