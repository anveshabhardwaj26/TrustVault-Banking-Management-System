const path = require('path');
const fs = require('fs');

// Configure test database environment before importing application modules
const testDataDir = path.join(__dirname, '../data');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

process.env.NODE_ENV = 'test';
process.env.DB_PATH = path.join(testDataDir, 'test_trustvault.db');
process.env.SESSION_DB = 'test_sessions.db';
process.env.SESSION_SECRET = 'test_super_secret_session_key_123';

const request = require('supertest');
const db = require('../src/config/database');
const { initDatabase } = require('../src/database/initialize');
const app = require('../src/app');

/**
 * Resets the test database to clean slate with full schema
 */
function setupTestDatabase() {
  db.pragma('foreign_keys = OFF');
  const tables = ['audit_logs', 'loan_applications', 'transactions', 'accounts', 'users'];
  for (const table of tables) {
    db.exec(`DROP TABLE IF EXISTS ${table};`);
  }
  db.pragma('foreign_keys = ON');
  initDatabase(db);
}

/**
 * Creates an authenticated supertest agent for given credentials
 * @param {string} email
 * @param {string} password
 * @returns {Promise<request.SuperAgentTest>}
 */
async function getAuthenticatedAgent(email, password) {
  const agent = request.agent(app);
  const res = await agent
    .post('/api/auth/login')
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(`Failed to log in test user ${email}: ${res.body.message || res.status}`);
  }

  return agent;
}

module.exports = {
  app,
  db,
  request,
  setupTestDatabase,
  getAuthenticatedAgent
};
