require("dotenv").config()
const express = require("express")
const cors = require("cors")
require("./db")

const authRoutes = require("./routes/auth")
const gigsRoutes = require("./routes/gigs")
const bookingsRoutes = require("./routes/bookings")
const walletRoutes = require("./routes/wallet")
const reviewsRoutes = require("./routes/reviews")
const notificationsRoutes = require("./routes/notifications")

const app = express()
const port = process.env.PORT || 5000

app.use(cors({ 
  origin: [
    "http://localhost:3000",
    process.env.CLIENT_URL
  ].filter(Boolean)
}))
app.use(express.json())

app.get("/api/health", (_, res) => res.json({ ok: true }))
app.use("/api/auth", authRoutes)
app.use("/api/gigs", gigsRoutes)
app.use("/api/bookings", bookingsRoutes)
app.use("/api/wallet", walletRoutes)
app.use("/api/reviews", reviewsRoutes)
app.use("/api/notifications", notificationsRoutes)

app.listen(port, () => {
  console.log(`Server running on ${port}`)
})
