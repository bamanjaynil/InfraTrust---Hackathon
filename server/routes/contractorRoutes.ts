import { Router } from 'express';
import { getContractors, getUsersByRole } from '../controllers/contractorController.js';

const router = Router();

router.get('/', getContractors);
router.get('/users', getUsersByRole);

export default router;
