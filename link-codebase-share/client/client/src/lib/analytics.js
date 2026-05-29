import { analytics } from './firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

// Analytics service for tracking user interactions
class AnalyticsService {
  constructor() {
    this.analytics = analytics;
    this.isEnabled = this.analytics && typeof window !== 'undefined';
  }

  // Track page views
  trackPageView(pageName, pageTitle = null) {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, 'page_view', {
        page_title: pageTitle || pageName,
        page_location: window.location.href,
        page_name: pageName
      });
      console.log('📊 Analytics: Page view tracked:', pageName);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track property views
  trackPropertyView(propertyId, propertyTitle, propertyPrice, propertyLocation) {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, 'property_view', {
        property_id: propertyId,
        property_title: propertyTitle,
        property_price: propertyPrice,
        property_location: propertyLocation,
        timestamp: new Date().toISOString()
      });
      console.log('📊 Analytics: Property view tracked:', propertyTitle);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track search events
  trackSearch(searchQuery, searchType = 'general', resultsCount = 0) {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, 'search', {
        search_term: searchQuery,
        search_type: searchType,
        results_count: resultsCount
      });
      console.log('📊 Analytics: Search tracked:', searchQuery);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track user registration
  trackUserRegistration(method = 'email') {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, 'sign_up', {
        method: method
      });
      console.log('📊 Analytics: User registration tracked:', method);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
  }

  // Track user login
  trackUserLogin(method = 'email') {
    if (!this.isEnabled) return;

    try {
      logEvent(this.analytics, 'login', {
        method: method
      });
      console.log('📊 Analytics: User login tracked:', method);
    } catch (error) {
      console.error('❌ Analytics error:', error);
    }
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
