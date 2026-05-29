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

// Properties API
export const propertiesAPI = {
  // Get all properties with pagination and filters
  getAll: async (params = {}) => {
    try {
      const {
        page = 1,
        limit: pageSize = 10,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        location,
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
      if (location) {
        constraints.push(where('location.city', '==', location));
      }

      // Add sorting
      constraints.push(orderBy(sortBy, sortOrder));

      // Add pagination
      constraints.push(limit(pageSize));

      if (page > 1) {
        // For pagination, you'd need to implement cursor-based pagination
        // This is a simplified version
      }

      const querySnapshot = await getDocs(query(q, ...constraints));
      const properties = [];
      
      querySnapshot.forEach((doc) => {
        properties.push({
          id: doc.id,
          ...doc.data()
        });
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
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Get featured properties
  getFeatured: async (limitCount = 6) => {
    try {
      console.log('Fetching featured properties...');
      
      const q = query(
        collection(db, 'properties'),
        where('featured', '==', true),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const properties = [];
      
      console.log('Featured properties query result:', querySnapshot.size, 'documents found');
      
      querySnapshot.forEach((doc) => {
        properties.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // If no featured properties found, get some regular properties as fallback
      if (properties.length === 0) {
        console.log('No featured properties found, getting fallback properties...');
        const fallbackQuery = query(
          collection(db, 'properties'),
          limit(limitCount)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        console.log('Fallback properties query result:', fallbackSnapshot.size, 'documents found');
        
        fallbackSnapshot.forEach((doc) => {
          properties.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }

      console.log('Total properties to return:', properties.length);
      return { properties };
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      
      // Return empty array if Firestore is not set up yet
      if (error.code === 'failed-precondition' || error.message.includes('400')) {
        console.log('Firestore not set up yet, returning empty properties array');
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
      const docRef = await addDoc(collection(db, 'properties'), {
        ...propertyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...propertyData
      };
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Update property
  update: async (id, propertyData) => {
    try {
      const docRef = doc(db, 'properties', id);
      await updateDoc(docRef, {
        ...propertyData,
        updatedAt: serverTimestamp()
      });
      
      return { id, ...propertyData };
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
  addToFavorites: async (userId, propertyId) => {
    try {
      await addDoc(collection(db, 'users', userId, 'favorites'), {
        propertyId,
        addedAt: serverTimestamp()
      });
      
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
      
      console.log('🔄 Uploading image to path:', path);
      console.log('📁 File details:', { name: file.name, size: file.size, type: file.type });
      
      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('✅ Upload successful, getting download URL...');
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('🔗 Download URL obtained:', downloadURL);
      
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
  // Get conversations for a user
  getConversations: async (userId) => {
    try {
      console.log('getConversations called with userId:', userId);
      if (!userId) {
        console.log('No userId provided, returning empty array');
        return { conversations: [] };
      }
      
      console.log('Fetching all conversations from Firestore...');
      const querySnapshot = await getDocs(collection(db, 'conversations'));
      console.log('Total conversations in Firestore:', querySnapshot.docs.length);
      
      const conversations = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        console.log('Checking conversation:', docSnapshot.id, 'with participants:', data.participants);
        console.log('Looking for userId:', userId, 'in participants:', data.participants);
        
        if (data.participants && data.participants.includes(userId)) {
          console.log('User is a participant in conversation:', docSnapshot.id);
          // Get user details for other participants
          const otherParticipantId = data.participants.find(id => id !== userId);
          let user = null;
          let property = null;
          
          if (otherParticipantId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', otherParticipantId));
              if (userDoc.exists()) {
                user = { id: userDoc.id, ...userDoc.data() };
              }
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          }
          
          // Get property details if propertyId exists
          if (data.propertyId) {
            try {
              const propertyDoc = await getDoc(doc(db, 'properties', data.propertyId));
              if (propertyDoc.exists()) {
                property = { id: propertyDoc.id, ...propertyDoc.data() };
              }
            } catch (error) {
              console.error('Error fetching property:', error);
            }
          }
          
          conversations.push({
            id: docSnapshot.id,
            ...data,
            user,
            property
          });
        }
      }

      console.log('Final conversations array:', conversations);
      console.log('Returning conversations count:', conversations.length);
      return { conversations };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get messages for a conversation with real-time updates
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
        messages.push({
          id: doc.id,
          ...doc.data()
        });
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
      // Validate required fields
      if (!messageData.senderId) {
        throw new Error('senderId is required');
      }
      if (!messageData.text) {
        throw new Error('message text is required');
      }
      
      const messageRef = collection(db, 'conversations', conversationId, 'messages');
      const messageDoc = await addDoc(messageRef, {
        ...messageData,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      // Update conversation with last message
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: messageData.text,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: messageData.senderId
      });
      
      // Ensure an inquiry exists (create if missing) - do not block send result
      (async () => {
        try {
          const inquiryQuery = query(collection(db, 'inquiries'), where('conversationId', '==', conversationId));
          const inquirySnapshot = await getDocs(inquiryQuery);

          if (inquirySnapshot.empty) {
            // Create inquiry from conversation context
            const convSnap = await getDoc(conversationRef);
            if (convSnap.exists()) {
              const convData = convSnap.data();
              const propertyId = convData.propertyId;
              if (propertyId) {
                // Determine agent and client
                const propertySnap = await getDoc(doc(db, 'properties', propertyId));
                let agentId = null;
                if (propertySnap.exists()) {
                  const propData = propertySnap.data();
                  agentId = propData.userId || propData.agentId || propData.agent?.id || null;
                }
                if (!agentId) {
                  // Fallback: assume agent is the other participant different from senderId
                  agentId = convData.participants?.find((p) => p !== messageData.senderId) || null;
                }
                const clientId = convData.participants?.find((p) => p !== agentId) || (convData.createdBy !== agentId ? convData.createdBy : null) || convData.lastMessageSender || null;

                const inquiryData = {
                  propertyId,
                  agentId,
                  clientId,
                  conversationId,
                  status: 'active',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  lastMessage: messageData.text,
                  lastMessageTime: serverTimestamp(),
                  lastMessageSender: messageData.senderId,
                  source: 'messaging'
                };
                await addDoc(collection(db, 'inquiries'), inquiryData);
              }
            }
          } else {
            // Update existing inquiry
            const inquiryDoc = inquirySnapshot.docs[0];
            await updateDoc(inquiryDoc.ref, {
              lastMessage: messageData.text,
              lastMessageTime: serverTimestamp(),
              lastMessageSender: messageData.senderId,
              updatedAt: serverTimestamp(),
              status: 'active'
            });
          }
        } catch (inquiryError) {
          console.error('Error updating inquiry:', inquiryError);
        }
      })();
      
      return messageDoc.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Create a new conversation
  createConversation: async (participants, propertyId) => {
    try {
      const conversationRef = collection(db, 'conversations');
      
      // Filter out any undefined or null values from participants
      const validParticipants = participants.filter(participant => participant != null);
      
      if (validParticipants.length === 0) {
        throw new Error('No valid participants provided');
      }
      
      const conversationData = {
        participants: validParticipants,
        createdBy: validParticipants[0],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: null,
        lastMessageSender: null
      };
      
      // Only add propertyId if it's not null or undefined
      if (propertyId) {
        conversationData.propertyId = propertyId;
      }
      
      const docRef = await addDoc(conversationRef, conversationData);
      
      // Create an inquiry record for the agent if this is a real property
      console.log('Checking if should create inquiry for propertyId:', propertyId);
      if (propertyId && !propertyId.includes('test-property')) {
        try {
          console.log('Creating inquiry for propertyId:', propertyId);
          // Get property details to find the agent
          const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
          if (propertyDoc.exists()) {
            const propertyData = propertyDoc.data();
            const agentId = propertyData.userId || propertyData.agentId;
            console.log('Found agentId:', agentId, 'for property:', propertyData.title);
            
            if (agentId) {
              // Find the client (non-agent participant)
              const clientId = validParticipants.find(p => p !== agentId);
              console.log('Found clientId:', clientId, 'participants:', validParticipants);
              
              if (clientId) {
                // Create inquiry record
                const inquiryRef = collection(db, 'inquiries');
                const inquiryData = {
                  propertyId: propertyId,
                  agentId: agentId,
                  clientId: clientId,
                  conversationId: docRef.id,
                  status: 'new',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  message: 'New inquiry via messaging system',
                  source: 'messaging'
                };
                console.log('Creating inquiry with data:', inquiryData);
                await addDoc(inquiryRef, inquiryData);
                console.log('Inquiry created successfully');
              } else {
                console.log('No clientId found in participants');
              }
            } else {
              console.log('No agentId found in property data');
            }
          } else {
            console.log('Property document does not exist for ID:', propertyId, '- This is why no inquiry is being created');
          }
        } catch (inquiryError) {
          console.error('Error creating inquiry record:', inquiryError);
          // Don't fail the conversation creation if inquiry creation fails
        }
      } else {
        console.log('Skipping inquiry creation - propertyId:', propertyId, 'is test property');
      }
      
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
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
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

  // Update user online status
  updateUserOnlineStatus: async (userId, isOnline) => {
    try {
      const userRef = doc(db, 'users', userId);
      // Use setDoc with merge to create document if it doesn't exist
      await setDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user online status:', error);
      // Don't throw error to prevent breaking other functionality
    }
  }
};

// Account Dashboard API
export const accountDashboardAPI = {
  // Get user's properties
  getUserProperties: async (userId) => {
    try {
      console.log('getUserProperties: Searching for properties with userId:', userId);
      
      // First, let's get ALL properties to see what's in the collection
      const allPropertiesQuery = query(collection(db, 'properties'));
      const allPropertiesSnapshot = await getDocs(allPropertiesQuery);
      console.log('getUserProperties: Total properties in collection:', allPropertiesSnapshot.size);
      
      // Log all properties to see their structure
      allPropertiesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Property:', doc.id, 'userId:', data.userId, 'agent.id:', data.agent?.id);
      });
      
      // Try with ordering first, fallback to no ordering if index not ready
      let querySnapshot;
      let properties = [];
      
      try {
        const q = query(
          collection(db, 'properties'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        querySnapshot = await getDocs(q);
        console.log('getUserProperties: Used ordered query successfully');
      } catch (orderError) {
        console.log('getUserProperties: Ordered query failed (index not ready), trying without ordering:', orderError.message);
        // Fallback to query without ordering
        const qNoOrder = query(
          collection(db, 'properties'),
          where('userId', '==', userId)
        );
        querySnapshot = await getDocs(qNoOrder);
        console.log('getUserProperties: Used fallback query without ordering');
      }
      
      querySnapshot.forEach((doc) => {
        properties.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort manually if we couldn't use orderBy
      if (properties.length > 0 && !properties[0].createdAt) {
        console.log('getUserProperties: Sorting manually by createdAt');
        properties.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return bTime - aTime;
        });
      }

      console.log('getUserProperties: Found', properties.length, 'properties with userId:', userId);
      
      // If none found by userId, try nested agent.id (older entries)
      let agentIdResults = [];
      if (properties.length === 0) {
        try {
          const qAgentId = query(
            collection(db, 'properties'),
            where('agent.id', '==', userId),
            orderBy('createdAt', 'desc')
          );
          const snapAgentId = await getDocs(qAgentId);
          snapAgentId.forEach((doc) => {
            agentIdResults.push({ id: doc.id, ...doc.data() });
          });
          console.log('getUserProperties: Found', agentIdResults.length, 'properties with agent.id (ordered)');
        } catch (agentOrderedErr) {
          console.warn('getUserProperties: agent.id ordered query failed, trying without ordering (index likely missing):', agentOrderedErr?.message || agentOrderedErr);
          try {
            const qAgentIdNoOrder = query(
              collection(db, 'properties'),
              where('agent.id', '==', userId)
            );
            const snapAgentIdNoOrder = await getDocs(qAgentIdNoOrder);
            snapAgentIdNoOrder.forEach((doc) => {
              agentIdResults.push({ id: doc.id, ...doc.data() });
            });
            // Sort in memory by createdAt desc
            agentIdResults.sort((a, b) => {
              const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
              const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
              return bTime - aTime;
            });
            console.log('getUserProperties: Found', agentIdResults.length, 'properties with agent.id (no ordering)');
          } catch (agentNoOrderErr) {
            console.error('getUserProperties: agent.id query without ordering failed:', agentNoOrderErr);
          }
        }
      }
      
      if (properties.length === 0 && agentIdResults.length > 0) {
        return agentIdResults;
      }
      
      // Also try without ordering to see if that's the issue
      try {
        const qWithoutOrdering = query(
          collection(db, 'properties'),
          where('userId', '==', userId)
        );
        
        const querySnapshotWithoutOrdering = await getDocs(qWithoutOrdering);
        console.log('getUserProperties: Found', querySnapshotWithoutOrdering.size, 'properties without ordering');
        
        if (querySnapshotWithoutOrdering.size > 0) {
          const propertiesWithoutOrdering = [];
          querySnapshotWithoutOrdering.forEach((doc) => {
            propertiesWithoutOrdering.push({
              id: doc.id,
              ...doc.data()
            });
          });
          console.log('getUserProperties: Returning properties without ordering');
          return propertiesWithoutOrdering;
        }
      } catch (noOrderingError) {
        console.error('Error fetching user properties without ordering:', noOrderingError);
      }
      
      return properties;
    } catch (error) {
      console.error('Error fetching user properties with ordering:', error);
      
      // Fallback: try without ordering if index doesn't exist
      try {
        const q = query(
          collection(db, 'properties'),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const properties = [];
        
        querySnapshot.forEach((doc) => {
          properties.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Sort manually in JavaScript
        properties.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return bTime - aTime;
        });

        return properties;
      } catch (fallbackError) {
        console.error('Error fetching user properties (fallback):', fallbackError);
        return [];
      }
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

  // Get agent's inquiries
  getAgentInquiries: async (agentId) => {
    try {
      console.log('getAgentInquiries called with agentId:', agentId);
      
      // Try with ordering first, fallback to no ordering if index not ready
      let querySnapshot;
      const inquiries = [];
      
      try {
        const q = query(
          collection(db, 'inquiries'),
          where('agentId', '==', agentId),
          orderBy('createdAt', 'desc')
        );
        querySnapshot = await getDocs(q);
        console.log('getAgentInquiries: Used ordered query successfully');
      } catch (orderError) {
        console.log('getAgentInquiries: Ordered query failed (index not ready), trying without ordering:', orderError.message);
        // Fallback to query without ordering
        const qNoOrder = query(
          collection(db, 'inquiries'),
          where('agentId', '==', agentId)
        );
        querySnapshot = await getDocs(qNoOrder);
        console.log('getAgentInquiries: Used fallback query without ordering');
      }
      
      console.log('Found inquiries from inquiries collection:', querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        inquiries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort manually if we couldn't use orderBy
      if (inquiries.length > 0) {
        inquiries.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return bTime - aTime;
        });
      }

             // Also get inquiries from conversations where the agent is a participant
       try {
         console.log('Fetching conversations for agent:', agentId);
         const conversationsQuery = query(
           collection(db, 'conversations'),
           where('participants', 'array-contains', agentId)
         );
         const conversationsSnapshot = await getDocs(conversationsQuery);
         
         console.log('Found conversations for agent:', conversationsSnapshot.size);
         
                   for (const convDoc of conversationsSnapshot.docs) {
           const convData = convDoc.data();
           console.log('Processing conversation:', convDoc.id, 'with propertyId:', convData.propertyId);
           
           // Only include conversations that have a propertyId (real inquiries)
           if (convData.propertyId && !convData.propertyId.includes('test-property')) {
             console.log('Conversation has valid propertyId:', convData.propertyId);
             // Get property details
             const propertyDoc = await getDoc(doc(db, 'properties', convData.propertyId));
             if (propertyDoc.exists()) {
               const propertyData = propertyDoc.data();
               console.log('Property exists:', propertyData.title);
               
               // Find the client (non-agent participant). Use multiple fallbacks
               const participants = Array.isArray(convData.participants) ? convData.participants : [];
               let clientId = participants.find(p => p !== agentId)
                 || (convData.createdBy && convData.createdBy !== agentId ? convData.createdBy : null)
                 || (convData.lastMessageSender && convData.lastMessageSender !== agentId ? convData.lastMessageSender : null);
               console.log('Found clientId:', clientId, 'for agentId:', agentId);
               
               if (clientId) {
                 // Get client details
                 const clientDoc = await getDoc(doc(db, 'users', clientId));
                 const clientData = clientDoc.exists() ? clientDoc.data() : {};
                 console.log('Client data:', clientData.name || clientData.username);
                 
                 // Check if this conversation already has an inquiry record
                 const existingInquiry = inquiries.find(inq => inq.conversationId === convDoc.id);
                 
                 if (!existingInquiry) {
                   console.log('Creating inquiry from conversation:', convDoc.id);
                   inquiries.push({
                     id: `conv-${convDoc.id}`,
                     conversationId: convDoc.id,
                     propertyId: convData.propertyId,
                     agentId: agentId,
                     clientId: clientId,
                     status: 'active',
                     createdAt: convData.createdAt,
                     updatedAt: convData.lastMessageTime || convData.createdAt,
                     lastMessage: convData.lastMessage || 'New inquiry via messaging',
                     lastMessageTime: convData.lastMessageTime,
                     lastMessageSender: convData.lastMessageSender,
                     source: 'messaging',
                     property: {
                       id: convData.propertyId,
                       title: propertyData.title || 'Property',
                       price: propertyData.price,
                       location: propertyData.location
                     },
                     client: {
                       id: clientId,
                       name: clientData.name || clientData.username || 'Client',
                       email: clientData.email
                     }
                   });
                   console.log('Inquiry created from conversation');
                 } else {
                   console.log('Inquiry already exists for conversation:', convDoc.id);
                 }
               } else {
                 console.log('No clientId found for conversation:', convDoc.id, '- creating minimal inquiry');
                 const existingInquiry = inquiries.find(inq => inq.conversationId === convDoc.id);
                 if (!existingInquiry) {
                   inquiries.push({
                     id: `conv-${convDoc.id}`,
                     conversationId: convDoc.id,
                     propertyId: convData.propertyId,
                     agentId: agentId,
                     clientId: null,
                     status: 'active',
                     createdAt: convData.createdAt,
                     updatedAt: convData.lastMessageTime || convData.createdAt,
                     lastMessage: convData.lastMessage || 'New inquiry via messaging',
                     lastMessageTime: convData.lastMessageTime,
                     lastMessageSender: convData.lastMessageSender,
                     source: 'messaging',
                     property: {
                       id: convData.propertyId,
                       title: propertyData.title || 'Property',
                       price: propertyData.price,
                       location: propertyData.location
                     },
                     client: {
                       id: null,
                       name: 'Client',
                       email: ''
                     }
                   });
                 }
               }
             } else {
               console.log('Property does not exist for ID:', convData.propertyId);
             }
           } else {
             console.log('Skipping conversation - no valid propertyId:', convData.propertyId);
           }
         }
      } catch (convError) {
        console.error('Error fetching conversations for inquiries:', convError);
      }

      // Sort all inquiries by updated time
      inquiries.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || a.updatedAt || a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || b.updatedAt || b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return bTime - aTime;
      });

      return inquiries;
    } catch (error) {
      console.error('Error fetching agent inquiries with ordering:', error);
      
      // Fallback: try without ordering if index doesn't exist
      try {
        const q = query(
          collection(db, 'inquiries'),
          where('agentId', '==', agentId)
        );
        
        const querySnapshot = await getDocs(q);
        const inquiries = [];
        
        querySnapshot.forEach((doc) => {
          inquiries.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Sort manually in JavaScript
        inquiries.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return bTime - aTime;
        });

        return inquiries;
      } catch (fallbackError) {
        console.error('Error fetching agent inquiries (fallback):', fallbackError);
        return [];
      }
    }
  },

  // Get agent's analytics
  getAgentAnalytics: async (agentId) => {
    try {
      // Get agent's properties
      const properties = await accountDashboardAPI.getUserProperties(agentId);
      
      // Get agent's inquiries
      const inquiries = await accountDashboardAPI.getAgentInquiries(agentId);
      
      // Calculate analytics
      const totalRevenue = properties.reduce((sum, prop) => sum + (prop.price || 0), 0);
      const totalViews = properties.reduce((sum, prop) => sum + (prop.views || 0), 0);
      const totalInquiries = inquiries.length;
      const averageRating = properties.reduce((sum, prop) => sum + (prop.rating || 0), 0) / Math.max(properties.length, 1);
      
      // Calculate conversion rate (inquiries / views)
      const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;

      return {
        totalRevenue,
        totalViews,
        totalInquiries,
        averageRating: Math.round(averageRating * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        properties: properties.length
      };
    } catch (error) {
      console.error('Error fetching agent analytics:', error);
      return {
        totalRevenue: 0,
        totalViews: 0,
        totalInquiries: 0,
        averageRating: 0,
        conversionRate: 0,
        properties: 0
      };
    }
  },

  // Get user's view history
  getUserViewHistory: async (userId) => {
    try {
      // Get user's page views from pageViews collection
      const pageViewsQuery = query(
        collection(db, 'pageViews'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(pageViewsQuery);
      const viewHistory = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.page && data.page.includes('/property/')) {
          viewHistory.push({
            id: doc.id,
            propertyId: data.page.split('/property/')[1],
            title: data.title || 'Property',
            viewedAt: data.timestamp?.toDate() || new Date(),
            page: data.page
          });
        }
      });

      return viewHistory;
    } catch (error) {
      console.error('Error getting user view history:', error);
      return [];
    }
  },

  // Get recommended properties for user
  getRecommendedProperties: async (userId) => {
    try {
      // Simple recommendation: get featured properties and recent properties
      const featuredQuery = query(
        collection(db, 'properties'),
        where('featured', '==', true),
        limit(3)
      );
      
      const recentQuery = query(
        collection(db, 'properties'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const [featuredSnapshot, recentSnapshot] = await Promise.all([
        getDocs(featuredQuery),
        getDocs(recentQuery)
      ]);

      const recommendations = new Map();

      // Add featured properties
      featuredSnapshot.forEach((doc) => {
        recommendations.set(doc.id, {
          id: doc.id,
          ...doc.data(),
          reason: 'Featured Property'
        });
      });

      // Add recent properties if not already included
      recentSnapshot.forEach((doc) => {
        if (!recommendations.has(doc.id)) {
          recommendations.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            reason: 'Recently Listed'
          });
        }
      });

      return Array.from(recommendations.values()).slice(0, 6);
    } catch (error) {
      console.error('Error getting recommended properties:', error);
      return [];
    }
  },

  // Get user's activity history
  getUserActivity: async (userId) => {
    try {
      const activities = [];
      
      // Get recent page views
      try {
        const pageViewsQuery = query(
          collection(db, 'pageViews'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        
        const viewsSnapshot = await getDocs(pageViewsQuery);
        viewsSnapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            type: 'view',
            description: `Viewed ${data.page || 'a page'}`,
            timestamp: data.timestamp?.toDate() || new Date(),
            icon: 'Eye'
          });
        });
      } catch (error) {
        console.log('Could not load page views for activity');
      }

      // Get recent favorites (from user's favorites subcollection)
      try {
        const favoritesQuery = query(
          collection(db, 'users', userId, 'favorites'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        
        const favoritesSnapshot = await getDocs(favoritesQuery);
        favoritesSnapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            type: 'favorite',
            description: `Added ${data.title || 'a property'} to favorites`,
            timestamp: data.createdAt?.toDate() || new Date(),
            icon: 'Heart'
          });
        });
      } catch (error) {
        console.log('Could not load favorites for activity');
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => b.timestamp - a.timestamp);
      
      return activities.slice(0, 10);
    } catch (error) {
      console.error('Error getting user activity:', error);
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
      console.log('🔥 Creating trial signup with Firebase...');
      console.log('📝 Form data received:', formData);
      
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
      console.log('💾 Saving trial data to Firestore:', trialData);
      const docRef = await addDoc(collection(db, 'trialSignups'), trialData);
      console.log('✅ Trial signup created with Firestore ID:', docRef.id);
      console.log('🔑 Generated credentials - Trial ID:', trialId, 'Password:', tempPassword);
      
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
      
      console.log('✅ Trial signup process completed successfully');
      
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

// Utility function for secure password generation
const generateSecurePassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
