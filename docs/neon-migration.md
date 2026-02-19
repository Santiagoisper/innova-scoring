# Migracion de Supabase a Neon (Vercel)

Esta app ya usa PostgreSQL con Drizzle. No depende de APIs de Supabase para queries, asi que la migracion es de base de datos/variables de entorno.

## 1) Crear base en Neon

1. Crea un proyecto en Neon.
2. Copia el connection string pooled (con SSL).
3. Guardalo como `DATABASE_URL`.

## 2) Copiar tablas y datos desde Supabase a Neon

Requiere `pg_dump` y `psql` instalados localmente.

```powershell
$env:SUPABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?sslmode=require"
$env:NEON_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"

pg_dump --dbname "$env:SUPABASE_URL" --format=plain --no-owner --no-privileges --schema=public --file supabase-export.sql
psql --dbname "$env:NEON_URL" --file supabase-export.sql
```

Si prefieres estructura y datos por separado:

```powershell
pg_dump --dbname "$env:SUPABASE_URL" --schema-only --no-owner --no-privileges --schema=public --file schema.sql
pg_dump --dbname "$env:SUPABASE_URL" --data-only --inserts --no-owner --no-privileges --schema=public --file data.sql
psql --dbname "$env:NEON_URL" --file schema.sql
psql --dbname "$env:NEON_URL" --file data.sql
```

## 3) Configurar Vercel

En Vercel, define:

- `DATABASE_URL`: URL pooled de Neon
- `POSTGRES_URL_NON_POOLING`: URL directa (opcional, util para migraciones largas)
- `NODE_ENV=production`

Luego redeploy.

## 4) Verificar esquema con Drizzle

```bash
npm run db:push
```

Esto sincroniza el esquema declarado en `shared/schema.ts` contra Neon.

## 5) Variables legacy

`SUPABASE_DATABASE_URL` sigue soportada como fallback, pero ya no es la opcion recomendada.
