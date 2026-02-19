import type { Express } from "express";
import { storage } from "../storage";
import { sendTokenEmail, sendEvaluationCompleteEmail, sendStatusChangeEmail } from "../email";

export function registerSitesRoutes(app: Express) {
  app.get("/api/sites", async (_req, res) => {
    try {
      const allSites = await storage.getAllSites();
      res.json(allSites);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch sites" });
    }
  });

  app.get("/api/sites/:id", async (req, res) => {
    try {
      const site = await storage.getSite(req.params.id);
      if (site) {
        res.json(site);
      } else {
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch site" });
    }
  });

  app.post("/api/sites", async (req, res) => {
    try {
      const site = await storage.createSite({
        ...req.body,
        status: "Pending",
        answers: {},
      });
      res.json(site);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create site" });
    }
  });

  app.patch("/api/sites/:id", async (req, res) => {
    try {
      const updated = await storage.updateSite(req.params.id, req.body);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update site" });
    }
  });

  app.delete("/api/sites/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSite(req.params.id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete site" });
    }
  });

  app.post("/api/sites/:id/generate-token", async (req, res) => {
    try {
      const token = `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const updated = await storage.updateSite(req.params.id, {
        token,
        status: "TokenSent",
        tokenSentAt: new Date(),
      });
      if (updated) {
        if (req.body.adminName) {
          await storage.createActivityLog({
            user: req.body.adminName,
            action: "Generated Token",
            target: updated.contactName,
            type: "info",
            sector: "Access Control",
          });
        }
        sendTokenEmail(updated.email, updated.contactName, token, updated.description || updated.contactName)
          .then(result => {
            if (!result.success) console.error("Failed to send token email:", result.error);
            else console.log("Token email sent to:", updated.email);
          })
          .catch(err => console.error("Token email error:", err));
        res.json(updated);
      } else {
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate token" });
    }
  });

  app.post("/api/sites/:id/update-status", async (req, res) => {
    try {
      const { status, adminName } = req.body;
      const updated = await storage.updateSite(req.params.id, {
        status,
        evaluatedBy: adminName || undefined,
        evaluatedAt: ["Approved", "Rejected", "ToConsider"].includes(status) ? new Date() : undefined,
      });
      if (updated) {
        if (adminName) {
          await storage.createActivityLog({
            user: adminName,
            action: `Changed Status to ${status}`,
            target: updated.contactName,
            type: status === "Rejected" ? "error" : "success",
            sector: "Status Management",
          });
        }
        if (["Approved", "Rejected", "ToConsider"].includes(status)) {
          sendStatusChangeEmail(updated.email, updated.contactName, updated.description || updated.contactName, status)
            .then(result => {
              if (!result.success) console.error("Failed to send status email:", result.error);
              else console.log("Status email sent to:", updated.email);
            })
            .catch(err => console.error("Status email error:", err));
        }
        res.json(updated);
      } else {
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update status" });
    }
  });

  app.post("/api/sites/:id/submit-evaluation", async (req, res) => {
    try {
      const { answers, score, status } = req.body;
      const updated = await storage.updateSite(req.params.id, {
        answers,
        score,
        status,
        evaluatedAt: new Date(),
      });
      if (updated) {
        sendEvaluationCompleteEmail(updated.email, updated.contactName, updated.description || updated.contactName, score || 0)
          .then(result => {
            if (!result.success) console.error("Failed to send evaluation email:", result.error);
            else console.log("Evaluation email sent to:", updated.email);
          })
          .catch(err => console.error("Evaluation email error:", err));
        res.json(updated);
      } else {
        res.status(404).json({ message: "Site not found" });
      }
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to submit evaluation" });
    }
  });

  app.post("/api/sites/:id/update-answers", async (req, res) => {
    try {
      const { answers, score, adminName } = req.body;
      const site = await storage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      const existingAnswers = (site.answers as Record<string, unknown>) || {};
      const mergedAnswers = { ...existingAnswers, ...answers };
      const updated = await storage.updateSite(req.params.id, {
        answers: mergedAnswers,
        score: score ?? site.score,
        evaluatedBy: adminName || site.evaluatedBy || undefined,
        evaluatedAt: score !== undefined ? new Date() : site.evaluatedAt || undefined,
      });
      if (adminName) {
        await storage.createActivityLog({
          user: adminName,
          action: "Updated Answers",
          target: site.contactName,
          type: "warning",
          sector: "Evaluation Data",
        });
      }
      res.json(updated);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update answers" });
    }
  });
}
