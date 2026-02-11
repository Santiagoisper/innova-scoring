import { storage } from "./storage";
import { createHash } from "crypto";
import type { Site, AdminRule, ReportTemplate, Domain, ScoreStatusMapping, Report } from "@shared/schema";

export interface DomainEvaluation {
  domainKey: string;
  displayName: string;
  scorePercent: number;
  statusLabel: string;
  description: string;
}

export interface CapaItem {
  priority: number;
  domainKey: string;
  domainName: string;
  requiredAction: string;
  evidenceRequired: string;
  timelineDays: number;
  triggerRule: string;
}

export interface ReportGenerationResult {
  reportVersion: string;
  finalStatus: string;
  scoreSnapshot: any;
  rulesSnapshot: any;
  templatesSnapshot: any;
  mappingsSnapshot: any;
  narrativeSnapshot: any;
  capaItems: CapaItem[];
  previousReportId: string | null;
}

function getStatusLabelForScore(score: number, mappings: ScoreStatusMapping[]): string {
  for (const m of mappings) {
    if (score >= m.minScore && score <= m.maxScore) {
      return m.statusLabel;
    }
  }
  if (score >= 80) return "Adequate";
  if (score >= 50) return "Partially Adequate";
  if (score >= 25) return "Critical Gap";
  return "Not Evidenced";
}

function determineFinalStatus(
  scoringStatus: string,
  categoryScores: Record<string, number>,
  activeRules: AdminRule[],
  allDomains: Domain[],
  mappings: ScoreStatusMapping[]
): { finalStatus: string; triggeredRules: AdminRule[] } {
  let finalStatus = scoringStatus === "Approved" ? "Approved" :
                    scoringStatus === "Conditional" ? "Conditionally Approved" : "Not Approved";

  const triggeredRules: AdminRule[] = [];

  const sortedRules = [...activeRules].sort((a, b) => b.rulePriority - a.rulePriority);

  for (const rule of sortedRules) {
    const domainScore = categoryScores[rule.domainKey];
    if (domainScore === undefined) continue;

    const statusLabel = getStatusLabelForScore(Math.round(domainScore), mappings);
    const triggerMatches =
      rule.triggerKey === statusLabel ||
      rule.triggerKey === "any_gap" && (statusLabel === "Critical Gap" || statusLabel === "Not Evidenced") ||
      rule.triggerKey === "below_adequate" && statusLabel !== "Adequate";

    if (triggerMatches) {
      triggeredRules.push(rule);

      if (rule.blocksApproval && finalStatus === "Approved") {
        finalStatus = "Conditionally Approved";
      }

      if (rule.forcesMinimumStatus) {
        const statusSeverity: Record<string, number> = {
          "Approved": 1,
          "Conditionally Approved": 2,
          "Not Approved": 3,
        };
        const currentSeverity = statusSeverity[finalStatus] || 0;
        const forcedSeverity = statusSeverity[rule.forcesMinimumStatus] || 0;
        if (forcedSeverity > currentSeverity) {
          finalStatus = rule.forcesMinimumStatus;
        }
      }
    }
  }

  return { finalStatus, triggeredRules };
}

function generateCapaItems(triggeredRules: AdminRule[], allDomains: Domain[]): CapaItem[] {
  const domainMap: Record<string, string> = {};
  allDomains.forEach(d => { domainMap[d.domainKey] = d.displayName; });

  return triggeredRules
    .filter(r => r.requiresCapa)
    .map(r => ({
      priority: r.rulePriority,
      domainKey: r.domainKey,
      domainName: domainMap[r.domainKey] || r.domainKey,
      requiredAction: r.requiredActionText || "Corrective action required",
      evidenceRequired: r.evidenceRequiredText || "Evidence of correction must be provided",
      timelineDays: r.recommendedTimelineDays || 90,
      triggerRule: r.triggerKey,
    }))
    .sort((a, b) => b.priority - a.priority);
}

function generateReportVersionId(siteId: string, existingReports: Report[]): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const siteShort = siteId.substring(0, 8).toUpperCase();
  const version = existingReports.length + 1;
  return `REPORT-${siteShort}-${dateStr}-v${version}`;
}

export async function generateReport(
  siteId: string,
  generatedByUserId: string,
  categoryScores: Record<string, number>,
  scoringStatus: string,
  globalScore: number
): Promise<ReportGenerationResult> {
  const [activeRules, allTemplates, allDomains, allMappings, existingReports] = await Promise.all([
    storage.getActiveAdminRules(),
    storage.getAllReportTemplates(),
    storage.getAllDomains(),
    storage.getAllScoreStatusMappings(),
    storage.getReportsBySiteId(siteId),
  ]);

  const { finalStatus, triggeredRules } = determineFinalStatus(
    scoringStatus, categoryScores, activeRules, allDomains, allMappings
  );

  const capaItems = generateCapaItems(triggeredRules, allDomains);

  const templateStatusKey = finalStatus === "Approved" ? "Approved" :
                            finalStatus === "Conditionally Approved" ? "Conditionally Approved" : "Not Approved";
  const template = allTemplates.find(t => t.statusType === templateStatusKey);

  const domainEvaluations: DomainEvaluation[] = allDomains
    .filter(d => d.isVisibleInReport)
    .map(d => ({
      domainKey: d.domainKey,
      displayName: d.displayName,
      scorePercent: Math.round(categoryScores[d.domainKey] || 0),
      statusLabel: getStatusLabelForScore(Math.round(categoryScores[d.domainKey] || 0), allMappings),
      description: d.description || "",
    }));

  const reportVersion = generateReportVersionId(siteId, existingReports);

  const previousReportId = existingReports.length > 0 ? existingReports[0].id : null;

  const scoreSnapshot = {
    globalScore: Math.round(globalScore),
    categoryScores,
    domainEvaluations,
  };

  const narrativeSnapshot = {
    executiveSummary: template?.executiveSummaryText || "",
    reevaluationClause: template?.reevaluationClauseText || "",
    domainParagraphs: template?.domainParagraphTemplatesJson || {},
  };

  return {
    reportVersion,
    finalStatus,
    scoreSnapshot,
    rulesSnapshot: activeRules,
    templatesSnapshot: allTemplates,
    mappingsSnapshot: allMappings,
    narrativeSnapshot,
    capaItems,
    previousReportId,
  };
}

export function computeReportHash(reportData: any): string {
  const content = JSON.stringify(reportData);
  return createHash("sha256").update(content).digest("hex");
}
