import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

function sanitizeUrl(url: string): string {
  return url.replace(/\\n/g, "").replace(/\n/g, "").replace(/\r/g, "").trim();
}

const rawUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set");
}

const connectionString = sanitizeUrl(rawUrl);
const useSSL = !!process.env.SUPABASE_DATABASE_URL;

export const pool = new pg.Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
