import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../api/axios"
import { useAuth } from "../../context/AuthContext"

export default function TutorDashboard() {
  const { user } = useAuth()
  const [gigs, setGigs] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    api.get("/gigs/my/gigs").then((res) => setGigs(res.data)).catch(() => {})
    api.get("/bookings/my/tutor").then((res) => setBookings(res.data)).catch(() => {})
  }, [])

  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === "completed")
    const earnings = completed.reduce((sum, b) => sum + Number(b.amount_paid), 0)
    const rating = gigs.length ? (gigs.reduce((sum, g) => sum + Number(g.avg_rating || 0), 0) / gigs.length).toFixed(1) : "0.0"
    return { totalGigs: gigs.length, completed: completed.length, earnings, rating }
  }, [gigs, bookings])

  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "pending" || b.status === "confirmed")
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 5),
    [bookings]
  )

  const chartData = useMemo(() => {
    const base = Array.from({ length: 7 }, (_, index) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - index))
      return {
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        value: 0
      }
    })
    const map = new Map(base.map((item) => [item.key, item]))
    bookings
      .filter((booking) => booking.status === "completed")
      .forEach((booking) => {
        const key = new Date(booking.scheduled_at).toISOString().slice(0, 10)
        if (map.has(key)) {
          map.get(key).value += Number(booking.amount_paid)
        }
      })
    const max = Math.max(...base.map((item) => item.value), 1)
    return { base, max }
  }, [bookings])

  const confirm = async (id) => {
    try {
      await api.patch(`/bookings/${id}/confirm`)
      toast.success("Booking confirmed")
      const res = await api.get("/bookings/my/tutor")
      setBookings(res.data)
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to confirm booking")
    }
  }

  const complete = async (id) => {
    try {
      await api.patch(`/bookings/${id}/complete`)
      toast.success("Booking completed")
      const res = await api.get("/bookings/my/tutor")
      setBookings(res.data)
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to complete booking")
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-slate-500">You are a tutor on PeerGig</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">Total Gigs: {stats.totalGigs}</div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">Sessions Completed: {stats.completed}</div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">Earnings: ₹{stats.earnings}</div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">Avg Rating: {stats.rating}</div>
      </div>
      <div className="mt-4 flex gap-3">
        <Link to="/tutor/gigs/create" className="rounded-xl bg-primary px-4 py-2 text-white">Create New Gig</Link>
        <Link to="/tutor/gigs" className="rounded-xl bg-slate-900 px-4 py-2 text-white">View My Gigs</Link>
        <Link to="/tutor/bookings" className="rounded-xl bg-secondary px-4 py-2 text-white">Upcoming Sessions</Link>
      </div>
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
          <Link to="/tutor/bookings" className="text-sm font-medium text-primary">Open all</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming sessions.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <div key={booking.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
                <div>
                  <p className="font-semibold">{booking.title}</p>
                  <p className="text-sm text-slate-500">{booking.learner_name} · {new Date(booking.scheduled_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {booking.status === "pending" && <button type="button" onClick={() => confirm(booking.id)} className="rounded-lg bg-primary px-3 py-1 text-sm text-white">Confirm</button>}
                  {booking.status === "confirmed" && <Link to={`/session/${booking.id}`} className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white">Join</Link>}
                  {booking.status === "confirmed" && <button type="button" onClick={() => complete(booking.id)} className="rounded-lg bg-primary px-3 py-1 text-sm text-white">Complete</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Earnings (Last 7 Days)</h2>
        <div className="grid grid-cols-7 items-end gap-2">
          {chartData.base.map((item) => (
            <div key={item.key} className="flex flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end rounded bg-slate-100 px-1">
                <div
                  className="w-full rounded bg-primary"
                  style={{ height: `${Math.max(8, (item.value / chartData.max) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="text-xs font-medium">₹{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
