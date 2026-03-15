import { Router } from 'express';
import { addTrackingData, getTracking } from '../controllers/trackingController.js';

const router = Router();

router.post('/', addTrackingData);
router.get('/', getTracking);

export default router;
