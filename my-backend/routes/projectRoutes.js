import express from 'express';
import { getDashboardSummary, getAllProjects, getProjectById } from '../controllers/projectController.js';

const router = express.Router();

router.get('/dashboard', getDashboardSummary);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

export default router;