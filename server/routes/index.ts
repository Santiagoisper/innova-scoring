import type { Express } from "express";
import type { Server } from "http";
import { registerChatRoutes } from "../replit_integrations/chat";
import { registerHealthRoutes } from "./health";
import { registerAuthRoutes } from "./auth";
import { registerAdminUsersRoutes } from "./admin-users";
import { registerSitesRoutes } from "./sites";
import { registerQuestionsRoutes } from "./questions";
import { registerActivityLogRoutes } from "./activity-log";
import { registerChatLogsRoutes } from "./chat-logs";
import { registerStatsRoutes } from "./stats";
import { registerTermsAcceptanceRoutes } from "./terms-acceptance";
import { registerReportsRoutes } from "./reports";
import { registerAdminRulesRoutes } from "./admin-rules";
import { registerReportTemplatesRoutes } from "./report-templates";
import { registerDomainsRoutes } from "./domains";
import { registerScoreMappingsRoutes } from "./score-mappings";
import { registerReportAuditLogRoutes } from "./report-audit-log";
import { registerSeedRoutes } from "./seed";
import { registerSystemRoutes } from "./system";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  registerChatRoutes(app);
  registerHealthRoutes(app);
  registerAuthRoutes(app);
  registerAdminUsersRoutes(app);
  registerSitesRoutes(app);
  registerQuestionsRoutes(app);
  registerActivityLogRoutes(app);
  registerChatLogsRoutes(app);
  registerStatsRoutes(app);
  registerTermsAcceptanceRoutes(app);
  registerReportsRoutes(app);
  registerAdminRulesRoutes(app);
  registerReportTemplatesRoutes(app);
  registerDomainsRoutes(app);
  registerScoreMappingsRoutes(app);
  registerReportAuditLogRoutes(app);
  registerSeedRoutes(app);
  registerSystemRoutes(app);

  return httpServer;
}
