/**
 * MOTOR DE SCORING OPTIMIZADO - INNOVA TRIALS
 * Basado en arquitectura Vite + Express + Drizzle
 */

export type EvaluationStatus = 'approved' | 'conditional' | 'rejected';

export interface ScoringInput {
  questionId: string;
  score: number;
  hasDocumentation?: boolean;
}

export interface ScoringResult {
  totalScore: number;
  status: EvaluationStatus;
  knockoutFailed: boolean;
  requiresManualReview: boolean;
  confidenceScore: number;
  missingDocsPenalty: number;
  breakdown: {
    questionId: string;
    score: number;
    weight: number;
    isKnockOut: boolean;
    failedKnockout: boolean;
    needsReview: boolean;
  }[];
}

export function calculateScore(
  answers: ScoringInput[],
  questions: any[],
  config = {
    knockoutThreshold: 40,
    reviewThreshold: 30,
    docPenaltyPerMissing: 5,
    maxDocPenalty: 15
  }
): ScoringResult {
  const {
    knockoutThreshold,
    reviewThreshold,
    docPenaltyPerMissing,
    maxDocPenalty
  } = config;

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let knockoutFailed = false;
  let requiresManualReview = false;
  let missingDocsCount = 0;
  let totalDocsRequired = 0;

  const breakdown = answers.map(ans => {
    const q = questions.find(q => q.id === ans.questionId);
    if (!q) return null;

    const isKnockOut = q.isKnockOut || false;
    const weight = q.weight || 1;
    
    const failedKnockout = isKnockOut && ans.score < reviewThreshold;
    const needsReview = isKnockOut && ans.score >= reviewThreshold && ans.score < knockoutThreshold;

    if (failedKnockout) knockoutFailed = true;
    if (needsReview) requiresManualReview = true;

    if (q.requiresDoc) {
      totalDocsRequired++;
      if (!ans.hasDocumentation) missingDocsCount++;
    }

    totalWeightedScore += (ans.score * weight);
    totalWeight += weight;

    return {
      questionId: ans.questionId,
      score: ans.score,
      weight,
      isKnockOut,
      failedKnockout,
      needsReview
    };
  }).filter(Boolean) as any[];

  const baseScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  const confidenceScore = totalDocsRequired > 0 ? Math.round(((totalDocsRequired - missingDocsCount) / totalDocsRequired) * 100) : 100;
  const docPenalty = Math.min(missingDocsCount * docPenaltyPerMissing, maxDocPenalty);
  const finalScore = Math.max(0, baseScore - docPenalty);

  let status: EvaluationStatus = 'approved';
  if (knockoutFailed) {
    status = 'rejected';
  } else if (requiresManualReview || (finalScore < 80 && finalScore >= 60)) {
    status = 'conditional';
  } else if (finalScore < 60) {
    status = 'rejected';
  }

  return {
    totalScore: finalScore,
    status,
    knockoutFailed,
    requiresManualReview,
    confidenceScore,
    missingDocsPenalty: docPenalty,
    breakdown
  };
}
