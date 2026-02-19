import { describe, expect, it } from "vitest";
import { classificarSitio, DEFAULT_SCORING_CONFIG, starFactor } from "./questions";

describe("starFactor", () => {
  it("maps stars to scoring multipliers", () => {
    expect(starFactor(1)).toBe(0);
    expect(starFactor(3)).toBe(1);
    expect(starFactor(5)).toBe(1.2);
  });
});

describe("classificarSitio", () => {
  it("classifies a strong site as approved", () => {
    const preguntas = [
      { pesoPregunta: 5, stars: 4, categoria: "Quality Management", isKO: false },
      { pesoPregunta: 5, stars: 4, categoria: "Patient Safety", isKO: false },
      { pesoPregunta: 4, stars: 4, categoria: "Staff", isKO: false },
      { pesoPregunta: 3, stars: 4, categoria: "Infrastructure", isKO: false },
    ];

    const result = classificarSitio(
      preguntas,
      ["Quality Management", "Patient Safety"],
      DEFAULT_SCORING_CONFIG.minimums.criticalCategory,
      DEFAULT_SCORING_CONFIG,
    );

    expect(result.classification).toBe("Sobresaliente");
    expect(result.knockOutReason).toBeUndefined();
  });

  it("rejects when quality minimum is not met", () => {
    const preguntas = [
      { pesoPregunta: 5, stars: 1, categoria: "Quality Management", isKO: false },
      { pesoPregunta: 5, stars: 4, categoria: "Staff", isKO: false },
    ];

    const result = classificarSitio(
      preguntas,
      ["Quality Management", "Patient Safety"],
      DEFAULT_SCORING_CONFIG.minimums.criticalCategory,
      DEFAULT_SCORING_CONFIG,
    );

    expect(result.classification).toBe("No Aprobado (Bloque critico)");
    expect(result.knockOutReason).toContain("Quality group below minimum");
  });
});
