import type { Express } from "express";
import { storage } from "../storage";
import { detectCriticalRuleChange } from "./helpers";

export function registerAdminRulesRoutes(app: Express) {
  app.get("/api/admin-rules", async (_req, res) => {
    try {
      const rules = await storage.getAllAdminRules();
      res.json(rules);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch admin rules" });
    }
  });

  app.post("/api/admin-rules", async (req, res) => {
    try {
      const rule = await storage.createAdminRule(req.body);
      const ipAddress = req.headers["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      await storage.createReportAuditLog({
        entityType: "admin_rule",
        entityId: rule.id,
        actionType: "created",
        actorUserId: req.body.updatedByUserId,
        actorName: req.body.actorName || "Super Admin",
        ipAddress,
        userAgent,
        afterStateJson: rule,
        isCriticalChange: false,
      });
      res.json(rule);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create admin rule" });
    }
  });

  app.patch("/api/admin-rules/:id", async (req, res) => {
    try {
      const existing = await storage.getAdminRule(req.params.id);
      if (!existing) return res.status(404).json({ message: "Rule not found" });

      const isCritical = detectCriticalRuleChange(existing, req.body);

      if (isCritical && !req.body.changeReason) {
        return res.status(400).json({ message: "Critical change detected. A reason is required.", isCritical: true });
      }

      const updated = await storage.updateAdminRule(req.params.id, req.body);
      const ipAddress = req.headers["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      await storage.createReportAuditLog({
        entityType: "admin_rule",
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
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update admin rule" });
    }
  });
}
