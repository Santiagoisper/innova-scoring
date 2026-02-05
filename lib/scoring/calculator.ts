import { Criterion, EvaluationStatus } from '@/types'

export interface ScoringInput {
  criterion_id: string;
  score: number;
}

export interface ScoringResult {
  totalScore: number;
  status: EvaluationStatus;
  weightedScores: {
    criterion_id: string;
    score: number;
    weight: number;
    weightedScore: number;
  }[];
}

export function calculateWeightedScore(
  items: ScoringInput[],
  criteria: Criterion[]
): ScoringResult {
  const criteriaMap = new Map(criteria.map(c => [c.id, c]));

  let totalWeightedScore = 0;
  let totalWeight = 0;
  const weightedScores: ScoringResult['weightedScores'] = [];

  for (const item of items) {
    const criterion = criteriaMap.get(item.criterion_id);
    if (!criterion) continue;

    const weightedScore = item.score * criterion.weight;
    totalWeightedScore += weightedScore;
    totalWeight += criterion.weight;

    weightedScores.push({
      criterion_id: item.criterion_id,
      score: item.score,
      weight: criterion.weight,
      weightedScore,
    });
  }

  const totalScore = totalWeight > 0
    ? Math.round((totalWeightedScore / totalWeight) * 100) / 100
    : 0;

  return {
    totalScore,
    status: calculateStatus(totalScore),
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
