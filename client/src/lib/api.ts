import { apiRequest } from "./queryClient";
import type {
  Site,
  InsertSite,
  Question,
  InsertQuestion,
  AdminUser,
  InsertAdminUser,
  ActivityLogEntry,
  InsertActivityLog,
  ReportTemplate,
  Domain,
  ScoreStatusMapping,
  InsertScoreStatusMapping,
  AdminRule,
  InsertAdminRule,
  Report,
  ReportAuditLog,
  TermsAcceptance,
} from "@shared/schema";

export type { Site, Question, AdminUser, ActivityLogEntry, Report, ReportAuditLog, TermsAcceptance };

export async function adminLogin(username: string, password: string): Promise<{ id: string; name: string; role: string; permission: string }> {
  const res = await apiRequest("POST", "/api/auth/admin-login", { username, password });
  return res.json();
}

export async function siteLogin(email: string, token: string): Promise<{ id: string; name: string; role: string; siteId: string }> {
  const res = await apiRequest("POST", "/api/auth/site-login", { email, token });
  return res.json();
}

export async function fetchSites(): Promise<Site[]> {
  const res = await fetch("/api/sites", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch sites");
  return res.json();
}

export async function fetchSite(id: string): Promise<Site> {
  const res = await fetch(`/api/sites/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch site");
  return res.json();
}

export async function registerSite(data: InsertSite): Promise<Site> {
  const res = await apiRequest("POST", "/api/sites", data);
  return res.json();
}

export async function updateSite(id: string, data: Partial<Omit<Site, "id">>): Promise<Site> {
  const res = await apiRequest("PATCH", `/api/sites/${id}`, data);
  return res.json();
}

export async function deleteSite(id: string) {
  const res = await apiRequest("DELETE", `/api/sites/${id}`);
  return res.json();
}

export async function generateToken(siteId: string, adminName: string) {
  const res = await apiRequest("POST", `/api/sites/${siteId}/generate-token`, { adminName });
  return res.json();
}

export async function updateSiteStatus(siteId: string, status: string, adminName: string) {
  const res = await apiRequest("POST", `/api/sites/${siteId}/update-status`, { status, adminName });
  return res.json();
}

export async function submitEvaluation(
  siteId: string,
  data: { answers: Record<string, unknown>; score: number; status: string }
): Promise<Site> {
  const res = await apiRequest("POST", `/api/sites/${siteId}/submit-evaluation`, data);
  return res.json();
}

export async function updateSiteAnswers(
  siteId: string,
  answers: Record<string, unknown>,
  score: number,
  adminName: string
): Promise<Site> {
  const res = await apiRequest("POST", `/api/sites/${siteId}/update-answers`, { answers, score, adminName });
  return res.json();
}

export async function fetchQuestions(): Promise<Question[]> {
  const res = await fetch("/api/questions", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}

export async function createQuestion(data: InsertQuestion): Promise<Question> {
  const res = await apiRequest("POST", "/api/questions", data);
  return res.json();
}

export async function updateQuestion(id: string, data: Partial<Omit<Question, "id">>): Promise<Question> {
  const res = await apiRequest("PATCH", `/api/questions/${id}`, data);
  return res.json();
}

export async function deleteQuestion(id: string) {
  const res = await apiRequest("DELETE", `/api/questions/${id}`);
  return res.json();
}

export async function bulkUpdateQuestions(
  updates: Array<{ id: string; enabled?: boolean; weight?: number }>
): Promise<Question[]> {
  const res = await apiRequest("POST", "/api/questions/bulk-update", { updates });
  return res.json();
}

export async function fetchAdminUsers(): Promise<(AdminUser & { password?: string })[]> {
  const res = await fetch("/api/admin-users", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch admin users");
  return res.json();
}

export async function createAdminUser(data: InsertAdminUser): Promise<AdminUser> {
  const res = await apiRequest("POST", "/api/admin-users", data);
  return res.json();
}

export async function updateAdminUser(id: string, data: Partial<Omit<AdminUser, "id">>): Promise<AdminUser> {
  const res = await apiRequest("PATCH", `/api/admin-users/${id}`, data);
  return res.json();
}

export async function deleteAdminUser(id: string) {
  const res = await apiRequest("DELETE", `/api/admin-users/${id}`);
  return res.json();
}

export async function fetchActivityLog(): Promise<ActivityLogEntry[]> {
  const res = await fetch("/api/activity-log", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch activity log");
  return res.json();
}

export async function createActivityLogEntry(data: InsertActivityLog): Promise<ActivityLogEntry> {
  const res = await apiRequest("POST", "/api/activity-log", data);
  return res.json();
}

export async function clearActivityLog() {
  const res = await apiRequest("DELETE", "/api/activity-log");
  return res.json();
}

export interface Stats {
  totalSites: number;
  activeQuestions: number;
  categories: number;
  completedEvaluations: number;
  avgResponseTimeDays: number | null;
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch("/api/stats", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function seedDatabase(): Promise<{ success: boolean; message?: string }> {
  const res = await apiRequest("POST", "/api/seed");
  return res.json();
}

export async function fetchChatLogs(): Promise<Array<{ sessionId: string; userType: string | null; userName: string | null; startedAt: string; messages: Array<{ id: number; role: string; content: string; createdAt: string }> }>> {
  const res = await fetch("/api/chat-logs", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch chat logs");
  return res.json();
}

export async function submitTermsAcceptance(data: {
  siteId: string;
  registrantName: string;
  registrantEmail: string;
  siteName?: string;
  termsVersion: string;
  termsEffectiveDate: string;
  termsTextSha256: string;
}): Promise<TermsAcceptance> {
  const res = await apiRequest("POST", "/api/terms-acceptance", data);
  return res.json();
}

export async function fetchTermsAcceptances(): Promise<TermsAcceptance[]> {
  const res = await fetch("/api/terms-acceptance", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch terms acceptances");
  return res.json();
}

export async function fetchTermsAcceptanceBySiteId(siteId: string): Promise<TermsAcceptance | null> {
  const res = await fetch(`/api/terms-acceptance/${siteId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch terms acceptance");
  return res.json();
}

export async function fetchReports(): Promise<Report[]> {
  const res = await fetch("/api/reports", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function fetchReport(id: string): Promise<Report> {
  const res = await fetch(`/api/reports/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}

export async function fetchReportsBySiteId(siteId: string): Promise<Report[]> {
  const res = await fetch(`/api/reports/site/${siteId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch site reports");
  return res.json();
}

export async function generateSiteReport(data: {
  siteId: string;
  generatedByUserId: string;
  generatedByName: string;
  categoryScores: Record<string, number>;
  scoringStatus: string;
  globalScore: number;
}): Promise<Report> {
  const res = await apiRequest("POST", "/api/reports/generate", data);
  return res.json();
}

export async function fetchReportSignatures(reportId: string): Promise<Array<{ id: string; signedByName: string; signedByRole: string; signedAtUtc: Date }>> {
  const res = await fetch(`/api/reports/${reportId}/signatures`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch signatures");
  return res.json();
}

export async function acknowledgeReport(
  reportId: string,
  data: { signedByName: string; signedByRole: string; hashVerification: string }
): Promise<{ signature: { id: string }; locked: boolean }> {
  const res = await apiRequest("POST", `/api/reports/${reportId}/acknowledge`, data);
  return res.json();
}

export async function fetchAdminRules(): Promise<AdminRule[]> {
  const res = await fetch("/api/admin-rules", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch admin rules");
  return res.json();
}

export async function createAdminRule(data: InsertAdminRule): Promise<AdminRule> {
  const res = await apiRequest("POST", "/api/admin-rules", data);
  return res.json();
}

export async function updateAdminRule(id: string, data: Partial<Omit<AdminRule, "id">>): Promise<AdminRule> {
  const res = await apiRequest("PATCH", `/api/admin-rules/${id}`, data);
  return res.json();
}

export async function fetchReportTemplates(): Promise<ReportTemplate[]> {
  const res = await fetch("/api/report-templates", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch report templates");
  return res.json();
}

export async function updateReportTemplate(id: string, data: Partial<Omit<ReportTemplate, "id">>): Promise<ReportTemplate> {
  const res = await apiRequest("PATCH", `/api/report-templates/${id}`, data);
  return res.json();
}

export async function fetchDomains(): Promise<Domain[]> {
  const res = await fetch("/api/domains", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch domains");
  return res.json();
}

export async function updateDomain(id: string, data: Partial<Omit<Domain, "id">>): Promise<Domain> {
  const res = await apiRequest("PATCH", `/api/domains/${id}`, data);
  return res.json();
}

export async function fetchScoreMappings(): Promise<ScoreStatusMapping[]> {
  const res = await fetch("/api/score-mappings", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch score mappings");
  return res.json();
}

export async function createScoreMapping(data: InsertScoreStatusMapping): Promise<ScoreStatusMapping> {
  const res = await apiRequest("POST", "/api/score-mappings", data);
  return res.json();
}

export async function updateScoreMapping(id: string, data: Partial<Omit<ScoreStatusMapping, "id">>): Promise<ScoreStatusMapping> {
  const res = await apiRequest("PATCH", `/api/score-mappings/${id}`, data);
  return res.json();
}

export async function deleteScoreMapping(id: string) {
  const res = await apiRequest("DELETE", `/api/score-mappings/${id}`);
  return res.json();
}

export async function fetchReportAuditLog(): Promise<ReportAuditLog[]> {
  const res = await fetch("/api/report-audit-log", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch audit log");
  return res.json();
}

export async function triggerAutoDeploy(requestedBy: string): Promise<{ ok: boolean; committed?: boolean; branch?: string; operations?: string[]; deployOutput?: string }> {
  const res = await apiRequest("POST", "/api/system/deploy", { requestedBy });
  return res.json();
}
