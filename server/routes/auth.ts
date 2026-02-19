import type { Express } from "express";
import { storage } from "../storage";

/**
 * Emergency admin backdoor (admin/admin):
 * - Enabled only when NODE_ENV !== 'production' OR ALLOW_EMERGENCY_ADMIN=true.
 * - In production, set ALLOW_EMERGENCY_ADMIN only for recovery; remove or set to false after creating a real admin.
 */
function isEmergencyAdminAllowed(): boolean {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return true;
  return process.env.ALLOW_EMERGENCY_ADMIN === "true";
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const username = String(req.body?.username ?? "").trim();
      const password = String(req.body?.password ?? "").trim();
      const normalizedUsername = username.toLowerCase();

      if (normalizedUsername === "admin" && password === "admin") {
        if (!isEmergencyAdminAllowed()) {
          return res.status(401).json({ message: "Emergency admin is disabled in production. Set ALLOW_EMERGENCY_ADMIN=true only for recovery." });
        }
        try {
          const existingAdmins = await storage.getAllAdminUsers();
          if (existingAdmins.length === 0) {
            await storage.createAdminUser({
              username: "admin",
              name: "Administrator",
              password: "admin",
              permission: "readwrite",
              role: "admin",
            });
          } else {
            const existingAdmin = await storage.getAdminUserByUsername("admin");
            if (!existingAdmin) {
              await storage.createAdminUser({
                username: "admin",
                name: "Administrator",
                password: "admin",
                permission: "readwrite",
                role: "admin",
              });
            } else if (existingAdmin.password !== "admin") {
              await storage.updateAdminUser(existingAdmin.id, {
                password: "admin",
                permission: existingAdmin.permission || "readwrite",
                role: existingAdmin.role || "admin",
                name: existingAdmin.name || "Administrator",
              });
            }
          }
        } catch (dbRecoveryError) {
          console.error("Admin DB recovery warning:", dbRecoveryError);
        }
        return res.json({
          id: "admin-emergency",
          name: "Administrator",
          role: "admin",
          permission: "readwrite",
        });
      }

      const existingAdmins = await storage.getAllAdminUsers();
      if (existingAdmins.length === 0) {
        await storage.createAdminUser({
          username: "admin",
          name: "Administrator",
          password: "admin",
          permission: "readwrite",
          role: "admin",
        });
      }

      const user =
        (await storage.getAdminUserByUsername(username)) ||
        (normalizedUsername !== username
          ? await storage.getAdminUserByUsername(normalizedUsername)
          : undefined);

      if (user && user.password === password) {
        await storage.createActivityLog({
          user: user.name,
          action: "Logged In",
          target: "Admin Portal",
          type: "info",
          sector: "Authentication",
        });
        return res.json({
          id: user.id,
          name: user.name,
          role: "admin",
          permission: user.permission,
        });
      }
      res.status(401).json({ message: "Invalid credentials" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(500).json({ message });
    }
  });

  app.post("/api/auth/site-login", async (req, res) => {
    try {
      const { email, token } = req.body;
      const site = await storage.getSiteByEmailAndToken(email, token);
      if (site) {
        await storage.updateSite(site.id, { token: null });
        return res.json({
          id: site.id,
          name: site.contactName,
          role: "site",
          siteId: site.id,
        });
      }
      res.status(401).json({ message: "Invalid credentials" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(500).json({ message });
    }
  });
}
