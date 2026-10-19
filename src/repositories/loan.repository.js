const db = require('../config/database');

/**
 * Loan Repository
 * Handles database operations for loan applications.
 */

/**
 * Creates a new loan application.
 * @param {object} params
 * @param {number} params.user_id
 * @param {string} params.loan_type
 * @param {number} params.requested_amount_paise
 * @param {number} params.tenure_months
 * @param {string} [params.application_description]
 * @returns {object} The created loan application record
 */
function createLoan({ user_id, loan_type, requested_amount_paise, tenure_months, application_description = '' }) {
  const stmt = db.prepare(`
    INSERT INTO loan_applications (
      user_id,
      loan_type,
      requested_amount_paise,
      tenure_months,
      application_description,
      status
    ) VALUES (?, ?, ?, ?, ?, 'pending')
  `);
  const info = stmt.run(user_id, loan_type, requested_amount_paise, tenure_months, application_description);
  return getLoanById(info.lastInsertRowid);
}

/**
 * Retrieves all loan applications submitted by a specific user.
 * @param {number} userId
 * @returns {Array<object>}
 */
function getLoansByUserId(userId) {
  const stmt = db.prepare(`
    SELECT l.*, r.full_name as reviewer_name
    FROM loan_applications l
    LEFT JOIN users r ON l.reviewed_by = r.id
    WHERE l.user_id = ?
    ORDER BY l.created_at DESC, l.id DESC
  `);
  return stmt.all(userId);
}

/**
 * Retrieves a single loan application by ID.
 * @param {number} id
 * @returns {object|undefined}
 */
function getLoanById(id) {
  const stmt = db.prepare(`
    SELECT l.*,
           u.full_name as applicant_name,
           u.email as applicant_email,
           r.full_name as reviewer_name
    FROM loan_applications l
    JOIN users u ON l.user_id = u.id
    LEFT JOIN users r ON l.reviewed_by = r.id
    WHERE l.id = ?
  `);
  return stmt.get(id);
}

/**
 * Retrieves all loan applications system-wide (for bank administrators).
 * @returns {Array<object>}
 */
function getAllLoans() {
  const stmt = db.prepare(`
    SELECT l.*,
           u.full_name as applicant_name,
           u.email as applicant_email,
           r.full_name as reviewer_name
    FROM loan_applications l
    JOIN users u ON l.user_id = u.id
    LEFT JOIN users r ON l.reviewed_by = r.id
    ORDER BY l.created_at DESC, l.id DESC
  `);
  return stmt.all();
}

/**
 * Updates the decision status and notes for a loan application.
 * @param {number} id
 * @param {object} params
 * @param {string} params.status - 'approved' | 'rejected'
 * @param {string} [params.decision_note]
 * @param {number} params.reviewed_by
 * @param {string} [params.reviewed_at]
 * @returns {object} The updated loan application
 */
function updateLoanDecision(id, { status, decision_note = '', reviewed_by, reviewed_at = new Date().toISOString() }) {
  const stmt = db.prepare(`
    UPDATE loan_applications
    SET status = ?,
        decision_note = ?,
        reviewed_by = ?,
        reviewed_at = ?
    WHERE id = ?
  `);
  stmt.run(status, decision_note, reviewed_by, reviewed_at, id);
  return getLoanById(id);
}

/**
 * Computes aggregated loan statistics for dashboard and reporting.
 * @returns {object}
 */
function getLoanStats() {
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total_loans,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_loans,
      COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved_loans,
      COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected_loans,
      COALESCE(SUM(CASE WHEN status = 'approved' THEN requested_amount_paise ELSE 0 END), 0) as approved_volume_paise,
      COALESCE(SUM(requested_amount_paise), 0) as total_requested_paise
    FROM loan_applications
  `);
  return stmt.get();
}

module.exports = {
  createLoan,
  getLoansByUserId,
  getLoanById,
  getAllLoans,
  updateLoanDecision,
  getLoanStats
};
