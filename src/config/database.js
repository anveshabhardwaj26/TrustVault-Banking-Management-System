const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
// Database file path: supports override via environment variable for testing
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/trustvault.db');
fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });

// Initialize better-sqlite3 database connection
const db = new Database(dbPath);

// Enable WAL mode for concurrency and performance
db.pragma('journal_mode = WAL');

// Enforce foreign key constraints
db.pragma('foreign_keys = ON');

module.exports = db;
