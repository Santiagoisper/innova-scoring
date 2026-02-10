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
