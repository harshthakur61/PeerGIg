import { Link, useNavigate } from "react-router-dom"
import NotificationBell from "./NotificationBell"
import { useAuth } from "../context/AuthContext"
import logo from "../assets/peergig-logo.svg"

export default function Navbar() {
  const { user, logout, activeRole, switchRole } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(26,18,8,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="PeerGig" className="h-10 w-auto" />
          <span className="hidden text-lg font-black text-[#FDF6EC] md:block" style={{ fontFamily: "'Playfair Display', serif" }}>
            Peer<span className="text-[#E8621A]">Gig</span>
          </span>
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium text-[#DCCCB8]">
          <Link to="/explore" className="hover:text-[#FDF6EC]">Explore</Link>
          {user && <Link to={activeRole === "tutor" ? "/tutor/dashboard" : "/learner/dashboard"} className="hover:text-[#FDF6EC]">Dashboard</Link>}
          {user && <Link to={activeRole === "tutor" ? "/tutor/wallet" : "/learner/wallet"} className="hover:text-[#FDF6EC]">Wallet</Link>}
          {user && <NotificationBell />}
          {user ? (
            <>
              {user.role === "both" && (
                <button type="button" onClick={() => activeRole && switchRole()} className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[#FDF6EC]">
                  Switch Role
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate("/")
                }}
                className="rounded-lg bg-secondary px-3 py-1 text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-lg bg-primary px-3 py-1 text-white">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
