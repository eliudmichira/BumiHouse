/**
 * Utility functions for handling image URLs and Firebase Storage
 */

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';

// Extract [lat, lng] from a property using any of the common field shapes
export const getPropertyCoords = (property) => {
  if (!property) return null;
  const lat =
    property.latitude ??
    property.lat ??
    property.location?.coordinates?.lat ??
    property.location?.lat ??
    property.coordinates?.lat;
  const lng =
    property.longitude ??
    property.lng ??
    property.location?.coordinates?.lng ??
    property.location?.lng ??
    property.coordinates?.lng;
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;
  if (latNum === 0 && lngNum === 0) return null;
  return [latNum, lngNum];
};

// Build a Google Street View Static API URL for given coords
export const getStreetViewUrl = (lat, lng, { width = 800, height = 500, fov = 80, pitch = 10 } = {}) => {
  const key = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&fov=${fov}&pitch=${pitch}&key=${key}`;
};

// Street View fallback for a property (null if no coords or no API key)
export const getStreetViewForProperty = (property, options) => {
  const coords = getPropertyCoords(property);
  if (!coords) return null;
  return getStreetViewUrl(coords[0], coords[1], options);
};

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
  
  // Fall back to Google Street View if we have coordinates
  const sv = getStreetViewForProperty(property);
  if (sv) return sv;

  // Return placeholder
  return PLACEHOLDER_IMAGE;
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
  
  if (uniqueImages.length > 0) return uniqueImages;

  // Fall back to Google Street View if we have coordinates
  const sv = getStreetViewForProperty(property);
  if (sv) return [sv];

  return [PLACEHOLDER_IMAGE];
};

// Handle image loading errors with fallback
export const handleImageError = (event, fallbackUrl = null, property = null) => {
  const img = event.target;

  // Try fallback URL first
  if (fallbackUrl && img.src !== fallbackUrl) {
    img.src = fallbackUrl;
    return;
  }

  // Try Street View if we have property coords
  if (property) {
    const sv = getStreetViewForProperty(property);
    if (sv && img.src !== sv) {
      img.src = sv;
      return;
    }
  }

  // Use default placeholder
  img.src = PLACEHOLDER_IMAGE;
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
