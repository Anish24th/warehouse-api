const express = require('express');
const router = express.Router();
const acController = require('../controllers/acController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Any authenticated user (or worker/owner) can list AC models
router.get('/', authenticateToken, acController.getAllACs);
router.get('/:id', authenticateToken, acController.getACById);

// Owner-only operations
router.post('/', authenticateToken, requireRole('owner'), acController.createAC);
router.put('/:id', authenticateToken, requireRole('owner'), acController.updateAC);
router.delete('/:id', authenticateToken, requireRole('owner'), acController.deleteAC);

module.exports = router;
