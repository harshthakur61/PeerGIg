import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../api/axios"
import StarRating from "../components/StarRating"
import { useAuth } from "../context/AuthContext"

export default function GigDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState({ gig: null, reviews: [] })
  const [scheduledAt, setScheduledAt] = useState("")
  const [bookings, setBookings] = useState([])
  const [review, setReview] = useState({ rating: 5, comment: "" })
  const tags = (data.gig?.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

  const load = () => {
    const requests = [api.get(`/gigs/${id}`)]
    if (user) {
      requests.push(api.get("/bookings/my/learner"))
    }
    Promise.all(requests)
      .then(([gigRes, bookingRes]) => {
        setData(gigRes.data)
        if (bookingRes) {
          setBookings(bookingRes.data)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    load()
  }, [id, user])

  const book = async () => {
    if (!user) {
      navigate("/auth")
      return
    }
    try {
      await api.post("/bookings", { gig_id: Number(id), scheduled_at: scheduledAt || new Date().toISOString() })
      toast.success("Booking created")
      navigate("/learner/bookings")
    } catch (error) {
      if (error.response?.data?.message === "Insufficient balance") {
        await api.post("/wallet/add-credits")
        toast.success("₹100 credits added")
      } else {
        toast.error(error.response?.data?.message || "Booking failed")
      }
    }
  }

  const submitReview = async () => {
    try {
      const reviewBooking = bookings.find(
        (booking) =>
          booking.gig_id === Number(id) && booking.status === "completed" && Number(booking.has_review) === 0
      )
      if (!reviewBooking) {
        toast.error("No eligible completed booking found")
        return
      }
      await api.post("/reviews", { booking_id: reviewBooking.id, gig_id: Number(id), rating: review.rating, comment: review.comment })
      toast.success("Review submitted")
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || "Review failed")
    }
  }

  if (!data.gig) {
    return <main className="mx-auto max-w-5xl px-4 py-8">Loading...</main>
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">{data.gig.title}</h1>
          <p className="mt-3 text-slate-600">{data.gig.description}</p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm">{data.gig.subject}</span>
            <span className="rounded-full bg-pink-100 px-3 py-1 text-sm">{data.gig.difficulty}</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">{data.gig.duration_minutes} min</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <h2 className="font-semibold">Tutor</h2>
            <p className="font-medium">{data.gig.tutor_name}</p>
            <p className="text-sm text-slate-500">{data.gig.tutor_college}</p>
            <p className="mt-2 text-sm text-slate-600">{data.gig.tutor_bio || "No bio yet."}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-2 text-xs">Active gigs: <span className="font-semibold">{data.gig.tutor_total_gigs || 0}</span></div>
              <div className="rounded-lg bg-white p-2 text-xs">Completed sessions: <span className="font-semibold">{data.gig.tutor_completed_sessions || 0}</span></div>
              <div className="rounded-lg bg-white p-2 text-xs">Tutor rating: <span className="font-semibold">{data.gig.tutor_avg_rating || 0}</span></div>
            </div>
          </div>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-2xl font-bold text-primary">₹{data.gig.price}</p>
          <p className="mt-1 text-sm text-slate-500">Total bookings: {data.gig.booking_count || 0}</p>
          <input type="datetime-local" className="mt-3 w-full rounded-xl border p-2" onChange={(e) => setScheduledAt(e.target.value)} />
          <button type="button" onClick={book} className="mt-3 w-full rounded-xl bg-primary p-2 text-white">
            Confirm Booking
          </button>
        </section>
      </div>
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
        {data.reviews.map((r) => (
          <div key={r.id} className="border-b py-3 last:border-none">
            <div className="flex items-center justify-between">
              <p className="font-medium">{r.reviewer_name}</p>
              <StarRating value={r.rating} />
            </div>
            <p className="text-sm text-slate-600">{r.comment}</p>
          </div>
        ))}
      </section>
      {user && bookings.some((booking) => booking.gig_id === Number(id) && booking.status === "completed" && Number(booking.has_review) === 0) && (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Write a Review</h3>
          <StarRating interactive value={review.rating} onChange={(value) => setReview({ ...review, rating: value })} />
          <textarea className="mt-2 w-full rounded border p-2" placeholder="Your feedback" onChange={(e) => setReview({ ...review, comment: e.target.value })} />
          <button type="button" onClick={submitReview} className="mt-2 rounded-xl bg-secondary px-4 py-2 text-white">
            Submit Review
          </button>
        </section>
      )}
    </main>
  )
}
