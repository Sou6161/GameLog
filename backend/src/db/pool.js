const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set. Set it in backend/.env (see .env.example).');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enable SSL automatically for hosted Postgres (e.g. Render/Supabase/Neon).
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
