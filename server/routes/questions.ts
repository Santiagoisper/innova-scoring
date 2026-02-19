import type { Express } from "express";
import { storage } from "../storage";

export function registerQuestionsRoutes(app: Express) {
  app.get("/api/questions", async (_req, res) => {
    try {
      const allQuestions = await storage.getAllQuestions();
      res.json(allQuestions);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch questions" });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const question = await storage.createQuestion(req.body);
      res.json(question);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create question" });
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
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update question" });
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
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete question" });
    }
  });

  app.post("/api/questions/bulk-update", async (req, res) => {
    try {
      const { updates } = req.body;
      await storage.bulkUpdateQuestions(updates);
      const allQuestions = await storage.getAllQuestions();
      res.json(allQuestions);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to bulk update questions" });
    }
  });
}
