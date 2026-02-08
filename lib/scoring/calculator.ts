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
  const criteriaMap = new Map(criteria.map(c => [String(c.id), c]))

  let totalWeightedScore = 0
  const totalPossibleWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)

  const weightedScores: ScoringResult['weightedScores'] = []

  for (const item of items) {
    const criterion = criteriaMap.get(String(item.criterion_id))
    if (!criterion) continue

    const weight = Number(criterion.weight) || 0
    const weightedScore = item.score * weight
    totalWeightedScore += weightedScore

    weightedScores.push({
      criterion_id: String(item.criterion_id),
      score: item.score,
      weight,
      weightedScore,
    })
  }

  const totalScore = totalPossibleWeight > 0
    ? Math.round((totalWeightedScore / totalPossibleWeight) * 100) / 100
    : 0

  return {
    totalScore,
    status: calculateStatus(totalScore),
    weightedScores,
  }
}

export function calculateStatus(score: number): EvaluationStatus {
  if (score >= 80) return 'green'
  if (score >= 60) return 'yellow'
  return 'red'
}

export function getStatusColor(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'bg-emerald-500'
    case 'yellow': return 'bg-amber-500'
    case 'red': return 'bg-red-500'
  }
}

export function getStatusLabel(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'Approved'
    case 'yellow': return 'Conditional'
    case 'red': return 'Not Approved'
  }
}

export function getStatusBgColor(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'bg-emerald-50'
    case 'yellow': return 'bg-amber-50'
    case 'red': return 'bg-red-50'
  }
}

export function getStatusTextColor(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'text-emerald-600'
    case 'yellow': return 'text-amber-600'
    case 'red': return 'text-red-600'
  }
}
