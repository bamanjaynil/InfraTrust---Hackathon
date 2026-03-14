import { Router } from 'express';
import { 
  getDeliveries, 
  getDeliveriesByDriver,
  getDeliveriesByContractor,
  getDeliveryById,
  createDelivery, 
  updateDeliveryStatus,
  startDelivery,
  markArrived,
  completeDelivery,
  assignDriver,
  verifyDelivery,
  getDeliveriesByDriverId
} from '../controllers/deliveryController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getDeliveries);
router.get('/driver', getDeliveriesByDriver);
router.get('/contractor', authenticateToken, requireRole(['CONTRACTOR']), getDeliveriesByContractor);
router.get('/:id', getDeliveryById);
router.post('/', createDelivery);
router.put('/:id/status', updateDeliveryStatus);
router.post('/:id/start', startDelivery);
router.post('/:id/arrive', markArrived);
router.post('/:id/complete', completeDelivery);
router.post('/assign-driver', authenticateToken, requireRole(['ADMIN']), assignDriver);
router.post('/verify', authenticateToken, requireRole(['DRIVER']), verifyDelivery);
router.get('/driver/:driverId', authenticateToken, requireRole(['DRIVER']), getDeliveriesByDriverId);

export default router;
