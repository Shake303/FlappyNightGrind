-- Erstellen der Datenbank `floppy_birddb1`, falls sie noch nicht existiert
CREATE DATABASE IF NOT EXISTS floppy_birddb1;

-- Festlegen der zu verwendenden Datenbank
USE floppy_birddb1;

-- Optional: Erstellen eines Benutzers und Gewähren von Berechtigungen, falls erforderlich
CREATE USER IF NOT EXISTS 'flappy_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON floppy_birddb1.* TO 'flappy_user'@'%';

-- Flush privileges, um sicherzustellen, dass alle Änderungen wirksam werden
FLUSH PRIVILEGES;

-- Führen Sie den Inhalt der Datei `Floppy_Bird_DB.sql` aus, um die Tabellenstruktur zu laden
SOURCE /docker-entrypoint-initdb.d/Floppy_Bird_DB.sql;
