import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './firebase';
import { getCountyFromCoords, getGeohash } from '../utils/locationUtils';

// Dev-only logger — keeps the production console clean. console.error/warn are left intact.
const devLog = (...args) => { if (import.meta.env.DEV) console.log(...args); };

// Properties API
export const propertiesAPI = {
  // Get all properties with pagination and filters
  getAll: async (params = {}) => {
    try {
      devLog('🏠 Fetching properties from Firestore...');

      const {
        page = 1,
        limit: pageSize = 500,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        location, // Standard search
        county,    // New: County-based filter
        geohash,   // New: Geohash-based filter
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;

      let q = collection(db, 'properties');
      const constraints = [];

      // Add filters
      if (propertyType) {
        constraints.push(where('type', '==', propertyType));
      }
      if (minPrice) {
        constraints.push(where('price', '>=', minPrice));
      }
      if (maxPrice) {
        constraints.push(where('price', '<=', maxPrice));
      }
      if (bedrooms) {
        constraints.push(where('bedrooms', '>=', bedrooms));
      }
      // Avoid combining county + geohash range — that requires a composite
      // Firestore index. If both are present, query only by county and filter
      // geohash client-side after the docs come back.
      const geohashPrefix = geohash ? geohash.substring(0, 5) : null;
      const filterGeohashClientSide = !!(county && geohashPrefix);

      if (county) {
        constraints.push(where('county', '==', county));
      }
      if (geohashPrefix && !filterGeohashClientSide) {
        constraints.push(where('geohash', '>=', geohashPrefix));
        constraints.push(where('geohash', '<=', geohashPrefix + '\uf8ff'));
      }
      if (location && !county) { // Only use generic city search if county is not provided
        constraints.push(where('location.city', '==', location));
      }

      // Add pagination — skip orderBy to avoid excluding docs without createdAt
      constraints.push(limit(pageSize));

      let querySnapshot = await getDocs(query(q, ...constraints));

      // If very few results and no filters applied, retry without any constraints (get all)
      if (querySnapshot.size < 5 && constraints.length === 1) {
        querySnapshot = await getDocs(collection(db, 'properties'));
      }
      const properties = [];

      devLog('📊 Firestore query result:', {
        size: querySnapshot.size,
        empty: querySnapshot.empty,
        hasDocs: querySnapshot.docs.length > 0
      });

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        properties.push({
          id: doc.id,
          ...data
        });
      });

      // Client-side geohash narrowing when we skipped it in the query to
      // avoid the composite index requirement.
      if (filterGeohashClientSide) {
        const before = properties.length;
        for (let i = properties.length - 1; i >= 0; i--) {
          const gh = properties[i].geohash;
          if (typeof gh !== 'string' || !gh.startsWith(geohashPrefix)) {
            properties.splice(i, 1);
          }
        }
        devLog(`📍 Geohash filtered client-side: ${before} → ${properties.length}`);
      }

      // Sort manually if orderBy failed
      if (properties.length > 0 && sortBy === 'createdAt') {
        properties.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
        });
      }

      devLog('✅ Properties fetched successfully:', {
        count: properties.length,
        firstProperty: properties[0] ? properties[0].title || properties[0].name : 'No properties'
      });

      return {
        properties,
        pagination: {
          page,
          limit: pageSize,
          total: properties.length,
          pages: Math.ceil(properties.length / pageSize)
        }
      };
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
      console.error('🔍 Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      // Fallback: try without any constraints if the above fails
      try {
        devLog('🔄 Trying fallback query without any constraints...');
        const querySnapshot = await getDocs(collection(db, 'properties'));
        const properties = [];

        devLog('📊 Fallback query result:', {
          size: querySnapshot.size,
          empty: querySnapshot.empty
        });

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          properties.push({
            id: doc.id,
            ...data
          });
        });

        // Sort manually
        properties.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return bTime - aTime;
        });

        devLog('✅ Fallback query successful:', {
          count: properties.length
        });

        return {
          properties,
          pagination: {
            page: 1,
            limit: properties.length,
            total: properties.length,
            pages: 1
          }
        };
      } catch (fallbackError) {
        console.error('❌ Fallback query also failed:', fallbackError);

        // Return empty result instead of throwing to prevent app crash
        devLog('🔄 Returning empty properties array to prevent app crash');
        return {
          properties: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            pages: 0
          }
        };
      }
    }
  },

  // Get featured properties
  getFeatured: async (limitCount = 6) => {
    try {
      devLog('Fetching featured properties...');

      // Try to get featured properties first
      let properties = [];
      try {
        const q = query(
          collection(db, 'properties'),
          where('featured', '==', true),
          limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        devLog('Featured properties query result:', querySnapshot.size, 'documents found');

        querySnapshot.forEach((doc) => {
          properties.push({
            id: doc.id,
            ...doc.data()
          });
        });
      } catch (featuredError) {
        devLog('Featured properties query failed, trying fallback:', featuredError.message);
      }

      // Top up with regular listings whenever there are fewer featured than requested,
      // so the carousel always shows a full row (featured first, padded with others).
      if (properties.length < limitCount) {
        const existingIds = new Set(properties.map((p) => p.id));

        const addUntilFull = (snapshot) => {
          snapshot.forEach((doc) => {
            if (properties.length >= limitCount) return;
            if (existingIds.has(doc.id)) return;
            existingIds.add(doc.id);
            properties.push({ id: doc.id, ...doc.data() });
          });
        };

        devLog(`Only ${properties.length} featured; topping up to ${limitCount} with regular listings...`);
        try {
          // Fetch extra to cover any overlap with the featured set before deduping.
          const fallbackQuery = query(
            collection(db, 'properties'),
            limit(limitCount + properties.length)
          );

          const fallbackSnapshot = await getDocs(fallbackQuery);
          devLog('Fallback properties query result:', fallbackSnapshot.size, 'documents found');
          addUntilFull(fallbackSnapshot);
        } catch (fallbackError) {
          devLog('Fallback query failed, trying basic collection query:', fallbackError.message);
          // Last resort: get all properties without any query constraints
          const allSnapshot = await getDocs(collection(db, 'properties'));
          devLog('Basic collection query result:', allSnapshot.size, 'documents found');
          addUntilFull(allSnapshot);
        }
      }

      // Sort featured first, then newest first within each group.
      if (properties.length > 0) {
        properties.sort((a, b) => {
          const aFeatured = (a.featured || a.is_featured) ? 1 : 0;
          const bFeatured = (b.featured || b.is_featured) ? 1 : 0;
          if (aFeatured !== bFeatured) return bFeatured - aFeatured;

          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return bTime - aTime;
        });
      }

      devLog('Total properties to return:', properties.length);
      return { properties };
    } catch (error) {
      console.error('Error fetching featured properties:', error);

      // Return empty array if Firestore is not set up yet
      if (error.code === 'failed-precondition' || error.message.includes('400')) {
        devLog('Firestore not set up yet, returning empty properties array');
        return { properties: [] };
      }

      throw error;
    }
  },

  // Get property by ID
  getById: async (id) => {
    try {
      const docRef = doc(db, 'properties', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Property not found');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  // Create new property
  create: async (propertyData) => {
    try {
      // Auto-enrich with county and geohash if coordinates exist
      const enrichedData = { ...propertyData };
      const coords = propertyData.location?.coordinates || propertyData.coordinates || propertyData.location;

      if (coords && coords.lat && coords.lng) {
        const lat = parseFloat(coords.lat);
        const lng = parseFloat(coords.lng);

        if (!enrichedData.county) {
          const county = getCountyFromCoords(lat, lng);
          if (county) enrichedData.county = county.name || county;
        }

        if (!enrichedData.geohash) {
          enrichedData.geohash = getGeohash(lat, lng);
        }
      }

      const docRef = await addDoc(collection(db, 'properties'), {
        ...enrichedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...enrichedData
      };
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Update property
  update: async (id, propertyData) => {
    try {
      // Auto-enrich with county and geohash if coordinates exist
      const enrichedData = { ...propertyData };
      const coords = propertyData.location?.coordinates || propertyData.coordinates || propertyData.location;

      if (coords && coords.lat && coords.lng) {
        const lat = parseFloat(coords.lat);
        const lng = parseFloat(coords.lng);

        if (!enrichedData.county) {
          const county = getCountyFromCoords(lat, lng);
          if (county) enrichedData.county = county.name || county;
        }

        if (!enrichedData.geohash) {
          enrichedData.geohash = getGeohash(lat, lng);
        }
      }

      const docRef = doc(db, 'properties', id);
      await updateDoc(docRef, {
        ...enrichedData,
        updatedAt: serverTimestamp()
      });

      return { id, ...enrichedData };
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  // Delete property
  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'properties', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // Search properties
  search: async (searchTerm) => {
    try {
      const q = query(
        collection(db, 'properties'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);
      const properties = [];

      querySnapshot.forEach((doc) => {
        properties.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { properties };
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }
};

// Users API
export const usersAPI = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        // If user document doesn't exist, create a basic one
        await setDoc(docRef, {
          email: auth.currentUser.email,
          username: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
          avatar: auth.currentUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        const newDocSnap = await getDoc(docRef);
        return {
          id: newDocSnap.id,
          ...newDocSnap.data()
        };
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });

      return { id: userId, ...userData };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Get user favorites
  getFavorites: async (userId) => {
    try {
      const q = query(
        collection(db, 'users', userId, 'favorites')
      );

      const querySnapshot = await getDocs(q);
      const favorites = [];

      querySnapshot.forEach((doc) => {
        favorites.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { favorites };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Add to favorites
  addToFavorites: async (userId, property) => {
    try {
      const propertyId = property.id || property;
      const propertyData = typeof property === 'object' ? property : { id: propertyId };

      const docRef = doc(db, 'users', userId, 'favorites', propertyId);
      await setDoc(docRef, {
        ...propertyData,
        propertyId,
        addedAt: serverTimestamp()
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  // Remove from favorites
  removeFromFavorites: async (userId, favoriteId) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'favorites', favoriteId));
      return { success: true };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }
};

// Storage API
export const storageAPI = {
  // Upload image
  uploadImage: async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const metadata = {
        contentType: file?.type || 'image/jpeg',
        cacheControl: 'public, max-age=31536000'
      };

      devLog('🔄 Uploading image to path:', path);
      devLog('📁 File details:', { name: file.name, size: file.size, type: file.type });

      const snapshot = await uploadBytes(storageRef, file, metadata);
      devLog('✅ Upload successful, getting download URL...');

      const downloadURL = await getDownloadURL(snapshot.ref);
      devLog('🔗 Download URL obtained:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading image:', error);

      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('You do not have permission to upload files. Please make sure you are logged in.');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Upload was canceled. Please try again.');
      } else if (error.code === 'storage/unknown') {
        throw new Error('An unknown error occurred during upload. This might be a CORS issue. Please contact support.');
      } else if (error.message.includes('CORS')) {
        throw new Error('CORS error: The storage bucket needs to be configured to allow uploads from this domain. Please contact the administrator.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
  },

  // Delete image
  deleteImage: async (path) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
};

// Agents API
export const agentsAPI = {
  // Get all agents
  getAll: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'agents'));
      const agents = [];

      querySnapshot.forEach((doc) => {
        agents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { agents };
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  // Get verified agents only
  getVerified: async () => {
    try {
      const q = query(
        collection(db, 'agents'),
        where('verified', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const agents = [];

      querySnapshot.forEach((doc) => {
        agents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { agents };
    } catch (error) {
      console.error('Error fetching verified agents:', error);
      throw error;
    }
  },

  // Get agent by ID
  getById: async (id) => {
    try {
      const docRef = doc(db, 'agents', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Agent not found');
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  },

  // Create or update agent
  createOrUpdate: async (agentData) => {
    try {
      // Validate that agentData.id exists
      if (!agentData || !agentData.id) {
        throw new Error('Agent ID is required for creating/updating agent');
      }

      const docRef = doc(db, 'agents', agentData.id);
      await setDoc(docRef, {
        ...agentData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return { id: agentData.id, ...agentData };
    } catch (error) {
      console.error('Error creating/updating agent:', error);
      throw error;
    }
  }
};

// Agent Verification API
export const agentVerificationAPI = {
  // Check if user is a verified agent
  isVerifiedAgent: async (userId) => {
    try {
      if (!userId) return false;

      const docRef = doc(db, 'agents', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const agentData = docSnap.data();
        return agentData.verified === true;
      }
      return false;
    } catch (error) {
      console.error('Error checking agent verification:', error);
      return false;
    }
  },

  // Request agent verification
  requestVerification: async (userId, agentData) => {
    try {
      if (!userId) {
        throw new Error('User ID is required for verification request');
      }

      const docRef = doc(db, 'agents', userId);
      const verificationData = {
        ...agentData,
        verified: false,
        verificationRequested: true,
        verificationRequestedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, verificationData, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error requesting agent verification:', error);
      throw error;
    }
  },

  // Update agent verification status (admin only)
  updateVerificationStatus: async (userId, verified, adminNotes = '') => {
    try {
      const docRef = doc(db, 'agents', userId);
      await updateDoc(docRef, {
        verified,
        verifiedAt: verified ? serverTimestamp() : null,
        adminNotes,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating agent verification:', error);
      throw error;
    }
  }
};

// Messages API
export const messagesAPI = {
  // Get conversations for a user with real-time subscription
  subscribeToConversations: (userId, onUpdate, onError) => {
    try {
      if (!userId) {
        onUpdate([]);
        return () => { };
      }

      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc'),
        limit(50)
      );

      return onSnapshot(q, async (snapshot) => {
        const docs = snapshot.docs;
        const conversations = await Promise.all(docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const otherParticipantId = data.participants?.find(id => id !== userId);
          let user = null;
          let property = null;
          const [userDoc, propertyDoc] = await Promise.all([
            otherParticipantId ? getDoc(doc(db, 'users', otherParticipantId)).catch(() => null) : null,
            data.propertyId ? getDoc(doc(db, 'properties', data.propertyId)).catch(() => null) : null
          ]);
          if (userDoc?.exists()) user = { id: userDoc.id, ...userDoc.data() };
          if (propertyDoc?.exists()) property = { id: propertyDoc.id, ...propertyDoc.data() };
          return { id: docSnapshot.id, ...data, user, property };
        }));
        onUpdate(conversations);
      }, (err) => {
        console.error('Real-time conversation error:', err);
        if (onError) onError(err);
      });
    } catch (error) {
      console.error('Error setting up conversation subscription:', error);
      if (onError) onError(error);
      return () => { };
    }
  },

  // Get conversations for a user (legacy/one-time)
  getConversations: async (userId) => {
    try {
      if (!userId) return { conversations: [] };
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const conversations = await Promise.all(docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const otherParticipantId = data.participants?.find(id => id !== userId);
        const [userDoc, propertyDoc] = await Promise.all([
          otherParticipantId ? getDoc(doc(db, 'users', otherParticipantId)).catch(() => null) : null,
          data.propertyId ? getDoc(doc(db, 'properties', data.propertyId)).catch(() => null) : null
        ]);
        const user = userDoc?.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
        const property = propertyDoc?.exists() ? { id: propertyDoc.id, ...propertyDoc.data() } : null;
        return { id: docSnapshot.id, ...data, user, property };
      }));
      return { conversations };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get messages with real-time subscription and pagination
  subscribeToMessages: (conversationId, onUpdate, onError, limitCount = 50) => {
    try {
      const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );

      return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        onUpdate(messages);
      }, (err) => {
        console.error('Real-time messages error:', err);
        if (onError) onError(err);
      });
    } catch (error) {
      console.error('Error setting up message subscription:', error);
      if (onError) onError(error);
      return () => { };
    }
  },

  // Get messages for a conversation (legacy/one-time)
  getMessages: async (conversationId) => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'conversations', conversationId, 'messages'),
          orderBy('timestamp', 'asc')
        )
      );
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      return { messages };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (conversationId, messageData) => {
    try {
      if (!messageData.senderId || !messageData.text) {
        throw new Error('senderId and text are required');
      }
      const messageRef = collection(db, 'conversations', conversationId, 'messages');
      const messageDoc = await addDoc(messageRef, {
        ...messageData,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: messageData.text,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: messageData.senderId
      });
      return { id: messageDoc.id, ...messageData, timestamp: new Date(), status: 'sent' };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Create a new conversation
  createConversation: async (participants, propertyId) => {
    try {
      const conversationRef = collection(db, 'conversations');
      const validParticipants = participants.filter(p => p != null);
      if (validParticipants.length === 0) throw new Error('No valid participants');
      const conversationData = {
        participants: validParticipants,
        createdBy: validParticipants[0],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: null,
        lastMessageSender: null
      };
      if (propertyId) conversationData.propertyId = propertyId;
      const docRef = await addDoc(conversationRef, conversationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Get user details
  getUserDetails: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) return { id: userDoc.id, ...userDoc.data() };
      return null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId, userId) => {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const unreadMessages = query(
        messagesRef,
        where('senderId', '!=', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(unreadMessages);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true, readAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // Alias for logic clarity
  markConversationAsRead: async (conversationId, userId) => {
    return messagesAPI.markAsRead(conversationId, userId);
  },

  // Update user online status
  updateUserOnlineStatus: async (userId, isOnline) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }
};

// Account Dashboard API
export const accountDashboardAPI = {
  // Get user's properties (Optimized)
  getUserProperties: async (userId) => {
    if (!userId) return [];
    try {
      // Prioritize the direct userId lookup as it's the modern standard
      const q = query(
        collection(db, 'properties'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (err) {
        // Fallback to non-ordered if index is missing
        const qFall = query(collection(db, 'properties'), where('userId', '==', userId));
        querySnapshot = await getDocs(qFall);
      }

      let properties = [];
      querySnapshot.forEach(doc => properties.push({ id: doc.id, ...doc.data() }));

      // If nothing found by userId, check legacy agent.id field
      if (properties.length === 0) {
        const qLegacy = query(collection(db, 'properties'), where('agent.id', '==', userId));
        const legacySnap = await getDocs(qLegacy);
        legacySnap.forEach(doc => properties.push({ id: doc.id, ...doc.data() }));
      }

      // Final sort in memory to ensure consistency across fallbacks
      return properties.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
        const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  },

  // Get user's favorites
  getUserFavorites: async (userId) => {
    try {
      // First try with ordering
      const q = query(
        collection(db, 'users', userId, 'favorites'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const favorites = [];

      querySnapshot.forEach((doc) => {
        favorites.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return favorites;
    } catch (error) {
      console.error('Error fetching user favorites with ordering:', error);

      // Fallback: try without ordering if index doesn't exist
      try {
        const q = query(collection(db, 'users', userId, 'favorites'));

        const querySnapshot = await getDocs(q);
        const favorites = [];

        querySnapshot.forEach((doc) => {
          favorites.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Sort manually in JavaScript
        favorites.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return bTime - aTime;
        });

        return favorites;
      } catch (fallbackError) {
        console.error('Error fetching user favorites (fallback):', fallbackError);
        return [];
      }
    }
  },

  // Get user's bookings/appointments
  getUserBookings: async (userId) => {
    try {
      // First try with ordering
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bookings = [];

      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings with ordering:', error);

      // Fallback: try without ordering if index doesn't exist
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const bookings = [];

        querySnapshot.forEach((doc) => {
          bookings.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Sort manually in JavaScript
        bookings.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return bTime - aTime;
        });

        return bookings;
      } catch (fallbackError) {
        console.error('Error fetching user bookings (fallback):', fallbackError);
        return [];
      }
    }
  },

  // Create a new viewing booking
  createBooking: async (bookingData) => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...bookingData };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get agent's bookings
  getAgentBookings: async (agentId) => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('agentId', '==', agentId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching agent bookings:', error);
      // Fallback without order
      try {
        const q = query(collection(db, 'bookings'), where('agentId', '==', agentId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return [];
      }
    }
  },

  // Get agent's inquiries (Optimized)
  getAgentInquiries: async (agentId) => {
    if (!agentId) return [];
    try {
      const q = query(
        collection(db, 'inquiries'),
        where('agentId', '==', agentId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const inquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch conversations to find new inquiries from chats
      const convQ = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', agentId),
        limit(50)
      );
      const convSnap = await getDocs(convQ);
      const conversations = convSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const newConvs = conversations.filter(c => !inquiries.some(inq => inq.conversationId === c.id));

      if (newConvs.length > 0) {
        // ... (enrichment logic could go here if needed)
      }

      return inquiries;
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      return [];
    }
  },

  // Get agent performance analytics
  getAgentAnalytics: async (agentId) => {
    if (!agentId) return null;
    try {
      const properties = await accountDashboardAPI.getUserProperties(agentId);
      const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
      const inquiries = await accountDashboardAPI.getAgentInquiries(agentId);

      return {
        totalViews,
        totalInquiries: inquiries.length,
        totalRevenue: properties.reduce((sum, p) => sum + (p.price || 0), 0),
        averageRating: 4.5,
        conversionRate: totalViews > 0 ? Math.round((inquiries.length / totalViews) * 100) : 0,
        properties: properties.length
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  },

  // Get user's view history with full property details
  getUserViewHistory: async (userId) => {
    try {
      const q = query(
        collection(db, 'pageViews'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(8)
      );
      const snapshot = await getDocs(q);
      const views = snapshot.docs.map(doc => doc.data());
      
      if (views.length === 0) return [];

      // Extract unique property IDs from page views
      const propertyIds = [...new Set(views
        .filter(v => v.page && v.page.includes('/property/'))
        .map(v => v.page.split('/property/')[1])
      )].slice(0, 4);

      if (propertyIds.length === 0) return [];

      // Fetch full property details for each ID
      const propertyDocs = await Promise.all(
        propertyIds.map(id => getDoc(doc(db, 'properties', id)))
      );

      return propertyDocs
        .filter(d => d.exists())
        .map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error fetching view history:', error);
      return [];
    }
  },

  // Get recommended properties for user
  getRecommendedProperties: async (userId) => {
    try {
      const q = query(collection(db, 'properties'), limit(6));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reason: 'Recommended for you'
      }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  },

  // Get user activity log
  getUserActivity: async (userId) => {
    try {
      const activities = [];
      // Combine favorites and searches for activity log
      const favorites = await usersAPI.getFavorites(userId);
      favorites.favorites?.forEach(fav => {
        activities.push({
          id: `fav-${fav.id}`,
          type: 'favorite',
          description: `Added ${fav.title || 'property'} to favorites`,
          timestamp: fav.addedAt || new Date(),
          icon: 'Heart'
        });
      });

      return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  }
};

// Testimonials API
export const testimonialsAPI = {
  // Get recent testimonials
  getAll: async (limitCount = 12) => {
    try {
      const q = query(
        collection(db, 'testimonials'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const testimonials = [];
      snapshot.forEach((docSnap) => {
        testimonials.push({ id: docSnap.id, ...docSnap.data() });
      });
      return testimonials;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  },

  // Create a new testimonial/review
  create: async ({ name, location, rating = 5, comment, avatar = '' }) => {
    try {
      if (!name || !comment) {
        throw new Error('Name and comment are required');
      }
      const payload = {
        name,
        location: location || '',
        rating: Number(rating) || 5,
        comment,
        avatar,
        createdAt: serverTimestamp()
      };
      const ref = await addDoc(collection(db, 'testimonials'), payload);
      return { id: ref.id, ...payload };
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }
};

// Trial signup functions
export const trialAPI = {
  // Create a new trial signup
  create: async (formData) => {
    try {
      devLog('🔥 Creating trial signup with Firebase...');
      devLog('📝 Form data received:', formData);

      // Generate trial ID and credentials
      const trialId = `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tempPassword = generateSecurePassword();
      const trialExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      // Create trial signup document
      const trialData = {
        trialId,
        ...formData,
        tempPassword,
        status: 'active',
        trialExpiryDate: Timestamp.fromDate(trialExpiryDate),
        createdAt: serverTimestamp(),
        source: 'rentakenya-landing',
        emailSent: false,
        onboardingScheduled: false
      };

      // Save to Firestore
      devLog('💾 Saving trial data to Firestore:', trialData);
      const docRef = await addDoc(collection(db, 'trialSignups'), trialData);
      devLog('✅ Trial signup created with Firestore ID:', docRef.id);
      devLog('🔑 Generated credentials - Trial ID:', trialId, 'Password:', tempPassword);

      // Trigger email sending (this will be handled by Firebase Functions)
      await addDoc(collection(db, 'emailQueue'), {
        type: 'trial_welcome',
        trialId,
        recipientEmail: formData.email,
        recipientName: formData.fullName,
        templateData: {
          fullName: formData.fullName,
          trialId,
          tempPassword,
          expiryDate: trialExpiryDate.toLocaleDateString(),
          dashboardUrl: `${window.location.origin}/trial-dashboard`
        },
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Send notification to sales team
      await addDoc(collection(db, 'emailQueue'), {
        type: 'sales_notification',
        recipientEmail: 'eliudmichira7@gmail.com',
        templateData: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          businessType: formData.businessType,
          propertyCount: formData.propertyCount,
          location: formData.location,
          interests: formData.interests?.join(', ') || 'None specified',
          timeline: formData.timeline,
          trialId,
          signupTime: new Date().toLocaleString()
        },
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Track analytics
      await addDoc(collection(db, 'analytics'), {
        event: 'trial_signup_completed',
        data: {
          trialId,
          businessType: formData.businessType,
          propertyCount: formData.propertyCount,
          location: formData.location,
          interests: formData.interests,
          timeline: formData.timeline
        },
        timestamp: serverTimestamp()
      });

      devLog('✅ Trial signup process completed successfully');

      return {
        success: true,
        trialId,
        expiryDate: trialExpiryDate,
        message: 'Trial account created successfully'
      };

    } catch (error) {
      console.error('❌ Error creating trial signup:', error);
      throw error;
    }
  },

  // Get trial status by ID
  getStatus: async (trialId) => {
    try {
      const q = query(
        collection(db, 'trialSignups'),
        where('trialId', '==', trialId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { exists: false };
      }

      const trialDoc = querySnapshot.docs[0];
      const trialData = trialDoc.data();

      return {
        exists: true,
        ...trialData,
        id: trialDoc.id
      };

    } catch (error) {
      console.error('❌ Error getting trial status:', error);
      throw error;
    }
  },

  // Get all trial signups (for admin)
  getAll: async () => {
    try {
      const q = query(
        collection(db, 'trialSignups'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const trials = [];

      querySnapshot.forEach((doc) => {
        trials.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return trials;
    } catch (error) {
      console.error('❌ Error getting all trials:', error);
      throw error;
    }
  }
};

// Notifications API
export const notificationsAPI = {
  // Create a notification for a user
  create: async (userId, notificationData) => {
    try {
      if (!userId) return null;
      const notificationRef = collection(db, 'users', userId, 'notifications');
      const docRef = await addDoc(notificationRef, {
        ...notificationData,
        read: false,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  // Register FCM token for user
  registerToken: async (userId, token) => {
    try {
      if (!userId || !token) return;

      const tokenRef = doc(db, 'users', userId, 'fcmTokens', token);
      await setDoc(tokenRef, {
        token,
        lastUpdated: serverTimestamp(),
        platform: window.Capacitor?.getPlatform() || 'web'
      });

      return { success: true };
    } catch (error) {
      console.error('Error registering FCM token:', error);
      // Don't throw, just log
      return { success: false, error };
    }
  },

  // Get notification history
  getHistory: (userId, onUpdate) => {
    try {
      if (!userId) return () => { };

      const q = query(
        collection(db, 'users', userId, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const notifications = [];
        let unreadCount = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          notifications.push({
            id: doc.id,
            ...data
          });
          if (!data.read) unreadCount++;
        });

        onUpdate({ notifications, unreadCount });
      });
    } catch (error) {
      console.error('Error getting notification history:', error);
      return () => { };
    }
  },

  // Mark notification as read
  markRead: async (userId, notificationId) => {
    try {
      const docRef = doc(db, 'users', userId, 'notifications', notificationId);
      await updateDoc(docRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification read:', error);
      throw error;
    }
  },

  // Mark all as read
  markAllRead: async (userId) => {
    try {
      const q = query(
        collection(db, 'users', userId, 'notifications'),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      throw error;
    }
  },

  // Delete notification
  delete: async (userId, notificationId) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'notifications', notificationId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

// Utility function for secure password generation
const generateSecurePassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
