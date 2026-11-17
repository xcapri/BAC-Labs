const express = require('express');
const mysql = require('mysql2');

const app = express();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'shop',
  waitForConnections: true,
  connectionLimit: 5,
});

// GET /search?q=...  (SQLi: input concatenated into the query)
app.get('/search', (req, res) => {
  const q = req.query.q || '';
  // VULNERABLE: string concatenation into MySQL
  const sql = `SELECT id, name, price FROM products WHERE name LIKE '%${q}%'`;
  pool.query(sql, (err, rows) => {
    if (err) return res.json({ error: err.sqlMessage || err.message });
    res.json({ results: rows });
  });
});

app.get('/', (req, res) => {
  res.type('text/html').send('<h1>Shop Search</h1><p>Try <a href="/search?q=laptop">/search?q=laptop</a></p>');
});

app.listen(3000, () => console.log('shop search listening on :3000'));
