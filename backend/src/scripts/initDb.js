// Initialize the database schema.
// Usage: npm run db:init   (requires DATABASE_URL in backend/.env)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../db/pool');

async function main() {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log('Applying schema from', schemaPath);
  await pool.query(sql);
  console.log('✅ Schema applied successfully.');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Failed to apply schema:', err);
  process.exit(1);
});
