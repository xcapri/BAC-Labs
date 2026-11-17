CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user'
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50)
);

CREATE TABLE secrets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  value VARCHAR(255) NOT NULL
);

INSERT INTO users (username, password, role) VALUES
  ('admin', '5f4dcc3b5aa765d61d8327deb882cf99', 'admin'),
  ('jdoe', '482c811da5d5b4bc6d497ffa98491e38', 'user'),
  ('asmith', '202cb962ac59075b964b07152d234b70', 'user');

INSERT INTO products (name, price, category) VALUES
  ('Laptop', 999.99, 'electronics'),
  ('Mouse', 19.99, 'electronics'),
  ('Keyboard', 49.99, 'electronics'),
  ('Desk', 199.99, 'furniture'),
  ('Chair', 89.99, 'furniture');

INSERT INTO secrets (name, value) VALUES
  ('api_key', 'FLAG{mysql_sqli_dump_flag}'),
  ('admin_note', 'rotate api key every 30 days');
