const fs = require('fs');
const path = require('path');
const db = require('../config/database');

/**
 * Initializes the SQLite database by executing schema.sql.
 * It is idempotent and safe to run multiple times.
 * @param {import('better-sqlite3').Database} [targetDb] - Optional database instance.
 */
function initDatabase(targetDb = db) {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[TrustVault DB] Executing database schema initialization...');

    // better-sqlite3 exec() executes all SQL statements in the string
    targetDb.exec(schemaSql);

    console.log('[TrustVault DB] Database initialized successfully.');
    return targetDb;
  } catch (error) {
    console.error('[TrustVault DB] Failed to initialize database:', error.message);
    throw error;
  }
}

// If run directly from CLI
if (require.main === module) {
  initDatabase();
  console.log('[TrustVault DB] Tables and indexes verified.');
}

module.exports = {
  db,
  initDatabase
};
