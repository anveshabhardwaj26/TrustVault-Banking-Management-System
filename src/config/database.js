const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists before opening the database
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path: supports override via environment variable for testing
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/trustvault.db');

// Initialize better-sqlite3 database connection
const db = new Database(dbPath);

// Enable WAL mode for concurrency and performance
db.pragma('journal_mode = WAL');

// Enforce foreign key constraints
db.pragma('foreign_keys = ON');

module.exports = db;
