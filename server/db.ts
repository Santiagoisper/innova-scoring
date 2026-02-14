import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

function sanitizeUrl(url: string): string {
  return url.replace(/\\n/g, "").replace(/\n/g, "").replace(/\r/g, "").trim();
}

const rawUrl =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!rawUrl) {
  throw new Error(
    "Set DATABASE_URL, SUPABASE_DATABASE_URL, or POSTGRES_URL for database connection",
  );
}

const connectionString = sanitizeUrl(rawUrl);
const useSSL =
  !/localhost|127\.0\.0\.1/i.test(connectionString) &&
  (/supabase\.co/i.test(connectionString) || /sslmode=require/i.test(connectionString));

export const pool = new pg.Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
