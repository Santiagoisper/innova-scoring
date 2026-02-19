import type { Express } from "express";
import { storage } from "../storage";

export function registerAdminUsersRoutes(app: Express) {
  app.get("/api/admin-users", async (_req, res) => {
    try {
      const users = await storage.getAllAdminUsers();
      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch admin users" });
    }
  });

  app.post("/api/admin-users", async (req, res) => {
    try {
      const user = await storage.createAdminUser(req.body);
      res.json({ ...user, password: undefined });
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create admin user" });
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
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update admin user" });
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
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete admin user" });
    }
  });
}
