import { Router } from 'express';
import { createPassport, getProjectPassports, verifyPassport } from '../controllers/passportController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/create', authenticateToken, requireRole(['ADMIN', 'CONTRACTOR']), createPassport);
router.get('/project/:id', authenticateToken, getProjectPassports);
router.post('/verify', authenticateToken, requireRole(['DRIVER', 'ADMIN']), verifyPassport);

export default router;
