// API service for trial signup
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const createTrialAccount = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/trial/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Personal Info
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        
        // Business Info
        businessType: formData.businessType,
        propertyCount: formData.propertyCount,
        location: formData.location,
        
        // Preferences
        interests: formData.interests,
        timeline: formData.timeline,
        
        // Metadata
        source: 'rentakenya-landing',
        trialLength: 30, // days
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Trial signup error:', error);
    throw error;
  }
};

export const trackTrialEvent = async (eventType, data) => {
  try {
    await fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventType,
        data,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};
