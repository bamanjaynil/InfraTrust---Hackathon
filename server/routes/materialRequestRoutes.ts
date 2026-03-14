import { Router } from 'express';
import { 
  createMaterialRequest, 
  getMaterialRequestsByContractor, 
  updateMaterialRequestStatus,
  getMaterialRequestsByProject,
  approveMaterialRequest,
  rejectMaterialRequest
} from '../controllers/materialRequestController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, requireRole(['CONTRACTOR']), createMaterialRequest);
router.get('/contractor', authenticateToken, requireRole(['CONTRACTOR']), getMaterialRequestsByContractor);
router.get('/project/:projectId', authenticateToken, getMaterialRequestsByProject);
router.post('/:id/approve', authenticateToken, requireRole(['ADMIN']), approveMaterialRequest);
router.post('/:id/reject', authenticateToken, requireRole(['ADMIN']), rejectMaterialRequest);
router.patch('/:id/status', authenticateToken, requireRole(['CONTRACTOR', 'ADMIN']), updateMaterialRequestStatus);

export default router;
