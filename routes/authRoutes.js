const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/guest', authController.guestLogin);
router.post('/create-worker', authenticateToken, requireRole('owner'), authController.createWorker);
router.get('/me', authenticateToken, authController.getMe);
router.get('/workers', authenticateToken, requireRole('owner'), authController.getWorkers);

module.exports = router;
