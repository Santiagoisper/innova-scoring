import { NextRequest, NextResponse } from 'next/server'

// Usuarios autorizados (por defecto)
const DEFAULT_USERS = [
  { username: 'innova', password: 'trials2026' }
]

// Obtener usuarios de localStorage del servidor (simulado)
// En producción, esto vendría de una base de datos
let authorizedUsers = [...DEFAULT_USERS]

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar credenciales
    const user = authorizedUsers.find(
      u => u.username === username && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Generar token simple (en producción usar JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')

    return NextResponse.json(
      { 
        token,
        username,
        message: 'Acceso concedido'
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 }
    )
  }
}

// Exportar para acceso desde otros módulos
export { authorizedUsers }
