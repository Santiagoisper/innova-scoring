import { apiRequest } from "./queryClient";

export async function adminLogin(username: string, password: string) {
  const res = await apiRequest("POST", "/api/auth/admin-login", { username, password });
  return res.json();
}

export async function siteLogin(email: string, token: string) {
  const res = await apiRequest("POST", "/api/auth/site-login", { email, token });
  return res.json();
}

export async function fetchSites() {
  const res = await fetch("/api/sites", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch sites");
  return res.json();
}

export async function fetchSite(id: string) {
  const res = await fetch(`/api/sites/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch site");
  return res.json();
}

export async function registerSite(data: any) {
  const res = await apiRequest("POST", "/api/sites", data);
  return res.json();
}

export async function updateSite(id: string, data: any) {
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

export async function submitEvaluation(siteId: string, data: { answers: any; score: number; status: string }) {
  const res = await apiRequest("POST", `/api/sites/${siteId}/submit-evaluation`, data);
  return res.json();
}

export async function updateSiteAnswers(siteId: string, answers: any, score: number, adminName: string) {
  const res = await apiRequest("POST", `/api/sites/${siteId}/update-answers`, { answers, score, adminName });
  return res.json();
}

export async function fetchQuestions() {
  const res = await fetch("/api/questions", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}

export async function createQuestion(data: any) {
  const res = await apiRequest("POST", "/api/questions", data);
  return res.json();
}

export async function updateQuestion(id: string, data: any) {
  const res = await apiRequest("PATCH", `/api/questions/${id}`, data);
  return res.json();
}

export async function deleteQuestion(id: string) {
  const res = await apiRequest("DELETE", `/api/questions/${id}`);
  return res.json();
}

export async function bulkUpdateQuestions(updates: Array<{ id: string; enabled?: boolean; weight?: number }>) {
  const res = await apiRequest("POST", "/api/questions/bulk-update", { updates });
  return res.json();
}

export async function fetchAdminUsers() {
  const res = await fetch("/api/admin-users", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch admin users");
  return res.json();
}

export async function createAdminUser(data: any) {
  const res = await apiRequest("POST", "/api/admin-users", data);
  return res.json();
}

export async function updateAdminUser(id: string, data: any) {
  const res = await apiRequest("PATCH", `/api/admin-users/${id}`, data);
  return res.json();
}

export async function deleteAdminUser(id: string) {
  const res = await apiRequest("DELETE", `/api/admin-users/${id}`);
  return res.json();
}

export async function fetchActivityLog() {
  const res = await fetch("/api/activity-log", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch activity log");
  return res.json();
}

export async function createActivityLogEntry(data: any) {
  const res = await apiRequest("POST", "/api/activity-log", data);
  return res.json();
}

export async function clearActivityLog() {
  const res = await apiRequest("DELETE", "/api/activity-log");
  return res.json();
}

export async function fetchStats() {
  const res = await fetch("/api/stats", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function seedDatabase() {
  const res = await apiRequest("POST", "/api/seed");
  return res.json();
}

export async function fetchChatLogs() {
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
}) {
  const res = await apiRequest("POST", "/api/terms-acceptance", data);
  return res.json();
}

export async function fetchTermsAcceptances() {
  const res = await fetch("/api/terms-acceptance", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch terms acceptances");
  return res.json();
}

export async function fetchTermsAcceptanceBySiteId(siteId: string) {
  const res = await fetch(`/api/terms-acceptance/${siteId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch terms acceptance");
  return res.json();
}

export async function fetchReports() {
  const res = await fetch("/api/reports", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function fetchReport(id: string) {
  const res = await fetch(`/api/reports/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}

export async function fetchReportsBySiteId(siteId: string) {
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
}) {
  const res = await apiRequest("POST", "/api/reports/generate", data);
  return res.json();
}

export async function fetchReportSignatures(reportId: string) {
  const res = await fetch(`/api/reports/${reportId}/signatures`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch signatures");
  return res.json();
}

export async function acknowledgeReport(reportId: string, data: {
  signedByName: string;
  signedByRole: string;
  hashVerification: string;
}) {
  const res = await apiRequest("POST", `/api/reports/${reportId}/acknowledge`, data);
  return res.json();
}

export async function fetchAdminRules() {
  const res = await fetch("/api/admin-rules", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch admin rules");
  return res.json();
}

export async function createAdminRule(data: any) {
  const res = await apiRequest("POST", "/api/admin-rules", data);
  return res.json();
}

export async function updateAdminRule(id: string, data: any) {
  const res = await apiRequest("PATCH", `/api/admin-rules/${id}`, data);
  return res.json();
}

export async function fetchReportTemplates() {
  const res = await fetch("/api/report-templates", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch report templates");
  return res.json();
}

export async function updateReportTemplate(id: string, data: any) {
  const res = await apiRequest("PATCH", `/api/report-templates/${id}`, data);
  return res.json();
}

export async function fetchDomains() {
  const res = await fetch("/api/domains", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch domains");
  return res.json();
}

export async function updateDomain(id: string, data: any) {
  const res = await apiRequest("PATCH", `/api/domains/${id}`, data);
  return res.json();
}

export async function fetchScoreMappings() {
  const res = await fetch("/api/score-mappings", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch score mappings");
  return res.json();
}

export async function createScoreMapping(data: any) {
  const res = await apiRequest("POST", "/api/score-mappings", data);
  return res.json();
}

export async function updateScoreMapping(id: string, data: any) {
  const res = await apiRequest("PATCH", `/api/score-mappings/${id}`, data);
  return res.json();
}

export async function deleteScoreMapping(id: string) {
  const res = await apiRequest("DELETE", `/api/score-mappings/${id}`);
  return res.json();
}

export async function fetchReportAuditLog() {
  const res = await fetch("/api/report-audit-log", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch audit log");
  return res.json();
}

export async function triggerAutoDeploy(requestedBy: string) {
  const res = await apiRequest("POST", "/api/system/deploy", { requestedBy });
  return res.json();
}
