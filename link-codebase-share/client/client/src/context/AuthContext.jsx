import React, { createContext, useContext, useState, useEffect } from "react";
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
import { agentVerificationAPI, messagesAPI } from "../lib/firebaseAPI";

const AuthContext = createContext();

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
      addToFavorites: () => {},
      removeFromFavorites: () => {},
      toggleFavorite: () => {},
      isFavorite: () => false,
      saveSearch: () => {},
      removeSavedSearch: () => {},
      updatePreferences: () => {},
      updateProfile: () => {},
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

  // Initialize context value with safe defaults
  const [contextValue, setContextValue] = useState({
    currentUser: null,
    loading: true,
    favorites: [],
    savedSearches: [],
    userPreferences: {
      notifications: true,
      emailAlerts: true,
      priceRange: { min: 0, max: 1000000 },
      preferredAreas: [],
      homeTypes: [],
    },
    signUp: () =>
      Promise.resolve({ success: false, error: "Auth not initialized" }),
    signIn: () =>
      Promise.resolve({ success: false, error: "Auth not initialized" }),
    signInWithGoogleAuth: () =>
      Promise.resolve({ success: false, error: "Auth not initialized" }),
    signOut: () => Promise.resolve(),
    addToFavorites: () => {},
    removeFromFavorites: () => {},
    toggleFavorite: () => {},
    isFavorite: () => false,
    saveSearch: () => {},
    removeSavedSearch: () => {},
    updatePreferences: () => {},
    updateProfile: () => {},
    getUserDisplayName: () => "Guest",
    getUserAvatar: () => "",
    getUserRole: () => "user",
    isVerifiedAgent: false,
    verificationStatus: 'unknown',
    checkAgentVerification: () => Promise.resolve(false),
    requestAgentVerification: () => Promise.resolve({ success: false }),
  });

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange( async(user) => {
      if (user && !user.emailVerified ) {
        
      }
      if (user) {
        // User is signed in
        const userData = {
          id: user.uid,
          email: user.email,
          username: user.displayName || user.email?.split("@")[0] || "User",
          name: user.displayName || user.email?.split("@")[0] || "User",
          phone: user.phoneNumber || "",
          avatar: user.photoURL || "",
          createdAt: user.metadata.creationTime,
          provider: user.providerData[0]?.providerId || "email",
          role: user.email === "admin@bogani.com" ? "admin" : "user",
        };
        setCurrentUser(userData);

        // Load user preferences from backend/localStorage
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
      } catch (_) {}
    };

    const handleVisibility = async () => {
      try {
        if (!currentUser?.id) return;
        if (document.visibilityState === 'visible') {
          await messagesAPI.updateUserOnlineStatus(currentUser.id, true);
        } else {
          await messagesAPI.updateUserOnlineStatus(currentUser.id, false);
        }
      } catch (_) {}
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

  // Refresh agent verification status when user changes
  useEffect(() => {
    if (currentUser?.id) {
      // For testing: Auto-verify blake11nicole as agent
      if (currentUser.email === "blake11nicole@gmail.com") {
        setIsVerifiedAgent(true);
        setVerificationStatus('verified');
        return;
      }
      
      // Fire and forget
      checkAgentVerification();
    }
  }, [currentUser?.id]);

  // Load user preferences from backend
  const loadUserPreferences = async (userId) => {
    try {
      // Simple check: if we're not on localhost, skip backend calls
      if (
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        // In production, just use localStorage
        loadFromLocalStorage();
        return;
      }

      // Only try backend on localhost
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      // const response = await fetch(
      //   `http://localhost:8800/api/users/${userId}/preferences`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     signal: controller.signal,
      //   }
      // );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
        setSavedSearches(data.savedSearches || []);
        setUserPreferences(data.preferences || userPreferences);
        return;
      }

      // Fallback to localStorage for production or when backend fails
      loadFromLocalStorage();
    } catch (error) {
      // Silently fallback to localStorage for any network errors
      loadFromLocalStorage();
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

  // Save user data to backend
  const saveUserDataToBackend = async (userData) => {
    // if (!currentUser) return;

    try {
      // Simple check: if we're not on localhost, skip backend calls
      if (
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        // In production, just use localStorage (data is already saved)
        return;
      }

      // Only try backend on localhost
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout     

      await registerUser(userData);

      clearTimeout(timeoutId)

      // const response = await fetch(
      //   `http://localhost:8800/api/users/${currentUser.id}/preferences`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       favorites,
      //       savedSearches,
      //       preferences: userPreferences,
      //     }),
      //     signal: controller.signal,
      //   }
      // );

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Silently fail - data is already saved to localStorage
      }
    } catch (error) {
      // Silently fail - data is already saved to localStorage
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
  const signUp = async (email, password) => {
    setLoading(true);

    try {
      const result = await signUpWithEmail(email, password);
      if (result.success) {
        // For development fallback, manually set the user
        if (result.user && !auth.currentUser) {
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
            role: result.user.email === "admin@bogani.com" ? "admin" : "user",
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
        // For development fallback, manually set the user
        if (result.user && !auth.currentUser) {
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
            role: result.user.email === "admin@bogani.com" ? "admin" : "user",
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
      const result = await signInWithGoogle();
      if (result.success) {
        // For development fallback, manually set the user
        if (result.user && !auth.currentUser) {
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
            role: result.user.email === "admin@bogani.com" ? "admin" : "user",
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
  const addToFavorites = (property) => {
    if (!currentUser) {
      throw new Error("You must be logged in to save favorites");
    }

    const isAlreadyFavorite = favorites.some((fav) => fav.id === property.id);
    if (!isAlreadyFavorite) {
      const newFavorite = {
        ...property,
        addedAt: new Date().toISOString(),
        userId: currentUser.id,
      };
      setFavorites((prev) => [...prev, newFavorite]);
    }
  };

  const removeFromFavorites = (propertyId) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== propertyId));
  };

  const toggleFavorite = (property) => {
    const isFavorite = favorites.some((fav) => fav.id === property.id);
    if (isFavorite) {
      removeFromFavorites(property.id);
    } else {
      addToFavorites(property);
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.some((fav) => fav.id === propertyId);
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
    // Check if user exists and has admin email
    if (!currentUser) return "user";

    // Check if user has admin role set
    if (currentUser.role === "admin") return "admin";

    // Check if user email matches admin email
    if (currentUser.email === "eddmichira@gmail.com") {
      return "admin";
    }

    // Grant admin access to the current user "Mich Michira" for development/testing
    if (
      currentUser.name === "Edd Michira" ||
      currentUser.username === "Edd Michira"
    ) {
      return "admin";
    }

    // For testing: Grant agent access to blake11nicole
    if (currentUser.email === "blake11nicole@gmail.com") {
      return "agent";
    }

    // Check if user is a verified agent
    if (isVerifiedAgent) {
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
        name: currentUser.name || currentUser.username
      });
      
      setVerificationStatus('pending');
      return result;
    } catch (error) {
      console.error('Error requesting agent verification:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user role in useEffect to avoid setState during render
  useEffect(() => {
    if (currentUser) {
      let shouldUpdate = false;
      let newRole = currentUser.role;

      // Check if user email matches admin email
      if (
        currentUser.email === "admin@bogani.com" &&
        currentUser.role !== "admin"
      ) {
        newRole = "admin";
        shouldUpdate = true;
      }

      // Grant admin access to the current user "Mich Michira" for development/testing
      if (
        (currentUser.name === "Mich Michira" ||
          currentUser.username === "Mich Michira") &&
        currentUser.role !== "admin"
      ) {
        newRole = "admin";
        shouldUpdate = true;
      }

      // For testing: Grant agent access to blake11nicole
      if (
        currentUser.email === "blake11nicole@gmail.com" &&
        currentUser.role !== "agent"
      ) {
        newRole = "agent";
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        const updatedUser = { ...currentUser, role: newRole };
        setCurrentUser(updatedUser);
      }
    }
  }, [currentUser]);

  // Safe wrapper for getUserRole to prevent undefined errors
  const safeGetUserRole = () => {
    try {
      return getUserRole();
    } catch (error) {
      return "user";
    }
  };

  // Create context value with safe defaults
  const createContextValue = () => {
    const newContextValue = {
      currentUser,
      loading,
      favorites,
      savedSearches,
      userPreferences,
      signUp:
        signUp ||
        (() =>
          Promise.resolve({ success: false, error: "Auth not initialized" })),
      signIn:
        signIn ||
        (() =>
          Promise.resolve({ success: false, error: "Auth not initialized" })),
      signInWithGoogleAuth:
        signInWithGoogleAuth ||
        (() =>
          Promise.resolve({ success: false, error: "Auth not initialized" })),
      signOut: signOut || (() => Promise.resolve()),
      addToFavorites: addToFavorites || (() => {}),
      removeFromFavorites: removeFromFavorites || (() => {}),
      toggleFavorite: toggleFavorite || (() => {}),
      isFavorite: isFavorite || (() => false),
      saveSearch: saveSearch || (() => {}),
      removeSavedSearch: removeSavedSearch || (() => {}),
      updatePreferences: updatePreferences || (() => {}),
      updateProfile: updateProfile || (() => {}),
      getUserDisplayName: getUserDisplayName || (() => "Guest"),
      getUserAvatar: getUserAvatar || (() => ""),
      getUserRole: getUserRole || (() => "user"),
      isVerifiedAgent,
      verificationStatus,
      checkAgentVerification,
      requestAgentVerification,
    };

    return newContextValue;
  };

  // Update context value whenever dependencies change
  useEffect(() => {
    const newValue = createContextValue();
    setContextValue(newValue);
  }, [currentUser, loading, favorites, savedSearches, userPreferences]);

  // Provide safe context value - always ensure it has all required functions
  const value = contextValue || createContextValue();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
