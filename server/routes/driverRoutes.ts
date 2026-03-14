import { Router } from 'express';
import { createDriver, getDrivers } from '../controllers/driverController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Assuming contractors can create and view drivers
router.post('/', authenticateToken, requireRole(['CONTRACTOR', 'ADMIN']), createDriver);
router.get('/', authenticateToken, requireRole(['CONTRACTOR', 'ADMIN']), getDrivers);

export default router;
