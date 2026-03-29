const express = require("express")
const db = require("../db")
const { auth, requireRole } = require("../middleware/auth")

const router = express.Router()

function createNotification(userId, message) {
  db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(userId, message)
}

router.post("/", auth, requireRole(["learner"]), (req, res) => {
  const { gig_id, scheduled_at } = req.body
  const gig = db.prepare("SELECT * FROM gigs WHERE id = ? AND is_active = 1").get(gig_id)
  if (!gig) {
    return res.status(404).json({ message: "Gig not found" })
  }
  if (gig.tutor_id === req.user.id) {
    return res.status(400).json({ message: "You cannot book your own gig" })
  }
  const scheduledAtDate = new Date(scheduled_at)
  if (!scheduled_at || Number.isNaN(scheduledAtDate.getTime()) || scheduledAtDate.getTime() <= Date.now()) {
    return res.status(400).json({ message: "Please choose a future date and time" })
  }
  const learner = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id)
  if (learner.wallet_balance < gig.price) {
    return res.status(400).json({ message: "Insufficient balance" })
  }
  const tx = db.transaction(() => {
    db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?").run(gig.price, req.user.id)
    db.prepare(
      "INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, 'debit', ?, ?)"
    ).run(req.user.id, gig.price, `Booking: ${gig.title}`)
    const result = db
      .prepare(
        `INSERT INTO bookings (gig_id, learner_id, tutor_id, scheduled_at, session_room_id, amount_paid)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        gig.id,
        req.user.id,
        gig.tutor_id,
        scheduledAtDate.toISOString(),
        "",
        gig.price
      )
    const bookingId = result.lastInsertRowid
    db.prepare("UPDATE bookings SET session_room_id = ? WHERE id = ?").run(`peergig-session-${bookingId}`, bookingId)
    createNotification(gig.tutor_id, `New booking: ${gig.title}`)
    return bookingId
  })
  const bookingId = tx()
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId)
  return res.status(201).json(booking)
})

router.get("/my/learner", auth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT b.*, g.title, u.name AS tutor_name,
       CASE WHEN r.id IS NULL THEN 0 ELSE 1 END AS has_review
       FROM bookings b
       JOIN gigs g ON g.id = b.gig_id
       JOIN users u ON u.id = b.tutor_id
       LEFT JOIN reviews r ON r.booking_id = b.id
       WHERE b.learner_id = ?
       ORDER BY b.scheduled_at DESC`
    )
    .all(req.user.id)
  return res.json(rows)
})

router.get("/my/tutor", auth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT b.*, g.title, u.name AS learner_name,
       CASE WHEN r.id IS NULL THEN 0 ELSE 1 END AS has_review
       FROM bookings b
       JOIN gigs g ON g.id = b.gig_id
       JOIN users u ON u.id = b.learner_id
       LEFT JOIN reviews r ON r.booking_id = b.id
       WHERE b.tutor_id = ?
       ORDER BY b.scheduled_at DESC`
    )
    .all(req.user.id)
  return res.json(rows)
})

router.get("/:id(\\d+)", auth, (req, res) => {
  const booking = db
    .prepare(
      `SELECT b.*, g.title, g.subject, u1.name AS learner_name, u2.name AS tutor_name
       FROM bookings b
       JOIN gigs g ON g.id = b.gig_id
       JOIN users u1 ON u1.id = b.learner_id
       JOIN users u2 ON u2.id = b.tutor_id
       WHERE b.id = ?`
    )
    .get(req.params.id)
  if (!booking || (booking.learner_id !== req.user.id && booking.tutor_id !== req.user.id)) {
    return res.status(404).json({ message: "Booking not found" })
  }
  return res.json(booking)
})

router.patch("/:id/confirm", auth, requireRole(["tutor"]), (req, res) => {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id)
  if (!booking || booking.tutor_id !== req.user.id) {
    return res.status(404).json({ message: "Booking not found" })
  }
  if (booking.status !== "pending") {
    return res.status(400).json({ message: "Only pending bookings can be confirmed" })
  }
  db.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?").run(req.params.id)
  createNotification(booking.learner_id, "Your booking was confirmed")
  return res.json({ message: "Booking confirmed" })
})

router.patch("/:id/complete", auth, requireRole(["tutor"]), (req, res) => {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id)
  if (!booking || booking.tutor_id !== req.user.id) {
    return res.status(404).json({ message: "Booking not found" })
  }
  if (booking.status === "completed") {
    return res.json({ message: "Already completed" })
  }
  if (booking.status !== "confirmed") {
    return res.status(400).json({ message: "Only confirmed bookings can be completed" })
  }
  const gig = db.prepare("SELECT title FROM gigs WHERE id = ?").get(booking.gig_id)
  const tx = db.transaction(() => {
    db.prepare("UPDATE bookings SET status = 'completed' WHERE id = ?").run(req.params.id)
    db.prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?").run(
      booking.amount_paid,
      booking.tutor_id
    )
    db.prepare(
      "INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, 'credit', ?, ?)"
    ).run(booking.tutor_id, booking.amount_paid, `Session: ${gig.title}`)
    createNotification(booking.learner_id, "Session completed. Please leave a review!")
  })
  tx()
  return res.json({ message: "Booking completed" })
})

router.patch("/:id/cancel", auth, (req, res) => {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id)
  if (!booking || (booking.tutor_id !== req.user.id && booking.learner_id !== req.user.id)) {
    return res.status(404).json({ message: "Booking not found" })
  }
  if (booking.status === "cancelled") {
    return res.json({ message: "Already cancelled" })
  }
  if (booking.status === "completed") {
    return res.status(400).json({ message: "Completed bookings cannot be cancelled" })
  }
  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return res.status(400).json({ message: "Booking cannot be cancelled" })
  }
  const tx = db.transaction(() => {
    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id)
    db.prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?").run(
      booking.amount_paid,
      booking.learner_id
    )
    db.prepare(
      "INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, 'credit', ?, ?)"
    ).run(booking.learner_id, booking.amount_paid, "Booking refund")
    createNotification(booking.learner_id, "Booking cancelled and refunded")
    createNotification(booking.tutor_id, "A booking was cancelled")
  })
  tx()
  return res.json({ message: "Booking cancelled" })
})

module.exports = router
