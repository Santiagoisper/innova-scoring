"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash

    if (!hash) {
      setError("Invalid reset link. Missing token.")
      return
    }

    const params = new URLSearchParams(hash.replace("#", ""))

    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")

    if (!access_token || !refresh_token) {
      setError("Invalid reset link. Missing access/refresh token.")
      return
    }

    const setSession = async () => {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSessionReady(true)
    }

    setSession()
  }, [supabase])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!sessionReady) {
      setError("Session not ready. Please reload the page.")
      return
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage("Password updated successfully. Redirecting.....")

    setTimeout(() => {
      router.replace("/login?next=/admin")
    }, 1200)
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 card">
      <h1 className="text-2xl font-black text-slate-900">Reset Password</h1>
      <p className="text-slate-500 mt-2">
        Set a new password for your account.
      </p>

      <form onSubmit={handleReset} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            New Password
          </label>
          <input
            className="input mt-2 w-full"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Confirm Password
          </label>
          <input
            className="input mt-2 w-full"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
            {message}
          </div>
        )}

        <button className="btn-primary w-full py-4" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  )
}
