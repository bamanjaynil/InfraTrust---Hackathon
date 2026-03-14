import { Router } from 'express';
import { getTrustScores } from '../controllers/trustController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, getTrustScores);

export default router;
