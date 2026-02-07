import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, generateToken } from '@/lib/auth/users'

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
    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { message: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Generar token
    const token = generateToken(username)

    return NextResponse.json(
      { 
        token,
        username,
        message: 'Acceso concedido'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
