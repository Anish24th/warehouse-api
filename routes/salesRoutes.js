const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Owner Sales & Analytics Sub-Dashboard
router.get('/summary', authenticateToken, requireRole('owner'), salesController.getSalesAnalytics);

module.exports = router;
