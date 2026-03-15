import { Router } from 'express';
import { submitReport, getMyReports, getReports, updateReportStatus, getReportsByProject, getReportsByContractor } from '../controllers/reportController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, requireRole(['CITIZEN']), submitReport);
router.get('/my', authenticateToken, requireRole(['CITIZEN']), getMyReports);
router.get('/contractor', authenticateToken, requireRole(['CONTRACTOR']), getReportsByContractor);
router.get('/project/:id', authenticateToken, requireRole(['CONTRACTOR', 'ADMIN']), getReportsByProject);
router.get('/', getReports);
router.patch('/:id/status', authenticateToken, requireRole(['ADMIN']), updateReportStatus);

export default router;
