const bcrypt = require("bcryptjs")
const db = require("./db")

db.exec(`
DELETE FROM reviews;
DELETE FROM bookings;
DELETE FROM wallet_transactions;
DELETE FROM notifications;
DELETE FROM gigs;
DELETE FROM users;
`)

const users = [
  ["Arjun Sharma", "learner@demo.com", "both", "IIT Bombay", "Curious learner across subjects"],
  ["Priya Mehta", "tutor@demo.com", "tutor", "BITS Pilani", "I teach with concept-first clarity"]
]

const userInsert = db.prepare(
  "INSERT INTO users (name, email, password_hash, role, college, bio, wallet_balance) VALUES (?, ?, ?, ?, ?, ?, ?)"
)
for (const user of users) {
  userInsert.run(user[0], user[1], bcrypt.hashSync("demo123", 10), user[2], user[3], user[4], 100)
}

const tutor = db.prepare("SELECT * FROM users WHERE email = 'tutor@demo.com'").get()

const gigs = [
  ["Quadratic Equations", "Mathematics", 49, "Beginner"],
  ["Newton's Laws of Motion", "Physics", 59, "Intermediate"],
  ["Organic Chemistry Basics", "Chemistry", 79, "Beginner"],
  ["Python for Beginners", "Programming", 99, "Beginner"],
  ["Microeconomics — Supply & Demand", "Economics", 69, "Beginner"],
  ["Sorting Algorithms", "Programming", 89, "Intermediate"],
  ["Trigonometry Identities", "Mathematics", 49, "Intermediate"],
  ["Indian History — Mughal Empire", "History", 39, "Beginner"],
  ["English Essay Writing", "English", 59, "Beginner"],
  ["Chess Openings — Sicilian Defence", "Chess", 79, "Advanced"]
]

const gigInsert = db.prepare(
  "INSERT INTO gigs (tutor_id, title, subject, description, price, duration_minutes, difficulty, tags, avg_rating, total_reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
)

for (const [title, subject, price, difficulty] of gigs) {
  gigInsert.run(
    tutor.id,
    title,
    subject,
    `Focused 1:1 session on ${title} with practical examples and revision strategy.`,
    price,
    45,
    difficulty,
    `${subject.toLowerCase()},student,concept`,
    4.6,
    3
  )
}

console.log("Seed completed")
