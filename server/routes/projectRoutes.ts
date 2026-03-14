import { Router } from 'express';
import { getProjects, createProject, getProjectById, updateProjectStatus, getContractorProjects } from '../controllers/projectController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getProjects);
router.get('/contractor', authenticateToken, requireRole(['CONTRACTOR']), getContractorProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.patch('/:id/status', updateProjectStatus);

export default router;
