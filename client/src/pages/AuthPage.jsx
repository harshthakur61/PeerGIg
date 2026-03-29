import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [form, setForm] = useState({ name: "", college: "", email: "", password: "", role: "both" })
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login"
      const payload = isSignup ? form : { email: form.email, password: form.password }
      const { data } = await api.post(endpoint, payload)
      login(data)
      toast.success("Welcome to PeerGig")
      navigate(data.user.role === "tutor" ? "/tutor/dashboard" : "/learner/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed")
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{isSignup ? "Create account" : "Login"}</h1>
        <button type="button" className="mt-2 text-sm text-primary" onClick={() => setIsSignup((v) => !v)}>
          {isSignup ? "Already have an account?" : "Need an account?"}
        </button>
        <form onSubmit={submit} className="mt-4 space-y-3">
          {isSignup && (
            <>
              <input placeholder="Name" className="w-full rounded-xl border p-2" onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="College/University" className="w-full rounded-xl border p-2" onChange={(e) => setForm({ ...form, college: e.target.value })} />
              <select className="w-full rounded-xl border p-2" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="learner">I want to Learn</option>
                <option value="tutor">I want to Teach</option>
                <option value="both">Both</option>
              </select>
            </>
          )}
          <input placeholder="Email" type="email" className="w-full rounded-xl border p-2" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Password" type="password" className="w-full rounded-xl border p-2" onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit" className="w-full rounded-xl bg-primary p-2 font-semibold text-white">
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs">
          Demo: learner@demo.com / demo123 | tutor@demo.com / demo123
        </div>
      </div>
    </main>
  )
}
