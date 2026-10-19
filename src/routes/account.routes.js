const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const { requireAuth } = require('../middleware/authentication');

// All account routes require valid customer authentication
router.use(requireAuth);

router.get('/me', accountController.getMyAccount);
router.get('/me/balance', accountController.getMyBalance);

module.exports = router;
