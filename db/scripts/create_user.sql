CREATE DATABASE IF NOT EXISTS test;

CREATE USER IF NOT EXISTS 'test' @'%' IDENTIFIED WITH mysql_native_password BY 'test';

CREATE USER IF NOT EXISTS 'test' @'localhost' IDENTIFIED WITH mysql_native_password BY 'test';

CREATE USER IF NOT EXISTS 'test' @'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'test';

CREATE USER IF NOT EXISTS 'root' @'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'root';

GRANT ALL PRIVILEGES ON test.* TO 'test' @'%';

GRANT ALL PRIVILEGES ON test.* TO 'test' @'localhost';

GRANT ALL PRIVILEGES ON test.* TO 'test' @'127.0.0.1';

GRANT ALL PRIVILEGES ON *.* TO 'root' @'%';

GRANT ALL PRIVILEGES ON *.* TO 'root' @'localhost';

GRANT ALL PRIVILEGES ON *.* TO 'root' @'127.0.0.1';

FLUSH PRIVILEGES;