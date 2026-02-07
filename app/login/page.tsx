"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Sparkles, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Intentando login con:', username)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok && data.token) {
        // Guardar token en localStorage
        localStorage.setItem('admin_token', data.token)
        localStorage.setItem('admin_username', username)
        
        console.log('Token guardado, redirigiendo...')
        
        // Pequeño delay para asegurar que se guarde
        setTimeout(() => {
          router.push('/admin')
        }, 100)
      } else {
        setError(data.message || 'Usuario o contraseña incorrectos')
        console.log('Error en respuesta:', data.message)
      }
    } catch (err) {
      console.error('Error de conexión:', err)
      setError('Error al conectar con el servidor. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Innova Trials</h1>
            <p className="text-blue-200 text-sm">Admin Access Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="innova"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
                required
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              {loading ? 'Conectando...' : 'Acceder al Panel'}
            </button>
          </form>

          {/* Test Credentials Info */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/40 space-y-2">
            <p>Credenciales de prueba:</p>
            <p className="text-white/60 font-mono">Usuario: innova</p>
            <p className="text-white/60 font-mono">Contraseña: trials2026</p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-xs text-white/40 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          Conexión Segura
        </div>
      </div>
    </div>
  )
}
