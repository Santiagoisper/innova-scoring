import { Question } from "./types";

export const QUESTIONS: Question[] = [
  // Knock Out Questions
  {
    id: "ko1",
    text: "Does the site have a dedicated secure storage area for investigational products (IP) with restricted access?",
    type: "YesNo",
    category: "Facilities",
    weight: 0,
    isKnockOut: true
  },
  {
    id: "ko2",
    text: "Has the Principal Investigator ever been debarred by a regulatory authority (e.g., FDA, EMA)?",
    type: "YesNo",
    category: "Personnel",
    weight: 0,
    isKnockOut: true
  },
  
  // Scored Questions - Facilities (30%)
  {
    id: "f1",
    text: "Does the site have temperature-controlled storage (2-8°C) with continuous monitoring and alarm systems?",
    type: "YesNo",
    category: "Facilities",
    weight: 10
  },
  {
    id: "f2",
    text: "Is there a backup power generator for critical equipment?",
    type: "YesNo",
    category: "Facilities",
    weight: 10
  },
  {
    id: "f3",
    text: "Does the site have a dedicated area for monitoring visits with internet access?",
    type: "YesNo",
    category: "Facilities",
    weight: 5
  },

  // Scored Questions - Experience (40%)
  {
    id: "e1",
    text: "Has the site conducted more than 5 clinical trials in the last 3 years?",
    type: "YesNo",
    category: "Experience",
    weight: 15
  },
  {
    id: "e2",
    text: "Does the site have experience with EDC (Electronic Data Capture) systems?",
    type: "YesNo",
    category: "Experience",
    weight: 10
  },
  {
    id: "e3",
    text: "Is the staff certified in GCP (Good Clinical Practice) within the last 2 years?",
    type: "YesNo",
    category: "Experience",
    weight: 15
  },

  // Scored Questions - Recruitment (30%)
  {
    id: "r1",
    text: "Does the site have a database of potential patients for this therapeutic area?",
    type: "YesNo",
    category: "Recruitment",
    weight: 15
  },
  {
    id: "r2",
    text: "Can the site guarantee a recruitment rate of at least 2 patients per month?",
    type: "YesNo",
    category: "Recruitment",
    weight: 10
  },

  // Open Ended
  {
    id: "o1",
    text: "Please describe your site's standard operating procedure (SOP) for informed consent.",
    type: "Text",
    category: "Qualitative",
    weight: 0
  }
];

export function calculateScore(answers: Record<string, any>): { score: number, isKnockOut: boolean } {
  let totalWeight = 0;
  let earnedScore = 0;
  let isKnockOut = false;

  QUESTIONS.forEach(q => {
    const answer = answers[q.id];
    
    // Check Knock Out
    if (q.isKnockOut) {
      if (q.id === "ko1" && answer === "No") isKnockOut = true;
      if (q.id === "ko2" && answer === "Yes") isKnockOut = true;
    }

    // Calculate Score
    if (q.weight > 0 && answer === "Yes") {
      earnedScore += q.weight;
    }
    
    if (q.weight > 0) {
      totalWeight += q.weight;
    }
  });

  const finalScore = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 0;
  return { score: Math.round(finalScore), isKnockOut };
}
