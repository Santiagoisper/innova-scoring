import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

function sanitizeUrl(url: string): string {
  return url.replace(/\\n/g, "").replace(/\n/g, "").replace(/\r/g, "").trim();
}

const rawUrl =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.SUPABASE_DATABASE_URL;

if (!rawUrl) {
  throw new Error(
    "Set DATABASE_URL (recommended for Neon/Vercel), NEON_DATABASE_URL, or POSTGRES_URL for database connection",
  );
}

const connectionString = sanitizeUrl(rawUrl);
const useSSL =
  !/localhost|127\.0\.0\.1/i.test(connectionString) &&
  !/sslmode=disable/i.test(connectionString);
const isServerless = Boolean(process.env.VERCEL);
const maxPoolSize = Number.parseInt(
  process.env.PGPOOL_MAX || (isServerless ? "1" : "10"),
  10,
);

export const pool = new pg.Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  max: Number.isFinite(maxPoolSize) && maxPoolSize > 0 ? maxPoolSize : 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
});

export const db = drizzle(pool, { schema });
