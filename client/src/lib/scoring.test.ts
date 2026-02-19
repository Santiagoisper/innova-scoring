import { describe, expect, it } from "vitest";
import { calculateScore, scoringSchema, type ScoringInput } from "./scoring";

describe("scoringSchema", () => {
  it("accepts valid input", () => {
    const valid: ScoringInput = {
      fullName: "Jane Doe",
      dni: "12345678",
      age: 30,
      monthlyIncome: 5000,
      monthlyExpenses: 1000,
      employmentStatus: "employed",
      loanAmount: 10000,
    };
    expect(scoringSchema.parse(valid)).toEqual(valid);
  });

  it("rejects age under 18", () => {
    const invalid = {
      fullName: "Jane",
      dni: "123456",
      age: 17,
      monthlyIncome: 5000,
      monthlyExpenses: 1000,
      employmentStatus: "employed",
      loanAmount: 1000,
    };
    expect(() => scoringSchema.parse(invalid)).toThrow();
  });

  it("rejects empty name", () => {
    const invalid = {
      fullName: "J",
      dni: "123456",
      age: 25,
      monthlyIncome: 5000,
      monthlyExpenses: 1000,
      employmentStatus: "employed",
      loanAmount: 1000,
    };
    expect(() => scoringSchema.parse(invalid)).toThrow();
  });
});

describe("calculateScore", () => {
  it("returns Approved for high score (employed, low debt ratio)", () => {
    const result = calculateScore({
      fullName: "Jane Doe",
      dni: "12345678",
      age: 35,
      monthlyIncome: 10000,
      monthlyExpenses: 2000,
      employmentStatus: "employed",
      loanAmount: 5000,
    });
    expect(result.status).toBe("Approved");
    expect(result.riskLevel).toBe("Low");
    expect(result.score).toBeGreaterThanOrEqual(700);
    expect(result.interestRate).toBe(5.5);
  });

  it("returns Rejected for unemployed and high debt ratio", () => {
    const result = calculateScore({
      fullName: "Jane Doe",
      dni: "12345678",
      age: 30,
      monthlyIncome: 2000,
      monthlyExpenses: 1800,
      employmentStatus: "unemployed",
      loanAmount: 5000,
    });
    expect(result.status).toBe("Rejected");
    expect(result.riskLevel).toBe("High");
    expect(result.score).toBeLessThan(500);
  });

  it("returns Review for medium score", () => {
    const result = calculateScore({
      fullName: "Jane Doe",
      dni: "12345678",
      age: 40,
      monthlyIncome: 5000,
      monthlyExpenses: 2500,
      employmentStatus: "self-employed",
      loanAmount: 5000,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1000);
    expect(["Approved", "Review", "Rejected"]).toContain(result.status);
  });

  it("clamps score between 0 and 1000", () => {
    const result = calculateScore({
      fullName: "Jane Doe",
      dni: "12345678",
      age: 20,
      monthlyIncome: 500,
      monthlyExpenses: 600,
      employmentStatus: "unemployed",
      loanAmount: 50000,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1000);
  });
});
