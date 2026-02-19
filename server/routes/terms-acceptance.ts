import type { Express } from "express";
import { storage } from "../storage";
import { sendTermsAcceptanceConfirmationEmail } from "../email";

export function registerTermsAcceptanceRoutes(app: Express) {
  app.post("/api/terms-acceptance", async (req, res) => {
    try {
      const { siteId, registrantName, registrantEmail, siteName, termsVersion, termsEffectiveDate, termsTextSha256 } = req.body;
      const ipAddress = req.headers["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      const record = await storage.createTermsAcceptance({
        siteId,
        registrantName,
        registrantEmail,
        siteName: siteName || null,
        accepted: true,
        ipAddress,
        userAgent,
        termsVersion: termsVersion || "1.0",
        termsEffectiveDate: termsEffectiveDate || "2026-02-11",
        termsTextSha256,
      });

      await storage.createActivityLog({
        user: registrantName,
        action: "Accepted Terms",
        target: `Terms v${termsVersion || "1.0"}`,
        type: "success",
        sector: "Legal Compliance",
      });

      if (registrantEmail) {
        sendTermsAcceptanceConfirmationEmail(
          registrantEmail,
          registrantName || "Site Representative",
          termsVersion || "1.0",
          termsEffectiveDate || "2026-02-11",
          record.acceptedAtUtc ? new Date(record.acceptedAtUtc).toISOString() : new Date().toISOString()
        ).catch(err => console.error("Terms confirmation email error:", err));
      }

      res.json(record);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to record terms acceptance" });
    }
  });

  app.get("/api/terms-acceptance", async (_req, res) => {
    try {
      const records = await storage.getAllTermsAcceptances();
      res.json(records);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch terms acceptances" });
    }
  });

  app.get("/api/terms-acceptance/:siteId", async (req, res) => {
    try {
      const record = await storage.getTermsAcceptanceBySiteId(req.params.siteId);
      res.json(record);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch terms acceptance" });
    }
  });
}
