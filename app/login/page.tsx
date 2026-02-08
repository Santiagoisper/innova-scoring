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
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.replace(nextPath)
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

        <button className="btn-primary w-full py-4" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  )
}
