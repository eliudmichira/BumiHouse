import express from 'express';
import {
  getAllAgents,
  getAgentById,
  getAgentProperties,
  searchAgents,
  getAgentStats,
  contactAgent,
  getAgentPerformance
} from '../controllers/agentController.js';

const router = express.Router();

// Agent operations
router.get('/all', getAllAgents);
router.get('/stats', getAgentStats);
router.get('/search', searchAgents);
router.get('/:id', getAgentById);
router.get('/:agentId/properties', getAgentProperties);
router.get('/:agentId/performance', getAgentPerformance);
router.post('/:agentId/contact', contactAgent);

export { router as agentRoute };
