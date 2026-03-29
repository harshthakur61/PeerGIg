const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(__dirname, "peergig.db")
const db = new Database(dbPath)

db.pragma("foreign_keys = ON")

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'both',
  college TEXT,
  bio TEXT,
  wallet_balance REAL DEFAULT 100.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gigs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tutor_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  difficulty TEXT DEFAULT 'Beginner',
  tags TEXT,
  is_active INTEGER DEFAULT 1,
  avg_rating REAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gig_id INTEGER NOT NULL,
  learner_id INTEGER NOT NULL,
  tutor_id INTEGER NOT NULL,
  scheduled_at DATETIME NOT NULL,
  status TEXT DEFAULT 'pending',
  session_room_id TEXT,
  amount_paid REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gig_id) REFERENCES gigs(id),
  FOREIGN KEY (learner_id) REFERENCES users(id),
  FOREIGN KEY (tutor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER UNIQUE NOT NULL,
  gig_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (gig_id) REFERENCES gigs(id)
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`)

// Handle initial seeding for empty database (important for ephemeral Free Tier)
const row = db.prepare("SELECT count(*) as count FROM users").get()
if (row && row.count === 0) {
  console.log("Database empty. Seeding initial data...")
  const bcrypt = require("bcryptjs")
  
  // Create Demo Users
  const userInsert = db.prepare(
    "INSERT INTO users (name, email, password_hash, role, college, bio, wallet_balance) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
  const users = [
    ["Arjun Sharma", "learner@demo.com", bcrypt.hashSync("demo123", 10), "both", "IIT Bombay", "Curious learner across subjects", 100],
    ["Priya Mehta", "tutor@demo.com", bcrypt.hashSync("demo123", 10), "tutor", "BITS Pilani", "I teach with concept-first clarity", 100]
  ]
  for (const user of users) {
    userInsert.run(...user)
  }

  // Create Demo Gigs
  const tutor = db.prepare("SELECT * FROM users WHERE email = 'tutor@demo.com'").get()
  const gigInsert = db.prepare(
    "INSERT INTO gigs (tutor_id, title, subject, description, price, duration_minutes, difficulty, tags, avg_rating, total_reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
  const gigs = [
    ["Quadratic Equations", "Mathematics", "Focused session on Math.", 49, 45, "Beginner", "math,concept", 4.8, 5],
    ["Newton's Laws", "Physics", "Physics fundamentals.", 59, 45, "Beginner", "physics,laws", 4.7, 3]
  ]
  for (const gig of gigs) {
    gigInsert.run(tutor.id, ...gig)
  }
  console.log("Seeding complete.")
}

module.exports = db
