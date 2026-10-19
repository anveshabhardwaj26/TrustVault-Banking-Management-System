const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/authentication');
const { auditLog } = require('../middleware/authorization');

// Enforce admin privileges on all admin endpoints
router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomerById);
router.patch('/customers/:id/status', auditLog('UPDATE_CUSTOMER_STATUS', 'USER'), adminController.updateCustomerStatus);
router.get('/transactions', adminController.getAllTransactions);
router.get('/loans', adminController.getAllLoans);
router.patch('/loans/:id/decision', auditLog('DECIDE_LOAN', 'LOAN'), adminController.decideLoan);
router.get('/reports', adminController.getReports);

module.exports = router;
