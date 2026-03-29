const express = require("express")
const db = require("../db")
const { auth, requireRole } = require("../middleware/auth")

const router = express.Router()

router.get("/", (req, res) => {
  const { search = "", subject, difficulty, maxPrice, sort = "newest", minRating } = req.query
  const params = []
  const where = ["g.is_active = 1"]
  if (search) {
    where.push("(g.title LIKE ? OR g.subject LIKE ? OR g.tags LIKE ?)")
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (subject) {
    where.push("g.subject = ?")
    params.push(subject)
  }
  if (difficulty) {
    where.push("g.difficulty = ?")
    params.push(difficulty)
  }
  if (maxPrice) {
    where.push("g.price <= ?")
    params.push(Number(maxPrice))
  }
  if (minRating) {
    where.push("g.avg_rating >= ?")
    params.push(Number(minRating))
  }
  const sortMap = {
    rating: "g.avg_rating DESC",
    price_asc: "g.price ASC",
    price_desc: "g.price DESC",
    newest: "g.created_at DESC"
  }
  const orderBy = sortMap[sort] || sortMap.newest
  const rows = db
    .prepare(
      `
      SELECT g.*, u.name AS tutor_name, u.college AS tutor_college
      FROM gigs g
      JOIN users u ON u.id = g.tutor_id
      WHERE ${where.join(" AND ")}
      ORDER BY ${orderBy}
      `
    )
    .all(...params)
  return res.json(rows)
})

router.get("/my/gigs", auth, (req, res) => {
  const rows = db
    .prepare(
      `
      SELECT g.*,
      COUNT(b.id) AS bookings_count,
      SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings_count
      FROM gigs g
      LEFT JOIN bookings b ON b.gig_id = g.id
      WHERE g.tutor_id = ?
      GROUP BY g.id
      ORDER BY g.created_at DESC
      `
    )
    .all(req.user.id)
  return res.json(rows)
})

router.get("/:id", (req, res) => {
  const gig = db
    .prepare(
      `SELECT g.*, u.name AS tutor_name, u.college AS tutor_college, u.bio AS tutor_bio,
      (SELECT COUNT(*) FROM gigs WHERE tutor_id = g.tutor_id AND is_active = 1) AS tutor_total_gigs,
      (SELECT COUNT(*) FROM bookings WHERE tutor_id = g.tutor_id AND status = 'completed') AS tutor_completed_sessions,
      (SELECT COALESCE(ROUND(AVG(r.rating), 1), 0)
       FROM reviews r
       JOIN gigs gx ON gx.id = r.gig_id
       WHERE gx.tutor_id = g.tutor_id) AS tutor_avg_rating,
      (SELECT COUNT(*) FROM bookings WHERE gig_id = g.id) AS booking_count
       FROM gigs g JOIN users u ON u.id = g.tutor_id WHERE g.id = ?`
    )
    .get(req.params.id)
  if (!gig) {
    return res.status(404).json({ message: "Gig not found" })
  }
  const reviews = db
    .prepare(
      `SELECT r.*, u.name AS reviewer_name
       FROM reviews r JOIN users u ON u.id = r.reviewer_id
       WHERE r.gig_id = ? ORDER BY r.created_at DESC`
    )
    .all(req.params.id)
  return res.json({ gig, reviews })
})

router.post("/", auth, requireRole(["tutor"]), (req, res) => {
  const { title, subject, description, price, duration_minutes, difficulty, tags } = req.body
  if (!title || !subject || !description || !price) {
    return res.status(400).json({ message: "Missing required fields" })
  }
  const result = db
    .prepare(
      `INSERT INTO gigs (tutor_id, title, subject, description, price, duration_minutes, difficulty, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      title,
      subject,
      description,
      Number(price),
      Number(duration_minutes || 45),
      difficulty || "Beginner",
      tags || ""
    )
  const gig = db.prepare("SELECT * FROM gigs WHERE id = ?").get(result.lastInsertRowid)
  return res.status(201).json(gig)
})

router.put("/:id", auth, requireRole(["tutor"]), (req, res) => {
  const ownGig = db.prepare("SELECT * FROM gigs WHERE id = ? AND tutor_id = ?").get(req.params.id, req.user.id)
  if (!ownGig) {
    return res.status(404).json({ message: "Gig not found" })
  }
  const { title, subject, description, price, duration_minutes, difficulty, tags, is_active } = req.body
  db.prepare(
    `UPDATE gigs SET title = ?, subject = ?, description = ?, price = ?, duration_minutes = ?, difficulty = ?, tags = ?, is_active = ? WHERE id = ?`
  ).run(
    title ?? ownGig.title,
    subject ?? ownGig.subject,
    description ?? ownGig.description,
    Number(price ?? ownGig.price),
    Number(duration_minutes ?? ownGig.duration_minutes),
    difficulty ?? ownGig.difficulty,
    tags ?? ownGig.tags,
    Number(is_active ?? ownGig.is_active),
    req.params.id
  )
  const gig = db.prepare("SELECT * FROM gigs WHERE id = ?").get(req.params.id)
  return res.json(gig)
})

router.delete("/:id", auth, requireRole(["tutor"]), (req, res) => {
  const ownGig = db.prepare("SELECT * FROM gigs WHERE id = ? AND tutor_id = ?").get(req.params.id, req.user.id)
  if (!ownGig) {
    return res.status(404).json({ message: "Gig not found" })
  }
  db.prepare("UPDATE gigs SET is_active = 0 WHERE id = ?").run(req.params.id)
  return res.json({ message: "Gig deactivated" })
})

module.exports = router
