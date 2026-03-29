import { Bell } from "lucide-react"
import { useEffect, useState } from "react"
import api from "../api/axios"

export default function NotificationBell() {
  const [data, setData] = useState({ items: [], unread: 0 })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const load = () => {
      api.get("/notifications").then((res) => setData(res.data)).catch(() => {})
    }
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (!open) {
      api.patch("/notifications/read-all").then(() => {
        setData((prev) => ({ ...prev, unread: 0 }))
      })
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={handleToggle} className="relative rounded-full p-2 text-[#FDF6EC] hover:bg-white/10">
        <Bell className="h-5 w-5" />
        {data.unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-secondary px-1.5 text-xs text-white">
            {data.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border bg-white p-3 shadow-lg">
          {data.items.length === 0 ? (
            <p className="text-sm text-slate-500">No notifications</p>
          ) : (
            data.items.map((n) => (
              <div key={n.id} className="border-b py-2 text-sm last:border-none">
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
