const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const { requireAuth } = require('../middleware/authentication');
const { auditLog } = require('../middleware/authorization');

// Protect all customer loan endpoints
router.use(requireAuth);

router.post('/', auditLog('APPLY_LOAN', 'LOAN'), loanController.applyForLoan);
router.get('/me', loanController.getMyLoans);
router.get('/:id', loanController.getLoanById);

module.exports = router;
