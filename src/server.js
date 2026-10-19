require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./database/initialize');

// Run schema initialization to ensure all tables, constraints, and indexes exist
initDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[TrustVault] Server listening on port ${PORT}`);
  console.log(`[TrustVault] Environment: ${process.env.NODE_ENV || 'development'}`);
});
