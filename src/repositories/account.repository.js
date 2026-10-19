const defaultDb = require('../config/database');

/**
 * Account Repository
 * Manages bank accounts data access. Supports passing transaction-bound db connection.
 */

/**
 * Finds an account by user ID.
 * @param {number} userId
 * @returns {object|undefined}
 */
function findByUserId(userId) {
  const stmt = defaultDb.prepare('SELECT * FROM accounts WHERE user_id = ? ORDER BY id ASC LIMIT 1');
  return stmt.get(userId);
}

/**
 * Finds an account by account ID.
 * @param {number} accountId
 * @returns {object|undefined}
 */
function findById(accountId) {
  const stmt = defaultDb.prepare('SELECT * FROM accounts WHERE id = ?');
  return stmt.get(accountId);
}

/**
 * Finds an account by its unique account number (e.g. TV1234567890).
 * @param {string} accountNumber
 * @returns {object|undefined}
 */
function findByAccountNumber(accountNumber) {
  const stmt = defaultDb.prepare('SELECT * FROM accounts WHERE account_number = ?');
  return stmt.get(accountNumber);
}

/**
 * Creates a new bank account.
 * @param {object} params
 * @param {string} params.account_number
 * @param {number} params.user_id
 * @param {string} [params.account_type='savings']
 * @param {number} [params.balance_paise=0]
 * @param {string} [params.status='active']
 * @param {import('better-sqlite3').Database} [db]
 * @returns {object} The created account record
 */
function createAccount({ account_number, user_id, account_type = 'savings', balance_paise = 0, status = 'active' }, db = defaultDb) {
  const stmt = db.prepare(`
    INSERT INTO accounts (account_number, user_id, account_type, balance_paise, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(account_number, user_id, account_type, balance_paise, status);
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(info.lastInsertRowid);
}

/**
 * Updates the balance of an account in paise.
 * @param {number} accountId
 * @param {number} newBalancePaise
 * @param {import('better-sqlite3').Database} [db] - Optional transaction db instance
 * @returns {object}
 */
function updateBalance(accountId, newBalancePaise, db = defaultDb) {
  const stmt = db.prepare(`
    UPDATE accounts
    SET balance_paise = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(newBalancePaise, accountId);
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
}

/**
 * Updates the status of an account (active, blocked, closed).
 * @param {number} accountId
 * @param {string} status
 * @param {import('better-sqlite3').Database} [db]
 * @returns {object}
 */
function updateStatus(accountId, status, db = defaultDb) {
  const stmt = db.prepare(`
    UPDATE accounts
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(status, accountId);
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
}

/**
 * Retrieves all accounts along with user profile details.
 * @returns {Array<object>}
 */
function getAllAccounts() {
  const stmt = defaultDb.prepare(`
    SELECT a.*, u.full_name as owner_name, u.email as owner_email
    FROM accounts a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.id DESC
  `);
  return stmt.all();
}

module.exports = {
  findByUserId,
  findById,
  findByAccountNumber,
  createAccount,
  updateBalance,
  updateStatus,
  getAllAccounts
};
