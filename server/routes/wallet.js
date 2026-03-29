const express = require("express")
const db = require("../db")
const { auth } = require("../middleware/auth")

const router = express.Router()

router.get("/balance", auth, (req, res) => {
  const row = db.prepare("SELECT wallet_balance FROM users WHERE id = ?").get(req.user.id)
  return res.json({ balance: row?.wallet_balance ?? 0 })
})

router.get("/transactions", auth, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id)
  return res.json(rows)
})

router.post("/add-credits", auth, (req, res) => {
  const amount = 100
  db.prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?").run(amount, req.user.id)
  db.prepare(
    "INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, 'credit', ?, ?)"
  ).run(req.user.id, amount, "Demo credit added")
  const row = db.prepare("SELECT wallet_balance FROM users WHERE id = ?").get(req.user.id)
  return res.json({ balance: row.wallet_balance })
})

module.exports = router
