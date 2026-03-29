import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../api/axios"

const tabs = ["pending", "confirmed", "completed", "cancelled"]

const statusClassMap = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700"
}

export default function TutorBookings() {
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState("pending")
  const [now, setNow] = useState(Date.now())

  const load = () => {
    api.get("/bookings/my/tutor").then((res) => setBookings(res.data)).catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const items = useMemo(() => bookings.filter((b) => b.status === tab), [bookings, tab])

  const confirm = async (id) => {
    try {
      await api.patch(`/bookings/${id}/confirm`)
      toast.success("Booking confirmed")
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to confirm booking")
    }
  }

  const complete = async (id) => {
    try {
      await api.patch(`/bookings/${id}/complete`)
      toast.success("Booking completed")
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to complete booking")
    }
  }

  const cancel = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`)
      toast.success("Booking cancelled")
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel booking")
    }
  }

  const getCountdownLabel = (scheduledAt) => {
    const diff = new Date(scheduledAt).getTime() - now
    if (diff <= 0) {
      return "Live now"
    }
    const totalSeconds = Math.floor(diff / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `Starts in ${hours}h ${minutes}m ${seconds}s`
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Tutor Bookings</h1>
      <div className="mt-4 flex gap-2">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-3 py-1 ${tab === t ? "bg-primary text-white" : "bg-white"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((b) => (
          <div key={b.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="font-semibold">{b.title}</p>
            <p className="text-sm text-slate-500">{b.learner_name} · {new Date(b.scheduled_at).toLocaleString()}</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm">₹{b.amount_paid}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs ${statusClassMap[b.status]}`}>{b.status}</span>
              {(b.status === "pending" || b.status === "confirmed") && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">
                  {getCountdownLabel(b.scheduled_at)}
                </span>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              {b.status === "pending" && <button type="button" onClick={() => confirm(b.id)} className="rounded-lg bg-primary px-3 py-1 text-white">Confirm</button>}
              {b.status === "pending" && <button type="button" onClick={() => cancel(b.id)} className="rounded-lg bg-rose-500 px-3 py-1 text-white">Cancel</button>}
              {b.status === "confirmed" && <Link to={`/session/${b.id}`} className="rounded-lg bg-slate-900 px-3 py-1 text-white">Join Session</Link>}
              {b.status === "confirmed" && <button type="button" onClick={() => complete(b.id)} className="rounded-lg bg-primary px-3 py-1 text-white">Complete</button>}
              {b.status === "confirmed" && <button type="button" onClick={() => cancel(b.id)} className="rounded-lg bg-rose-500 px-3 py-1 text-white">Cancel</button>}
              {b.status === "completed" && <span className="rounded-lg bg-emerald-100 px-3 py-1 text-emerald-700">Earnings credited</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
