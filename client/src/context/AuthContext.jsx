import { createContext, useContext, useEffect, useMemo, useState } from "react"
import api from "../api/axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [activeRole, setActiveRole] = useState(localStorage.getItem("activeRole") || "learner")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .finally(() => setLoading(false))
  }, [])

  const login = ({ token, user: userPayload }) => {
    localStorage.setItem("token", token)
    setUser(userPayload)
    const role = userPayload.role === "tutor" ? "tutor" : "learner"
    localStorage.setItem("activeRole", role)
    setActiveRole(role)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("activeRole")
    setUser(null)
    setActiveRole("learner")
  }

  const switchRole = () => {
    if (user?.role !== "both") {
      return
    }
    const nextRole = activeRole === "tutor" ? "learner" : "tutor"
    localStorage.setItem("activeRole", nextRole)
    setActiveRole(nextRole)
  }

  const value = useMemo(() => ({ user, activeRole, setUser, loading, login, logout, switchRole }), [user, activeRole, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
