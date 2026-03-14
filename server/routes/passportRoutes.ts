import { Router } from 'express';
import { createPassport, getProjectPassports, verifyPassport } from '../controllers/passportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/create', authenticateToken, createPassport);
router.get('/project/:id', authenticateToken, getProjectPassports);
router.post('/verify', authenticateToken, verifyPassport);

export default router;
