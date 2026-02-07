import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, generateToken } from '@/lib/auth/users'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log('Login attempt:', { username, passwordLength: password?.length })

    if (!username || !password) {
      console.log('Missing credentials')
      return NextResponse.json(
        { message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar credenciales
    const isValid = validateCredentials(username, password)
    console.log('Credentials valid:', isValid)

    if (!isValid) {
      console.log('Invalid credentials for user:', username)
      return NextResponse.json(
        { message: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Generar token
    const token = generateToken(username)
    console.log('Token generated for:', username)

    const response = NextResponse.json(
      { 
        token,
        username,
        message: 'Acceso concedido'
      },
      { status: 200 }
    )

    // Opcional: Establecer cookie también
    response.cookies.set('admin_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    })

    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
