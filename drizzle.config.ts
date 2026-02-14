import { defineConfig } from "drizzle-kit";

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!dbUrl) {
  throw new Error(
    "Set DATABASE_URL, SUPABASE_DATABASE_URL, or POSTGRES_URL for migrations",
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
