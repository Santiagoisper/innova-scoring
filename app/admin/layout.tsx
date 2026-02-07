"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "./Sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si existe un token válido
    const token = localStorage.getItem("admin_token")
    
    if (!token) {
      // No hay token, redirigir a login
      router.push("/login")
    } else {
      // Token existe, permitir acceso
      setIsAuthenticated(true)
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <main className="flex-1 p-10">{children}</main>
    </div>
  )
}
