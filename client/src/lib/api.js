import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
    // If it's a CORS error or network error, we'll handle it gracefully
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.warn('API not available, using fallback data');
      // Return a mock response for development/production fallback
      return Promise.resolve({
        data: {
          properties: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        }
      });
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API utility functions
const apiUtils = {
  handleError: (error) => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return { error: true, message };
  },

  formatProperty: (property) => ({
    id: property.id,
    title: property.title,
    description: property.description,
    price: property.price,
    location: property.location,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    type: property.type,
    status: property.status,
    images: property.images || [],
    amenities: property.amenities || [],
    agent: property.agent,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  }),

  buildQuery: (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return query.toString();
  },

  paginate: (data, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: data.length,
        pages: Math.ceil(data.length / limit),
      },
    };
  },
};

// Property API
export const propertyAPI = {
  getAll: async (params = {}) => {
    try {
      const query = apiUtils.buildQuery(params);
      const response = await api.get(`/properties?${query}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return apiUtils.formatProperty(response.data);
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  create: async (propertyData) => {
    try {
      const response = await api.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  update: async (id, propertyData) => {
    try {
      const response = await api.put(`/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  search: async (query, filters = {}) => {
    try {
      const params = { q: query, ...filters };
      const queryString = apiUtils.buildQuery(params);
      const response = await api.get(`/properties/search?${queryString}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getFeatured: async () => {
    try {
      const response = await api.get('/properties/featured');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/properties/stats');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  toggleFavorite: async (propertyId) => {
    try {
      const response = await api.post(`/properties/${propertyId}/favorite`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },
};

// Agent API
export const agentAPI = {
  getAll: async (params = {}) => {
    try {
      const query = apiUtils.buildQuery(params);
      const response = await api.get(`/agents?${query}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/agents/${id}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getProperties: async (agentId, params = {}) => {
    try {
      const query = apiUtils.buildQuery(params);
      const response = await api.get(`/agents/${agentId}/properties?${query}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  search: async (query, filters = {}) => {
    try {
      const params = { q: query, ...filters };
      const queryString = apiUtils.buildQuery(params);
      const response = await api.get(`/agents/search?${queryString}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/agents/stats');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  contact: async (agentId, messageData) => {
    try {
      const response = await api.post(`/agents/${agentId}/contact`, messageData);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getPerformance: async (agentId) => {
    try {
      const response = await api.get(`/agents/${agentId}/performance`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/user/profile', userData);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getFavorites: async () => {
    try {
      const response = await api.get('/user/favorites');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  addToFavorites: async (propertyId) => {
    try {
      const response = await api.post(`/user/favorites/${propertyId}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  removeFromFavorites: async (propertyId) => {
    try {
      const response = await api.delete(`/user/favorites/${propertyId}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getSavedSearches: async () => {
    try {
      const response = await api.get('/user/saved-searches');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  saveSearch: async (searchData) => {
    try {
      const response = await api.post('/user/saved-searches', searchData);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  deleteSavedSearch: async (searchId) => {
    try {
      const response = await api.delete(`/user/saved-searches/${searchId}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getPreferences: async () => {
    try {
      const response = await api.get('/user/preferences');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/user/preferences', preferences);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getActivity: async (params = {}) => {
    try {
      const query = apiUtils.buildQuery(params);
      const response = await api.get(`/user/activity?${query}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/user/dashboard-stats');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },
};

// Legacy API (for backward compatibility)
export const legacyAPI = {
  getAllProperties: async () => {
    try {
      const response = await api.get('/residency/allresd');
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  getProperty: async (id) => {
    try {
      const response = await api.get(`/residency/${id}`);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/user/register', userData);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },

  addProperty: async (propertyData) => {
    try {
      const response = await api.post('/residency/create', propertyData);
      return response.data;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  },
};

export { api, apiUtils };
