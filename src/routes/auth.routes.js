const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/authentication');

// Public endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Authenticated session profile endpoint
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
