import api from './api';

export const vacancyService = {
  // Get vacancy data for a property
  async getVacancyData(propertyId) {
    try {
      const response = await api.get(`/properties/${propertyId}/vacancy`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vacancy data:', error);
      throw error;
    }
  },

  // Update vacancy data for a property
  async updateVacancyData(propertyId, vacancyData) {
    try {
      const response = await api.put(`/properties/${propertyId}/vacancy`, vacancyData);
      return response.data;
    } catch (error) {
      console.error('Error updating vacancy data:', error);
      throw error;
    }
  },

  // Add a new unit type
  async addUnitType(propertyId, unitType) {
    try {
      const response = await api.post(`/properties/${propertyId}/unit-types`, unitType);
      return response.data;
    } catch (error) {
      console.error('Error adding unit type:', error);
      throw error;
    }
  },

  // Update a unit type
  async updateUnitType(propertyId, unitTypeId, unitType) {
    try {
      const response = await api.put(`/properties/${propertyId}/unit-types/${unitTypeId}`, unitType);
      return response.data;
    } catch (error) {
      console.error('Error updating unit type:', error);
      throw error;
    }
  },

  // Delete a unit type
  async deleteUnitType(propertyId, unitTypeId) {
    try {
      const response = await api.delete(`/properties/${propertyId}/unit-types/${unitTypeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting unit type:', error);
      throw error;
    }
  },

  // Update unit availability (occupy/vacate)
  async updateUnitAvailability(propertyId, unitTypeId, action) {
    try {
      const response = await api.patch(`/properties/${propertyId}/unit-types/${unitTypeId}/availability`, {
        action // 'occupy' or 'vacate'
      });
      return response.data;
    } catch (error) {
      console.error('Error updating unit availability:', error);
      throw error;
    }
  },

  // Get vacancy analytics for multiple properties
  async getVacancyAnalytics(propertyIds = []) {
    try {
      const response = await api.get('/properties/vacancy/analytics', {
        params: { propertyIds: propertyIds.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vacancy analytics:', error);
      throw error;
    }
  },

  // Add to waitlist
  async addToWaitlist(propertyId, email, preferences = {}) {
    try {
      const response = await api.post(`/properties/${propertyId}/waitlist`, {
        email,
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      throw error;
    }
  },

  // Get waitlist for a property
  async getWaitlist(propertyId) {
    try {
      const response = await api.get(`/properties/${propertyId}/waitlist`);
      return response.data;
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      throw error;
    }
  }
};
