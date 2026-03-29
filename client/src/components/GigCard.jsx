import { Link } from "react-router-dom"
import StarRating from "./StarRating"

export default function GigCard({ gig }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white p-4 shadow-sm transition hover:shadow-md">
      <img
        src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(gig.tutor_name || "Tutor")}`}
        alt={gig.tutor_name}
        className="mb-3 h-12 w-12 rounded-full"
      />
      <Link to={`/gig/${gig.id}`} className="text-lg font-semibold text-slate-900">
        {gig.title}
      </Link>
      <div className="mt-1 flex gap-2 text-xs">
        <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-700">{gig.subject}</span>
        <span className="rounded-full bg-pink-100 px-2 py-1 text-pink-700">{gig.difficulty}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xl font-bold text-primary">₹{gig.price}</span>
        <span className="text-sm text-slate-500">{gig.duration_minutes} min</span>
      </div>
      <div className="mt-2">
        <StarRating value={gig.avg_rating || 0} />
      </div>
      <Link to={`/gig/${gig.id}`} className="mt-4 block rounded-xl bg-primary px-3 py-2 text-center text-sm font-semibold text-white">
        Book Now
      </Link>
    </div>
  )
}
