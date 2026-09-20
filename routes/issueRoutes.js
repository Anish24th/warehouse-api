const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Anyone (worker, guest, owner) can submit an issue/feedback
router.post('/', authenticateToken, issueController.createIssue);

// Owner views and manages issue feed
router.get('/', authenticateToken, requireRole('owner'), issueController.getAllIssues);
router.patch('/:id/resolve', authenticateToken, requireRole('owner'), issueController.resolveIssue);

module.exports = router;
