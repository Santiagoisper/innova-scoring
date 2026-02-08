"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function LoginPage() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const router = useRouter()
  const search = useSearchParams()
  const nextPath = search.get("next") || "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("LOGIN RESULT:", { data, error })

      if (error) {
        setLoading(false)
        setError(error.message)
        return
      }

      setMessage("Login successful. Redirecting.....")
      
      // Esperar a que las cookies se propaguen
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setLoading(false)

      // Usar router de Next.js para navegación correcta
      router.push(nextPath)
      router.refresh()
    } catch (err: any) {
      console.error("LOGIN ERROR:", err)
      setLoading(false)
      setError("Unexpected error during login.")
    }
  }

  const onResetPassword = async () => {
    setResetLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (!email) {
        setResetLoading(false)
        setError("Please enter your email first.")
        return
      }

      const redirectTo = `${window.location.origin}/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      console.log("RESET PASSWORD RESULT:", error)

      if (error) {
        setResetLoading(false)
        setError(error.message)
        return
      }

      setResetLoading(false)
      setMessage("Password reset email sent. Check your inbox.")
    } catch (err: any) {
      console.error("RESET ERROR:", err)
      setResetLoading(false)
      setError("Unexpected error sending reset email.")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 card">
      <h1 className="text-2xl font-black text-slate-900">Admin Login</h1>
      <p className="text-slate-500 mt-2">Acceso restringido al panel.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Email
          </label>
          <input
            className="input mt-2 w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Password
          </label>

          <div className="relative mt-2">
            <input
              className="input w-full pr-20"
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
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
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <button
          type="button"
          className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-900"
          onClick={onResetPassword}
          disabled={resetLoading}
        >
          {resetLoading ? "Sending reset email..." : "Forgot password?"}
        </button>
      </form>
    </div>
  )
}
