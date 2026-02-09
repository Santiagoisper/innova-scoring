# Innova Trials - Clinical Research Site Evaluation Platform

## Overview

Innova Trials is a web-based platform for evaluating and scoring clinical research sites. It enables clinical research organizations to assess investigational sites across weighted criteria (infrastructure, staff, quality systems, etc.), manage site registrations, generate evaluation tokens, and track activity. The platform has two user interfaces: an **Admin Dashboard** for managing sites, configuring evaluation questions, reviewing scores, and exporting results; and a **Client Portal** where research sites log in with a one-time token to complete self-evaluation questionnaires.

The scoring system evaluates sites across multiple categories (Infrastructure, Staff, Quality, etc.) with weighted questions. Sites receive scores that determine their status (Approved, Rejected, To Consider). The platform is fully functional with PostgreSQL database persistence, RESTful API backend, and React frontend using TanStack React Query for data fetching.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: Zustand with `persist` middleware for auth state (stored in localStorage)
- **Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming, custom fonts (Open Sans, Roboto)
- **Charts**: Recharts for score gauges and data visualization
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express 5 running on Node.js with TypeScript (tsx for development)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Authentication**: Simple token-based auth — admins log in with username/password, sites log in with email + one-time token. No session middleware (auth state is client-side via Zustand)
- **Build**: Custom build script using esbuild for server and Vite for client. Production output goes to `dist/`

### Database
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` — shared between client and server
- **Migrations**: Drizzle Kit with `drizzle-kit push` for schema synchronization
- **Tables**:
  - `admin_users` — admin accounts with username, password (plaintext), name, permission level (readonly/readwrite)
  - `sites` — research sites with contact info, location, status workflow, evaluation answers (JSONB), scores
  - `questions` — evaluation questions with category, weight, type (YesNo/Text/Select), knock-out flag, sort order
  - `activity_log` — audit trail of system actions

### Key Design Decisions

1. **Shared Schema**: The `shared/` directory contains the Drizzle schema used by both frontend (for types) and backend (for queries). This ensures type safety across the full stack.

2. **Storage Abstraction**: `server/storage.ts` defines an `IStorage` interface with a `DatabaseStorage` implementation, making it possible to swap storage backends.

3. **Client-Side Auth**: Authentication state lives in the browser via Zustand's persist middleware. The server validates credentials on login but doesn't maintain sessions. This simplifies the backend but means API endpoints aren't session-protected.

4. **Question Configuration**: Evaluation questions are both hardcoded in `client/src/lib/questions.ts` (as defaults/seed data) and stored in the database. The database is the source of truth for the admin's question management.

5. **Status Workflow**: Sites follow a lifecycle: Pending → TokenSent → InProcess → Completed → Approved/Rejected/ToConsider.

### Project Structure
```
client/                  # Frontend React application
  src/
    components/          # Shared components and shadcn/ui
    hooks/               # Custom React hooks
    lib/                 # API client, store, types, utilities
    pages/               # Route pages
      admin/             # Admin dashboard pages
      site/              # Client portal pages
server/                  # Express backend
  index.ts               # Server entry point
  routes.ts              # API route definitions
  storage.ts             # Database storage layer
  db.ts                  # Drizzle + pg pool setup
  static.ts              # Static file serving for production
  vite.ts                # Vite dev server middleware
shared/                  # Shared code between client/server
  schema.ts              # Drizzle database schema
migrations/              # Drizzle migration files
```

## AI Chatbot

- **Floating widget**: Available on all pages via `Chatbot` component in `App.tsx`
- **Backend**: `server/replit_integrations/chat/routes.ts` — single `/api/chat` endpoint with SSE streaming
- **AI Provider**: Replit AI Integrations (OpenAI-compatible) via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` env vars (auto-managed)
- **Model**: gpt-4o-mini with clinical research system prompt
- **Design**: Stateless — conversation history is maintained client-side only (no DB persistence for chat messages)
- **Features**: Streaming responses, suggestion buttons, clear chat, markdown formatting

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable. Required for the application to start.
- **Drizzle ORM + Drizzle Kit**: Database ORM and migration tooling. Use `npm run db:push` to sync schema.
- **OpenAI (via Replit AI Integrations)**: Powers the AI chatbot assistant. No API key management needed — handled by Replit.
- **No external auth service**: Authentication is handled internally with plaintext password comparison (no hashing currently implemented).
- **No email service configured in this codebase**: Though Resend is referenced in attached analysis documents as part of the original Next.js project, the current Express codebase generates tokens but doesn't send emails.
- **Recharts**: Used for score visualization (gauge charts, bar charts).
- **Google Fonts**: Open Sans and Roboto loaded via CDN in `index.html`.