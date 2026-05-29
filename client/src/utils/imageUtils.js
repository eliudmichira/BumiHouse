/**
 * Utility functions for handling image URLs and Firebase Storage
 */

// Transform old storage bucket URLs to new ones
export const transformImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return imageUrl;
  }
  
  // Replace old bucket with new bucket
  if (imageUrl.includes('makao-648bd.firebasestorage.app')) {
    return imageUrl.replace('makao-648bd.firebasestorage.app', 'dwellmate-285e8.firebasestorage.app');
  }
  
  return imageUrl;
};

// Transform array of image URLs
export const transformImageUrls = (images) => {
  if (!Array.isArray(images)) {
    return images;
  }
  
  return images.map(transformImageUrl);
};

// Get the first valid image from a property
export const getPropertyImage = (property) => {
  // Try images array first
  if (property?.images && Array.isArray(property.images) && property.images.length > 0) {
    return transformImageUrl(property.images[0]);
  }
  
  // Try single image field
  if (property?.image) {
    return transformImageUrl(property.image);
  }
  
  // Try photos array
  if (property?.photos && Array.isArray(property.photos) && property.photos.length > 0) {
    return transformImageUrl(property.photos[0]);
  }
  
  // Try gallery array
  if (property?.gallery && Array.isArray(property.gallery) && property.gallery.length > 0) {
    return transformImageUrl(property.gallery[0]);
  }
  
  // Return placeholder
  return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
};

// Get all images for a property
export const getPropertyImages = (property) => {
  const images = [];
  
  // Collect from images array
  if (property?.images && Array.isArray(property.images)) {
    images.push(...transformImageUrls(property.images));
  }
  
  // Collect from single image field
  if (property?.image) {
    images.push(transformImageUrl(property.image));
  }
  
  // Collect from photos array
  if (property?.photos && Array.isArray(property.photos)) {
    images.push(...transformImageUrls(property.photos));
  }
  
  // Collect from gallery array
  if (property?.gallery && Array.isArray(property.gallery)) {
    images.push(...transformImageUrls(property.gallery));
  }
  
  // Remove duplicates and filter out invalid URLs
  const uniqueImages = [...new Set(images)].filter(img => img && typeof img === 'string');
  
  // Return images or placeholder
  return uniqueImages.length > 0 ? uniqueImages : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'];
};

// Handle image loading errors with fallback
export const handleImageError = (event, fallbackUrl = null) => {
  const img = event.target;
  
  // Try fallback URL first
  if (fallbackUrl && img.src !== fallbackUrl) {
    img.src = fallbackUrl;
    return;
  }
  
  // Use default placeholder
  img.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
};

// Preload images for better UX
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = transformImageUrl(src);
  });
};

// Batch preload images
export const preloadImages = (imageUrls) => {
  return Promise.allSettled(
    imageUrls.map(url => preloadImage(url))
  );
};
