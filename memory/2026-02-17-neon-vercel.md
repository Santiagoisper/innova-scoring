# Memoria - 2026-02-17

## Lo aprendido hoy
- El deploy en Vercel no migra tablas por si solo: GitHub despliega codigo, no datos.
- La causa de "no veo tablas en Neon" fue que `DATABASE_URL` de Production seguia apuntando a Supabase.
- Se cambio `DATABASE_URL` en Vercel Production para usar Neon.
- Se valido en prod que `/api/health/db` responde conectado a base.
- Se ejecuto seed en produccion y se validaron endpoints principales.

## Decisiones tecnicas aplicadas
- Priorizar conexiones Postgres/Neon en runtime y en config de Drizzle.
- Agregar preflight de entorno para build de Vercel.
- Agregar health checks (`/api/health` y `/api/health/db`).
- Incluir `db:push` dentro de `build:vercel` para provisionar schema automaticamente en deploy.

## Riesgos/recordatorios
- Variables opcionales pendientes en Vercel: `POSTGRES_URL_NON_POOLING`, `RESEND_API_KEY`, `OPENAI_API_KEY`.
- Si se rota la URL de Neon, actualizar `DATABASE_URL` en Vercel y redeploy.
