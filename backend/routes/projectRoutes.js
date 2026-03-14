const express = require('express');
const ProjectController = require('../controllers/projectController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// All project routes require authentication
router.use(verifyToken);

// Create project (ADMIN only)
router.post('/', requireRole('ADMIN'), ProjectController.createProject);

// Get all projects (ADMIN, CONTRACTOR, CITIZEN)
// Drivers are blocked in the controller logic
router.get('/', ProjectController.getProjects);

// Get project by ID
router.get('/:id', ProjectController.getProjectById);

// Update project status (ADMIN or assigned CONTRACTOR)
router.patch('/:id/status', requireRole('ADMIN', 'CONTRACTOR'), ProjectController.updateProjectStatus);

module.exports = router;
