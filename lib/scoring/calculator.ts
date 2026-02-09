import { Criterion, EvaluationStatus } from '@/types'

export interface ScoringInput {
  criterion_id: string;
  score: number;
  response?: 'yes' | 'no' | 'partial' | string;
  has_documentation?: boolean;
}

export interface ScoringResult {
  totalScore: number;
  status: EvaluationStatus;
  knockoutFailed: boolean;
  knockoutReason?: string;
  requiresManualReview: boolean; // Nuevo: Para casos borde
  confidenceScore: number;       // Nuevo: Score de evidencia (0-100)
  missingDocsPenalty: number;
  weightedScores: {
    criterion_id: string;
    score: number;
    weight: number;
    weightedScore: number;
    is_knockout: boolean;
    failed_knockout: boolean;
    needs_review: boolean;
  }[];
}

/**
 * MOTOR DE SCORING OPTIMIZADO - INNOVA TRIALS
 * 
 * Cambios realizados:
 * 1. Umbral de Knockout reducido a 40 para mayor flexibilidad.
 * 2. Introducción de 'requiresManualReview' para fallos cercanos al umbral.
 * 3. Cálculo de confidenceScore independiente del totalScore para no castigar capacidad por falta de burocracia.
 */
export function calculateWeightedScore(
  items: ScoringInput[],
  criteria: Criterion[],
  config: {
    knockoutThreshold?: number;    // Default: 40 (Antes 50)
    reviewThreshold?: number;      // Default: 30 (Si está entre 30 y 40, requiere revisión)
    docPenaltyPerMissing?: number; // Default: 5
    maxDocPenalty?: number;        // Default: 15 (Reducido de 20 para no ser tan punitivo)
  } = {}
): ScoringResult {
  const {
    knockoutThreshold = 40,
    reviewThreshold = 30,
    docPenaltyPerMissing = 5,
    maxDocPenalty = 15
  } = config;

  const criteriaMap = new Map(criteria.map(c => [c.id, c]));
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let knockoutFailed = false;
  let requiresManualReview = false;
  let knockoutReason: string | undefined;
  
  let missingDocsCount = 0;
  let totalDocsRequired = 0;

  const weightedScores: ScoringResult['weightedScores'] = [];

  // FASE 1: Análisis de Criterios y Knockouts
  for (const item of items) {
    const criterion = criteriaMap.get(item.criterion_id);
    if (!criterion) continue;

    const itemScore = item.score;
    const weightedScore = itemScore * criterion.weight;
    
    // Lógica de Knockout evolucionada
    const failedKnockout = criterion.is_knockout && itemScore < reviewThreshold;
    const needsReview = criterion.is_knockout && itemScore >= reviewThreshold && itemScore < knockoutThreshold;
    
    if (failedKnockout) {
      knockoutFailed = true;
      knockoutReason = `Critical failure: "${criterion.name}" (${itemScore} is below minimum safety threshold of ${reviewThreshold})`;
    } else if (needsReview) {
      requiresManualReview = true;
      knockoutReason = `Manual review required: "${criterion.name}" is in the gray zone (${itemScore}/${knockoutThreshold})`;
    }

    // Seguimiento de documentación
    if (criterion.requires_doc) {
      totalDocsRequired++;
      if (!item.has_documentation) {
        missingDocsCount++;
      }
    }

    totalWeightedScore += weightedScore;
    totalWeight += criterion.weight;

    weightedScores.push({
      criterion_id: item.criterion_id,
      score: itemScore,
      weight: criterion.weight,
      weightedScore,
      is_knockout: criterion.is_knockout,
      failed_knockout: failedKnockout,
      needs_review: needsReview
    });
  }

  // FASE 2: Cálculo de Score de Capacidad (Base)
  let baseScore = totalWeight > 0
    ? Math.round((totalWeightedScore / totalWeight))
    : 0;

  // FASE 3: Score de Confianza (Evidencia)
  // Calculamos qué porcentaje de la documentación requerida fue entregada
  const confidenceScore = totalDocsRequired > 0 
    ? Math.round(((totalDocsRequired - missingDocsCount) / totalDocsRequired) * 100)
    : 100;

  // FASE 4: Penalización moderada por falta de docs (Máximo 15 puntos)
  const docPenalty = Math.min(missingDocsCount * docPenaltyPerMissing, maxDocPenalty);
  const finalScore = Math.max(0, baseScore - docPenalty);

  // FASE 5: Determinación de Status
  let status: EvaluationStatus;
  
  if (knockoutFailed) {
    status = 'red';
  } else if (requiresManualReview) {
    status = 'yellow'; // Pasa a amarillo para revisión manual aunque el score sea alto
  } else {
    status = calculateStatus(finalScore);
  }

  return {
    totalScore: finalScore,
    status,
    knockoutFailed,
    knockoutReason,
    requiresManualReview,
    confidenceScore,
    missingDocsPenalty: docPenalty,
    weightedScores,
  };
}

export function calculateStatus(score: number): EvaluationStatus {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

export function getStatusColor(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'bg-emerald-500';
    case 'yellow': return 'bg-amber-500';
    case 'red': return 'bg-red-500';
  }
}

export function getStatusLabel(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'Approved';
    case 'yellow': return 'Conditional / Review';
    case 'red': return 'Not Approved';
  }
}

// ... mantener las funciones auxiliares de UI existentes
export function getStatusBgColor(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'bg-emerald-50';
    case 'yellow': return 'bg-amber-50';
    case 'red': return 'bg-red-50';
  }
}

export function getStatusTextColor(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'text-emerald-600';
    case 'yellow': return 'text-amber-600';
    case 'red': return 'text-red-600';
  }
}

export function responseToScore(response: 'yes' | 'no' | 'partial'): number {
  switch (response) {
    case 'yes': return 100;
    case 'partial': return 50;
    case 'no': return 0;
    default: return 0;
  }
}
