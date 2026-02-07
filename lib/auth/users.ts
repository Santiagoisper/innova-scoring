// Usuarios autorizados (por defecto)
export const DEFAULT_USERS = [
  { username: 'innova', password: 'trials2026' }
]

// Obtener usuarios autorizados
export function getAuthorizedUsers() {
  return DEFAULT_USERS
}

// Validar credenciales
export function validateCredentials(username: string, password: string): boolean {
  return DEFAULT_USERS.some(
    u => u.username === username && u.password === password
  )
}

// Generar token
export function generateToken(username: string): string {
  return Buffer.from(`${username}:${Date.now()}`).toString('base64')
}
