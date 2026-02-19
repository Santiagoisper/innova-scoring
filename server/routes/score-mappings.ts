import type { Express } from "express";
import { storage } from "../storage";

export function registerScoreMappingsRoutes(app: Express) {
  app.get("/api/score-mappings", async (_req, res) => {
    try {
      const mappings = await storage.getAllScoreStatusMappings();
      res.json(mappings);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch score mappings" });
    }
  });

  app.post("/api/score-mappings", async (req, res) => {
    try {
      const mapping = await storage.createScoreStatusMapping(req.body);
      const ipAddress = req.headers["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      await storage.createReportAuditLog({
        entityType: "score_mapping",
        entityId: mapping.id,
        actionType: "created",
        actorUserId: req.body.updatedByUserId,
        actorName: req.body.actorName || "Super Admin",
        ipAddress,
        userAgent,
        afterStateJson: mapping,
        isCriticalChange: false,
      });
      res.json(mapping);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create score mapping" });
    }
  });

  app.patch("/api/score-mappings/:id", async (req, res) => {
    try {
      const existing = await storage.getScoreStatusMapping(req.params.id);
      if (!existing) return res.status(404).json({ message: "Mapping not found" });

      const isCritical = existing.statusLabel === "Adequate" &&
        req.body.minScore !== undefined && req.body.minScore < existing.minScore;

      if (isCritical && !req.body.changeReason) {
        return res.status(400).json({ message: "Critical change: expanding Adequate range. A reason is required.", isCritical: true });
      }

      const updated = await storage.updateScoreStatusMapping(req.params.id, req.body);
      const ipAddress = req.headers["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      await storage.createReportAuditLog({
        entityType: "score_mapping",
        entityId: req.params.id,
        actionType: "updated",
        actorUserId: req.body.updatedByUserId,
        actorName: req.body.actorName || "Super Admin",
        ipAddress,
        userAgent,
        beforeStateJson: existing,
        afterStateJson: updated,
        isCriticalChange: isCritical,
        changeReason: req.body.changeReason,
      });
      res.json(updated);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update score mapping" });
    }
  });

  app.delete("/api/score-mappings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteScoreStatusMapping(req.params.id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Mapping not found" });
      }
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete score mapping" });
    }
  });
}
