import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  adminUsers, sites, questions, activityLog, chatLogs, termsAcceptance,
  type AdminUser, type InsertAdminUser,
  type Site, type InsertSite,
  type Question, type InsertQuestion,
  type ActivityLogEntry, type InsertActivityLog,
  type ChatLog, type InsertChatLog,
  type TermsAcceptance, type InsertTermsAcceptance,
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
