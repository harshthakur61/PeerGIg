import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../api/axios"
import StarRating from "../../components/StarRating"

const tabs = ["upcoming", "completed", "cancelled"]

const statusClassMap = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700"
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState("upcoming")
  const [review, setReview] = useState({ booking_id: null, rating: 5, comment: "" })
  const [now, setNow] = useState(Date.now())

  const load = () => {
    api.get("/bookings/my/learner").then((res) => setBookings(res.data)).catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const items = useMemo(() => {
    if (tab === "upcoming") {
      return bookings.filter((b) => b.status === "pending" || b.status === "confirmed")
    }
    return bookings.filter((b) => b.status === tab)
  }, [bookings, tab])

  const submitReview = async () => {
    try {
      const selected = bookings.find((b) => b.id === review.booking_id)
      await api.post("/reviews", {
        booking_id: review.booking_id,
        gig_id: selected?.gig_id,
        rating: review.rating,
        comment: review.comment
      })
      toast.success("Review submitted")
      setReview({ booking_id: null, rating: 5, comment: "" })
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || "Review submission failed")
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
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
      <h1 className="text-2xl font-bold">My Bookings</h1>
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
            <p className="text-sm text-slate-500">{b.tutor_name} · {new Date(b.scheduled_at).toLocaleString()}</p>
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
              {(b.status === "pending" || b.status === "confirmed") && <Link to={`/session/${b.id}`} className="rounded-lg bg-slate-900 px-3 py-1 text-white">Join Session</Link>}
              {(b.status === "pending" || b.status === "confirmed") && (
                <button type="button" onClick={() => cancelBooking(b.id)} className="rounded-lg bg-rose-500 px-3 py-1 text-white">
                  Cancel
                </button>
              )}
              {b.status === "completed" && Number(b.has_review) === 0 && (
                <button type="button" onClick={() => setReview({ ...review, booking_id: b.id })} className="rounded-lg bg-secondary px-3 py-1 text-white">
                  Write Review
                </button>
              )}
              {b.status === "completed" && Number(b.has_review) === 1 && (
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-emerald-700">Reviewed</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {review.booking_id && (
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="font-semibold">Review booking #{review.booking_id}</h3>
          <StarRating interactive value={review.rating} onChange={(value) => setReview({ ...review, rating: value })} />
          <textarea className="mt-2 w-full rounded border p-2" onChange={(e) => setReview({ ...review, comment: e.target.value })} />
          <button type="button" onClick={submitReview} className="mt-2 rounded-lg bg-primary px-3 py-1 text-white">Submit</button>
        </div>
      )}
    </main>
  )
}
