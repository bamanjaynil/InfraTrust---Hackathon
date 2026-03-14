import { Router } from 'express';
import { addTrackingData } from '../controllers/trackingController.js';

const router = Router();

router.post('/', addTrackingData);

export default router;
