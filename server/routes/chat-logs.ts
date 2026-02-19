import type { Express } from "express";
import { storage } from "../storage";

interface ChatSession {
  sessionId: string;
  userType: string | null;
  userName: string | null;
  startedAt: Date;
  messages: Array<{ id: number; role: string; content: string; createdAt: Date }>;
}

export function registerChatLogsRoutes(app: Express) {
  app.get("/api/chat-logs", async (_req, res) => {
    try {
      const logs = await storage.getAllChatLogs();
      const sessions: Record<string, ChatSession> = {};
      for (const log of logs) {
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
      }
      const sessionList = Object.values(sessions).sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
      res.json(sessionList);
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch chat logs" });
    }
  });
}
