import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Property API
export const propertyAPI = {
  // Get all properties with filters
  getAll: (params = {}) => api.get('/properties/all', { params }),
  
  // Get property by ID
  getById: (id) => api.get(`/properties/${id}`),
  
  // Create new property
  create: (data) => api.post('/properties/create', data),
  
  // Update property
  update: (id, data) => api.put(`/properties/${id}`, data),
  
  // Delete property
  delete: (id) => api.delete(`/properties/${id}`),
  
  // Search properties
  search: (data) => api.post('/properties/search', data),
  
  // Get property statistics
  getStats: () => api.get('/properties/stats'),
  
  // Get featured properties
  getFeatured: () => api.get('/properties/featured'),
  
  // Toggle favorite
  toggleFavorite: (id, userId) => api.post(`/properties/${id}/favorite`, { userId }),
};

// Agent API
export const agentAPI = {
  // Get all agents with filters
  getAll: (params = {}) => api.get('/agents/all', { params }),
  
  // Get agent by ID
  getById: (id) => api.get(`/agents/${id}`),
  
  // Get agent's properties
  getProperties: (agentId, params = {}) => 
    api.get(`/agents/${agentId}/properties`, { params }),
  
  // Search agents
  search: (data) => api.post('/agents/search', data),
  
  // Get agent statistics
  getStats: () => api.get('/agents/stats'),
  
  // Contact agent
  contact: (agentId, data) => api.post(`/agents/${agentId}/contact`, data),
  
  // Get agent performance
  getPerformance: (agentId) => api.get(`/agents/${agentId}/performance`),
};

// User API
export const userAPI = {
  // Create user
  create: (data) => api.post('/user/register', data),
  
  // Get user profile
  getProfile: (userId) => api.get(`/user/${userId}/profile`),
  
  // Update user profile
  updateProfile: (userId, data) => api.put(`/user/${userId}/profile`, data),
  
  // Delete user
  delete: (userId) => api.delete(`/user/${userId}`),
  
  // Favorites
  addToFavorites: (userId, propertyId) => 
    api.post(`/user/${userId}/favorites`, { propertyId }),
  
  removeFromFavorites: (userId, propertyId) => 
    api.delete(`/user/${userId}/favorites`, { data: { propertyId } }),
  
  getFavorites: (userId, params = {}) => 
    api.get(`/user/${userId}/favorites`, { params }),
  
  // Saved searches
  saveSearch: (userId, data) => api.post(`/user/${userId}/searches`, data),
  
  getSavedSearches: (userId) => api.get(`/user/${userId}/searches`),
  
  deleteSavedSearch: (searchId) => api.delete(`/user/searches/${searchId}`),
  
  // Preferences
  updatePreferences: (userId, data) => 
    api.put(`/user/${userId}/preferences`, data),
  
  getPreferences: (userId) => api.get(`/user/${userId}/preferences`),
  
  // Activity and stats
  getActivity: (userId) => api.get(`/user/${userId}/activity`),
  
  getDashboardStats: (userId) => api.get(`/user/${userId}/dashboard-stats`),
};

// Legacy API (for backward compatibility)
export const legacyAPI = {
  getAllProperties: () => api.get('/residency/allresd'),
  getProperty: (id) => api.get(`/residency/${id}`),
  createProperty: (data) => api.post('/residency/create', data),
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.error || error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  },

  // Format property data
  formatProperty: (property) => {
    return {
      ...property,
      price: parseInt(property.price) || 0,
      pricePerSqft: parseInt(property.pricePerSqft) || 0,
      bedrooms: parseInt(property.bedrooms) || 0,
      bathrooms: parseFloat(property.bathrooms) || 0,
      area: parseInt(property.area) || 0,
      days_on_market: parseInt(property.days_on_market) || 0,
      images: Array.isArray(property.images) ? property.images : [],
      features: Array.isArray(property.features) ? property.features : [],
      schools: Array.isArray(property.schools) ? property.schools : [],
      price_history: Array.isArray(property.price_history) ? property.price_history : [],
      property_history: Array.isArray(property.property_history) ? property.property_history : [],
      similar_properties: Array.isArray(property.similar_properties) ? property.similar_properties : [],
    };
  },

  // Format agent data
  formatAgent: (agent) => {
    return {
      ...agent,
      rating: parseFloat(agent.rating) || 0,
      reviews: parseInt(agent.reviews) || 0,
      properties: parseInt(agent.properties) || 0,
      totalValue: parseInt(agent.totalValue) || 0,
      averagePrice: parseInt(agent.averagePrice) || 0,
      specialties: Array.isArray(agent.specialties) ? agent.specialties : [],
      cities: Array.isArray(agent.cities) ? agent.cities : [],
    };
  },

  // Format user data
  formatUser: (user) => {
    return {
      ...user,
      favorites: Array.isArray(user.favorites) ? user.favorites : [],
      savedSearches: Array.isArray(user.savedSearches) ? user.savedSearches : [],
    };
  },

  // Build query parameters
  buildQueryParams: (params) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    return queryParams.toString();
  },

  // Pagination helper
  getPaginationInfo: (response) => {
    return {
      currentPage: response.data?.pagination?.currentPage || 1,
      totalPages: response.data?.pagination?.totalPages || 1,
      total: response.data?.pagination?.total || 0,
      hasNext: response.data?.pagination?.hasNext || false,
      hasPrev: response.data?.pagination?.hasPrev || false,
    };
  },
};

// Export default api instance
export default api;
