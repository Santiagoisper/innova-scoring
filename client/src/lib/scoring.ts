
import { z } from "zod";

// Define the schema for the scoring input
export const scoringSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  dni: z.string().min(6, "Valid ID/DNI is required"),
  age: z.number().min(18, "Must be at least 18").max(100),
  monthlyIncome: z.number().min(0, "Income must be positive"),
  monthlyExpenses: z.number().min(0, "Expenses must be positive"),
  employmentStatus: z.enum(["employed", "self-employed", "unemployed", "retired"]),
  loanAmount: z.number().min(100, "Minimum loan amount is 100"),
});

export type ScoringInput = z.infer<typeof scoringSchema>;

export interface ScoringResult {
  score: number; // 0-1000
  riskLevel: "Low" | "Medium" | "High";
  status: "Approved" | "Review" | "Rejected";
  maxLoanAmount: number;
  interestRate: number;
}

export function calculateScore(data: ScoringInput): ScoringResult {
  // Mock scoring logic based on simple rules
  let baseScore = 500;

  // Age factor
  if (data.age > 25 && data.age < 60) baseScore += 50;
  
  // Income/Expense ratio
  const disposableIncome = data.monthlyIncome - data.monthlyExpenses;
  const debtRatio = data.monthlyExpenses / (data.monthlyIncome || 1);

  if (debtRatio < 0.3) baseScore += 150;
  else if (debtRatio < 0.5) baseScore += 50;
  else baseScore -= 100;

  // Employment
  if (data.employmentStatus === "employed") baseScore += 100;
  if (data.employmentStatus === "self-employed") baseScore += 50;
  if (data.employmentStatus === "unemployed") baseScore -= 150;

  // Loan amount check
  if (data.loanAmount > disposableIncome * 12) baseScore -= 100;

  // Clamp score
  const score = Math.max(0, Math.min(1000, Math.round(baseScore)));

  // Determine risk and status
  let riskLevel: ScoringResult["riskLevel"] = "High";
  let status: ScoringResult["status"] = "Rejected";
  let interestRate = 15.0;

  if (score >= 700) {
    riskLevel = "Low";
    status = "Approved";
    interestRate = 5.5;
  } else if (score >= 500) {
    riskLevel = "Medium";
    status = "Review";
    interestRate = 9.8;
  }

  return {
    score,
    riskLevel,
    status,
    maxLoanAmount: disposableIncome * 24, // Approx 2 years of disposable income
    interestRate
  };
}
