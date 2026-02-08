"use client"

import { useMemo, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function AdminUsersPage() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "evaluator">("evaluator")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInvite = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError("Not logged in.")
        setLoading(false)
        return
      }

      const res = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json?.error || "Invite failed")
        setLoading(false)
        return
      }

      setMessage(`Invitation sent to ${email} as ${role}`)
      setEmail("")
    } catch (err: any) {
      setError("Unexpected error sending invite.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24 px-6 pt-10">
      <div className="card p-10">
        <h1 className="text-3xl font-black text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-2">
          Invite evaluators or admins by email. They will receive a link to set their password.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Email
            </label>
            <input
              className="input w-full mt-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="user@email.com"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Role
            </label>
            <select
              className="input w-full mt-2"
              value={role}
              onChange={e => setRole(e.target.value as any)}
            >
              <option value="evaluator">Evaluator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 font-bold text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-bold text-sm">
              {message}
            </div>
          )}

          <button
            className="btn-primary w-full py-4"
            onClick={handleInvite}
            disabled={loading || !email}
          >
            {loading ? "Sending invite..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  )
}
