import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../api/axios"
import { useAuth } from "../../context/AuthContext"

export default function LearnerDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [balance, setBalance] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    api.get("/bookings/my/learner").then((res) => setBookings(res.data)).catch(() => {})
    api.get("/wallet/balance").then((res) => setBalance(res.data.balance)).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === "completed").length
    return { booked: bookings.length, completed, topics: new Set(bookings.map((b) => b.title)).size }
  }, [bookings])

  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => (b.status === "pending" || b.status === "confirmed") && new Date(b.scheduled_at).getTime() > now)
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 4),
    [bookings, now]
  )

  const recent = useMemo(() => bookings.slice(0, 3), [bookings])

  const formatCountdown = (scheduledAt) => {
    const diff = Math.max(0, new Date(scheduledAt).getTime() - now)
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">Sessions Booked: {stats.booked}</div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">Sessions Completed: {stats.completed}</div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">Topics Learned: {stats.topics}</div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">Wallet Balance: ₹{balance}</div>
      </div>
      <Link to="/explore" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-white">
        Find a Tutor
      </Link>
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
          <Link to="/learner/bookings" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming sessions yet.</p>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((booking) => (
              <div key={booking.id} className="rounded-xl border p-3">
                <p className="font-semibold">{booking.title}</p>
                <p className="text-sm text-slate-500">{booking.tutor_name} · {new Date(booking.scheduled_at).toLocaleString()}</p>
                <p className="mt-1 text-sm font-medium text-primary">Starts in {formatCountdown(booking.scheduled_at)}</p>
                <Link to={`/session/${booking.id}`} className="mt-2 inline-block rounded-lg bg-slate-900 px-3 py-1 text-sm text-white">
                  Join Session
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Recently Booked</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {recent.map((booking) => (
            <div key={booking.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-semibold">{booking.title}</p>
              <p className="text-sm text-slate-500">{new Date(booking.scheduled_at).toLocaleString()}</p>
              <p className="mt-1 text-sm">Status: {booking.status}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
