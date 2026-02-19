# Site Scoring - Innova Trials

Herramienta interna de Innova Trials para evaluar centros de investigacion clinica.

## Neon + Vercel

La app funciona sobre PostgreSQL (Drizzle). Para migrar desde Supabase a Neon, sigue:

- `docs/neon-migration.md`
- `docs/vercel-neon-checklist.md`

## Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticacion**: Supabase Auth
- **Deployment**: Vercel

## Instalacion

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
pnpm dev
```

## Configuracion de Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ejecutar las migraciones en `supabase/migrations/`
3. Ejecutar los seeds en `supabase/seeds/`
4. Copiar las credenciales a `.env.local`

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Estructura

```
/app
  /api           # API routes
  page.tsx       # Pagina principal con tabs
/components
  /tabs          # Componentes de cada tab
/lib
  /supabase      # Cliente de Supabase
  /scoring       # Logica de calculo de scores
/types           # TypeScript types
/supabase
  /migrations    # Schema SQL
  /seeds         # Datos iniciales
```

## Tabs

1. **Dashboard** - Vista general
2. **Evaluar** - Formulario de evaluacion
3. **Rubric** - Criterios y pesos
4. **Dinamicas** - Evolucion temporal
5. **Madurez** - Nivel de madurez
6. **Benchmark** - Comparacion
7. **Comparar** - Comparar centros
8. **Export** - Exportar datos

## API Endpoints

- `GET/POST /api/centers` - Listar/Crear centros
- `GET/PATCH/DELETE /api/centers/[id]` - Centro individual
- `GET /api/criteria` - Listar criterios
- `PATCH /api/criteria/[id]` - Actualizar peso
- `GET/POST /api/evaluations` - Listar/Crear evaluaciones
- `GET/DELETE /api/evaluations/[id]` - Evaluacion individual

## Deploy en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
