require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors({
  origin: 'http://localhost:5500',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432
});

pool.connect()
  .then((client) => {
    console.log('Connected to PostgreSQL');
    client.release();
  })
  .catch(err => console.error('PostgreSQL connection error:', err));

app.get('/api/comments', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, user_name, comment_text, rating, 
             to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at 
      FROM comments 
      WHERE is_approved = true 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/comments', async (req, res) => {
  const { user_name, comment_text, rating } = req.body;
  
  // Validation
  if (!comment_text || comment_text.trim() === '') {
    return res.status(400).json({ error: 'Comment text is required' });
  }
  
  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const ip_address = req.ip || req.connection.remoteAddress;
    const { rows } = await pool.query(
      `INSERT INTO comments (user_name, comment_text, rating, ip_address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_name, comment_text, rating, 
                 to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at`,
      [
        user_name && user_name.trim() !== '' ? user_name.trim() : 'Anonymous',
        comment_text.trim(),
        rating || null, 
        ip_address
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('DB insert error:', err);
    res.status(500).json({ error: 'Failed to save comment' });
  }
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5500; // Изменено на 5500 для соответствия требованиям
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  pool.end()
    .then(() => {
      console.log('Pool has ended');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during pool ending:', err);
      process.exit(1);
    });
});