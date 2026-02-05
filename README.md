# Site Scoring v5.0 - Innova Trials

A comprehensive clinical research site evaluation platform with modern UI/UX design.

## What's New in v5.0

### 🎨 Complete Visual Redesign
- Modern, professional aesthetic with gradient accents
- Consistent design language across all pages
- Improved typography with DM Sans + Plus Jakarta Sans fonts
- Smooth animations and micro-interactions
- Mobile-responsive layouts

### 🌐 Full English Translation
- All UI text translated to English
- Status labels: Approved / Conditional / Not Approved
- Professional terminology throughout

### 👥 Dual Interface Architecture

**Client Portal** (`/cliente/[token]`)
- Step-by-step wizard for self-assessment
- Terms acceptance flow
- Progress tracking with real-time score calculation
- Clean, guided evaluation experience
- Confirmation and success screens

**Admin Dashboard** (`/admin`)
- Professional sidebar navigation
- Dashboard with metrics and charts (Recharts)
- Center management with copy-link functionality
- Evaluation scoring interface
- Rubric configuration
- Dynamics (trend analysis)
- Maturity model visualization
- Benchmark comparisons
- Export to CSV/JSON

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment
# Copy .env.local and update with your Supabase credentials

# Run development server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Database Setup

Run the migrations in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seeds/001_criteria.sql`

Make sure to add the `public_token` column to centers:
```sql
ALTER TABLE centers ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT uuid_generate_v4();
```

## Project Structure

```
├── app/
│   ├── admin/           # Admin panel pages
│   │   ├── benchmark/
│   │   ├── centers/
│   │   ├── dynamics/
│   │   ├── evaluate/
│   │   ├── export/
│   │   ├── maturity/
│   │   ├── rubric/
│   │   ├── layout.tsx   # Admin layout with sidebar
│   │   └── page.tsx     # Dashboard
│   ├── cliente/         # Client portal
│   │   ├── [token]/     # Token-based evaluation
│   │   └── page.tsx     # Landing without token
│   ├── login/           # Authentication
│   ├── api/             # API routes
│   └── page.tsx         # Landing page
├── components/
├── lib/
│   ├── supabase/
│   └── scoring/
├── types/
└── public/
```

## Key Features

### Evaluation Criteria
18 criteria across 5 categories:
- Experience & Capacity
- Infrastructure
- Personnel
- Compliance & Quality
- Sustainability

### Scoring System
- 0-100 scale per criterion
- Configurable weights (1-5)
- Automatic status calculation:
  - ≥80: Approved (Green)
  - 60-79: Conditional (Yellow)
  - <60: Not Approved (Red)

### Maturity Model
5-level classification:
1. Initial
2. Developing
3. Defined
4. Managed
5. Optimized

## License

Proprietary - Innova Trials
