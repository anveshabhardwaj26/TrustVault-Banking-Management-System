const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');

// Ensure data directory exists for SQLite session persistence
const dataDir = path.join(__dirname, '../../data');
const sessionDir = process.env.SESSION_DIR || dataDir;
fs.mkdirSync(sessionDir, { recursive: true });

const sessionDb = process.env.SESSION_DB || 'sessions.db';
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET;

if (isProduction && !sessionSecret) {
  throw new Error('SESSION_SECRET must be set when NODE_ENV is production.');
}

const sessionMiddleware = session({
  store: new SQLiteStore({
    db: sessionDb,
    dir: sessionDir,
    concurrentDB: true
  }),
  secret: sessionSecret || 'trustvault_default_session_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

module.exports = sessionMiddleware;
