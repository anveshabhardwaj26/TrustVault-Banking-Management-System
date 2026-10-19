require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./database/initialize');

// Run schema initialization to ensure all tables, constraints, and indexes exist
initDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[TrustVault] Server running smoothly on http://localhost:${PORT}`);
  console.log(`[TrustVault] Environment: ${process.env.NODE_ENV || 'development'}`);
});
