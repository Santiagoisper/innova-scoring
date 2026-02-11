import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  permission: text("permission").notNull().default("readonly"),
  role: text("role").notNull().default("admin"),
});

export const sites = pgTable("sites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("Pending"),
  token: text("token"),
  location: text("location"),
  code: text("code"),
  country: text("country"),
  city: text("city"),
  address: text("address"),
  phone: text("phone"),
  score: integer("score").default(0),
  answers: jsonb("answers").default({}),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  evaluatedAt: timestamp("evaluated_at"),
  evaluatedBy: text("evaluated_by"),
  tokenSentAt: timestamp("token_sent_at"),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  type: text("type").notNull().default("YesNo"),
  category: text("category").notNull(),
  weight: integer("weight").notNull().default(1),
  isKnockOut: boolean("is_knock_out").default(false),
  enabled: boolean("enabled").default(true),
  keywords: text("keywords").array(),
  sortOrder: integer("sort_order").default(0),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  user: text("user").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  type: text("type").notNull().default("info"),
  sector: text("sector"),
});

export const chatLogs = pgTable("chat_logs", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  userType: text("user_type"),
  userName: text("user_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true });
export const insertSiteSchema = createInsertSchema(sites).omit({ id: true, registeredAt: true, updatedAt: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true, date: true });
export const termsAcceptance = pgTable("terms_acceptance", {
  id: serial("id").primaryKey(),
  siteId: varchar("site_id").notNull(),
  registrantName: text("registrant_name").notNull(),
  registrantEmail: text("registrant_email").notNull(),
  siteName: text("site_name"),
  accepted: boolean("accepted").notNull().default(true),
  acceptedAtUtc: timestamp("accepted_at_utc").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  termsVersion: text("terms_version").notNull().default("1.0"),
  termsEffectiveDate: text("terms_effective_date").notNull().default("2026-02-11"),
  termsTextSha256: text("terms_text_sha256").notNull(),
});

export const insertTermsAcceptanceSchema = createInsertSchema(termsAcceptance).omit({ id: true, acceptedAtUtc: true });
export const insertChatLogSchema = createInsertSchema(chatLogs).omit({ id: true, createdAt: true });

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Site = typeof sites.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type InsertChatLog = z.infer<typeof insertChatLogSchema>;
export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertTermsAcceptance = z.infer<typeof insertTermsAcceptanceSchema>;
export type TermsAcceptance = typeof termsAcceptance.$inferSelect;
