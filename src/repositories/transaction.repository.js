const defaultDb = require('../config/database');

/**
 * Transaction Repository
 * Handles transaction records persistence and statistics.
 */

/**
 * Creates a transaction record.
 * @param {object} params
 * @param {string} params.transaction_reference
 * @param {string} params.transaction_type - 'deposit' | 'withdrawal' | 'transfer'
 * @param {number|null} [params.source_account_id=null]
 * @param {number|null} [params.destination_account_id=null]
 * @param {number} params.amount_paise
 * @param {string} [params.status='completed']
 * @param {string} [params.description]
 * @param {import('better-sqlite3').Database} [db]
 * @returns {object} The created transaction
 */
function createTransaction({
  transaction_reference,
  transaction_type,
  source_account_id = null,
  destination_account_id = null,
  amount_paise,
  status = 'completed',
  description = ''
}, db = defaultDb) {
  const stmt = db.prepare(`
    INSERT INTO transactions (
      transaction_reference,
      transaction_type,
      source_account_id,
      destination_account_id,
      amount_paise,
      status,
      description
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    transaction_reference,
    transaction_type,
    source_account_id,
    destination_account_id,
    amount_paise,
    status,
    description
  );

  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid);
}

/**
 * Retrieves transactions for a specific account with optional filtering.
 * @param {number} accountId
 * @param {object} [filters]
 * @param {string} [filters.type]
 * @param {number} [filters.limit=50]
 * @param {number} [filters.offset=0]
 * @returns {Array<object>}
 */
function getTransactionsByAccountId(accountId, filters = {}) {
  let sql = `
    SELECT t.*,
           sa.account_number as source_account_number,
           da.account_number as destination_account_number
    FROM transactions t
    LEFT JOIN accounts sa ON t.source_account_id = sa.id
    LEFT JOIN accounts da ON t.destination_account_id = da.id
    WHERE (t.source_account_id = ? OR t.destination_account_id = ?)
  `;
  const params = [accountId, accountId];

  if (filters.type) {
    sql += ' AND t.transaction_type = ?';
    params.push(filters.type);
  }

  sql += ' ORDER BY t.created_at DESC, t.id DESC';

  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(Number(filters.limit));
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(Number(filters.offset));
    }
  }

  const stmt = defaultDb.prepare(sql);
  return stmt.all(...params);
}

/**
 * Retrieves all transactions system-wide (for admin auditing).
 * @returns {Array<object>}
 */
function getAllTransactions() {
  const stmt = defaultDb.prepare(`
    SELECT t.*,
           sa.account_number as source_account_number,
           da.account_number as destination_account_number,
           su.full_name as source_user_name,
           du.full_name as destination_user_name
    FROM transactions t
    LEFT JOIN accounts sa ON t.source_account_id = sa.id
    LEFT JOIN users su ON sa.user_id = su.id
    LEFT JOIN accounts da ON t.destination_account_id = da.id
    LEFT JOIN users du ON da.user_id = du.id
    ORDER BY t.created_at DESC, t.id DESC
  `);
  return stmt.all();
}

/**
 * Updates the status of a transaction.
 * @param {number} transactionId
 * @param {string} status - 'pending' | 'completed' | 'failed'
 * @param {import('better-sqlite3').Database} [db]
 * @returns {object}
 */
function updateStatus(transactionId, status, db = defaultDb) {
  const stmt = db.prepare('UPDATE transactions SET status = ? WHERE id = ?');
  stmt.run(status, transactionId);
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId);
}

/**
 * Computes aggregated transaction statistics.
 * @returns {object}
 */
function getTransactionStats() {
  const stmt = defaultDb.prepare(`
    SELECT
      COUNT(*) as total_count,
      COALESCE(SUM(amount_paise), 0) as total_volume_paise,
      COALESCE(SUM(CASE WHEN transaction_type = 'deposit' THEN amount_paise ELSE 0 END), 0) as deposit_volume_paise,
      COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount_paise ELSE 0 END), 0) as withdrawal_volume_paise,
      COALESCE(SUM(CASE WHEN transaction_type = 'transfer' THEN amount_paise ELSE 0 END), 0) as transfer_volume_paise,
      COALESCE(SUM(CASE WHEN transaction_type = 'deposit' THEN 1 ELSE 0 END), 0) as deposit_count,
      COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' THEN 1 ELSE 0 END), 0) as withdrawal_count,
      COALESCE(SUM(CASE WHEN transaction_type = 'transfer' THEN 1 ELSE 0 END), 0) as transfer_count
    FROM transactions
    WHERE status = 'completed'
  `);
  return stmt.get();
}

module.exports = {
  createTransaction,
  getTransactionsByAccountId,
  getAllTransactions,
  updateStatus,
  getTransactionStats
};
