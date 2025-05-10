const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as current_time');
    console.log('Database connection successful:', res.rows[0]);
    await pool.end();
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

testConnection();