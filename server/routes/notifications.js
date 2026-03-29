const express = require("express")
const db = require("../db")
const { auth } = require("../middleware/auth")

const router = express.Router()

router.get("/", auth, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5")
    .all(req.user.id)
  const unreadCount = db
    .prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0")
    .get(req.user.id)
  return res.json({ items: rows, unread: unreadCount.count })
})

router.patch("/read-all", auth, (req, res) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.user.id)
  return res.json({ message: "Updated" })
})

module.exports = router
