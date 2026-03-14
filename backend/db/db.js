const { Pool } = require('pg');
const config = require('../config/config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

// Test the connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Run migrations on startup
(async () => {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

      ALTER TABLE projects ADD COLUMN IF NOT EXISTS state VARCHAR(100);
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS district VARCHAR(100);
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS city VARCHAR(100);
    `);
    console.log('Database migrations completed successfully.');
  } catch (err) {
    console.error('Error running database migrations:', err);
  }
})();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
