import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const useSaveUserData = (currentUser, favorites, savedSearches, userPreferences) => {
  return useMutation({
    mutationFn: async () => {
      if (!currentUser) return;

      // Skip backend if not localhost
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return;
      }

      return axios.put(
        `http://localhost:8800/api/users/${currentUser.id}/preferences`,
        {
          favorites,
          savedSearches,
          preferences: userPreferences
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 3000
        }
      );
    },

    onSuccess: () => {
      // Optional: success toast or silent save
      toast.success('Preferences saved');
    },

    onError: ({ response }) => {
      toast.error(response?.data?.message || 'Failed to save preferences');
    },

    onSettled: () => {
      // Called after success or error
      console.log('Save attempt finished');
    }
  });
};
