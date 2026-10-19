const loanService = require('../services/loan.service');
const { successResponse, errorResponse } = require('../utils/responses');
const { validateAmount } = require('../utils/validation');

/**
 * Loan Controller
 * Handles customer-facing loan applications and retrieval.
 */

/**
 * Submits a new loan application for review.
 */
function applyForLoan(req, res, next) {
  try {
    const { loan_type, requested_amount, amount, tenure_months, description } = req.body;
    const reqAmount = requested_amount !== undefined ? requested_amount : amount;

    if (!loan_type || !loan_type.toString().trim()) {
      return errorResponse(res, 'Loan type is required.', 400);
    }

    if (reqAmount === undefined || reqAmount === null || reqAmount === '') {
      return errorResponse(res, 'Requested loan amount is required.', 400);
    }

    if (!validateAmount(reqAmount)) {
      return errorResponse(res, 'Loan amount must be a positive number greater than zero.', 400);
    }

    if (!tenure_months) {
      return errorResponse(res, 'Tenure in months is required.', 400);
    }

    const tenure = parseInt(tenure_months, 10);
    if (isNaN(tenure) || tenure < 1 || tenure > 360) {
      return errorResponse(res, 'Loan tenure must be between 1 and 360 months.', 400);
    }

    const loan = loanService.applyForLoan({
      userId: req.session.userId,
      loan_type,
      requested_amount: reqAmount,
      tenure_months: tenure,
      description
    });

    return successResponse(res, loan, 'Loan application submitted successfully.', 201);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Retrieves all loan applications submitted by the logged-in customer.
 */
function getMyLoans(req, res, next) {
  try {
    const loans = loanService.getLoanStatus(req.session.userId);
    return successResponse(res, loans, 'Loan applications retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Retrieves a single loan application by ID for the customer.
 */
function getLoanById(req, res, next) {
  try {
    const loanId = parseInt(req.params.id, 10);
    if (isNaN(loanId)) {
      return errorResponse(res, 'Invalid loan ID.', 400);
    }

    // Role-aware check: admins can view any loan, customers can only view their own
    const userId = req.session.role === 'admin' ? null : req.session.userId;
    const loan = loanService.getLoanById(loanId, userId);

    return successResponse(res, loan, 'Loan details retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

module.exports = {
  applyForLoan,
  getMyLoans,
  getLoanById
};
