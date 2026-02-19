# Checklist de deploy Vercel + Neon

## Variables en Vercel (Production)

Obligatoria:

- `DATABASE_URL` (Neon pooled connection string)

Opcionales recomendadas:

- `POSTGRES_URL_NON_POOLING` (Neon direct connection string)
- `RESEND_API_KEY` (si quieres envio de emails)
- `OPENAI_API_KEY` (si quieres chat AI)
- `PGPOOL_MAX` (por defecto se usa `1` en Vercel)
- `ALLOW_EMERGENCY_ADMIN=true` — **solo para recuperación**: en producción el login `admin`/`admin` está deshabilitado por defecto. Si pierdes acceso al panel, activa esta variable temporalmente, entra, crea un admin real y cambia la contraseña; luego quita la variable.

## Orden recomendado

1. Configurar variables en Vercel.
2. Deploy (`main`/branch de produccion).
3. Ejecutar `npm run db:push` contra Neon para asegurar esquema actualizado.
4. Ejecutar una vez `POST /api/seed` para datos iniciales (si base nueva).

## Validaciones rapidas

1. `GET /api/sites` debe responder `200`.
2. Login admin: en desarrollo `admin`/`admin` funciona; en producción solo si `ALLOW_EMERGENCY_ADMIN=true` o tras crear un usuario admin por seed/API.
3. Crear un sitio y verificar persistencia al recargar.

## Notas

- El build en Vercel ahora corre preflight y falla si falta `DATABASE_URL`.
- `SUPABASE_DATABASE_URL` sigue como fallback en código, pero para deploy nuevo usa Neon con `DATABASE_URL`.
