const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Submit movement (Worker or Owner)
router.post('/', authenticateToken, movementController.createMovementRequest);

// Worker views their submissions
router.get('/my', authenticateToken, movementController.getMyRequests);

// Owner views pending requests
router.get('/pending', authenticateToken, requireRole('owner'), movementController.getPendingRequests);

// Owner views all requests history
router.get('/all', authenticateToken, requireRole('owner'), movementController.getAllRequests);

// Owner reviews (Approve & Issue / Reject)
router.patch('/:id/review', authenticateToken, requireRole('owner'), movementController.reviewMovementRequest);

module.exports = router;
