"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Sparkles, 
  Mail, 
  Key, 
  ChevronRight, 
  AlertCircle,
  Loader2
} from "lucide-react"

export default function ClienteLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/cliente/validate-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Access Denied")
      }

      // If valid, redirect to the evaluation page with the token
      router.push(`/cliente/${token}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-500/20 mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Client Portal</h1>
          <p className="text-slate-500">Innova Trials - Site Self-Assessment</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@site.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Access Token
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your unique token"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-wider">
                The token was sent to your institutional email
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-3 py-4 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Enter Portal
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center text-sm text-slate-400 mt-8 font-medium">
          Don't have a token? Contact your Innova Trials administrator.
        </p>
      </div>
    </div>
  )
}
