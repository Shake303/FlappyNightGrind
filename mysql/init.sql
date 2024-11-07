-- This creates additional databases
CREATE DATABASE IF NOT EXISTS database1;
CREATE DATABASE IF NOT EXISTS database2;

-- Optional: If you want to create other users with specific permissions
CREATE USER IF NOT EXISTS 'user1'@'%' IDENTIFIED BY 'password1';
GRANT ALL PRIVILEGES ON database1.* TO 'user1'@'%';

CREATE USER IF NOT EXISTS 'user2'@'%' IDENTIFIED BY 'password2';
GRANT ALL PRIVILEGES ON database2.* TO 'user2'@'%';

-- Flush privileges to ensure all changes take effect
FLUSH PRIVILEGES;
