import { Router } from 'express';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import contractorRoutes from './routes/contractorRoutes.js';
import passportRoutes from './routes/passportRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import trustRoutes from './routes/trustRoutes.js';
import materialRequestRoutes from './routes/materialRequestRoutes.js';
import driverRoutes from './routes/driverRoutes.js';

const router = Router();

// Modular Routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/reports', reportRoutes);
router.use('/contractors', contractorRoutes);
router.use('/users', contractorRoutes); // Keep /users for backward compatibility or move to a separate userRoutes
router.use('/passports', passportRoutes);
router.use('/tracking', trackingRoutes);
router.use('/trust', trustRoutes);
router.use('/material-requests', materialRequestRoutes);
router.use('/drivers', driverRoutes);

export default router;
