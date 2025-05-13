const express = require('express');
const path = require('path');
const pool = require('./db');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/comments', async (req, res) => {
    const result = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    res.json(result.rows);
});

app.post('/comments', async (req, res) => {
    const { author, text, rating } = req.body;
    if (rating !== undefined) {
        await pool.query(
            'INSERT INTO comments (author, text, rating) VALUES ($1, $2, $3)',
            [author || 'Аноним', text, rating]
        );
    } else {
        await pool.query(
            'INSERT INTO comments (author, text) VALUES ($1, $2)',
            [author || 'Аноним', text]
        );
    }
    res.status(201).send('OK');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});