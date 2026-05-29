// Bulletproof API error handling for production
export class APIErrorHandler {
  constructor() {
    this.timeouts = new Map();
    this.retryAttempts = new Map();
  }

  // Fetch with timeout and retry logic
  async fetchWithTimeout(resource, options = {}) {
    const { 
      timeout = 10000, 
      retries = 3, 
      retryDelay = 1000,
      fallback = null 
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms`);
      }

      // Retry logic
      const retryKey = resource;
      const attempts = this.retryAttempts.get(retryKey) || 0;
      
      if (attempts < retries) {
        this.retryAttempts.set(retryKey, attempts + 1);
        console.warn(`🔄 Retrying request (${attempts + 1}/${retries}):`, resource);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempts + 1)));
        return this.fetchWithTimeout(resource, { ...options, retries, retryDelay, fallback });
      }

      // All retries failed
      this.retryAttempts.delete(retryKey);
      
      if (fallback) {
        console.warn('⚠️ Using fallback data for:', resource);
        return { ok: true, json: () => Promise.resolve(fallback) };
      }

      throw error;
    }
  }

  // Safe JSON parsing with fallback
  async safeJson(response, fallback = {}) {
    try {
      return await response.json();
    } catch (error) {
      console.warn('⚠️ JSON parsing failed, using fallback:', error.message);
      return fallback;
    }
  }

  // Wrap any async function with error handling
  async safeExecute(asyncFn, fallback = null, context = 'Unknown') {
    try {
      return await asyncFn();
    } catch (error) {
      console.error(`❌ ${context} failed:`, error.message);
      
      if (fallback) {
        console.warn(`⚠️ Using fallback for ${context}`);
        return fallback;
      }
      
      throw error;
    }
  }

  // Clean up timeouts
  cleanup() {
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeouts.clear();
    this.retryAttempts.clear();
  }
}

// Global instance
export const apiErrorHandler = new APIErrorHandler();

// Utility functions
export const safeFetch = (resource, options = {}) => 
  apiErrorHandler.fetchWithTimeout(resource, options);

export const safeJson = (response, fallback = {}) => 
  apiErrorHandler.safeJson(response, fallback);

export const safeExecute = (asyncFn, fallback = null, context = 'Unknown') => 
  apiErrorHandler.safeExecute(asyncFn, fallback, context);
