import type { Express } from "express";
import { storage } from "../storage";
import { generateReport, computeReportHash } from "../report-engine";

export function registerReportsRoutes(app: Express) {
  app.get("/api/reports", async (_req, res) => {
    try {
      const allReports = await storage.getAllReports();
      res.json(allReports);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (report) {
        res.json(report);
      } else {
        res.status(404).json({ message: "Report not found" });
      }
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch report" });
    }
  });

  app.get("/api/reports/site/:siteId", async (req, res) => {
    try {
      const siteReports = await storage.getReportsBySiteId(req.params.siteId);
      res.json(siteReports);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch site reports" });
    }
  });

  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { siteId, generatedByUserId, generatedByName, categoryScores, scoringStatus, globalScore } = req.body;

      const site = await storage.getSite(siteId);
      if (!site) return res.status(404).json({ message: "Site not found" });

      const result = await generateReport(siteId, generatedByUserId, categoryScores, scoringStatus, globalScore);

      const hashData = {
        reportVersion: result.reportVersion,
        siteId,
        finalStatus: result.finalStatus,
        scoreSnapshot: result.scoreSnapshot,
        capaItems: result.capaItems,
        generatedAt: new Date().toISOString(),
      };
      const hashSha256 = computeReportHash(hashData);

      const report = await storage.createReport({
        siteId,
        reportVersion: result.reportVersion,
        generatedByUserId,
        statusAtGeneration: site.status,
        finalStatus: result.finalStatus,
        scoreSnapshotJson: result.scoreSnapshot,
        rulesSnapshotJson: result.rulesSnapshot,
        templatesSnapshotJson: result.templatesSnapshot,
        mappingsSnapshotJson: result.mappingsSnapshot,
        narrativeSnapshotJson: result.narrativeSnapshot,
        capaItemsJson: result.capaItems,
        hashSha256,
        isLocked: false,
        previousReportId: result.previousReportId,
      });

      const ipAddress = req.headers["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      await storage.createReportAuditLog({
        entityType: "report",
        entityId: report.id,
        actionType: "generated",
        actorUserId: generatedByUserId,
        actorName: generatedByName || "Unknown",
        ipAddress,
        userAgent,
        afterStateJson: { reportVersion: result.reportVersion, finalStatus: result.finalStatus },
        isCriticalChange: false,
      });

      await storage.createActivityLog({
        user: generatedByName || "Admin",
        action: "Generated Report",
        target: `${site.contactName} - ${result.reportVersion}`,
        type: "info",
        sector: "Reports",
      });

      res.json(report);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate report" });
    }
  });

  app.get("/api/reports/:id/signatures", async (req, res) => {
    try {
      const signatures = await storage.getSignaturesByReportId(req.params.id);
      res.json(signatures);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch signatures" });
    }
  });

  app.post("/api/reports/:id/acknowledge", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) return res.status(404).json({ message: "Report not found" });
      if (report.isLocked) return res.status(400).json({ message: "Report is already locked" });

      const { signedByName, signedByRole, hashVerification } = req.body;

      if (hashVerification !== report.hashSha256) {
        return res.status(400).json({ message: "Hash verification failed. Report integrity cannot be confirmed." });
      }

      const ipAddress = req.headers["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      const signature = await storage.createReportSignature({
        reportId: report.id,
        signedByName,
        signedByRole,
        ipAddress,
        userAgent,
        hashAtSignature: report.hashSha256!,
        signatureMethod: "acknowledgment",
        signaturePayload: { acknowledgedAt: new Date().toISOString() },
      });

      await storage.updateReport(report.id, { isLocked: true });

      await storage.createReportAuditLog({
        entityType: "report",
        entityId: report.id,
        actionType: "acknowledged",
        actorName: signedByName,
        ipAddress,
        userAgent,
        afterStateJson: { signatureId: signature.id, isLocked: true },
        isCriticalChange: false,
      });

      res.json({ signature, locked: true });
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to acknowledge report" });
    }
  });
}
