import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import GigCard from "../components/GigCard"
import logo from "../assets/peergig-logo.svg"

const subjects = ["Mathematics", "Physics", "Chemistry", "Programming", "Economics", "History", "English", "Chess"]
const roleData = {
  learner: {
    label: "🎓 Learner",
    title: "No concept should stay",
    accent: "unclear.",
    sub: "Get instant 1:1 help from trusted student tutors. Learn faster with topic-wise sessions, clear examples, and affordable pricing.",
    ctaPrimary: "Find a Tutor",
    ctaSecondary: "How It Works →",
    color: "#E8621A",
    particleColor: "rgba(249, 135, 74, 0.35)"
  },
  tutor: {
    label: "✍️ Tutor",
    title: "Teach what you know,",
    accent: "earn what you deserve.",
    sub: "Create your gig, set your price, and teach students who need your expertise. Build reputation and income in one place.",
    ctaPrimary: "Become a Tutor",
    ctaSecondary: "Create Profile →",
    color: "#3B6BC9",
    particleColor: "rgba(122, 171, 255, 0.35)"
  },
  achiever: {
    label: "📚 Achiever",
    title: "From weak chapters",
    accent: "to top scores.",
    sub: "Track your progress session by session. Convert doubts into clarity and improve confidence before tests and exams.",
    ctaPrimary: "Start Learning",
    ctaSecondary: "Explore Subjects →",
    color: "#2D6A4F",
    particleColor: "rgba(82, 183, 136, 0.35)"
  },
  sprint: {
    label: "⚡ Exam Sprint",
    title: "Last-minute prep,",
    accent: "maximum impact.",
    sub: "Book focused revision sessions for formulas, numericals, coding, and writing practice when deadlines are close.",
    ctaPrimary: "Book a Session",
    ctaSecondary: "See Featured Gigs →",
    color: "#7B3BC9",
    particleColor: "rgba(184, 122, 255, 0.35)"
  }
}

const bgSymbols = ["📘", "📙", "📗", "✎", "✐", "∑", "π", "∞", "x²", "√", "Δ", "∫", "A", "B", "C", "1", "2", "3", "{ }", "[ ]", "+", "÷"]

export default function LandingPage() {
  const [gigs, setGigs] = useState([])
  const [activeRole, setActiveRole] = useState("learner")
  const [stats, setStats] = useState({ sessions: 0, tutors: 0, subjects: 0, avg: 0 })
  const canvasRef = useRef(null)

  useEffect(() => {
    api.get("/gigs?sort=rating").then((res) => setGigs(res.data.slice(0, 6))).catch(() => {})
  }, [])

  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap"
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  useEffect(() => {
    const target = { sessions: 2400, tutors: 300, subjects: 500, avg: 49 }
    const duration = 1200
    const startTime = performance.now()
    let frame

    const animate = (now) => {
      const progress = Math.min(1, (now - startTime) / duration)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setStats({
        sessions: Math.round(target.sessions * easeOut),
        tutors: Math.round(target.tutors * easeOut),
        subjects: Math.round(target.subjects * easeOut),
        avg: Math.round(target.avg * easeOut)
      })
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    let width = window.innerWidth
    let height = window.innerHeight
    let animationFrame
    let time = 0
    const mouse = { x: width / 2, y: height / 2 }
    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.2 + Math.random() * 0.6),
      size: 12 + Math.random() * 22,
      alpha: 0.06 + Math.random() * 0.14,
      spin: (Math.random() - 0.5) * 0.009,
      rot: Math.random() * Math.PI * 2,
      symbol: bgSymbols[Math.floor(Math.random() * bgSymbols.length)]
    }))
    const dots = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.4 + Math.random() * 1.8,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: 0.05 + Math.random() * 0.15
    }))

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    const onMouseMove = (event) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }

    const drawOrb = (x, y, radius, color) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, "rgba(0,0,0,0)")
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fillStyle = gradient
      context.fill()
    }

    const render = () => {
      time += 0.004
      context.clearRect(0, 0, width, height)
      context.fillStyle = "#1A1208"
      context.fillRect(0, 0, width, height)

      const roleColor = roleData[activeRole]?.particleColor || "rgba(249, 135, 74, 0.35)"
      drawOrb(width * 0.2 + Math.sin(time) * 70, height * 0.35 + Math.cos(time * 0.8) * 46, 360, roleColor)
      drawOrb(width * 0.8 + Math.cos(time) * 58, height * 0.66 + Math.sin(time * 0.7) * 52, 320, "rgba(82, 183, 136, 0.2)")

      const mouseGlow = context.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240)
      mouseGlow.addColorStop(0, "rgba(253,246,236,0.06)")
      mouseGlow.addColorStop(1, "rgba(253,246,236,0)")
      context.fillStyle = mouseGlow
      context.fillRect(0, 0, width, height)

      dots.forEach((dot) => {
        dot.x += dot.dx
        dot.y += dot.dy
        if (dot.x < 0) dot.x = width
        if (dot.x > width) dot.x = 0
        if (dot.y < 0) dot.y = height
        if (dot.y > height) dot.y = 0
        context.beginPath()
        context.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
        context.fillStyle = `rgba(253,246,236,${dot.alpha})`
        context.fill()
      })

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rot += particle.spin
        if (particle.y < -80) {
          particle.y = height + 30
          particle.x = Math.random() * width
          particle.symbol = bgSymbols[Math.floor(Math.random() * bgSymbols.length)]
        }
        context.save()
        context.translate(particle.x, particle.y)
        context.rotate(particle.rot)
        context.globalAlpha = particle.alpha
        context.font = `${particle.size}px serif`
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText(particle.symbol, 0, 0)
        context.restore()
      })

      animationFrame = requestAnimationFrame(render)
    }

    resize()
    render()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMouseMove)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [activeRole])

  const role = useMemo(() => roleData[activeRole], [activeRole])

  return (
    <main className="relative overflow-x-hidden bg-[#1A1208] text-[#FDF6EC]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-6 md:pt-14">
        <section className="min-h-[calc(100vh-90px)] overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(26,18,8,0.55)] backdrop-blur-xl">
          <div className="flex min-h-[72vh] flex-col items-center justify-center px-5 py-16 text-center md:px-10">
            <img src={logo} alt="PeerGig" className="mb-8 h-16 w-auto" />
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8621A]/40 bg-[#E8621A]/15 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#F9874A]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#E8621A]" />
              Study support for learners across India
            </div>

            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#C8B499]">PeerGig Learning Network</p>
            <h1
              className="max-w-4xl text-[clamp(2.7rem,8vw,6.3rem)] font-black leading-[1.02] tracking-[-0.03em] text-[#FDF6EC]"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 10px 28px rgba(0,0,0,0.3)" }}
            >
              {role.title}
              <span className="block bg-gradient-to-r from-[#E8621A] via-[#F9874A] to-[#C9963B] bg-clip-text italic text-transparent">{role.accent}</span>
            </h1>

            <p className="mt-5 min-h-[4.4rem] max-w-2xl text-[clamp(1rem,2vw,1.15rem)] font-light leading-7 text-[#FDF6EC]/70">{role.sub}</p>

            <p className="mb-3 mt-4 text-xs uppercase tracking-[0.16em] text-[#A89880]">I am a —</p>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              {Object.entries(roleData).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveRole(key)}
                  className="rounded-2xl border px-4 py-2.5 text-sm transition-all duration-300"
                  style={{
                    borderColor: activeRole === key ? value.color : "rgba(255,255,255,0.15)",
                    color: activeRole === key ? "#fff" : "rgba(253,246,236,0.75)",
                    background: activeRole === key ? `${value.color}33` : "rgba(255,255,255,0.04)",
                    boxShadow: activeRole === key ? `0 8px 26px ${value.color}50` : "none",
                    transform: activeRole === key ? "translateY(-3px)" : "translateY(0)"
                  }}
                >
                  {value.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to={activeRole === "tutor" ? "/auth" : "/explore"}
                className="rounded-full px-8 py-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5"
                style={{ background: role.color }}
              >
                {role.ctaPrimary}
              </Link>
              <a href="#how-to-use" className="rounded-full border border-white/25 px-8 py-3 text-sm text-[#FDF6EC] transition hover:bg-white/10">
                {role.ctaSecondary}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center border-t border-white/10 bg-[rgba(26,18,8,0.45)] px-4 py-6 backdrop-blur-md">
            <div className="w-[180px] px-4 text-center">
              <p className="text-4xl leading-none text-[#FDF6EC]" style={{ fontFamily: "'Playfair Display', serif" }}>{stats.sessions.toLocaleString("en-IN")}+</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#A89880]">Sessions Completed</p>
            </div>
            <div className="w-[180px] px-4 text-center">
              <p className="text-4xl leading-none text-[#FDF6EC]" style={{ fontFamily: "'Playfair Display', serif" }}>{stats.tutors}+</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#A89880]">Student Tutors</p>
            </div>
            <div className="w-[180px] px-4 text-center">
              <p className="text-4xl leading-none text-[#FDF6EC]" style={{ fontFamily: "'Playfair Display', serif" }}>{stats.subjects}+</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#A89880]">Topics Covered</p>
            </div>
            <div className="w-[180px] px-4 text-center">
              <p className="text-4xl leading-none text-[#FDF6EC]" style={{ fontFamily: "'Playfair Display', serif" }}>₹{stats.avg}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#A89880]">Avg Session Price</p>
            </div>
          </div>
        </section>

        <section id="how-to-use" className="mt-12 rounded-[28px] border border-white/10 bg-[rgba(26,18,8,0.58)] p-6 backdrop-blur-xl md:p-10">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#FDF6EC]" style={{ fontFamily: "'Playfair Display', serif" }}>How to Use</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-[#F9874A]">Step 1</p>
              <h3 className="mt-1 text-xl font-semibold">Choose Subject</h3>
              <p className="mt-2 text-sm text-[#FDF6EC]/70">Pick your topic and filter tutors by rating, price, and skill level.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-[#F9874A]">Step 2</p>
              <h3 className="mt-1 text-xl font-semibold">Book Session</h3>
              <p className="mt-2 text-sm text-[#FDF6EC]/70">Select a tutor, choose schedule, and confirm in seconds.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-[#F9874A]">Step 3</p>
              <h3 className="mt-1 text-xl font-semibold">Learn & Improve</h3>
              <p className="mt-2 text-sm text-[#FDF6EC]/70">Join the session, solve doubts, and keep track of your learning progress.</p>
            </div>
          </div>
        </section>

        <section id="about" className="mt-10 rounded-[28px] border border-white/10 bg-[rgba(26,18,8,0.58)] p-6 backdrop-blur-xl md:p-10">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#FDF6EC]" style={{ fontFamily: "'Playfair Display', serif" }}>About PeerGig</h2>
          <p className="mt-3 max-w-3xl text-[#FDF6EC]/70">
            PeerGig brings learners and tutors together for focused micro-learning. From books and formulas to coding and problem-solving, it helps students move faster with clarity.
          </p>
        </section>

        <section id="contact-us" className="mt-10 rounded-[28px] border border-white/10 bg-[rgba(26,18,8,0.58)] p-6 backdrop-blur-xl md:p-10">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#FDF6EC]" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Us</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="mailto:support@peergig.app" className="rounded-full border border-[#E8621A]/50 bg-[#E8621A]/15 px-5 py-2.5 text-sm font-medium text-[#F9874A]">
              support@peergig.app
            </a>
            <Link to="/auth" className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-[#FDF6EC]">
              Create Account
            </Link>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-[rgba(26,18,8,0.58)] p-6 backdrop-blur-xl md:p-10">
          <h2 className="mb-4 text-2xl font-black tracking-[-0.02em] text-[#FDF6EC]" style={{ fontFamily: "'Playfair Display', serif" }}>Browse by Subject</h2>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Link
                key={subject}
                to={`/explore?subject=${encodeURIComponent(subject)}`}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-[#FDF6EC]/85 transition hover:border-[#E8621A]/50 hover:text-[#F9874A]"
              >
                {subject}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-black tracking-[-0.02em] text-[#FDF6EC]" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Gigs</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
