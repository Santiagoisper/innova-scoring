import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { questions as questionsTable } from "@shared/schema";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { sendTokenEmail, sendEvaluationCompleteEmail, sendStatusChangeEmail, sendTermsAcceptanceConfirmationEmail } from "./email";
import { generateReport, computeReportHash } from "./report-engine";

function detectCriticalRuleChange(existing: any, updates: any): boolean {
  const statusSeverity: Record<string, number> = {
    "Not Approved": 3,
    "Conditionally Approved": 2,
    "Approved": 1,
  };
  if (updates.forcesMinimumStatus && existing.forcesMinimumStatus) {
    const oldSev = statusSeverity[existing.forcesMinimumStatus] || 0;
    const newSev = statusSeverity[updates.forcesMinimumStatus] || 0;
    if (newSev < oldSev) return true;
  }
  if (updates.blocksApproval === false && existing.blocksApproval === true) return true;
  if (updates.active === false && existing.active === true && existing.blocksApproval) return true;
  return false;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  registerChatRoutes(app);

  // ========== AUTH ==========
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getAdminUserByUsername(username);
      if (user && user.password === password) {
        await storage.createActivityLog({
          user: user.name,
          action: "Logged In",
          target: "Admin Portal",
          type: "info",
          sector: "Authentication",
        });
        res.json({
          id: user.id,
          name: user.name,
          role: "admin",
          permission: user.permission,
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/site-login", async (req, res) => {
    try {
      const { email, token } = req.body;
      const site = await storage.getSiteByEmailAndToken(email, token);
      if (site) {
        await storage.updateSite(site.id, { token: null });
        res.json({
          id: site.id,
          name: site.contactName,
          role: "site",
          siteId: site.id,
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== ADMIN USERS ==========
  app.get("/api/admin-users", async (_req, res) => {
    try {
      const users = await storage.getAllAdminUsers();
      const safeUsers = users.map(u => ({ ...u, password: undefined }));
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin-users", async (req, res) => {
    try {
      const user = await storage.createAdminUser(req.body);
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin-users/:id", async (req, res) => {
    try {
      const updated = await storage.updateAdminUser(req.params.id, req.body);
      if (updated) {
        res.json({ ...updated, password: undefined });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin-users/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAdminUser(req.params.id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== SITES ==========
  app.get("/api/sites", async (_req, res) => {
    try {
      const allSites = await storage.getAllSites();
      res.json(allSites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sites/:id/update-status", async (req, res) => {
    try {
      const { status, adminName } = req.body;
      const updated = await storage.updateSite(req.params.id, { status });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sites/:id/update-answers", async (req, res) => {
    try {
      const { answers, score, adminName } = req.body;
      const site = await storage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      const mergedAnswers = { ...(site.answers as any || {}), ...answers };
      const updated = await storage.updateSite(req.params.id, {
        answers: mergedAnswers,
        score: score ?? site.score,
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== QUESTIONS ==========
  app.get("/api/questions", async (_req, res) => {
    try {
      const allQuestions = await storage.getAllQuestions();
      res.json(allQuestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const question = await storage.createQuestion(req.body);
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/questions/:id", async (req, res) => {
    try {
      const updated = await storage.updateQuestion(req.params.id, req.body);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Question not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/questions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQuestion(req.params.id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Question not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/questions/bulk-update", async (req, res) => {
    try {
      const { updates } = req.body;
      await storage.bulkUpdateQuestions(updates);
      const allQuestions = await storage.getAllQuestions();
      res.json(allQuestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== ACTIVITY LOG ==========
  app.get("/api/activity-log", async (_req, res) => {
    try {
      const log = await storage.getAllActivityLog();
      res.json(log);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/activity-log", async (req, res) => {
    try {
      const entry = await storage.createActivityLog(req.body);
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/activity-log", async (_req, res) => {
    try {
      await storage.clearActivityLog();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== CHAT LOGS ==========
  app.get("/api/chat-logs", async (_req, res) => {
    try {
      const logs = await storage.getAllChatLogs();
      const sessions: Record<string, any> = {};
      logs.forEach(log => {
        if (!sessions[log.sessionId]) {
          sessions[log.sessionId] = {
            sessionId: log.sessionId,
            userType: log.userType,
            userName: log.userName,
            startedAt: log.createdAt,
            messages: [],
          };
        }
        sessions[log.sessionId].messages.push({
          id: log.id,
          role: log.role,
          content: log.content,
          createdAt: log.createdAt,
        });
      });
      const sessionList = Object.values(sessions).sort(
        (a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
      res.json(sessionList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== STATS ==========
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== TERMS ACCEPTANCE ==========
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/terms-acceptance", async (_req, res) => {
    try {
      const records = await storage.getAllTermsAcceptances();
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/terms-acceptance/:siteId", async (req, res) => {
    try {
      const record = await storage.getTermsAcceptanceBySiteId(req.params.siteId);
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== REPORTS ==========
  app.get("/api/reports", async (_req, res) => {
    try {
      const allReports = await storage.getAllReports();
      res.json(allReports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/site/:siteId", async (req, res) => {
    try {
      const siteReports = await storage.getReportsBySiteId(req.params.siteId);
      res.json(siteReports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/:id/signatures", async (req, res) => {
    try {
      const signatures = await storage.getSignaturesByReportId(req.params.id);
      res.json(signatures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== ADMIN RULES ==========
  app.get("/api/admin-rules", async (_req, res) => {
    try {
      const rules = await storage.getAllAdminRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== REPORT TEMPLATES ==========
  app.get("/api/report-templates", async (_req, res) => {
    try {
      const templates = await storage.getAllReportTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== DOMAINS ==========
  app.get("/api/domains", async (_req, res) => {
    try {
      const allDomains = await storage.getAllDomains();
      res.json(allDomains);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== SCORE STATUS MAPPINGS ==========
  app.get("/api/score-mappings", async (_req, res) => {
    try {
      const mappings = await storage.getAllScoreStatusMappings();
      res.json(mappings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== REPORT AUDIT LOG ==========
  app.get("/api/report-audit-log", async (_req, res) => {
    try {
      const logs = await storage.getAllReportAuditLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== SEED (initial data) ==========
  app.post("/api/seed", async (_req, res) => {
    try {
      const existingUsers = await storage.getAllAdminUsers();
      if (existingUsers.length === 0) {
        await storage.createAdminUser({
          username: "admin",
          name: "Administrator",
          password: "admin",
          permission: "readwrite",
          role: "admin",
        });
        await storage.createAdminUser({
          username: "viewer",
          name: "Guest Viewer",
          password: "viewer",
          permission: "readonly",
          role: "admin",
        });
      }

      const existingQuestions = await storage.getAllQuestions();
      if (existingQuestions.length === 0) {
        const { QUESTIONS } = await import("../client/src/lib/questions");
        for (let i = 0; i < QUESTIONS.length; i++) {
          const q = QUESTIONS[i];
          await db.insert(questionsTable).values({
            id: q.id,
            text: q.text,
            type: q.type,
            category: q.category,
            weight: q.weight,
            isKnockOut: q.isKnockOut || false,
            enabled: q.enabled !== false,
            keywords: q.keywords || null,
            sortOrder: i,
          });
        }
      }

      const existingDomains = await storage.getAllDomains();
      if (existingDomains.length === 0) {
        const defaultDomains = [
          { domainKey: "Patient Safety", displayName: "Patient Safety", description: "SAE systems, AE/SAE reporting timeliness, emergency service, biological sample temperature control, pathogenic waste disposal. If this fails, the site is not viable. Non-compensable.", displayOrder: 1 },
          { domainKey: "IMP & Drug Accountability", displayName: "IMP & Drug Accountability", description: "Pharmacy for research, IMP traceability, IP refrigeration, double-blind circuit. High regulatory risk — lack of traceability is critical.", displayOrder: 2 },
          { domainKey: "Regulatory & Quality System", displayName: "Regulatory & Quality System", description: "SOPs, CAPA system, internal audits, IEC compliance, deviation tracking, GCP training documentation. Without this, no defense against audit.", displayOrder: 3 },
          { domainKey: "Data Integrity & Monitoring", displayName: "Data Integrity & Monitoring", description: "eCRF TAT, data tracking system, EMR access for monitors, monitoring responsibility, follow-up documentation. Impacts sponsor confidence and regulatory approval.", displayOrder: 4 },
          { domainKey: "Operational Infrastructure", displayName: "Operational Infrastructure", description: "Generator, local laboratories, equipment calibration, 24-hour observation, weekend dosing capacity. Important but not structurally non-compensable.", displayOrder: 5 },
          { domainKey: "Experience & Reputation", displayName: "Experience & Reputation", description: "Phase I–IV experience, audit history without critical findings, recruitment methods, therapeutic specialty experience. Impacts speed and confidence, not basic compliance.", displayOrder: 6 },
        ];
        for (const d of defaultDomains) {
          await storage.createDomain(d);
        }
      }

      const existingTemplates = await storage.getAllReportTemplates();
      if (existingTemplates.length === 0) {
        const defaultTemplates = [
          { statusType: "Approved", executiveSummaryText: "This clinical research site has met all qualification criteria established by the evaluation framework. The site demonstrates adequate infrastructure, staff competency, quality management systems, and patient safety protocols to participate in clinical trials. All domains have been evaluated and scored above the minimum thresholds required for full approval.", reevaluationClauseText: "This approval is valid for 12 months from the date of issuance. A re-evaluation will be conducted prior to expiration or upon any significant change in site capabilities, personnel, or infrastructure.", domainParagraphTemplatesJson: { default: "The site demonstrates adequate performance in this domain, meeting or exceeding the minimum requirements for participation in clinical trials." } },
          { statusType: "Conditionally Approved", executiveSummaryText: "This clinical research site has met most qualification criteria but requires corrective actions in specific domains before full approval can be granted. The site demonstrates general capability but has identified gaps that must be addressed within the specified timeline. A Corrective and Preventive Action (CAPA) plan has been generated for the deficient areas.", reevaluationClauseText: "Conditional approval is granted for a period of 6 months. The site must complete all CAPA items and undergo a follow-up evaluation within this period. Failure to address corrective actions may result in downgrade to Not Approved status.", domainParagraphTemplatesJson: { default: "This domain requires improvement. The site should address the identified gaps according to the CAPA plan timeline.", adequate: "The site demonstrates adequate performance in this domain." } },
          { statusType: "Not Approved", executiveSummaryText: "This clinical research site has not met the minimum qualification criteria required for participation in clinical trials. Critical deficiencies have been identified in one or more essential domains. The site must undergo substantial improvements and submit a new evaluation request after addressing the identified gaps.", reevaluationClauseText: "The site may request a new evaluation after a minimum of 90 days, provided that documented evidence of corrective actions has been submitted for review. A comprehensive re-evaluation of all domains will be required.", domainParagraphTemplatesJson: { default: "This domain falls below the minimum acceptable threshold. Significant improvements are required before the site can be considered for clinical trial participation.", adequate: "While this domain meets the minimum requirements, overall site qualification has been denied due to critical gaps in other areas." } },
        ];
        for (const t of defaultTemplates) {
          await storage.createReportTemplate(t);
        }
      }

      const existingMappings = await storage.getAllScoreStatusMappings();
      if (existingMappings.length === 0) {
        const defaultMappings = [
          { minScore: 80, maxScore: 100, statusLabel: "Approved" },
          { minScore: 60, maxScore: 79, statusLabel: "Conditionally Approved" },
          { minScore: 0, maxScore: 59, statusLabel: "Not Approved" },
        ];
        for (const m of defaultMappings) {
          await storage.createScoreStatusMapping(m);
        }
      }

      res.json({ success: true, message: "Seed completed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
