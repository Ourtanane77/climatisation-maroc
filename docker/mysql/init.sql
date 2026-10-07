-- Test database used by Pest (phpunit.xml). Runs once, when the MySQL volume is created.
CREATE DATABASE IF NOT EXISTS climatisation_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON climatisation_test.* TO 'climatisation'@'%';
FLUSH PRIVILEGES;
