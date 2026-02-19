import type { Express } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

export function registerHealthRoutes(app: Express) {
  app.get("/api/health", async (_req, res) => {
    res.json({ ok: true, service: "innova-scoring-api" });
  });

  app.get("/api/health/db", async (_req, res) => {
    try {
      await db.execute(sql`select 1`);
      res.json({ ok: true, database: "connected" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Database check failed";
      res.status(500).json({
        ok: false,
        database: "disconnected",
        message,
      });
    }
  });
}
