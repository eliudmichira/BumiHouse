// Server-side analytics service for GA4 Measurement Protocol
// This should be used from your backend/server, not from the browser

class ServerAnalyticsService {
  constructor(measurementId, apiSecret) {
    this.measurementId = measurementId;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://www.google-analytics.com/mp/collect';
  }

  // Send event to GA4 Measurement Protocol (server-side only)
  async sendEvent(clientId, eventName, parameters = {}) {
    if (!this.measurementId || !this.apiSecret) {
      console.warn('⚠️ GA4 Measurement Protocol not configured');
      return { success: false, error: 'Not configured' };
    }

    try {
      const payload = {
        client_id: clientId,
        events: [{
          name: eventName,
          params: {
            ...parameters,
            timestamp_micros: Date.now() * 1000
          }
        }]
      };

      const response = await fetch(`${this.baseUrl}?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`GA4 MP request failed: ${response.status} ${response.statusText}`);
      }

      console.log(`📊 Server Analytics: Event sent - ${eventName}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Server Analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  // Track page view (server-side)
  async trackPageView(clientId, pageTitle, pageLocation) {
    return this.sendEvent(clientId, 'page_view', {
      page_title: pageTitle,
      page_location: pageLocation
    });
  }

  // Track custom event (server-side)
  async trackCustomEvent(clientId, eventName, parameters = {}) {
    return this.sendEvent(clientId, eventName, parameters);
  }
}

// Export for use in server-side code
export default ServerAnalyticsService;

// Example usage in your backend:
/*
import ServerAnalyticsService from './lib/serverAnalytics.js';

const analytics = new ServerAnalyticsService(
  process.env.GA4_MEASUREMENT_ID,
  process.env.GA4_API_SECRET
);

// In your API endpoint:
app.post('/api/analytics/track', async (req, res) => {
  const { clientId, eventName, parameters } = req.body;
  
  const result = await analytics.trackCustomEvent(clientId, eventName, parameters);
  
  res.json(result);
});
*/
