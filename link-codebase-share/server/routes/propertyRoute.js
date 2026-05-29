import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getPropertyStats,
  getFeaturedProperties,
  toggleFavorite
} from '../controllers/propertyController.js';

const router = express.Router();

// Property CRUD operations
router.get('/', getAllProperties);
router.get('/featured', getFeaturedProperties);
router.get('/stats', getPropertyStats);
router.get('/search', searchProperties);
router.get('/:id', getPropertyById);
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);
router.post('/:id/favorite', toggleFavorite);

export { router as propertyRoute };
