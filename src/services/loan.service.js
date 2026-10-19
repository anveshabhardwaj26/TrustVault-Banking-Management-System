const loanRepo = require('../repositories/loan.repository');
const { formatAmount } = require('../utils/responses');
const { validateAmount } = require('../utils/validation');

/**
 * Loan Service
 * Handles application submission, status checks, and credit approval decisions.
 */

/**
 * Submits a new loan application for a customer.
 * @param {object} params
 * @param {number} params.userId
 * @param {string} params.loan_type - e.g. 'personal', 'home', 'education'
 * @param {number|string} params.requested_amount - Amount in Rupees
 * @param {number|string} params.tenure_months - Loan duration in months
 * @param {string} [params.description]
 * @returns {object}
 */
function applyForLoan({ userId, loan_type, requested_amount, tenure_months, description = '' }) {
  if (!loan_type || typeof loan_type !== 'string' || !loan_type.trim()) {
    const error = new Error('Loan type is required (e.g., personal, home, education).');
    error.statusCode = 400;
    throw error;
  }

  if (!validateAmount(requested_amount)) {
    const error = new Error('Requested loan amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  const requestedAmountPaise = Math.round(Number(requested_amount) * 100);
  if (requestedAmountPaise <= 0) {
    const error = new Error('Requested loan amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  const tenure = parseInt(tenure_months, 10);
  if (isNaN(tenure) || tenure < 1 || tenure > 360) {
    const error = new Error('Loan tenure must be between 1 and 360 months.');
    error.statusCode = 400;
    throw error;
  }

  const loan = loanRepo.createLoan({
    user_id: userId,
    loan_type: loan_type.trim().toLowerCase(),
    requested_amount_paise: requestedAmountPaise,
    tenure_months: tenure,
    application_description: description ? description.trim() : ''
  });

  return {
    ...loan,
    requested_amount_rupees: formatAmount(loan.requested_amount_paise)
  };
}

/**
 * Retrieves all loan applications submitted by a customer.
 * @param {number} userId
 * @returns {Array<object>}
 */
function getLoanStatus(userId) {
  const loans = loanRepo.getLoansByUserId(userId);
  return loans.map(loan => ({
    ...loan,
    requested_amount_rupees: formatAmount(loan.requested_amount_paise)
  }));
}

/**
 * Retrieves a specific loan application by ID, enforcing ownership.
 * @param {number} id
 * @param {number} [userId] - If provided, ensures the loan belongs to this user
 * @returns {object}
 */
function getLoanById(id, userId = null) {
  const loan = loanRepo.getLoanById(id);
  if (!loan) {
    const error = new Error('Loan application not found.');
    error.statusCode = 404;
    throw error;
  }

  if (userId && loan.user_id !== userId) {
    const error = new Error('Access denied. You can only view your own loan applications.');
    error.statusCode = 403;
    throw error;
  }

  return {
    ...loan,
    requested_amount_rupees: formatAmount(loan.requested_amount_paise)
  };
}

/**
 * Retrieves all loans across the bank (Admin only).
 * @returns {Array<object>}
 */
function getAllLoans() {
  const loans = loanRepo.getAllLoans();
  return loans.map(loan => ({
    ...loan,
    requested_amount_rupees: formatAmount(loan.requested_amount_paise)
  }));
}

/**
 * Decides a loan application (approve or reject).
 * @param {object} params
 * @param {number} params.loanId
 * @param {string} params.decision - 'approved' | 'rejected'
 * @param {string} [params.decision_note]
 * @param {number} params.adminUserId
 * @returns {object}
 */
function decideLoan({ loanId, decision, decision_note = '', adminUserId }) {
  const normalizedDecision = decision ? decision.toLowerCase().trim() : '';
  if (!['approved', 'rejected'].includes(normalizedDecision)) {
    const error = new Error('Decision must be either "approved" or "rejected".');
    error.statusCode = 400;
    throw error;
  }

  const loan = loanRepo.getLoanById(loanId);
  if (!loan) {
    const error = new Error('Loan application not found.');
    error.statusCode = 404;
    throw error;
  }

  if (loan.status !== 'pending') {
    const error = new Error(`Loan has already been ${loan.status} and cannot be modified.`);
    error.statusCode = 400;
    throw error;
  }

  const updatedLoan = loanRepo.updateLoanDecision(loanId, {
    status: normalizedDecision,
    decision_note: decision_note ? decision_note.trim() : '',
    reviewed_by: adminUserId,
    reviewed_at: new Date().toISOString()
  });

  return {
    ...updatedLoan,
    requested_amount_rupees: formatAmount(updatedLoan.requested_amount_paise)
  };
}

module.exports = {
  applyForLoan,
  getLoanStatus,
  getLoanById,
  getAllLoans,
  decideLoan
};
