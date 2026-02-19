import type { Express } from "express";
import { storage } from "../storage";

export function registerDomainsRoutes(app: Express) {
  app.get("/api/domains", async (_req, res) => {
    try {
      const allDomains = await storage.getAllDomains();
      res.json(allDomains);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch domains" });
    }
  });

  app.patch("/api/domains/:id", async (req, res) => {
    try {
      const existing = await storage.getDomain(req.params.id);
      if (!existing) return res.status(404).json({ message: "Domain not found" });
      const updated = await storage.updateDomain(req.params.id, req.body);
      const ipAddress = req.headers["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      await storage.createReportAuditLog({
        entityType: "domain",
        entityId: req.params.id,
        actionType: "updated",
        actorUserId: req.body.updatedByUserId,
        actorName: req.body.actorName || "Super Admin",
        ipAddress,
        userAgent,
        beforeStateJson: existing,
        afterStateJson: updated,
        isCriticalChange: false,
      });
      res.json(updated);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update domain" });
    }
  });
}
