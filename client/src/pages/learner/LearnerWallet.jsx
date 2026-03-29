import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import api from "../../api/axios"

export default function LearnerWallet() {
  const [balance, setBalance] = useState(0)
  const [txns, setTxns] = useState([])

  const load = () => {
    api.get("/wallet/balance").then((res) => setBalance(res.data.balance)).catch(() => {})
    api.get("/wallet/transactions").then((res) => setTxns(res.data)).catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  const spent = useMemo(
    () => txns.filter((t) => t.type === "debit").reduce((sum, t) => sum + Number(t.amount), 0),
    [txns]
  )
  const added = useMemo(
    () => txns.filter((t) => t.type === "credit").reduce((sum, t) => sum + Number(t.amount), 0),
    [txns]
  )
  const txnsWithRunning = useMemo(() => {
    let rolling = Number(balance)
    return txns.map((txn) => {
      const currentBalance = rolling
      rolling += txn.type === "credit" ? -Number(txn.amount) : Number(txn.amount)
      return { ...txn, running_balance: currentBalance }
    })
  }, [txns, balance])

  const addCredits = async () => {
    await api.post("/wallet/add-credits")
    toast.success("₹100 added")
    load()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Learner Wallet</h1>
        <p className="mt-2 text-4xl font-bold text-primary">₹{balance}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">Credits added: <span className="font-semibold">₹{added}</span></div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">Total spent: <span className="font-semibold">₹{spent}</span></div>
        </div>
        <button type="button" onClick={addCredits} className="mt-3 rounded-xl bg-primary px-4 py-2 text-white">
          Add ₹100 Credits
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
