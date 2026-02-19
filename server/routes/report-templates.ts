import type { Express } from "express";
import { storage } from "../storage";

export function registerReportTemplatesRoutes(app: Express) {
  app.get("/api/report-templates", async (_req, res) => {
    try {
      const templates = await storage.getAllReportTemplates();
      res.json(templates);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch report templates" });
    }
  });

  app.patch("/api/report-templates/:id", async (req, res) => {
    try {
      const existing = await storage.getReportTemplate(req.params.id);
      if (!existing) return res.status(404).json({ message: "Template not found" });

      const isCritical = existing.statusType === "Not Approved" &&
        req.body.executiveSummaryText && req.body.executiveSummaryText !== existing.executiveSummaryText;

      if (isCritical && !req.body.changeReason) {
        return res.status(400).json({ message: "Critical change detected on Not Approved template. A reason is required.", isCritical: true });
      }

      const updated = await storage.updateReportTemplate(req.params.id, req.body);
      const ipAddress = req.headers["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      await storage.createReportAuditLog({
        entityType: "report_template",
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
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update report template" });
    }
  });
}
