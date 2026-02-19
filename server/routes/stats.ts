import type { Express } from "express";
import { storage } from "../storage";

export function registerStatsRoutes(app: Express) {
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch stats" });
    }
  });
}
