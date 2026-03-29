import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import api from "../../api/axios"

export default function TutorWallet() {
  const [balance, setBalance] = useState(0)
  const [txns, setTxns] = useState([])

  useEffect(() => {
    api.get("/wallet/balance").then((res) => setBalance(res.data.balance)).catch(() => {})
    api.get("/wallet/transactions").then((res) => setTxns(res.data)).catch(() => {})
  }, [])

  const allTime = useMemo(() => txns.filter((t) => t.type === "credit").reduce((sum, t) => sum + Number(t.amount), 0), [txns])
  const thisMonth = useMemo(
    () =>
      txns
        .filter((t) => t.type === "credit" && new Date(t.created_at).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [txns]
  )
  const thisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return txns
      .filter((t) => t.type === "credit" && new Date(t.created_at).getTime() >= weekAgo)
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }, [txns])
  const txnsWithRunning = useMemo(() => {
    let rolling = Number(balance)
    return txns.map((txn) => {
      const currentBalance = rolling
      rolling += txn.type === "credit" ? -Number(txn.amount) : Number(txn.amount)
      return { ...txn, running_balance: currentBalance }
    })
  }, [txns, balance])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Tutor Wallet</h1>
        <p className="mt-2 text-4xl font-bold text-primary">₹{balance}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">This week: <span className="font-semibold">₹{thisWeek}</span></div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">This month: <span className="font-semibold">₹{thisMonth}</span></div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">All time: <span className="font-semibold">₹{allTime}</span></div>
        </div>
        <button type="button" onClick={() => toast.success("Withdrawal requested")} className="mt-3 rounded-xl bg-secondary px-4 py-2 text-white">
          Withdraw (Demo)
        </button>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr><th className="p-3">Date</th><th className="p-3">Description</th><th className="p-3">Amount</th><th className="p-3">Balance</th></tr>
          </thead>
          <tbody>
            {txnsWithRunning.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{new Date(t.created_at).toLocaleString()}</td>
                <td className="p-3">{t.description}</td>
                <td className={`p-3 ${t.type === "credit" ? "text-emerald-600" : "text-red-600"}`}>{t.type === "credit" ? "+" : "-"}₹{t.amount}</td>
                <td className="p-3 font-medium">₹{Number(t.running_balance).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
