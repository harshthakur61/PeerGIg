import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../api/axios"

export default function ManageGigs() {
  const [gigs, setGigs] = useState([])

  const load = () => {
    api.get("/gigs/my/gigs").then((res) => setGigs(res.data)).catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  const toggle = async (gig) => {
    await api.put(`/gigs/${gig.id}`, { is_active: gig.is_active ? 0 : 1 })
    load()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Gigs</h1>
        <Link to="/tutor/gigs/create" className="rounded-xl bg-primary px-4 py-2 text-white">Create New Gig</Link>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr><th className="p-3">Title</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3">Bookings</th><th className="p-3">Rating</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody>
            {gigs.map((gig) => (
              <tr key={gig.id} className="border-t">
                <td className="p-3">{gig.title}</td>
                <td className="p-3">₹{gig.price}</td>
                <td className="p-3">{gig.is_active ? "active" : "inactive"}</td>
                <td className="p-3">{gig.bookings_count || 0}</td>
                <td className="p-3">{gig.avg_rating}</td>
                <td className="p-3">
                  <Link to={`/tutor/gigs/${gig.id}/edit`} className="mr-2 rounded bg-slate-900 px-2 py-1 text-white">Edit</Link>
                  <button type="button" onClick={() => toggle(gig)} className="rounded bg-secondary px-2 py-1 text-white">
                    {gig.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
