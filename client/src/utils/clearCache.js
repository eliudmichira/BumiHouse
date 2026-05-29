// Utility to clear browser cache and storage for the app
export const clearAppCache = async () => {
  try {
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('makao') || key.includes('firebase') || key.includes('estate'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('makao') || key.includes('firebase') || key.includes('estate'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.includes('makao') || cacheName.includes('hama-estate-v1')) {
            console.log('Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }
    
    console.log('✅ App cache cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return false;
  }
};

// Function to be called on app startup to clean old references
export const initializeCleanup = () => {
  // Run cleanup on app start
  clearAppCache();
  
  // Add to window for manual cleanup
  window.clearAppCache = clearAppCache;
  
  console.log('🧹 Cache cleanup initialized. Run window.clearAppCache() to manually clear cache.');
};
