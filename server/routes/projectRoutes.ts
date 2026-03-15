import { Router } from 'express';
import {
  applyToProject,
  approveApplication,
  createProject,
  getContractorProjects,
  getProjectById,
  getProjects,
  updateProjectStatus,
} from '../controllers/projectController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getProjects);
router.get('/contractor', authenticateToken, requireRole(['CONTRACTOR']), getContractorProjects);
router.post('/', authenticateToken, requireRole(['ADMIN']), createProject);
router.post('/:id/apply', authenticateToken, requireRole(['CONTRACTOR']), applyToProject);
router.post('/applications/:applicationId/approve', authenticateToken, requireRole(['ADMIN']), approveApplication);
router.get('/:id', getProjectById);
router.patch('/:id/status', authenticateToken, requireRole(['ADMIN', 'CONTRACTOR']), updateProjectStatus);

export default router;
