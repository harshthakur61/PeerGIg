const express = require("express")
const db = require("../db")
const { auth, requireRole } = require("../middleware/auth")

const router = express.Router()

router.get("/gig/:gigId", (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.*, u.name AS reviewer_name
       FROM reviews r JOIN users u ON u.id = r.reviewer_id
       WHERE r.gig_id = ? ORDER BY r.created_at DESC`
    )
    .all(req.params.gigId)
  return res.json(rows)
})

router.post("/", auth, requireRole(["learner"]), (req, res) => {
  const { booking_id, gig_id, rating, comment } = req.body
  const numericRating = Number(rating)
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: "Rating must be an integer between 1 and 5" })
  }
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(booking_id)
  if (!booking || booking.learner_id !== req.user.id || booking.status !== "completed") {
    return res.status(400).json({ message: "Review not allowed" })
  }
  if (Number(gig_id) !== booking.gig_id) {
    return res.status(400).json({ message: "Invalid booking for this gig" })
  }
  const existing = db.prepare("SELECT id FROM reviews WHERE booking_id = ?").get(booking_id)
  if (existing) {
    return res.status(400).json({ message: "Review already submitted" })
  }
  db.prepare("INSERT INTO reviews (booking_id, gig_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?, ?)").run(
    booking_id,
    gig_id,
    req.user.id,
    numericRating,
    comment || ""
  )
  const agg = db
    .prepare("SELECT ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS total_reviews FROM reviews WHERE gig_id = ?")
    .get(gig_id)
  db.prepare("UPDATE gigs SET avg_rating = ?, total_reviews = ? WHERE id = ?").run(
    agg.avg_rating || 0,
    agg.total_reviews || 0,
    gig_id
  )
  return res.status(201).json({ message: "Review submitted" })
})

module.exports = router
