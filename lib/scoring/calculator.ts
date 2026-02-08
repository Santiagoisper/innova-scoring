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
  missingDocsPenalty: number;
  weightedScores: {
    criterion_id: string;
    score: number;
    weight: number;
    weightedScore: number;
    is_knockout: boolean;
    failed_knockout: boolean;
  }[];
}

/**
 * MOTOR DE SCORING CON LÓGICA DE KNOCKOUT Y PENALIZACIONES
 * 
 * Reglas:
 * 1. Si un criterio is_knockout=true falla (score < threshold), resultado = RED (Not Approved)
 * 2. Penalización por falta de documentos requeridos
 * 3. Promedio ponderado solo si no hay knockouts
 */
export function calculateWeightedScore(
  items: ScoringInput[],
  criteria: Criterion[],
  config: {
    knockoutThreshold?: number; // Default: 50 (score < 50 = fallo)
    docPenaltyPerMissing?: number; // Default: -5 puntos por doc faltante
    maxDocPenalty?: number; // Default: -20 puntos máximo
  } = {}
): ScoringResult {
  const {
    knockoutThreshold = 50,
    docPenaltyPerMissing = 5,
    maxDocPenalty = 20
  } = config;

  const criteriaMap = new Map(criteria.map(c => [c.id, c]));
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let knockoutFailed = false;
  let knockoutReason: string | undefined;
  let missingDocsCount = 0;

  const weightedScores: ScoringResult['weightedScores'] = [];

  // FASE 1: Calcular scores y detectar knockouts
  for (const item of items) {
    const criterion = criteriaMap.get(item.criterion_id);
    if (!criterion) continue;

    const itemScore = item.score;
    const weightedScore = itemScore * criterion.weight;
    
    // Verificar knockout
    const failedKnockout = criterion.is_knockout && itemScore < knockoutThreshold;
    
    if (failedKnockout) {
      knockoutFailed = true;
      knockoutReason = `Critical criterion failed: "${criterion.name}" (score: ${itemScore}/${knockoutThreshold} required)`;
    }

    // Contar docs faltantes
    if (criterion.requires_doc && !item.has_documentation) {
      missingDocsCount++;
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
    });
  }

  // FASE 2: Calcular score base
  let baseScore = totalWeight > 0
    ? Math.round((totalWeightedScore / totalWeight))
    : 0;

  // FASE 3: Aplicar penalización por docs
  const docPenalty = Math.min(missingDocsCount * docPenaltyPerMissing, maxDocPenalty);
  const finalScore = Math.max(0, baseScore - docPenalty);

  // FASE 4: Determinar status
  let status: EvaluationStatus;
  
  if (knockoutFailed) {
    status = 'red'; // Automático RED si hay knockout
  } else {
    status = calculateStatus(finalScore);
  }

  return {
    totalScore: finalScore,
    status,
    knockoutFailed,
    knockoutReason,
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
    case 'yellow': return 'Conditional';
    case 'red': return 'Not Approved';
  }
}

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

/**
 * Convierte respuestas boolean a scores
 */
export function responseToScore(response: 'yes' | 'no' | 'partial'): number {
  switch (response) {
    case 'yes': return 100;
    case 'partial': return 50;
    case 'no': return 0;
    default: return 0;
  }
}
