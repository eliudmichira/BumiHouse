import { doc, increment, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Track property view in database
export const incrementPropertyView = async (propertyId) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    
    // Increment the views count
    await updateDoc(propertyRef, {
      views: increment(1),
      lastViewed: new Date().toISOString()
    });
    
    console.log('📊 Property view incremented for:', propertyId);
    return true;
  } catch (error) {
    console.error('❌ Error incrementing property view:', error);
    return false;
  }
};

// Get property view count
export const getPropertyViews = async (propertyId) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    
    if (propertySnap.exists()) {
      return propertySnap.data().views || 0;
    }
    return 0;
  } catch (error) {
    console.error('❌ Error getting property views:', error);
    return 0;
  }
};

// Get total views across all properties
export const getTotalViews = async () => {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const propertiesSnap = await getDocs(collection(db, 'properties'));
    
    let totalViews = 0;
    propertiesSnap.forEach(doc => {
      const data = doc.data();
      totalViews += data.views || 0;
    });
    
    return totalViews;
  } catch (error) {
    console.error('❌ Error getting total views:', error);
    return 0;
  }
};
