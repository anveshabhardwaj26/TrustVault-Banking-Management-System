const db = require('../config/database');
const { initDatabase } = require('./initialize');
const { seedDatabase } = require('./seed');

/**
 * Reset Database Script
 * Safely drops all existing tables and indexes, reinitializes the schema, and seeds default records.
 * WARNING: For development and demonstration reset only.
 */
async function resetDatabase(targetDb = db) {
  console.log('\n[TrustVault Reset] Initiating full database reset...');

  targetDb.pragma('foreign_keys = OFF');

  const tablesToDrop = [
    'audit_logs',
    'loan_applications',
    'transactions',
    'accounts',
    'users'
  ];

  for (const table of tablesToDrop) {
    targetDb.exec(`DROP TABLE IF EXISTS ${table};`);
    console.log(` -> Dropped table: ${table}`);
  }

  targetDb.pragma('foreign_keys = ON');

  console.log('[TrustVault Reset] Re-creating schema...');
  initDatabase(targetDb);

  console.log('[TrustVault Reset] Seeding initial demonstration dataset...');
  await seedDatabase(targetDb);

  console.log('[TrustVault Reset] Database successfully reset and re-seeded.\n');
}

if (require.main === module) {
  resetDatabase().catch(err => {
    console.error('[TrustVault Reset] Error resetting database:', err);
    process.exit(1);
  });
}

module.exports = {
  resetDatabase
};
