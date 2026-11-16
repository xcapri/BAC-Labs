import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

type DB = Database.Database;

let _db: DB | null = null;

// Lazy open: the connection is NOT created at import time. `next build`
// evaluates many route modules concurrently (worker threads), and opening the
// SQLite file at import time raced on the fresh DB file (SQLITE_BUSY). Opening
// on first use means only the home page (prerendered at build) opens it — a
// single connection with no contention.
function getDb(): DB {
  if (!_db) {
    const dbPath = path.join(process.cwd(), 'database.db');
    _db = new Database(dbPath, {
      // Wait up to 10s instead of throwing SQLITE_BUSY when the DB is locked.
      timeout: 10000,
    });

    // Enable foreign keys and WAL mode for better concurrency
    _db.pragma('foreign_keys = ON');
    _db.pragma('journal_mode = WAL');
    _db.pragma('busy_timeout = 10000');

    initTables(_db);
    seed(_db);
  }
  return _db;
}

function initTables(d: DB) {
  // Users table
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // News table
  d.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      author_id INTEGER NOT NULL,
      approved_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `);

  // Galeri table
  d.exec(`
    CREATE TABLE IF NOT EXISTS galeri (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      approved_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `);

  // Notes table (Stored XSS lab) — content disimpan mentah tanpa sanitasi
  d.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);
}

function seed(d: DB) {
  // Check if admin exists, if not create default users
  const adminExists = d.prepare('SELECT id FROM users WHERE role = ?').get('admin');

  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const hashedUserPassword = bcrypt.hashSync('user123', 10);

    // Insert default admin
    d.prepare('INSERT INTO users (uuid, username, password, role) VALUES (?, ?, ?, ?)').run(
      randomUUID(),
      'admin',
      hashedPassword,
      'admin'
    );

    // Insert default user
    d.prepare('INSERT INTO users (uuid, username, password, role) VALUES (?, ?, ?, ?)').run(
      randomUUID(),
      'user',
      hashedUserPassword,
      'user'
    );

    console.log('Default users created:');
    console.log('User - username: user, password: user123');

    // Insert sample approved news
    const adminId = d.prepare('SELECT id FROM users WHERE username = ?').get('admin') as any;

    for (let i = 1; i <= 5; i++) {
      d.prepare(`
        INSERT INTO news (title, content, image_url, author_id, approved_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        `Sample News ${i}`,
        `This is the content of sample news ${i}. It contains important information about various topics.`,
        `https://via.placeholder.com/800x400?text=News+${i}`,
        adminId.id,
        adminId.id
      );
    }

    // Insert sample approved galeri
    for (let i = 1; i <= 8; i++) {
      d.prepare(`
        INSERT INTO galeri (title, description, image_url, author_id, approved_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        `Gallery Image ${i}`,
        `Description for gallery image ${i}`,
        `https://via.placeholder.com/600x400?text=Gallery+${i}`,
        adminId.id,
        adminId.id
      );
    }

    console.log('Sample data inserted successfully');
  }
}

// Proxy so every existing `db.prepare(...)` / `db.exec(...)` call site keeps
// working unchanged, while the connection is opened on first real use.
const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb();
    const value = (real as any)[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

// Kept for API compatibility; the connection initializes on first use anyway.
export function initDatabase() {
  getDb();
}

export default db;
