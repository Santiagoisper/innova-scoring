import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  adminUsers, sites, questions, activityLog, chatLogs, termsAcceptance,
  reports, reportSignatures, adminRules, reportTemplates, domains, scoreStatusMapping, reportAuditLog,
  type AdminUser, type InsertAdminUser,
  type Site, type InsertSite,
  type Question, type InsertQuestion,
  type ActivityLogEntry, type InsertActivityLog,
  type ChatLog, type InsertChatLog,
  type TermsAcceptance, type InsertTermsAcceptance,
  type Report, type InsertReport,
  type ReportSignature, type InsertReportSignature,
  type AdminRule, type InsertAdminRule,
  type ReportTemplate, type InsertReportTemplate,
  type Domain, type InsertDomain,
  type ScoreStatusMapping, type InsertScoreStatusMapping,
  type ReportAuditLog, type InsertReportAuditLog,
} from "@shared/schema";

export interface IStorage {
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: string, updates: Partial<InsertAdminUser>): Promise<AdminUser | undefined>;
  deleteAdminUser(id: string): Promise<boolean>;

  getSite(id: string): Promise<Site | undefined>;
  getSiteByEmailAndToken(email: string, token: string): Promise<Site | undefined>;
  getAllSites(): Promise<Site[]>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: string, updates: Partial<InsertSite>): Promise<Site | undefined>;
  deleteSite(id: string): Promise<boolean>;

  getQuestion(id: string): Promise<Question | undefined>;
  getAllQuestions(): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, updates: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<boolean>;
  bulkUpdateQuestions(updates: Array<{ id: string; enabled?: boolean; weight?: number }>): Promise<void>;

  getAllActivityLog(): Promise<ActivityLogEntry[]>;
  createActivityLog(entry: InsertActivityLog): Promise<ActivityLogEntry>;
  clearActivityLog(): Promise<void>;

  getAllChatLogs(): Promise<ChatLog[]>;
  createChatLog(entry: InsertChatLog): Promise<ChatLog>;
  getChatLogsBySession(sessionId: string): Promise<ChatLog[]>;

  createTermsAcceptance(entry: InsertTermsAcceptance): Promise<TermsAcceptance>;
  getAllTermsAcceptances(): Promise<TermsAcceptance[]>;
  getTermsAcceptanceBySiteId(siteId: string): Promise<TermsAcceptance | null>;

  getReport(id: string): Promise<Report | undefined>;
  getReportsBySiteId(siteId: string): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, updates: Partial<InsertReport>): Promise<Report | undefined>;
  getLatestReportBySiteId(siteId: string): Promise<Report | undefined>;

  getReportSignature(id: string): Promise<ReportSignature | undefined>;
  getSignaturesByReportId(reportId: string): Promise<ReportSignature[]>;
  createReportSignature(signature: InsertReportSignature): Promise<ReportSignature>;

  getAdminRule(id: string): Promise<AdminRule | undefined>;
  getAllAdminRules(): Promise<AdminRule[]>;
  getActiveAdminRules(): Promise<AdminRule[]>;
  createAdminRule(rule: InsertAdminRule): Promise<AdminRule>;
  updateAdminRule(id: string, updates: Partial<InsertAdminRule>): Promise<AdminRule | undefined>;

  getReportTemplate(id: string): Promise<ReportTemplate | undefined>;
  getAllReportTemplates(): Promise<ReportTemplate[]>;
  getReportTemplateByStatus(statusType: string): Promise<ReportTemplate | undefined>;
  createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate>;
  updateReportTemplate(id: string, updates: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined>;

  getDomain(id: string): Promise<Domain | undefined>;
  getAllDomains(): Promise<Domain[]>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: string, updates: Partial<InsertDomain>): Promise<Domain | undefined>;

  getScoreStatusMapping(id: string): Promise<ScoreStatusMapping | undefined>;
  getAllScoreStatusMappings(): Promise<ScoreStatusMapping[]>;
  createScoreStatusMapping(mapping: InsertScoreStatusMapping): Promise<ScoreStatusMapping>;
  updateScoreStatusMapping(id: string, updates: Partial<InsertScoreStatusMapping>): Promise<ScoreStatusMapping | undefined>;
  deleteScoreStatusMapping(id: string): Promise<boolean>;

  getAllReportAuditLogs(): Promise<ReportAuditLog[]>;
  getReportAuditLogsByEntity(entityType: string, entityId: string): Promise<ReportAuditLog[]>;
  createReportAuditLog(entry: InsertReportAuditLog): Promise<ReportAuditLog>;

  getStats(): Promise<{
    totalSites: number;
    activeQuestions: number;
    categories: number;
    completedEvaluations: number;
    avgResponseTimeDays: number | null;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user;
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return db.select().from(adminUsers);
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const [created] = await db.insert(adminUsers).values(user).returning();
    return created;
  }

  async updateAdminUser(id: string, updates: Partial<InsertAdminUser>): Promise<AdminUser | undefined> {
    const [updated] = await db.update(adminUsers).set(updates).where(eq(adminUsers.id, id)).returning();
    return updated;
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    const result = await db.delete(adminUsers).where(eq(adminUsers.id, id)).returning();
    return result.length > 0;
  }

  async getSite(id: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site;
  }

  async getSiteByEmailAndToken(email: string, token: string): Promise<Site | undefined> {
    const allSites = await db.select().from(sites);
    return allSites.find(s => s.email.toLowerCase() === email.toLowerCase() && s.token === token);
  }

  async getAllSites(): Promise<Site[]> {
    return db.select().from(sites).orderBy(desc(sites.registeredAt));
  }

  async createSite(site: InsertSite): Promise<Site> {
    const [created] = await db.insert(sites).values(site).returning();
    return created;
  }

  async updateSite(id: string, updates: Partial<InsertSite>): Promise<Site | undefined> {
    const updateData: any = { ...updates, updatedAt: new Date() };
    const [updated] = await db.update(sites).set(updateData).where(eq(sites.id, id)).returning();
    return updated;
  }

  async deleteSite(id: string): Promise<boolean> {
    const result = await db.delete(sites).where(eq(sites.id, id)).returning();
    return result.length > 0;
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async getAllQuestions(): Promise<Question[]> {
    return db.select().from(questions).orderBy(questions.sortOrder);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [created] = await db.insert(questions).values(question).returning();
    return created;
  }

  async updateQuestion(id: string, updates: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [updated] = await db.update(questions).set(updates).where(eq(questions.id, id)).returning();
    return updated;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const result = await db.delete(questions).where(eq(questions.id, id)).returning();
    return result.length > 0;
  }

  async bulkUpdateQuestions(updates: Array<{ id: string; enabled?: boolean; weight?: number }>): Promise<void> {
    for (const update of updates) {
      const { id, ...data } = update;
      await db.update(questions).set(data).where(eq(questions.id, id));
    }
  }

  async getAllActivityLog(): Promise<ActivityLogEntry[]> {
    return db.select().from(activityLog).orderBy(desc(activityLog.date));
  }

  async createActivityLog(entry: InsertActivityLog): Promise<ActivityLogEntry> {
    const [created] = await db.insert(activityLog).values(entry).returning();
    return created;
  }

  async clearActivityLog(): Promise<void> {
    await db.delete(activityLog);
  }

  async getAllChatLogs(): Promise<ChatLog[]> {
    return db.select().from(chatLogs).orderBy(desc(chatLogs.createdAt));
  }

  async createChatLog(entry: InsertChatLog): Promise<ChatLog> {
    const [created] = await db.insert(chatLogs).values(entry).returning();
    return created;
  }

  async getChatLogsBySession(sessionId: string): Promise<ChatLog[]> {
    return db.select().from(chatLogs).where(eq(chatLogs.sessionId, sessionId)).orderBy(chatLogs.createdAt);
  }

  async createTermsAcceptance(entry: InsertTermsAcceptance): Promise<TermsAcceptance> {
    const [created] = await db.insert(termsAcceptance).values(entry).returning();
    return created;
  }

  async getAllTermsAcceptances(): Promise<TermsAcceptance[]> {
    return db.select().from(termsAcceptance).orderBy(desc(termsAcceptance.acceptedAtUtc));
  }

  async getTermsAcceptanceBySiteId(siteId: string): Promise<TermsAcceptance | null> {
    const [record] = await db.select().from(termsAcceptance).where(eq(termsAcceptance.siteId, siteId)).limit(1);
    return record || null;
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async getReportsBySiteId(siteId: string): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.siteId, siteId)).orderBy(desc(reports.generatedAtUtc));
  }

  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.generatedAtUtc));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [created] = await db.insert(reports).values(report).returning();
    return created;
  }

  async updateReport(id: string, updates: Partial<InsertReport>): Promise<Report | undefined> {
    const [updated] = await db.update(reports).set(updates).where(eq(reports.id, id)).returning();
    return updated;
  }

  async getLatestReportBySiteId(siteId: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.siteId, siteId)).orderBy(desc(reports.generatedAtUtc)).limit(1);
    return report;
  }

  async getReportSignature(id: string): Promise<ReportSignature | undefined> {
    const [sig] = await db.select().from(reportSignatures).where(eq(reportSignatures.id, id));
    return sig;
  }

  async getSignaturesByReportId(reportId: string): Promise<ReportSignature[]> {
    return db.select().from(reportSignatures).where(eq(reportSignatures.reportId, reportId)).orderBy(desc(reportSignatures.signedAtUtc));
  }

  async createReportSignature(signature: InsertReportSignature): Promise<ReportSignature> {
    const [created] = await db.insert(reportSignatures).values(signature).returning();
    return created;
  }

  async getAdminRule(id: string): Promise<AdminRule | undefined> {
    const [rule] = await db.select().from(adminRules).where(eq(adminRules.id, id));
    return rule;
  }

  async getAllAdminRules(): Promise<AdminRule[]> {
    return db.select().from(adminRules).orderBy(desc(adminRules.rulePriority));
  }

  async getActiveAdminRules(): Promise<AdminRule[]> {
    return db.select().from(adminRules).where(eq(adminRules.active, true)).orderBy(desc(adminRules.rulePriority));
  }

  async createAdminRule(rule: InsertAdminRule): Promise<AdminRule> {
    const [created] = await db.insert(adminRules).values(rule).returning();
    return created;
  }

  async updateAdminRule(id: string, updates: Partial<InsertAdminRule>): Promise<AdminRule | undefined> {
    const updateData: any = { ...updates, updatedAtUtc: new Date() };
    if (!updateData.versionNumber) {
      const existing = await this.getAdminRule(id);
      if (existing) updateData.versionNumber = existing.versionNumber + 1;
    }
    const [updated] = await db.update(adminRules).set(updateData).where(eq(adminRules.id, id)).returning();
    return updated;
  }

  async getReportTemplate(id: string): Promise<ReportTemplate | undefined> {
    const [template] = await db.select().from(reportTemplates).where(eq(reportTemplates.id, id));
    return template;
  }

  async getAllReportTemplates(): Promise<ReportTemplate[]> {
    return db.select().from(reportTemplates).orderBy(reportTemplates.statusType);
  }

  async getReportTemplateByStatus(statusType: string): Promise<ReportTemplate | undefined> {
    const [template] = await db.select().from(reportTemplates).where(eq(reportTemplates.statusType, statusType));
    return template;
  }

  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> {
    const [created] = await db.insert(reportTemplates).values(template).returning();
    return created;
  }

  async updateReportTemplate(id: string, updates: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> {
    const updateData: any = { ...updates, updatedAtUtc: new Date() };
    if (!updateData.versionNumber) {
      const existing = await this.getReportTemplate(id);
      if (existing) updateData.versionNumber = existing.versionNumber + 1;
    }
    const [updated] = await db.update(reportTemplates).set(updateData).where(eq(reportTemplates.id, id)).returning();
    return updated;
  }

  async getDomain(id: string): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain;
  }

  async getAllDomains(): Promise<Domain[]> {
    return db.select().from(domains).orderBy(domains.displayOrder);
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    const [created] = await db.insert(domains).values(domain).returning();
    return created;
  }

  async updateDomain(id: string, updates: Partial<InsertDomain>): Promise<Domain | undefined> {
    const updateData: any = { ...updates, updatedAtUtc: new Date() };
    if (!updateData.versionNumber) {
      const existing = await this.getDomain(id);
      if (existing) updateData.versionNumber = existing.versionNumber + 1;
    }
    const [updated] = await db.update(domains).set(updateData).where(eq(domains.id, id)).returning();
    return updated;
  }

  async getScoreStatusMapping(id: string): Promise<ScoreStatusMapping | undefined> {
    const [mapping] = await db.select().from(scoreStatusMapping).where(eq(scoreStatusMapping.id, id));
    return mapping;
  }

  async getAllScoreStatusMappings(): Promise<ScoreStatusMapping[]> {
    return db.select().from(scoreStatusMapping).orderBy(desc(scoreStatusMapping.minScore));
  }

  async createScoreStatusMapping(mapping: InsertScoreStatusMapping): Promise<ScoreStatusMapping> {
    const [created] = await db.insert(scoreStatusMapping).values(mapping).returning();
    return created;
  }

  async updateScoreStatusMapping(id: string, updates: Partial<InsertScoreStatusMapping>): Promise<ScoreStatusMapping | undefined> {
    const updateData: any = { ...updates, updatedAtUtc: new Date() };
    if (!updateData.versionNumber) {
      const existing = await this.getScoreStatusMapping(id);
      if (existing) updateData.versionNumber = existing.versionNumber + 1;
    }
    const [updated] = await db.update(scoreStatusMapping).set(updateData).where(eq(scoreStatusMapping.id, id)).returning();
    return updated;
  }

  async deleteScoreStatusMapping(id: string): Promise<boolean> {
    const result = await db.delete(scoreStatusMapping).where(eq(scoreStatusMapping.id, id)).returning();
    return result.length > 0;
  }

  async getAllReportAuditLogs(): Promise<ReportAuditLog[]> {
    return db.select().from(reportAuditLog).orderBy(desc(reportAuditLog.createdAtUtc));
  }

  async getReportAuditLogsByEntity(entityType: string, entityId: string): Promise<ReportAuditLog[]> {
    return db.select().from(reportAuditLog)
      .where(and(eq(reportAuditLog.entityType, entityType), eq(reportAuditLog.entityId, entityId)))
      .orderBy(desc(reportAuditLog.createdAtUtc));
  }

  async createReportAuditLog(entry: InsertReportAuditLog): Promise<ReportAuditLog> {
    const [created] = await db.insert(reportAuditLog).values(entry).returning();
    return created;
  }

  async getStats(): Promise<{
    totalSites: number;
    activeQuestions: number;
    categories: number;
    completedEvaluations: number;
    avgResponseTimeDays: number | null;
  }> {
    const allSites = await db.select().from(sites);
    const allQuestions = await db.select().from(questions);

    const activeQuestions = allQuestions.filter(q => q.enabled);
    const categorySet = new Set(activeQuestions.map(q => q.category));
    const categories = Array.from(categorySet);
    const completedEvaluations = allSites.filter(s =>
      s.status === "Completed" || s.status === "Approved" || s.status === "Rejected" || s.status === "ToConsider"
    );

    let avgResponseTimeDays: number | null = null;
    const sitesWithResponseTime = allSites.filter(s =>
      s.tokenSentAt && s.evaluatedAt
    );
    if (sitesWithResponseTime.length > 0) {
      const totalDays = sitesWithResponseTime.reduce((sum, s) => {
        const sent = new Date(s.tokenSentAt!).getTime();
        const completed = new Date(s.evaluatedAt!).getTime();
        return sum + (completed - sent) / (1000 * 60 * 60 * 24);
      }, 0);
      avgResponseTimeDays = Math.round((totalDays / sitesWithResponseTime.length) * 10) / 10;
    }

    return {
      totalSites: allSites.length,
      activeQuestions: activeQuestions.length,
      categories: categories.length,
      completedEvaluations: completedEvaluations.length,
      avgResponseTimeDays,
    };
  }
}

export const storage = new DatabaseStorage();
