import type { Express } from "express";
import { storage } from "../storage";
import { runCommand } from "./helpers";

export function registerSystemRoutes(app: Express) {
  app.post("/api/system/deploy", async (req, res) => {
    const requestedBy = String(req.body?.requestedBy || "Unknown").trim() || "Unknown";

    try {
      const changed = await runCommand("git", ["status", "--porcelain"]);
      const currentBranch = await runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
      const branch = currentBranch.stdout || "main";

      const operations: string[] = [];
      let committed = false;

      if (changed.stdout) {
        await runCommand("git", ["add", "-A"]);
        const commitMessage = `Auto deploy from settings (${new Date().toISOString()})`;
        await runCommand("git", ["commit", "-m", commitMessage]);
        committed = true;
        operations.push("git add -A");
        operations.push(`git commit -m "${commitMessage}"`);
      } else {
        operations.push("No local changes to commit");
      }

      await runCommand("git", ["push", "origin", branch]);
      operations.push(`git push origin ${branch}`);

      const deployResult = process.platform === "win32"
        ? await runCommand("cmd", ["/c", "npx", "vercel", "--prod", "--yes"])
        : await runCommand("npx", ["vercel", "--prod", "--yes"]);
      operations.push("npx vercel --prod --yes");

      await storage.createActivityLog({
        user: requestedBy,
        action: "Triggered Auto Deploy",
        target: `Branch ${branch}`,
        type: "success",
        sector: "System",
      });

      res.json({
        ok: true,
        committed,
        branch,
        operations,
        deployOutput: deployResult.stdout || deployResult.stderr || "Deploy completed",
      });
    } catch (error: unknown) {
      const err = error as { stderr?: string; stdout?: string; message?: string } | Error;
      const details = err && typeof err === "object" && "stderr" in err
        ? String((err as { stderr?: string }).stderr || (err as { stdout?: string }).stdout || (err as Error).message || "Unknown error")
        : error instanceof Error ? error.message : "Unknown error";

      await storage.createActivityLog({
        user: requestedBy,
        action: "Auto Deploy Failed",
        target: details.slice(0, 120),
        type: "warning",
        sector: "System",
      });

      res.status(500).json({
        message: "Auto deploy failed",
        details,
      });
    }
  });
}
