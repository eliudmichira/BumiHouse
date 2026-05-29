import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  auth,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
} from "../lib/firebase";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "../utils/api";
import { agentVerificationAPI, messagesAPI, usersAPI } from "../lib/firebaseAPI";
import { platformAuthService } from '../services/platformAuthService';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const AuthContext = createContext();

// Centralized admin email list – single source of truth
const ADMIN_EMAILS = [
  "eddmichira@gmail.com",
  "eliudsamwels7@gmail.com",
  "admin@bogani.com",
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      currentUser: null,
      loading: false,
      favorites: [],
      savedSearches: [],
      userPreferences: {},
      signUp: () =>
        Promise.resolve({ success: false, error: "Auth not available" }),
      signIn: () =>
        Promise.resolve({ success: false, error: "Auth not available" }),
      signInWithGoogleAuth: () =>
        Promise.resolve({ success: false, error: "Auth not available" }),
      signOut: () => Promise.resolve(),
      addToFavorites: () => { },
      removeFromFavorites: () => { },
      toggleFavorite: () => { },
      isFavorite: () => false,
      saveSearch: () => { },
      removeSavedSearch: () => { },
      updatePreferences: () => { },
      updateProfile: () => { },
      getUserDisplayName: () => "Guest",
      getUserAvatar: () => "",
      getUserRole: () => "user",
    };
  }

  // Ensure getUserRole is always available
  const safeContext = {
    ...context,
    getUserRole: context.getUserRole || (() => "admin"),
  };

  return safeContext;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    notifications: true,
    emailAlerts: true,
    priceRange: { min: 0, max: 1000000 },
    preferredAreas: [],
    homeTypes: [],
  });
  const [isVerifiedAgent, setIsVerifiedAgent] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('unknown'); // 'unknown', 'pending', 'verified', 'rejected'

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        // User is signed in
        const basicUserData = {
          id: user.uid,
          email: user.email,
          username: user.displayName || user.email?.split("@")[0] || "User",
          name: user.displayName || user.email?.split("@")[0] || "User",
          phone: user.phoneNumber || "",
          avatar: user.photoURL || "",
          createdAt: user.metadata.creationTime,
          provider: user.providerData[0]?.providerId || "email",
          role: "user", // Default
        };

        try {
          // Try to get enriched profile from Firestore
          const profile = await usersAPI.getProfile(user.uid);
          // Always check agents collection: user may be a verified agent even if users doc has role "user"
          const isVerified = await agentVerificationAPI.isVerifiedAgent(user.uid);
          setIsVerifiedAgent(!!isVerified);
          setVerificationStatus(isVerified ? 'verified' : 'pending');

          const enrichedUserData = {
            ...profile,
            id: user.uid, // Ensure ID is preserved
            // Preserve Google avatar if Firestore profile has none
            avatar: profile?.avatar || basicUserData.avatar || "",
            // If verified in agents collection, treat as agent regardless of users.role
            ...(isVerified ? { role: 'agent' } : {})
          };
          setCurrentUser(enrichedUserData);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser(basicUserData);
        }

        // Ensure user data is in sync
        try {
          await saveUserDataToBackend(basicUserData);
        } catch (error) {
          console.error('Error creating user document:', error);
        }

        // Load user preferences
        loadUserPreferences(user.uid);
      } else {
        // User is signed out
        setCurrentUser(null);
        setFavorites([]);
        setSavedSearches([]);
        setIsVerifiedAgent(false);
        setVerificationStatus('unknown');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Presence: update online status regularly and on visibility changes
  useEffect(() => {
    let intervalId;
    const pingOnline = async () => {
      try {
        if (currentUser?.id) {
          await messagesAPI.updateUserOnlineStatus(currentUser.id, true);
        }
      } catch (_) { }
    };

    const handleVisibility = async () => {
      try {
        if (!currentUser?.id) return;
        if (document.visibilityState === 'visible') {
          await messagesAPI.updateUserOnlineStatus(currentUser.id, true);
        } else {
          await messagesAPI.updateUserOnlineStatus(currentUser.id, false);
        }
      } catch (_) { }
    };

    if (currentUser?.id) {
      // immediate ping and interval
      pingOnline();
      intervalId = setInterval(pingOnline, 30000);
      document.addEventListener('visibilitychange', handleVisibility);
      window.addEventListener('beforeunload', handleVisibility);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleVisibility);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    // Fire and forget
    checkAgentVerification();
  }, [currentUser?.id]);

  // Load user preferences from backend
  const loadUserPreferences = async (userId) => {
    try {
      // 1. Load Favorites from Firestore
      const { favorites: cloudFavs } = await usersAPI.getFavorites(userId).catch(() => ({ favorites: [] }));

      if (cloudFavs && cloudFavs.length > 0) {
        setFavorites(cloudFavs);
      } else {
        // Only attempt migration if cloud is empty
        await migrateFavoritesToCloud(userId);
      }

      // Simple check: if we're not on localhost, skip proprietary backend calls
      if (
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        // In production, just use localStorage for searches/preferences for now
        loadFromLocalStorage();
        return;
      }

      // Rest of preferences from local/proprietary backend
      loadFromLocalStorage();
    } catch (error) {
      console.error('Error loading user preferences:', error);
      loadFromLocalStorage();
    }
  };

  // One-time migration of local favorites to Firestore
  const migrateFavoritesToCloud = async (userId) => {
    try {
      const savedFavorites = localStorage.getItem("estate_favorites");
      if (savedFavorites) {
        const localFavs = JSON.parse(savedFavorites);
        if (localFavs.length > 0) {
          console.log('🔄 Migrating local favorites to Firestore...');
          // Use Promise.all for faster migration
          await Promise.all(localFavs.map(fav =>
            usersAPI.addToFavorites(userId, fav).catch(err => console.error('Migration error for item:', err))
          ));

          const { favorites: mergedFavs } = await usersAPI.getFavorites(userId);
          if (mergedFavs && mergedFavs.length > 0) {
            setFavorites(mergedFavs);
          }
        }
      }
    } catch (error) {
      console.error("Migration failed:", error);
    }
  };

  // Load from localStorage as fallback
  const loadFromLocalStorage = () => {
    try {
      const savedFavorites = localStorage.getItem("estate_favorites");
      const savedSearches = localStorage.getItem("estate_saved_searches");
      const savedPreferences = localStorage.getItem("estate_preferences");

      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      if (savedSearches) {
        setSavedSearches(JSON.parse(savedSearches));
      }
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error("Error loading user data from localStorage:", error);
    }
  };

  // Save user data to backend and localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      // Save to backend
      // Also save to localStorage as backup
      localStorage.setItem("estate_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("estate_user");
    }
  }, [currentUser]);

  const { mutate: registerUser, isLoading } = useMutation({
    mutationFn: (user) => createUser(user),

    onSuccess: () => {
      // console.log("User registered successfully");
    },

    onError: ({ response }) => {
      console.log(response?.data?.message || "Something went wrong");
    },
    onSettled: () => {
      console.log("Registration attempt finished");
    }
  });

  // Save user data to Firestore
  const saveUserDataToBackend = async (userData) => {
    try {
      // Import Firestore functions
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');

      // Create/update user document in Firestore
      const userRef = doc(db, 'users', userData.id);
      await setDoc(userRef, {
        ...userData,
        lastSeen: serverTimestamp(),
        isOnline: true,
        updatedAt: serverTimestamp()
      }, { merge: true }); // Use merge to avoid overwriting existing data

      console.log('✅ User document created/updated in Firestore');
    } catch (error) {
      console.error('❌ Error saving user to Firestore:', error);
      // Don't throw - we don't want to break auth flow
    }
  };

  useEffect(() => {
    localStorage.setItem("estate_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "estate_saved_searches",
      JSON.stringify(savedSearches)
    );
  }, [savedSearches]);

  useEffect(() => {
    localStorage.setItem("estate_preferences", JSON.stringify(userPreferences));
  }, [userPreferences]);

  // Authentication functions
  const signUp = async (email, password, additionalData = {}) => {
    setLoading(true);

    try {
      const result = await signUpWithEmail(email, password);
      if (result.success) {
        // Optimistically set the user to prevent navigation loops
        if (result.user && !currentUser) {
          const userData = {
            id: result.user.uid,
            email: result.user.email,
            username:
              result.user.displayName ||
              result.user.email?.split("@")[0] ||
              "User",
            name:
              additionalData.fullName || // Use provided name if available
              result.user.displayName ||
              result.user.email?.split("@")[0] ||
              "User",
            phone: additionalData.phone || result.user.phoneNumber || "", // Use provided phone
            avatar: result.user.photoURL || "",
            createdAt: result.user.metadata.creationTime,
            provider: result.user.providerData[0]?.providerId || "email",
            role: ADMIN_EMAILS.includes(result.user.email)
              ? "admin"
              : (additionalData.role || "user"), // Use provided role
            ...additionalData // Merge any other data
          };
          setCurrentUser(userData);
          saveUserDataToBackend(userData);

        }

        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);


      if (result.success) {
        // Optimistically set the user to prevent navigation loops
        if (result.user && !currentUser) {
          const userData = {
            id: result.user.uid,
            email: result.user.email,
            username:
              result.user.displayName ||
              result.user.email?.split("@")[0] ||
              "User",
            name:
              result.user.displayName ||
              result.user.email?.split("@")[0] ||
              "User",
            phone: result.user.phoneNumber || "",
            avatar: result.user.photoURL || "",
            createdAt: result.user.metadata.creationTime,
            provider: result.user.providerData[0]?.providerId || "email",
            role: ADMIN_EMAILS.includes(result.user.email) ? "admin" : "user",
          };
          setCurrentUser(userData);
        }
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleAuth = async () => {
    setLoading(true);
    try {
      let result;
      // Toggle handling between Native and Web
      const isNative = platformAuthService.isNative();
      console.log('SignInWithGoogleAuth: Platform check:', isNative ? 'Native' : 'Web');

      if (isNative) {
        // Native: Use Service -> Plugin
        try {
          const idToken = await platformAuthService.signInWithGoogle();
          const credential = GoogleAuthProvider.credential(idToken);
          // Sign in to Firebase with the credential
          const userCredential = await signInWithCredential(auth, credential);
          result = { success: true, user: userCredential.user };
        } catch (nativeError) {
          console.error('Native Google Sign-In failed:', nativeError);
          return { success: false, error: nativeError.message };
        }
      } else {
        // Web: Use standard popup
        result = await signInWithGoogle();
      }

      if (result.success) {
        // Optimistically set the user to prevent navigation loops
        if (result.user && !currentUser) {
          const userData = {
            id: result.user.uid,
            email: result.user.email,
            username:
              result.user.displayName ||
              result.user.email?.split("@")[0] ||
              "User",
            name:
              result.user.displayName ||
              result.user.email?.split("@")[0] ||
              "User",
            phone: result.user.phoneNumber || "",
            avatar: result.user.photoURL || "",
            createdAt: result.user.metadata.creationTime,
            provider: result.user.providerData[0]?.providerId || "google.com",
            role: ADMIN_EMAILS.includes(result.user.email) ? "admin" : "user",
          };
          setCurrentUser(userData);
          saveUserDataToBackend(userData);
        }
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('AuthContext: signInWithGoogleAuth Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      // User will be cleared by the auth state listener or manually for development
      setCurrentUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Favorites management
  const addToFavorites = async (property) => {
    if (!currentUser) {
      throw new Error("You must be logged in to save favorites");
    }

    const propertyId = property.id || property;
    const isAlreadyFavorite = favorites.some((fav) => fav.id === propertyId);

    if (!isAlreadyFavorite) {
      const newFavorite = {
        ...property,
        addedAt: new Date().toISOString(),
        userId: currentUser.id,
      };

      // Optimistic Update
      setFavorites((prev) => [...prev, newFavorite]);

      // Cloud Persistence
      try {
        await usersAPI.addToFavorites(currentUser.id, property);
      } catch (error) {
        console.error("Failed to sync favorite to cloud:", error);
        // Rollback on failure if critical, but for UX we can keep it local
      }
    }
  };

  const removeFromFavorites = async (propertyId) => {
    if (!currentUser) return;

    // Optimistic Update
    setFavorites((prev) => prev.filter((fav) => fav.id !== propertyId));

    // Cloud Persistence
    try {
      await usersAPI.removeFromFavorites(currentUser.id, propertyId);
    } catch (error) {
      console.error("Failed to remove favorite from cloud:", error);
    }
  };

  const toggleFavorite = async (property) => {
    const propertyId = property.id || property;
    const isFav = favorites.some((fav) => fav.id === propertyId);
    if (isFav) {
      await removeFromFavorites(propertyId);
    } else {
      await addToFavorites(property);
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.some((fav) => (fav.id === propertyId || fav.propertyId === propertyId));
  };

  // Saved searches management
  const saveSearch = (searchCriteria) => {
    if (!currentUser) {
      throw new Error("You must be logged in to save searches");
    }

    const newSearch = {
      id: Date.now().toString(),
      ...searchCriteria,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
    };

    setSavedSearches((prev) => [newSearch, ...prev.slice(0, 9)]); // Keep only 10 searches
  };

  const removeSavedSearch = (searchId) => {
    setSavedSearches((prev) => prev.filter((search) => search.id !== searchId));
  };

  // User preferences management
  const updatePreferences = (newPreferences) => {
    setUserPreferences((prev) => ({ ...prev, ...newPreferences }));
  };

  const updateProfile = (profileData) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...profileData };
    setCurrentUser(updatedUser);
  };

  // Helper functions for user display
  const getUserDisplayName = () => {
    if (!currentUser) return "Guest";
    return currentUser.name || currentUser.username || "User";
  };

  const getUserAvatar = () => {
    if (!currentUser) return "";
    return currentUser.avatar || "";
  };

  const getUserRole = () => {
    if (!currentUser) return "user";

    // Allow override for specific emails if not set in DB
    if (ADMIN_EMAILS.includes(currentUser.email)) {
      return "admin";
    }

    // Check if user is a verified agent
    if (isVerifiedAgent || currentUser.role === 'agent') {
      return "agent";
    }

    return currentUser.role || "user";
  };

  // Check agent verification status
  const checkAgentVerification = async () => {
    if (!currentUser?.id) return false;

    try {
      const isVerified = await agentVerificationAPI.isVerifiedAgent(currentUser.id);
      setIsVerifiedAgent(isVerified);
      setVerificationStatus(isVerified ? 'verified' : 'pending');
      return isVerified;
    } catch (error) {
      console.error('Error checking agent verification:', error);
      return false;
    }
  };

  // Request agent verification
  const requestAgentVerification = async (agentData) => {
    if (!currentUser?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await agentVerificationAPI.requestVerification(currentUser.id, {
        ...agentData,
        userId: currentUser.id,
        email: currentUser.email,
        name: currentUser.name || currentUser.username || agentData.fullName
      });

      if (result.success) {
        setVerificationStatus('pending');
      }

      return result;
    } catch (error) {
      console.error('Error requesting agent verification:', error);
      return { success: false, error: error.message };
    }
  };



  // Safe wrapper for getUserRole to prevent undefined errors
  const safeGetUserRole = () => {
    try {
      return getUserRole();
    } catch (error) {
      return "user";
    }
  };

  // Conversations state
  const [conversations, setConversations] = useState([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Subscribe to conversations when user is logged in
  useEffect(() => {
    let unsubscribe = () => { };

    if (currentUser?.id) {
      try {
        unsubscribe = messagesAPI.subscribeToConversations(
          currentUser.id,
          (newConversations) => {
            setConversations(newConversations);

            // Calculate unread count
            const count = newConversations.reduce((acc, conv) => {
              return acc + (conv.unreadCount || 0);
            }, 0);
            setUnreadMessagesCount(count);
          },
          (error) => {
            console.error("Error subscribing to conversations:", error);
          }
        );
      } catch (error) {
        console.error("Failed to setup conversation subscription:", error);
      }
    } else {
      setConversations([]);
      setUnreadMessagesCount(0);
    }

    return () => unsubscribe();
  }, [currentUser?.id]);

  // Build context value with useMemo to avoid stale closures
  const value = useMemo(() => ({
    currentUser,
    loading,
    favorites,
    savedSearches,
    userPreferences,
    conversations,
    unreadMessagesCount,
    signUp,
    signIn,
    signInWithGoogleAuth,
    signOut,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    saveSearch,
    removeSavedSearch,
    updatePreferences,
    updateProfile,
    getUserDisplayName,
    getUserAvatar,
    getUserRole,
    isVerifiedAgent,
    verificationStatus,
    checkAgentVerification,
    requestAgentVerification,
  }), [currentUser, loading, favorites, savedSearches, userPreferences, isVerifiedAgent, verificationStatus, conversations, unreadMessagesCount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
