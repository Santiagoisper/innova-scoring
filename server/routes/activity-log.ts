import type { Express } from "express";
import { storage } from "../storage";

export function registerActivityLogRoutes(app: Express) {
  app.get("/api/activity-log", async (_req, res) => {
    try {
      const log = await storage.getAllActivityLog();
      res.json(log);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch activity log" });
    }
  });

  app.post("/api/activity-log", async (req, res) => {
    try {
      const entry = await storage.createActivityLog(req.body);
      res.json(entry);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create activity log entry" });
    }
  });

  app.delete("/api/activity-log", async (_req, res) => {
    try {
      await storage.clearActivityLog();
      res.json({ success: true });
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to clear activity log" });
    }
  });
}
