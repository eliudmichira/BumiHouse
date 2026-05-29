import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    updateDoc,
    doc,
    increment
} from 'firebase/firestore';
import { db } from './firebase';

export const reviewsAPI = {
    // Add a new review
    async addReview(propertyId, reviewData) {
        try {
            const reviewsRef = collection(db, 'properties', propertyId, 'reviews');
            const docRef = await addDoc(reviewsRef, {
                ...reviewData,
                createdAt: new Date().toISOString(),
                helpful: 0,
            });
            return { id: docRef.id, ...reviewData };
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    },

    // Get all reviews for a property
    async getReviews(propertyId) {
        try {
            const reviewsRef = collection(db, 'properties', propertyId, 'reviews');
            const q = query(reviewsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting reviews:', error);
            return [];
        }
    },

    // Mark review as helpful
    async markHelpful(propertyId, reviewId) {
        try {
            const reviewRef = doc(db, 'properties', propertyId, 'reviews', reviewId);
            await updateDoc(reviewRef, {
                helpful: increment(1)
            });
        } catch (error) {
            console.error('Error marking review helpful:', error);
            throw error;
        }
    }
};
