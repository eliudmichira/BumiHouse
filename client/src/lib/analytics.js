import { analytics } from './firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

// Analytics service for tracking user interactions with bulletproof error handling
class AnalyticsService {
  constructor() {
    this.analytics = analytics;
    this.isEnabled = this.analytics && typeof window !== 'undefined';
    this.failedEvents = [];
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  // Safe event tracking with retry logic
  async safeTrackEvent(eventName, parameters = {}, retryCount = 0) {
    if (!this.isEnabled) {
      console.log('📊 Analytics disabled - skipping event:', eventName);
      return;
    }

    try {
      logEvent(this.analytics, eventName, {
        ...parameters,
        timestamp: new Date().toISOString()
      });
      console.log('📊 Analytics: Event tracked successfully:', eventName);
    } catch (error) {
      console.error('❌ Analytics error:', error);
      
      // Retry logic for critical events
      if (retryCount < this.maxRetries) {
        console.warn(`🔄 Retrying analytics event (${retryCount + 1}/${this.maxRetries}):`, eventName);
        setTimeout(() => {
          this.safeTrackEvent(eventName, parameters, retryCount + 1);
        }, this.retryDelay * (retryCount + 1));
      } else {
        // Store failed events for later retry
        this.failedEvents.push({ eventName, parameters, timestamp: Date.now() });
        console.warn('⚠️ Analytics event failed, stored for later retry:', eventName);
      }
    }
  }

  // Retry failed events
  async retryFailedEvents() {
    if (this.failedEvents.length === 0) return;

    console.log(`🔄 Retrying ${this.failedEvents.length} failed analytics events`);
    const events = [...this.failedEvents];
    this.failedEvents = [];

    for (const event of events) {
      await this.safeTrackEvent(event.eventName, event.parameters);
    }
  }

  // Track page views (using Firebase Analytics only - no MP calls)
  trackPageView(pageName, pageTitle = null) {
    this.safeTrackEvent('page_view', {
      page_title: pageTitle || pageName,
      page_location: window.location.href,
      page_name: pageName
    });
  }

  // Track property views
  trackPropertyView(propertyId, propertyTitle, propertyPrice, propertyLocation) {
    this.safeTrackEvent('property_view', {
      property_id: propertyId,
      property_title: propertyTitle,
      property_price: propertyPrice,
      property_location: propertyLocation
    });
  }

  // Track search events
  trackSearch(searchQuery, searchType = 'general', resultsCount = 0) {
    this.safeTrackEvent('search', {
      search_term: searchQuery,
      search_type: searchType,
      results_count: resultsCount
    });
  }

  // Track user registration
  trackUserRegistration(method = 'email') {
    this.safeTrackEvent('sign_up', {
      method: method
    });
  }

  // Track user login
  trackUserLogin(method = 'email') {
    this.safeTrackEvent('login', {
      method: method
    });
  }

  // Track property contact/interest
  trackPropertyContact(propertyId, contactMethod = 'inquiry') {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, 'property_contact', {
        property_id: propertyId,
        contact_method: contactMethod,
        timestamp: new Date().toISOString()
      });
      console.log('📊 Analytics: Property contact tracked:', propertyId);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track favorite/bookmark
  trackFavorite(propertyId, action = 'add') {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, 'favorite_property', {
        property_id: propertyId,
        action: action, // 'add' or 'remove'
        timestamp: new Date().toISOString()
      });
      console.log('📊 Analytics: Favorite tracked:', action, propertyId);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track filter usage
  trackFilter(filterType, filterValue) {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, 'filter_used', {
        filter_type: filterType,
        filter_value: filterValue
      });
      console.log('📊 Analytics: Filter tracked:', filterType, filterValue);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Set user ID for tracking
  setUser(userId, userProperties = {}) {
    if (!this.isEnabled) return;

    try {
      setUserId(this.analytics, userId);
      if (Object.keys(userProperties).length > 0) {
        setUserProperties(this.analytics, userProperties);
      }
      console.log('📊 Analytics: User set:', userId);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track custom events
  trackCustomEvent(eventName, parameters = {}) {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, eventName, {
        ...parameters,
        timestamp: new Date().toISOString()
      });
      console.log('📊 Analytics: Custom event tracked:', eventName, parameters);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track error events
  trackError(errorType, errorMessage, errorContext = {}) {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, 'error', {
        error_type: errorType,
        error_message: errorMessage,
        error_context: JSON.stringify(errorContext),
        timestamp: new Date().toISOString()
      });
      console.log('📊 Analytics: Error tracked:', errorType);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }
}

// Create and export a singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
