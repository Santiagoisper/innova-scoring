import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rutas protegidas
  const protectedRoutes = ['/admin']

  // Verificar si la ruta es protegida
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Obtener token del header o cookie
    const token = request.cookies.get('admin_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    // Si no hay token, redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
