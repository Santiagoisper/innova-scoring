export const QUESTIONS: Question[] = [
  // Infraestructura (34)
  {
    id: "inf1",
    text: "Does the site have access to local laboratories?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 3,
    enabled: true
  },
  {
    id: "inf2",
    text: "Do you have a functioning generator?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 3,
    enabled: true
  },
  {
    id: "inf3",
    text: "Do you have strict control over medical equipment calibrations (thermometers, scales, blood pressure monitors, others)?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 5
  },
  {
    id: "inf4",
    text: "Do you have documented management for the disposal of pathogenic waste (waste from procedures, laboratory, among others)?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 4
  },
  {
    id: "inf5",
    text: "Does the site have a pharmacy dedicated exclusively to clinical research for the preparation and dispensing of the Investigational Product (IP)? Will the IP storage be carried out in the pharmacy?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 2
  },
  {
    id: "inf6",
    text: "What equipment do you have for IP refrigeration? (e.g., Freezer -20°C to -30°C, -70°C to -80°C, -135°C)",
    type: "Text",
    category: "Infrastructure",
    weight: 2
  },
  {
    id: "inf7",
    text: "Describe what resources, equipment, and/or facilities the site has available for use in the study.",
    type: "Text",
    category: "Infrastructure",
    weight: 1
  },
  {
    id: "inf8",
    text: "Does the site have the capacity to send digital images for centralized review? Does the site have sufficient high-speed internet connectivity to operate electronic data capture (EDC) systems?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 1
  },
  {
    id: "inf9",
    text: "Does the site have 24-hour observation and/or overnight stay capacity available for clinical research?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 1
  },
  {
    id: "inf10",
    text: "Can the site offer afternoon, weekend, and/or holiday service hours for study visits, if required? Does the site have the capacity to administer medication during weekends for continuous dosing schedules?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 2
  },
  {
    id: "inf11",
    text: "Does the site have an automated and documented temperature monitoring system for the storage of biological samples?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 2
  },
  {
    id: "inf12",
    text: "How are source documents corresponding to clinical research archived and protected?",
    type: "Text",
    category: "Infrastructure",
    weight: 2
  },
  {
    id: "inf13",
    text: "Do you have a documented circuit for temperature control of each thermometer at the site? What type of thermometers do you use for recording?",
    type: "Text",
    category: "Infrastructure",
    weight: 2
  },
  {
    id: "inf14",
    text: "Do you have a laboratory for sample processing? In the case of being a provider, do you have an evaluation system?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 2
  },
  {
    id: "inf15",
    text: "Do you have a circuit designed for double-blind studies?",
    type: "YesNo",
    category: "Infrastructure",
    weight: 2
  },

  // Staff (12)
  {
    id: "stf1",
    text: "Does the site have enough properly trained staff to guarantee eCRF loading within 5 business days after the patient's visit?",
    type: "YesNo",
    category: "Staff",
    weight: 4
  },
  {
    id: "stf2",
    text: "Do you have specific staff for the following roles: PI, SI, SC, research nursing, data manager, contract manager, recruiters, others?",
    type: "Text",
    category: "Staff",
    weight: 2
  },
  {
    id: "stf3",
    text: "Is there any member of your team designated as responsible for the processing and shipment of biological samples?",
    type: "YesNo",
    category: "Staff",
    weight: 1
  },
  {
    id: "stf4",
    text: "Do you have a system for updating staff documentation? (CV, GCP, training)?",
    type: "YesNo",
    category: "Staff",
    weight: 1
  },
  {
    id: "stf5",
    text: "Do you have documented traceable initial and continuous training processes in clinical research?",
    type: "YesNo",
    category: "Staff",
    weight: 2
  },
  {
    id: "stf6",
    text: "Is there a clearly defined person responsible for on-site and remote monitoring?",
    type: "YesNo",
    category: "Staff",
    weight: 2
  },

  // Quality Management (20)
  {
    id: "qms1",
    text: "Are there written, current, versioned, and accessible SOPs for staff?",
    type: "YesNo",
    category: "Quality Management",
    weight: 5
  },
  {
    id: "qms2",
    text: "Does it have formal internal audit systems or a quality management system? Is there a documented and in-use CAPA system?",
    type: "YesNo",
    category: "Quality Management",
    weight: 4
  },
  {
    id: "qms3",
    text: "Does the center have ISO or other certifications?",
    type: "YesNo",
    category: "Quality Management",
    weight: 4
  },
  {
    id: "qms4",
    text: "Is there a formal record of errors in taking informed consent from the patient?",
    type: "YesNo",
    category: "Quality Management",
    weight: 2
  },
  {
    id: "qms5",
    text: "Does the center have ISO or other certifications?",
    type: "YesNo",
    category: "Quality Management",
    weight: 2
  },
  {
    id: "qms6",
    text: "Are screen failures and dropouts systematically recorded? And SF rate?",
    type: "Text",
    category: "Quality Management",
    weight: 2
  },
  {
    id: "qms7",
    text: "Do you have documentation of the major deviation rate of the center in the last year?",
    type: "YesNo",
    category: "Quality Management",
    weight: 1
  },

  // Technology (7)
  {
    id: "tech1",
    text: "Do you have an electronic medical record (EMR)?",
    type: "YesNo",
    category: "Technology",
    weight: 5
  },
  {
    id: "tech2",
    text: "In which technological systems do you have experience? (e.g., eConsent, eCOA, eISF, Medidata Rave, Oracle RDC, Veeva Vault)",
    type: "Text",
    category: "Technology",
    weight: 2
  },

  // Data Management (10)
  {
    id: "dm1",
    text: "Do you measure the average query resolution time (Queries Average TAT)?",
    type: "YesNo",
    category: "Data Management",
    weight: 4
  },
  {
    id: "dm2",
    text: "Is there a data transmission tracking/control system to the CRF?",
    type: "YesNo",
    category: "Data Management",
    weight: 5
  },
  {
    id: "dm3",
    text: "Is there documented follow-up of actions derived from monitoring (Follow up letter)?",
    type: "YesNo",
    category: "Data Management",
    weight: 1
  },

  // Patient Safety (12)
  {
    id: "safe1",
    text: "Is there an international safety system for medication-related SAEs?",
    type: "YesNo",
    category: "Patient Safety",
    weight: 4
  },
  {
    id: "safe2",
    text: "Does the site have a fully equipped and available emergency service (ER)?",
    type: "YesNo",
    category: "Patient Safety",
    weight: 3
  },
  {
    id: "safe3",
    text: "Do you have a system that ensures AEs and SAEs are reported in a timely manner?",
    type: "YesNo",
    category: "Patient Safety",
    weight: 5
  },

  // Scientific Reputation (11)
  {
    id: "rep1",
    text: "Do you have a history of external audits/inspections without critical findings in any of them?",
    type: "YesNo",
    category: "Scientific Reputation",
    weight: 5
  },
  {
    id: "rep2",
    text: "In which therapeutic specialties do you have experience with clinical trials?",
    type: "Text",
    category: "Scientific Reputation",
    weight: 2
  },
  {
    id: "rep3",
    text: "Does the center have verifiable experience in Phase I studies?",
    type: "YesNo",
    category: "Scientific Reputation",
    weight: 2
  },
  {
    id: "rep4",
    text: "Does the center have verifiable experience in Phase II–IV studies?",
    type: "YesNo",
    category: "Scientific Reputation",
    weight: 2
  },

  // IMP Management (4)
  {
    id: "imp1",
    text: "Does the site have a complete and traceable circuit for IMP handling?",
    type: "YesNo",
    category: "IMP Management",
    weight: 4
  },

  // Sponsor Relationship (10)
  {
    id: "rel1",
    text: "Does the site allow remote monitoring visits?",
    type: "YesNo",
    category: "Sponsor Relationship",
    weight: 4
  },
  {
    id: "rel2",
    text: "Does the site allow on-site monitoring visits?",
    type: "YesNo",
    category: "Sponsor Relationship",
    weight: 4
  },
  {
    id: "rel3",
    text: "Does the site grant study monitors direct and controlled access to the electronic medical record (EMR) for source data verification?",
    type: "YesNo",
    category: "Sponsor Relationship",
    weight: 2
  },

  // Patient Experience (3)
  {
    id: "pat1",
    text: "Does the center have systems for measuring customer satisfaction? (patient, sponsor)",
    type: "YesNo",
    category: "Patient Experience",
    weight: 1
  },
  {
    id: "pat2",
    text: "Is there a formal transfer management system that guarantees that the patient does not incur any economic expense?",
    type: "YesNo",
    category: "Patient Experience",
    weight: 2
  },

  // Start Up (10)
  {
    id: "start1",
    text: "What is the average total time from the first submission of documentation to final approval by the IEC/IRB? Do you use a local, central, or both IEC? Does your IEC have any extra requirements for the submission/approval of documents?",
    type: "Text",
    category: "Start Up",
    weight: 2
  },
  {
    id: "start2",
    text: "Does the site have the capacity to submit documentation to its Ethics Committee (IEC/IRB) prior to the signature/execution of the contract?",
    type: "YesNo",
    category: "Start Up",
    weight: 2
  },
  {
    id: "start3",
    text: "Does the composition of the IEC/IRB members comply with ICH-GCP requirements?",
    type: "YesNo",
    category: "Start Up",
    weight: 2
  },
  {
    id: "start4",
    text: "Is there a clearly defined person responsible for start-up management?",
    type: "YesNo",
    category: "Start Up",
    weight: 2
  },
  {
    id: "start5",
    text: "How is the comprehensive review of the protocol performed before the start (operational feasibility, vendors, required resources)?",
    type: "Text",
    category: "Start Up",
    weight: 2
  },

  // Recruitment (2)
  {
    id: "rec1",
    text: "What methods has the site used for recruiting patients for clinical research? Is the site willing to carry out active dissemination and promotion actions of the study towards other local sites and/or referral networks?",
    type: "Text",
    category: "Recruitment",
    weight: 2
  },

  // Post Study (2)
  {
    id: "post1",
    text: "Is the management of physical and digital archives post-study closure clearly defined? Is there a follow-up of SAEs once the study is concluded?",
    type: "YesNo",
    category: "Post Study",
    weight: 2
  }
];

import { Question } from "./types";

export type SiteClassification = "Sobresaliente" | "Aprobado" | "No Aprobado" | "No Aprobado (KO)" | "No Aprobado (Bloque critico)";

export interface ScoringResult {
  score: number;
  isKnockOut: boolean;
  categoryScores: Record<string, number>;
  groupScores: Record<string, number>;
  status: "Approved" | "Conditional" | "Rejected";
  classification: SiteClassification;
  knockOutReason?: string;
}

export function starFactor(stars: number): number {
  switch (stars) {
    case 1: return 0;
    case 2: return 0.5;
    case 3: return 1;
    case 4: return 1.1;
    case 5: return 1.2;
    default: return 0;
  }
}

export const CRITICAL_CATEGORIES = [
  "Quality Management",
  "Patient Safety",
];

const CRITICAL_CATEGORY_MINIMUM = 60;
const QUALITY_GROUP_MINIMUM = 65;
const STAFF_GROUP_MINIMUM = 60;
const CRITICAL_FAILURES_FOR_REJECTION = 2;

type ScoringGroup = "infrastructure" | "staff" | "quality" | "recruitment" | "systems";

const GROUP_WEIGHTS: Record<ScoringGroup, number> = {
  infrastructure: 25,
  staff: 20,
  quality: 30,
  recruitment: 10,
  systems: 15,
};

const SCORING_CONFIG_STORAGE_KEY = "innova-scoring-model-v1";

export interface ScoringModelConfig {
  groupWeights: Record<ScoringGroup, number>;
  minimums: {
    criticalCategory: number;
    qualityGroup: number;
    staffGroup: number;
    criticalFailuresForRejection: number;
  };
  thresholds: {
    excellent: number;
    approved: number;
  };
}

export const DEFAULT_SCORING_CONFIG: ScoringModelConfig = {
  groupWeights: GROUP_WEIGHTS,
  minimums: {
    criticalCategory: CRITICAL_CATEGORY_MINIMUM,
    qualityGroup: QUALITY_GROUP_MINIMUM,
    staffGroup: STAFF_GROUP_MINIMUM,
    criticalFailuresForRejection: CRITICAL_FAILURES_FOR_REJECTION,
  },
  thresholds: {
    excellent: 85,
    approved: 65,
  },
};

const CATEGORY_TO_GROUP: Record<string, ScoringGroup> = {
  Infrastructure: "infrastructure",
  Capacity: "infrastructure",
  "IMP Management": "infrastructure",
  "Start Up": "infrastructure",

  Staff: "staff",
  "Scientific Reputation": "staff",
  Experience: "staff",

  "Quality Management": "quality",
  "Patient Safety": "quality",
  "Post Study": "quality",

  Recruitment: "recruitment",
  "Patient Experience": "recruitment",

  Technology: "systems",
  "Data Management": "systems",
  "Sponsor Relationship": "systems",
  Regulatory: "systems",
};

function getStarsFromAnswer(answer: any, questionType: string): number | null {
  if (answer === undefined || answer === null || answer === "") {
    return null;
  }
  if (typeof answer === "number" && answer >= 1 && answer <= 5) {
    return answer;
  }
  if (typeof answer === "string") {
    const parsed = parseInt(answer, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) return parsed;
    if (answer === "Yes") return 3;
    if (answer === "No") return 1;
    if (answer === "NA" || answer === "N/A") return 3;
    if (questionType === "Text" && answer.trim().length > 5) return 3;
    if (questionType === "Text" && answer.trim().length === 0) return null;
  }
  return null;
}

function toSafeNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeScoringConfig(raw: Partial<ScoringModelConfig> | null | undefined): ScoringModelConfig {
  const groupWeights = {
    infrastructure: toSafeNumber(raw?.groupWeights?.infrastructure, DEFAULT_SCORING_CONFIG.groupWeights.infrastructure),
    staff: toSafeNumber(raw?.groupWeights?.staff, DEFAULT_SCORING_CONFIG.groupWeights.staff),
    quality: toSafeNumber(raw?.groupWeights?.quality, DEFAULT_SCORING_CONFIG.groupWeights.quality),
    recruitment: toSafeNumber(raw?.groupWeights?.recruitment, DEFAULT_SCORING_CONFIG.groupWeights.recruitment),
    systems: toSafeNumber(raw?.groupWeights?.systems, DEFAULT_SCORING_CONFIG.groupWeights.systems),
  };

  return {
    groupWeights,
    minimums: {
      criticalCategory: toSafeNumber(raw?.minimums?.criticalCategory, DEFAULT_SCORING_CONFIG.minimums.criticalCategory),
      qualityGroup: toSafeNumber(raw?.minimums?.qualityGroup, DEFAULT_SCORING_CONFIG.minimums.qualityGroup),
      staffGroup: toSafeNumber(raw?.minimums?.staffGroup, DEFAULT_SCORING_CONFIG.minimums.staffGroup),
      criticalFailuresForRejection: Math.max(
        1,
        Math.round(
          toSafeNumber(
            raw?.minimums?.criticalFailuresForRejection,
            DEFAULT_SCORING_CONFIG.minimums.criticalFailuresForRejection
          )
        )
      ),
    },
    thresholds: {
      excellent: toSafeNumber(raw?.thresholds?.excellent, DEFAULT_SCORING_CONFIG.thresholds.excellent),
      approved: toSafeNumber(raw?.thresholds?.approved, DEFAULT_SCORING_CONFIG.thresholds.approved),
    },
  };
}

export function loadScoringModelConfig(): ScoringModelConfig {
  if (typeof window === "undefined") return DEFAULT_SCORING_CONFIG;
  const raw = window.localStorage.getItem(SCORING_CONFIG_STORAGE_KEY);
  if (!raw) return DEFAULT_SCORING_CONFIG;

  try {
    return normalizeScoringConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_SCORING_CONFIG;
  }
}

export function saveScoringModelConfig(config: ScoringModelConfig): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeScoringConfig(config);
  window.localStorage.setItem(SCORING_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
}

function getGroupForCategory(category: string): ScoringGroup {
  return CATEGORY_TO_GROUP[category] || "systems";
}

function calcularCategoryScores(
  preguntas: Array<{ pesoPregunta: number; stars: number; categoria: string }>
): Record<string, number> {
  const catData: Record<string, { num: number; den: number }> = {};

  preguntas.forEach((p) => {
    if (!catData[p.categoria]) {
      catData[p.categoria] = { num: 0, den: 0 };
    }
    catData[p.categoria].num += p.pesoPregunta * starFactor(p.stars);
    catData[p.categoria].den += p.pesoPregunta;
  });

  const scores: Record<string, number> = {};
  Object.keys(catData).forEach((cat) => {
    const { num, den } = catData[cat];
    scores[cat] = den > 0 ? (num / den) * 100 : 0;
  });
  return scores;
}

function calcularGroupScores(
  preguntas: Array<{ pesoPregunta: number; stars: number; categoria: string }>
): Record<string, number> {
  const groupData: Record<ScoringGroup, { num: number; den: number }> = {
    infrastructure: { num: 0, den: 0 },
    staff: { num: 0, den: 0 },
    quality: { num: 0, den: 0 },
    recruitment: { num: 0, den: 0 },
    systems: { num: 0, den: 0 },
  };

  preguntas.forEach((p) => {
    const group = getGroupForCategory(p.categoria);
    groupData[group].num += p.pesoPregunta * starFactor(p.stars);
    groupData[group].den += p.pesoPregunta;
  });

  const scores: Record<string, number> = {};
  (Object.keys(groupData) as ScoringGroup[]).forEach((group) => {
    const { num, den } = groupData[group];
    scores[group] = den > 0 ? (num / den) * 100 : 0;
  });

  return scores;
}

function calcularScoreGlobalPorGrupos(
  groupScores: Record<string, number>,
  preguntas: Array<{ categoria: string }>,
  groupWeights: Record<ScoringGroup, number>
): number {
  const presentGroups = new Set<ScoringGroup>();
  preguntas.forEach((p) => presentGroups.add(getGroupForCategory(p.categoria)));

  const totalWeight = Array.from(presentGroups).reduce(
    (sum, group) => sum + groupWeights[group],
    0
  );
  if (totalWeight === 0) return 0;

  const weightedScore = Array.from(presentGroups).reduce(
    (sum, group) => sum + (groupScores[group] || 0) * groupWeights[group],
    0
  );

  return weightedScore / totalWeight;
}

export function classificarSitio(
  preguntas: Array<{ pesoPregunta: number; stars: number; categoria: string; isKO?: boolean }>,
  categoriasCriticas: string[] = CRITICAL_CATEGORIES,
  minimoCritico: number = CRITICAL_CATEGORY_MINIMUM,
  config: ScoringModelConfig = DEFAULT_SCORING_CONFIG
): {
  classification: SiteClassification;
  scoreGlobal: number;
  categoryScores: Record<string, number>;
  groupScores: Record<string, number>;
  knockOutReason?: string;
} {
  const categoryScores = calcularCategoryScores(preguntas);
  const groupScores = calcularGroupScores(preguntas);
  const scoreGlobal = calcularScoreGlobalPorGrupos(groupScores, preguntas, config.groupWeights);

  const criticalFailures = preguntas.filter((p) => p.isKO && p.stars <= 2).length;

  if (criticalFailures >= config.minimums.criticalFailuresForRejection) {
    return {
      classification: "No Aprobado (Bloque critico)",
      scoreGlobal,
      categoryScores,
      groupScores,
      knockOutReason: `Critical questions failed: ${criticalFailures}`,
    };
  }

  if ((groupScores.quality ?? 0) < config.minimums.qualityGroup) {
    return {
      classification: "No Aprobado (Bloque critico)",
      scoreGlobal,
      categoryScores,
      groupScores,
      knockOutReason: `Quality group below minimum (${Math.round(groupScores.quality ?? 0)}% < ${config.minimums.qualityGroup}%)`,
    };
  }

  if ((groupScores.staff ?? 0) < config.minimums.staffGroup) {
    return {
      classification: "No Aprobado (Bloque critico)",
      scoreGlobal,
      categoryScores,
      groupScores,
      knockOutReason: `Staff group below minimum (${Math.round(groupScores.staff ?? 0)}% < ${config.minimums.staffGroup}%)`,
    };
  }

  for (const cat of categoriasCriticas) {
    if (cat in categoryScores && categoryScores[cat] < minimoCritico) {
      return {
        classification: "No Aprobado (Bloque critico)",
        scoreGlobal,
        categoryScores,
        groupScores,
        knockOutReason: `Critical category "${cat}" scored ${Math.round(categoryScores[cat])}% (minimum: ${minimoCritico}%)`,
      };
    }
  }

  let classification: SiteClassification;
  if (scoreGlobal >= config.thresholds.excellent) {
    classification = "Sobresaliente";
  } else if (scoreGlobal >= config.thresholds.approved) {
    classification = "Aprobado";
  } else {
    classification = "No Aprobado";
  }

  if (criticalFailures > 0 && classification === "Sobresaliente") {
    classification = "Aprobado";
  }

  return {
    classification,
    scoreGlobal,
    categoryScores,
    groupScores,
    knockOutReason: criticalFailures > 0 ? `Critical questions failed: ${criticalFailures}` : undefined,
  };
}

export function calculateScore(
  answers: Record<string, any>,
  questions: Question[] = QUESTIONS,
  configOverride?: ScoringModelConfig
): ScoringResult {
  const activeQuestions = questions.filter((q) => q.enabled !== false);
  const scoringConfig = configOverride ? normalizeScoringConfig(configOverride) : loadScoringModelConfig();

  const preguntas: Array<{ pesoPregunta: number; stars: number; categoria: string; isKO: boolean }> = [];

  activeQuestions.forEach((q) => {
    const answerEntry = answers[q.id];
    let answer = answerEntry;
    if (typeof answerEntry === "object" && answerEntry !== null && "value" in answerEntry) {
      answer = answerEntry.value;
    }
    const stars = getStarsFromAnswer(answer, q.type);
    if (stars !== null) {
      preguntas.push({
        pesoPregunta: q.weight,
        stars,
        categoria: q.category,
        isKO: q.isKnockOut ?? false,
      });
    }
  });

  const { classification, scoreGlobal, categoryScores, groupScores, knockOutReason } = classificarSitio(
    preguntas,
    CRITICAL_CATEGORIES,
    scoringConfig.minimums.criticalCategory,
    scoringConfig
  );

  const isKnockOut = classification === "No Aprobado (KO)" || classification === "No Aprobado (Bloque critico)";

  let status: "Approved" | "Conditional" | "Rejected";
  if (isKnockOut || classification === "No Aprobado") {
    status = "Rejected";
  } else if (classification === "Sobresaliente") {
    status = "Approved";
  } else {
    status = "Conditional";
  }

  return {
    score: Math.round(scoreGlobal),
    isKnockOut,
    categoryScores,
    groupScores,
    status,
    classification,
    knockOutReason,
  };
}
