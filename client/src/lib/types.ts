
export type SiteStatus = "Pending" | "TokenSent" | "InProcess" | "Completed" | "Approved" | "Rejected" | "ToConsider";

export interface Site {
  id: string;
  contactName: string;
  email: string;
  description: string;
  status: SiteStatus;
  token?: string;
  password?: string;
  registeredAt: string;
  updatedAt?: string; // Last update timestamp
  evaluatedAt?: string;
  evaluatedBy?: string; // Admin name
  score?: number; // 0-100
  answers: Record<string, Answer>;
  location?: string;
  code?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
}

export interface Answer {
  questionId: string;
  value: "Yes" | "No" | "NA" | string;
  scoreContribution: number;
  attachment?: {
    name: string;
    type: string;
    size?: number;
    url?: string;
  };
}

export interface Question {
  id: string;
  text: string;
  type: "YesNo" | "Text" | "Select";
  category: string;
  weight: number; // For weighted scoring
  isKnockOut?: boolean; // If failed, auto-reject
  enabled?: boolean;
  keywords?: string[]; // Keywords for scoring text answers
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "site";
  siteId?: string;
}
