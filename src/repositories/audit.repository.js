const db = require('../config/database');

/**
 * Audit Repository
 * Records system actions and security events into the audit_logs table.
 */

/**
 * Inserts an audit log record.
 * @param {object} params
 * @param {number|null} [params.actor_user_id]
 * @param {string} params.action
 * @param {string} params.entity_type
 * @param {number|null} [params.entity_id]
 * @param {string} [params.details]
 * @returns {object}
 */
function createAuditLog({ actor_user_id = null, action, entity_type, entity_id = null, details = null }) {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    actor_user_id,
    action,
    entity_type,
    entity_id,
    typeof details === 'object' ? JSON.stringify(details) : details
  );
  return db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(info.lastInsertRowid);
}

/**
 * Retrieves recent audit logs.
 * @param {number} [limit=50]
 * @returns {Array<object>}
 */
function getRecentLogs(limit = 50) {
  const stmt = db.prepare(`
    SELECT a.*, u.full_name as actor_name, u.email as actor_email
    FROM audit_logs a
    LEFT JOIN users u ON a.actor_user_id = u.id
    ORDER BY a.timestamp DESC, a.id DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

module.exports = {
  createAuditLog,
  getRecentLogs
};
