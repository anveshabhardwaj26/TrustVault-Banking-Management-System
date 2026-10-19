const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { requireAuth } = require('../middleware/authentication');
const { auditLog } = require('../middleware/authorization');

// Protect all transaction routes
router.use(requireAuth);

router.post('/deposit', auditLog('DEPOSIT', 'TRANSACTION'), transactionController.deposit);
router.post('/withdraw', auditLog('WITHDRAWAL', 'TRANSACTION'), transactionController.withdraw);
router.post('/transfer', auditLog('TRANSFER', 'TRANSACTION'), transactionController.transfer);
router.get('/me', transactionController.getMyTransactions);

module.exports = router;
