const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Adding created_by column to pfe_teams...');
    await pool.query('ALTER TABLE pfe_teams ADD COLUMN created_by INT;');
    console.log('Column added successfully.');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN') {
      console.log('Column created_by already exists.');
      process.exit(0);
    }
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
