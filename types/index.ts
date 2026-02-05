export interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: string;
  order: number;
  created_at: string;
}

export interface Center {
  id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  public_token?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Evaluation {
  id: string;
  center_id: string;
  evaluator_id?: string;
  evaluator_email?: string;
  total_score: number;
  status: 'green' | 'yellow' | 'red';
  notes?: string;
  created_at: string;
  updated_at: string;
  center?: Center;
  items?: EvaluationItem[];
}

export interface EvaluationItem {
  id: string;
  evaluation_id: string;
  criterion_id: string;
  score: number;
  notes?: string;
  created_at: string;
  criterion?: Criterion;
}

export type EvaluationStatus = 'green' | 'yellow' | 'red';

export function calculateStatus(score: number): EvaluationStatus {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

export function getStatusLabel(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'Approved';
    case 'yellow': return 'Conditional';
    case 'red': return 'Not Approved';
  }
}

export function getStatusColor(status: EvaluationStatus): string {
  switch (status) {
    case 'green': return 'bg-emerald-500';
    case 'yellow': return 'bg-amber-500';
    case 'red': return 'bg-red-500';
  }
}
