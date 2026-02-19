import type { Express } from "express";
import { storage } from "../storage";

export function registerReportAuditLogRoutes(app: Express) {
  app.get("/api/report-audit-log", async (_req, res) => {
    try {
      const logs = await storage.getAllReportAuditLogs();
      res.json(logs);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch report audit log" });
    }
  });
}
