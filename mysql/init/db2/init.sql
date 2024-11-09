USE Floppy_Bird_DB2;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role ENUM('player', 'admin') DEFAULT 'player'
);
