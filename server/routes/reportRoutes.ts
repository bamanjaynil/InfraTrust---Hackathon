import { Router } from 'express';
import { submitReport, getMyReports, getReports, updateReportStatus, getReportsByProject, getReportsByContractor } from '../controllers/reportController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', submitReport);
router.get('/my', getMyReports);
router.get('/contractor', authenticateToken, requireRole(['CONTRACTOR']), getReportsByContractor);
router.get('/project/:id', authenticateToken, requireRole(['CONTRACTOR', 'ADMIN']), getReportsByProject);
router.get('/', getReports);
router.patch('/:id/status', updateReportStatus);

export default router;
