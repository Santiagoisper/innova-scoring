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

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: varchar("site_id").notNull(),
  reportVersion: text("report_version").notNull(),
  generatedByUserId: varchar("generated_by_user_id").notNull(),
  generatedAtUtc: timestamp("generated_at_utc").notNull().defaultNow(),
  statusAtGeneration: text("status_at_generation").notNull(),
  finalStatus: text("final_status").notNull(),
  scoreSnapshotJson: jsonb("score_snapshot_json").notNull(),
  rulesSnapshotJson: jsonb("rules_snapshot_json").notNull(),
  templatesSnapshotJson: jsonb("templates_snapshot_json").notNull(),
  mappingsSnapshotJson: jsonb("mappings_snapshot_json").notNull(),
  narrativeSnapshotJson: jsonb("narrative_snapshot_json"),
  capaItemsJson: jsonb("capa_items_json"),
  pdfStoragePath: text("pdf_storage_path"),
  hashSha256: text("hash_sha256"),
  isLocked: boolean("is_locked").notNull().default(false),
  previousReportId: varchar("previous_report_id"),
});

export const reportSignatures = pgTable("report_signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull(),
  signedByName: text("signed_by_name").notNull(),
  signedByRole: text("signed_by_role").notNull(),
  signedAtUtc: timestamp("signed_at_utc").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  hashAtSignature: text("hash_at_signature").notNull(),
  signatureMethod: text("signature_method").notNull().default("acknowledgment"),
  signaturePayload: jsonb("signature_payload"),
});

export const adminRules = pgTable("admin_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainKey: text("domain_key").notNull(),
  triggerKey: text("trigger_key").notNull(),
  rulePriority: integer("rule_priority").notNull().default(1),
  forcesMinimumStatus: text("forces_minimum_status"),
  blocksApproval: boolean("blocks_approval").notNull().default(false),
  requiresCapa: boolean("requires_capa").notNull().default(false),
  requiredActionText: text("required_action_text"),
  evidenceRequiredText: text("evidence_required_text"),
  recommendedTimelineDays: integer("recommended_timeline_days"),
  appliesToPhase: text("applies_to_phase"),
  appliesToSponsor: text("applies_to_sponsor"),
  active: boolean("active").notNull().default(true),
  versionNumber: integer("version_number").notNull().default(1),
  createdAtUtc: timestamp("created_at_utc").notNull().defaultNow(),
  updatedAtUtc: timestamp("updated_at_utc").notNull().defaultNow(),
  updatedByUserId: varchar("updated_by_user_id"),
});

export const reportTemplates = pgTable("report_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  statusType: text("status_type").notNull(),
  executiveSummaryText: text("executive_summary_text").notNull(),
  reevaluationClauseText: text("reevaluation_clause_text"),
  domainParagraphTemplatesJson: jsonb("domain_paragraph_templates_json"),
  versionNumber: integer("version_number").notNull().default(1),
  updatedByUserId: varchar("updated_by_user_id"),
  updatedAtUtc: timestamp("updated_at_utc").notNull().defaultNow(),
});

export const domains = pgTable("domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainKey: text("domain_key").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  isVisibleInReport: boolean("is_visible_in_report").notNull().default(true),
  versionNumber: integer("version_number").notNull().default(1),
  updatedAtUtc: timestamp("updated_at_utc").notNull().defaultNow(),
  updatedByUserId: varchar("updated_by_user_id"),
});

export const scoreStatusMapping = pgTable("score_status_mapping", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  minScore: integer("min_score").notNull(),
  maxScore: integer("max_score").notNull(),
  statusLabel: text("status_label").notNull(),
  versionNumber: integer("version_number").notNull().default(1),
  updatedByUserId: varchar("updated_by_user_id"),
  updatedAtUtc: timestamp("updated_at_utc").notNull().defaultNow(),
});

export const reportAuditLog = pgTable("report_audit_log", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  actionType: text("action_type").notNull(),
  actorUserId: varchar("actor_user_id"),
  actorName: text("actor_name"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAtUtc: timestamp("created_at_utc").notNull().defaultNow(),
  beforeStateJson: jsonb("before_state_json"),
  afterStateJson: jsonb("after_state_json"),
  detailsJson: jsonb("details_json"),
  isCriticalChange: boolean("is_critical_change").notNull().default(false),
  changeReason: text("change_reason"),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, generatedAtUtc: true });
export const insertReportSignatureSchema = createInsertSchema(reportSignatures).omit({ id: true, signedAtUtc: true });
export const insertAdminRuleSchema = createInsertSchema(adminRules).omit({ id: true, createdAtUtc: true, updatedAtUtc: true });
export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({ id: true, updatedAtUtc: true });
export const insertDomainSchema = createInsertSchema(domains).omit({ id: true, updatedAtUtc: true });
export const insertScoreStatusMappingSchema = createInsertSchema(scoreStatusMapping).omit({ id: true, updatedAtUtc: true });
export const insertReportAuditLogSchema = createInsertSchema(reportAuditLog).omit({ id: true, createdAtUtc: true });

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

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type ReportSignature = typeof reportSignatures.$inferSelect;
export type InsertReportSignature = z.infer<typeof insertReportSignatureSchema>;
export type AdminRule = typeof adminRules.$inferSelect;
export type InsertAdminRule = z.infer<typeof insertAdminRuleSchema>;
export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;
export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type ScoreStatusMapping = typeof scoreStatusMapping.$inferSelect;
export type InsertScoreStatusMapping = z.infer<typeof insertScoreStatusMappingSchema>;
export type ReportAuditLog = typeof reportAuditLog.$inferSelect;
export type InsertReportAuditLog = z.infer<typeof insertReportAuditLogSchema>;

export { conversations, messages } from "./models/chat";
