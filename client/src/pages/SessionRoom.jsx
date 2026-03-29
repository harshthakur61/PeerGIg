import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"

export default function SessionRoom() {
  const { bookingId } = useParams()
  const { user } = useAuth()
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    api
      .get(`/bookings/${bookingId}`)
      .then((res) => setBooking(res.data))
      .catch(() => {})
  }, [bookingId])

  const complete = async () => {
    try {
      await api.patch(`/bookings/${bookingId}/complete`)
      setBooking((prev) => ({ ...prev, status: "completed" }))
      toast.success("Session marked as completed")
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to complete session")
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">{booking?.title || "Session Room"}</h1>
        <p className="text-sm text-slate-500">
          {booking?.scheduled_at ? new Date(booking.scheduled_at).toLocaleString() : ""}
          {booking?.tutor_id === user?.id ? ` · Learner: ${booking?.learner_name || ""}` : ` · Tutor: ${booking?.tutor_name || ""}`}
        </p>
        <p className="text-sm text-slate-500">Status: {booking?.status || "pending"}</p>
      </div>
      <iframe
        src={`https://meet.jit.si/peergig-session-${bookingId}`}
        allow="camera; microphone; fullscreen; display-capture"
        style={{ width: "100%", height: "600px", border: "none" }}
        title="Jitsi Room"
      />
      <div className="mt-4 flex gap-3">
        {booking?.tutor_id === user?.id && booking?.status === "confirmed" && (
          <button type="button" onClick={complete} className="rounded-xl bg-primary px-4 py-2 text-white">
            Mark as Completed
          </button>
        )}
        <Link to={booking?.tutor_id === user?.id ? "/tutor/dashboard" : "/learner/dashboard"} className="rounded-xl bg-slate-800 px-4 py-2 text-white">
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}
