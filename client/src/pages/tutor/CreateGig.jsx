import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../api/axios"
import GigCard from "../../components/GigCard"
import { useAuth } from "../../context/AuthContext"

const initial = {
  title: "",
  subject: "Mathematics",
  description: "",
  price: 49,
  duration_minutes: 45,
  difficulty: "Beginner",
  tags: ""
}

export default function CreateGig() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)

  useEffect(() => {
    if (id) {
      api.get(`/gigs/${id}`).then((res) => setForm(res.data.gig)).catch(() => {})
    }
  }, [id])

  const tagList = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

  const validationErrors = []
  if (!form.title.trim()) {
    validationErrors.push("Topic title is required")
  }
  if (form.description.trim().length < 50) {
    validationErrors.push("Description must be at least 50 characters")
  }
  if (Number(form.price) < 10 || Number(form.price) > 999) {
    validationErrors.push("Price must be between ₹10 and ₹999")
  }
  if (![30, 45, 60].includes(Number(form.duration_minutes))) {
    validationErrors.push("Select a valid duration")
  }
  if (!["Beginner", "Intermediate", "Advanced"].includes(form.difficulty)) {
    validationErrors.push("Select a valid difficulty")
  }
  if (tagList.length === 0) {
    validationErrors.push("Add at least one tag")
  }

  const save = async () => {
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      tags: tagList.join(",")
    }
    try {
      if (id) {
        await api.put(`/gigs/${id}`, payload)
      } else {
        await api.post("/gigs", payload)
      }
      toast.success("Gig saved")
      navigate("/tutor/gigs")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save gig")
    }
  }

  const deactivate = async () => {
    await api.delete(`/gigs/${id}`)
    navigate("/tutor/gigs")
  }

  const preview = { ...form, tutor_name: user?.name, avg_rating: 0 }

  return (
    <main className="mx-auto grid max-w-6xl gap-4 px-4 py-8 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{id ? "Edit Gig" : "Create Gig"}</h1>
        <div className="mt-4 grid gap-3">
          <input className="rounded-xl border p-2" placeholder="Topic Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="rounded-xl border p-2" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
            <option>Mathematics</option><option>Physics</option><option>Chemistry</option><option>Biology</option><option>Programming</option><option>Economics</option><option>History</option><option>English</option><option>Chess</option><option>Other</option>
          </select>
          <textarea className="rounded-xl border p-2" rows="4" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="number" min="10" max="999" className="rounded-xl border p-2" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <div className="flex gap-3">
            {[30, 45, 60].map((d) => (
              <button type="button" key={d} onClick={() => setForm({ ...form, duration_minutes: d })} className={`rounded-xl px-3 py-1 ${form.duration_minutes === d ? "bg-primary text-white" : "bg-slate-100"}`}>
                {d} min
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            {["Beginner", "Intermediate", "Advanced"].map((d) => (
              <button type="button" key={d} onClick={() => setForm({ ...form, difficulty: d })} className={`rounded-xl px-3 py-1 ${form.difficulty === d ? "bg-secondary text-white" : "bg-slate-100"}`}>
                {d}
              </button>
            ))}
          </div>
          <div>
            <input className="w-full rounded-xl border p-2" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <div className="mt-2 flex flex-wrap gap-2">
              {tagList.map((tag) => (
                <span key={tag} className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {validationErrors.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {validationErrors[0]}
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={save} className="rounded-xl bg-primary px-4 py-2 text-white">{id ? "Update" : "Submit"}</button>
            {id && <button type="button" onClick={deactivate} className="rounded-xl bg-red-500 px-4 py-2 text-white">Delete</button>}
          </div>
        </div>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Live Preview</h2>
        <GigCard gig={preview} />
      </section>
    </main>
  )
}
