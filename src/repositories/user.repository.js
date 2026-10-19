const db = require('../config/database');

/**
 * User Repository
 * Data access layer for user accounts, using parameterized queries for SQL injection prevention.
 */

/**
 * Finds a user by email address.
 * @param {string} email
 * @returns {object|undefined}
 */
function findByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
  return stmt.get(email);
}

/**
 * Finds a user by their unique primary key ID.
 * @param {number} id
 * @returns {object|undefined}
 */
function findById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

/**
 * Creates a new user record.
 * @param {object} params
 * @param {string} params.full_name
 * @param {string} params.email
 * @param {string} params.phone
 * @param {string} params.password_hash
 * @param {string} [params.role='customer']
 * @returns {object} The created user record
 */
function createUser({ full_name, email, phone, password_hash, role = 'customer' }) {
  const stmt = db.prepare(`
    INSERT INTO users (full_name, email, phone, password_hash, role)
    VALUES (?, LOWER(?), ?, ?, ?)
  `);
  const info = stmt.run(full_name, email, phone, password_hash, role);
  return findById(info.lastInsertRowid);
}

/**
 * Updates allowed fields for a user.
 * @param {number} id
 * @param {object} fields - Object containing fields to update (e.g. full_name, phone, is_active)
 * @returns {object|undefined} The updated user record
 */
function updateUser(id, fields) {
  const allowedKeys = ['full_name', 'phone', 'is_active', 'password_hash', 'role'];
  const setClauses = [];
  const values = [];

  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
  const stmt = db.prepare(sql);
  stmt.run(...values);

  return findById(id);
}

/**
 * Retrieves all customers.
 * Excludes sensitive password hash from the select query.
 * @returns {Array<object>}
 */
function getAllCustomers() {
  const stmt = db.prepare(`
    SELECT id, full_name, email, phone, role, is_active, created_at, updated_at
    FROM users
    WHERE role = 'customer'
    ORDER BY id DESC
  `);
  return stmt.all();
}

/**
 * Searches customers by name, email, or phone.
 * @param {string} query
 * @returns {Array<object>}
 */
function searchCustomers(query) {
  const pattern = `%${query}%`;
  const stmt = db.prepare(`
    SELECT id, full_name, email, phone, role, is_active, created_at, updated_at
    FROM users
    WHERE role = 'customer' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)
    ORDER BY id DESC
  `);
  return stmt.all(pattern, pattern, pattern);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUser,
  getAllCustomers,
  searchCustomers
};
