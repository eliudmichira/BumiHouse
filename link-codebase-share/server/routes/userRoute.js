import express from 'express';
import {
  createUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
  updateUserPreferences,
  getUserPreferences,
  getUserActivity,
  getUserDashboardStats
} from '../controllers/userController.js';

const router = express.Router();

// User CRUD operations
router.post('/register', createUser);
router.get('/:userId/profile', getUserProfile);
router.put('/:userId/profile', updateUserProfile);
router.delete('/:userId', deleteUser);

// User favorites
router.post('/:userId/favorites', addToFavorites);
router.delete('/:userId/favorites', removeFromFavorites);
router.get('/:userId/favorites', getUserFavorites);

// User searches
router.post('/:userId/searches', saveSearch);
router.get('/:userId/searches', getSavedSearches);
router.delete('/searches/:searchId', deleteSavedSearch);

// User preferences
router.put('/:userId/preferences', updateUserPreferences);
router.get('/:userId/preferences', getUserPreferences);

// User activity and stats
router.get('/:userId/activity', getUserActivity);
router.get('/:userId/dashboard-stats', getUserDashboardStats);

export { router as userRoute };