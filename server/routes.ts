import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { questions as questionsTable } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

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

  // ========== STATS ==========
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
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

      res.json({ success: true, message: "Seed completed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
