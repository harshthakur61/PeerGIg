const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("../db")
const { auth } = require("../middleware/auth")

const router = express.Router()

router.post("/register", (req, res) => {
  const { name, email, password, college, role = "both" } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, password are required" })
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
  if (existing) {
    return res.status(400).json({ message: "Email already exists" })
  }
  const passwordHash = bcrypt.hashSync(password, 10)
  const stmt = db.prepare(
    "INSERT INTO users (name, email, password_hash, role, college) VALUES (?, ?, ?, ?, ?)"
  )
  const result = stmt.run(name, email, passwordHash, role, college || null)
  const user = db
    .prepare("SELECT id, name, email, role, college, bio, wallet_balance FROM users WHERE id = ?")
    .get(result.lastInsertRowid)
  const token = jwt.sign(user, process.env.JWT_SECRET || "peergig_demo_secret_key", { expiresIn: "7d" })
  return res.status(201).json({ token, user })
})

router.post("/login", (req, res) => {
  const { email, password } = req.body
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: "Invalid credentials" })
  }
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    bio: user.bio,
    wallet_balance: user.wallet_balance
  }
  const token = jwt.sign(safeUser, process.env.JWT_SECRET || "peergig_demo_secret_key", { expiresIn: "7d" })
  return res.json({ token, user: safeUser })
})

router.get("/me", auth, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, role, college, bio, wallet_balance FROM users WHERE id = ?")
    .get(req.user.id)
  return res.json(user)
})

module.exports = router
