const jwt = require("jsonwebtoken")

function auth(req, res, next) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "peergig_demo_secret_key")
    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) && req.user.role !== "both") {
      return res.status(403).json({ message: "Forbidden" })
    }
    next()
  }
}

module.exports = { auth, requireRole }
