const userRepo = require('../repositories/user.repository');
const accountRepo = require('../repositories/account.repository');
const transactionRepo = require('../repositories/transaction.repository');
const loanRepo = require('../repositories/loan.repository');
const auditRepo = require('../repositories/audit.repository');
const transactionService = require('../services/transaction.service');
const loanService = require('../services/loan.service');
const { successResponse, errorResponse, formatAmount } = require('../utils/responses');

/**
 * Admin Controller
 * Provides administrative dashboards, audit reporting, user management, and loan approvals.
 */

/**
 * Retrieves high-level dashboard metrics for bank managers.
 */
function getDashboard(req, res, next) {
  try {
    const customers = userRepo.getAllCustomers();
    const accounts = accountRepo.getAllAccounts();
    const txStats = transactionService.getTransactionStats();
    const loanStats = loanRepo.getLoanStats();

    const totalSystemBalancePaise = accounts.reduce((acc, curr) => acc + (curr.balance_paise || 0), 0);

    const dashboard = {
      customers: {
        total: customers.length,
        active: customers.filter(c => c.is_active === 1).length,
        inactive: customers.filter(c => c.is_active === 0).length
      },
      accounts: {
        total: accounts.length,
        total_balance_paise: totalSystemBalancePaise,
        total_balance_rupees: formatAmount(totalSystemBalancePaise)
      },
      transactions: txStats,
      loans: {
        ...loanStats,
        approved_volume_rupees: formatAmount(loanStats.approved_volume_paise),
        total_requested_rupees: formatAmount(loanStats.total_requested_paise)
      }
    };

    return successResponse(res, dashboard, 'Admin dashboard metrics retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Retrieves customers with optional search term.
 */
function getCustomers(req, res, next) {
  try {
    const { search } = req.query;
    let customers;
    if (search && search.trim()) {
      customers = userRepo.searchCustomers(search.trim());
    } else {
      customers = userRepo.getAllCustomers();
    }

    return successResponse(res, customers, 'Customer list retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Retrieves a customer by user ID along with their bank account.
 */
function getCustomerById(req, res, next) {
  try {
    const customerId = parseInt(req.params.id, 10);
    if (isNaN(customerId)) {
      return errorResponse(res, 'Invalid customer ID.', 400);
    }

    const customer = userRepo.findById(customerId);
    if (!customer) {
      return errorResponse(res, 'Customer not found.', 404);
    }

    const account = accountRepo.findByUserId(customerId);
    const { password_hash: _, ...safeCustomer } = customer;

    return successResponse(res, {
      customer: safeCustomer,
      account: account ? {
        ...account,
        balance_rupees: formatAmount(account.balance_paise)
      } : null
    }, 'Customer details retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Updates customer active status or account status.
 */
function updateCustomerStatus(req, res, next) {
  try {
    const customerId = parseInt(req.params.id, 10);
    if (isNaN(customerId)) {
      return errorResponse(res, 'Invalid customer ID.', 400);
    }

    const customer = userRepo.findById(customerId);
    if (!customer) {
      return errorResponse(res, 'Customer not found.', 404);
    }

    const { is_active, status } = req.body;

    if (is_active !== undefined) {
      const activeVal = is_active === true || is_active === 1 || is_active === '1' ? 1 : 0;
      userRepo.updateUser(customerId, { is_active: activeVal });
    }

    if (status) {
      const account = accountRepo.findByUserId(customerId);
      if (account) {
        accountRepo.updateStatus(account.id, status);
      }
    }

    const updated = userRepo.findById(customerId);
    const updatedAccount = accountRepo.findByUserId(customerId);
    const { password_hash: _, ...safeCustomer } = updated;

    return successResponse(res, {
      customer: safeCustomer,
      account: updatedAccount
    }, 'Customer status updated successfully.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Retrieves all transactions system-wide.
 */
function getAllTransactions(req, res, next) {
  try {
    const rawTransactions = transactionRepo.getAllTransactions();
    const transactions = rawTransactions.map(tx => ({
      ...tx,
      amount_rupees: formatAmount(tx.amount_paise)
    }));

    return successResponse(res, transactions, 'All transactions retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Retrieves all loan applications across the bank.
 */
function getAllLoans(req, res, next) {
  try {
    const loans = loanService.getAllLoans();
    return successResponse(res, loans, 'All loan applications retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Decides a loan application (approve or reject).
 */
function decideLoan(req, res, next) {
  try {
    const loanId = parseInt(req.params.id, 10);
    if (isNaN(loanId)) {
      return errorResponse(res, 'Invalid loan ID.', 400);
    }

    const { decision, status, decision_note, note } = req.body;
    const targetDecision = decision || status;

    if (!targetDecision) {
      return errorResponse(res, 'Decision ("approved" or "rejected") is required.', 400);
    }

    const updatedLoan = loanService.decideLoan({
      loanId,
      decision: targetDecision,
      decision_note: decision_note || note || '',
      adminUserId: req.session.userId
    });

    return successResponse(res, updatedLoan, `Loan application ${updatedLoan.status} successfully.`);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Generates comprehensive bank summary and audit report.
 */
function getReports(req, res, next) {
  try {
    const accounts = accountRepo.getAllAccounts();
    const txStats = transactionService.getTransactionStats();
    const loanStats = loanRepo.getLoanStats();
    const auditLogs = auditRepo.getRecentLogs(30);

    const totalPaise = accounts.reduce((acc, a) => acc + (a.balance_paise || 0), 0);
    const avgPaise = accounts.length > 0 ? Math.round(totalPaise / accounts.length) : 0;

    const report = {
      financial_summary: {
        total_accounts: accounts.length,
        total_liquidity_paise: totalPaise,
        total_liquidity_rupees: formatAmount(totalPaise),
        average_account_balance_rupees: formatAmount(avgPaise)
      },
      transactions: txStats,
      loans: loanStats,
      recent_audit_trail: auditLogs
    };

    return successResponse(res, report, 'Bank report generated successfully.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

module.exports = {
  getDashboard,
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  getAllTransactions,
  getAllLoans,
  decideLoan,
  getReports
};
