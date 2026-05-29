import { db, auth } from './firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    getDoc,
    setDoc
} from 'firebase/firestore';

// Collection references
const REPORTS_COLLECTION = 'reports';
const USERS_COLLECTION = 'users';

export const reportsAPI = {
    /**
     * Submit a report for a property or user
     * @param {Object} reportData - The report data
     * @returns {Promise<string>} - The ID of the created report
     */
    submitReport: async (reportData) => {
        try {
            if (!auth.currentUser) throw new Error('Must be logged in to report');

            const finalData = {
                ...reportData,
                reporterId: auth.currentUser.uid,
                reporterEmail: auth.currentUser.email,
                status: 'pending',
                createdAt: serverTimestamp(),
                resolved: false
            };

            const docRef = await addDoc(collection(db, REPORTS_COLLECTION), finalData);
            return docRef.id;
        } catch (error) {
            console.error('Error submitting report:', error);
            throw error;
        }
    },

    /**
     * Block a user
     * @param {string} userIdToBlock - The ID of the user to block
     * @returns {Promise<void>}
     */
    blockUser: async (userIdToBlock) => {
        try {
            if (!auth.currentUser) throw new Error('Must be logged in to block users');

            const currentUserId = auth.currentUser.uid;
            const userRef = doc(db, USERS_COLLECTION, currentUserId);

            // Check if user document exists, if not create it (safe fallback)
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    blockedUsers: [userIdToBlock],
                    updatedAt: serverTimestamp()
                }, { merge: true });
            } else {
                await updateDoc(userRef, {
                    blockedUsers: arrayUnion(userIdToBlock)
                });
            }

            console.log(`User ${userIdToBlock} blocked successfully`);
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    },

    /**
     * Get list of blocked users for current user
     * @returns {Promise<string[]>} - Array of blocked user IDs
     */
    getBlockedUsers: async () => {
        try {
            if (!auth.currentUser) return [];

            const userRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data().blockedUsers || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching blocked users:', error);
            return [];
        }
    }
};
