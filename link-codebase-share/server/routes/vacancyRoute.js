import express from 'express';
import {
  getVacancyData,
  updateVacancyData,
  addUnitType,
  updateUnitType,
  deleteUnitType,
  updateUnitAvailability,
  getVacancyAnalytics,
  addToWaitlist,
  getWaitlist
} from '../controllers/vacancyController.js';
import jwtCheck from '../config/auth0Config.js';

const router = express.Router();

// Public routes
router.get('/:id', getVacancyData);
router.get('/analytics', getVacancyAnalytics);
router.post('/:id/waitlist', addToWaitlist);
router.get('/:id/waitlist', getWaitlist);

// Protected routes (require authentication)
router.use(jwtCheck);

// Vacancy management routes
router.put('/:id', updateVacancyData);

// Unit type management routes
router.post('/:id/unit-types', addUnitType);
router.put('/:id/unit-types/:unitTypeId', updateUnitType);
router.delete('/:id/unit-types/:unitTypeId', deleteUnitType);

// Unit availability routes
router.patch('/:id/unit-types/:unitTypeId/availability', updateUnitAvailability);

export default router;
