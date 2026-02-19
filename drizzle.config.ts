import { defineConfig } from "drizzle-kit";

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.SUPABASE_DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "Set DATABASE_URL (recommended for Neon/Vercel), NEON_DATABASE_URL, or POSTGRES_URL for migrations",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
