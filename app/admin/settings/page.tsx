"use client"

import { useState, useEffect } from 'react'
import { Settings, Users, Moon, Sun, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { useTheme } from '@/lib/theme/ThemeProvider'

interface AdminUser {
  id: string
  username: string
  password: string
  createdAt: string
}

export default function SettingsPage() {
  const { theme, brightness, setTheme, setBrightness } = useTheme()
  const [users, setUsers] = useState<AdminUser[]>([
    { id: '1', username: 'innova', password: 'trials2026', createdAt: '2026-02-07' }
  ])
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  // Cargar usuarios del localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('admin_users')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }, [])

  // Guardar configuración
  const saveSettings = () => {
    localStorage.setItem('admin_users', JSON.stringify(users))
    setMessage('Configuración guardada exitosamente')
    setTimeout(() => setMessage(''), 3000)
  }

  // Agregar nuevo usuario
  const addUser = () => {
    if (!newUsername || !newPassword) {
      setMessage('Por favor completa todos los campos')
      return
    }

    if (users.some(u => u.username === newUsername)) {
      setMessage('El usuario ya existe')
      return
    }

    const newUser: AdminUser = {
      id: Date.now().toString(),
      username: newUsername,
      password: newPassword,
      createdAt: new Date().toISOString().split('T')[0]
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers))
    setNewUsername('')
    setNewPassword('')
    setMessage('Usuario agregado exitosamente')
    setTimeout(() => setMessage(''), 3000)
  }

  // Eliminar usuario
  const deleteUser = (id: string) => {
    if (users.length === 1) {
      setMessage('No puedes eliminar el único usuario')
      return
    }
    const updatedUsers = users.filter(u => u.id !== id)
    setUsers(updatedUsers)
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers))
    setMessage('Usuario eliminado')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-900">Configuración del Sistema</h1>
      </div>

      {/* Success Message */}
      {message && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Interface Settings */}
        <div className="space-y-6">
          {/* Theme Section */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Sun className="w-5 h-5 text-blue-600" />
              Tema de Interfaz
            </h2>

            <div className="space-y-4">
              {/* Theme Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Modo de Tema
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Sun className="w-4 h-4 inline mr-2" />
                    Claro
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Moon className="w-4 h-4 inline mr-2" />
                    Oscuro
                  </button>
                </div>
              </div>

              {/* Brightness Control */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Brillo: {brightness}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Oscuro</span>
                  <span>Normal</span>
                  <span>Brillante</span>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveSettings}
                className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 mt-6"
              >
                Guardar Configuración
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
              Información del Sistema
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Versión:</span>
                <span className="font-semibold text-slate-900">V.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Plataforma:</span>
                <span className="font-semibold text-slate-900">Innova Trials</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tema Actual:</span>
                <span className="font-semibold text-slate-900 capitalize">{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Brillo:</span>
                <span className="font-semibold text-slate-900">{brightness}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - User Management */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Gestión de Usuarios
          </h2>

          {/* Add New User Form */}
          <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Agregar Nuevo Usuario</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Nombre de usuario"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={addUser}
                className="w-full py-2 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Usuario
              </button>
            </div>
          </div>

          {/* Users List */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Usuarios Autorizados</h3>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-500">Creado: {user.createdAt}</p>
                  </div>
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={users.length === 1}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Nota de Seguridad:</p>
        <p>Las credenciales se guardan localmente. Para un sistema de producción, se recomienda usar una base de datos segura con encriptación.</p>
      </div>
    </div>
  )
}
