const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all user routes
router.use(verifyToken);

// Only ADMIN can fetch users by role
router.get('/', requireRole('ADMIN'), userController.getUsersByRole);

module.exports = router;
