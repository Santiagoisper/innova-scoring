import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { questions as questionsTable } from "@shared/schema";

export function registerSeedRoutes(app: Express) {
  app.post("/api/seed", async (_req, res) => {
    try {
      const existingUsers = await storage.getAllAdminUsers();
      if (existingUsers.length === 0) {
        await storage.createAdminUser({
          username: "admin",
          name: "Administrator",
          password: "admin",
          permission: "readwrite",
          role: "admin",
        });
        await storage.createAdminUser({
          username: "viewer",
          name: "Guest Viewer",
          password: "viewer",
          permission: "readonly",
          role: "admin",
        });
      }

      const existingQuestions = await storage.getAllQuestions();
      if (existingQuestions.length === 0) {
        const { QUESTIONS } = await import("../../client/src/lib/questions");
        for (let i = 0; i < QUESTIONS.length; i++) {
          const q = QUESTIONS[i];
          await db.insert(questionsTable).values({
            id: q.id,
            text: q.text,
            type: q.type,
            category: q.category,
            weight: q.weight,
            isKnockOut: q.isKnockOut || false,
            enabled: q.enabled !== false,
            keywords: q.keywords || null,
            sortOrder: i,
          });
        }
      }

      const existingDomains = await storage.getAllDomains();
      if (existingDomains.length === 0) {
        const defaultDomains = [
          { domainKey: "Patient Safety", displayName: "Patient Safety", description: "SAE systems, AE/SAE reporting timeliness, emergency service, biological sample temperature control, pathogenic waste disposal. If this fails, the site is not viable. Non-compensable.", displayOrder: 1 },
          { domainKey: "IMP & Drug Accountability", displayName: "IMP & Drug Accountability", description: "Pharmacy for research, IMP traceability, IP refrigeration, double-blind circuit. High regulatory risk — lack of traceability is critical.", displayOrder: 2 },
          { domainKey: "Regulatory & Quality System", displayName: "Regulatory & Quality System", description: "SOPs, CAPA system, internal audits, IEC compliance, deviation tracking, GCP training documentation. Without this, no defense against audit.", displayOrder: 3 },
          { domainKey: "Data Integrity & Monitoring", displayName: "Data Integrity & Monitoring", description: "eCRF TAT, data tracking system, EMR access for monitors, monitoring responsibility, follow-up documentation. Impacts sponsor confidence and regulatory approval.", displayOrder: 4 },
          { domainKey: "Operational Infrastructure", displayName: "Operational Infrastructure", description: "Generator, local laboratories, equipment calibration, 24-hour observation, weekend dosing capacity. Important but not structurally non-compensable.", displayOrder: 5 },
          { domainKey: "Experience & Reputation", displayName: "Experience & Reputation", description: "Phase I–IV experience, audit history without critical findings, recruitment methods, therapeutic specialty experience. Impacts speed and confidence, not basic compliance.", displayOrder: 6 },
        ];
        for (const d of defaultDomains) {
          await storage.createDomain(d);
        }
      }

      const existingTemplates = await storage.getAllReportTemplates();
      if (existingTemplates.length === 0) {
        const defaultTemplates = [
          { statusType: "Approved", executiveSummaryText: "This clinical research site has met all qualification criteria established by the evaluation framework. The site demonstrates adequate infrastructure, staff competency, quality management systems, and patient safety protocols to participate in clinical trials. All domains have been evaluated and scored above the minimum thresholds required for full approval.", reevaluationClauseText: "This approval is valid for 12 months from the date of issuance. A re-evaluation will be conducted prior to expiration or upon any significant change in site capabilities, personnel, or infrastructure.", domainParagraphTemplatesJson: { default: "The site demonstrates adequate performance in this domain, meeting or exceeding the minimum requirements for participation in clinical trials." } },
          { statusType: "Conditionally Approved", executiveSummaryText: "This clinical research site has met most qualification criteria but requires corrective actions in specific domains before full approval can be granted. The site demonstrates general capability but has identified gaps that must be addressed within the specified timeline. A Corrective and Preventive Action (CAPA) plan has been generated for the deficient areas.", reevaluationClauseText: "Conditional approval is granted for a period of 6 months. The site must complete all CAPA items and undergo a follow-up evaluation within this period. Failure to address corrective actions may result in downgrade to Not Approved status.", domainParagraphTemplatesJson: { default: "This domain requires improvement. The site should address the identified gaps according to the CAPA plan timeline.", adequate: "The site demonstrates adequate performance in this domain." } },
          { statusType: "Not Approved", executiveSummaryText: "This clinical research site has not met the minimum qualification criteria required for participation in clinical trials. Critical deficiencies have been identified in one or more essential domains. The site must undergo substantial improvements and submit a new evaluation request after addressing the identified gaps.", reevaluationClauseText: "The site may request a new evaluation after a minimum of 90 days, provided that documented evidence of corrective actions has been submitted for review. A comprehensive re-evaluation of all domains will be required.", domainParagraphTemplatesJson: { default: "This domain falls below the minimum acceptable threshold. Significant improvements are required before the site can be considered for clinical trial participation.", adequate: "While this domain meets the minimum requirements, overall site qualification has been denied due to critical gaps in other areas." } },
        ];
        for (const t of defaultTemplates) {
          await storage.createReportTemplate(t);
        }
      }

      const existingMappings = await storage.getAllScoreStatusMappings();
      if (existingMappings.length === 0) {
        const defaultMappings = [
          { minScore: 80, maxScore: 100, statusLabel: "Approved" },
          { minScore: 60, maxScore: 79, statusLabel: "Conditionally Approved" },
          { minScore: 0, maxScore: 59, statusLabel: "Not Approved" },
        ];
        for (const m of defaultMappings) {
          await storage.createScoreStatusMapping(m);
        }
      }

      res.json({ success: true, message: "Seed completed" });
    } catch (error: unknown) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Seed failed" });
    }
  });
}
