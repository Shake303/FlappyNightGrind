// server.js

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// MySQL connection configuration
const db = mysql.createConnection({
    host: 'mysql',            // use 'localhost' if running outside Docker
    user: 'your_mysql_user',
    password: 'your_mysql_password',
    database: 'game_scores'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.json());

// Save score endpoint
app.post('/save-score', (req, res) => {
    const { playerName, score } = req.body;

    const query = 'INSERT INTO scores (player_name, score) VALUES (?, ?)';
    db.query(query, [playerName, score], (err) => {
        if (err) {
            console.error('Error saving score:', err);
            res.status(500).json({ message: 'Error saving score' });
        } else {
            res.status(200).json({ message: 'Score saved successfully' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Node.js API server running on http://localhost:${PORT}`);
});
