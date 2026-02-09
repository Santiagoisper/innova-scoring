export const QUESTIONS: any[] = [
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

export interface ScoringResult {
  score: number;
  isKnockOut: boolean;
  requiresManualReview: boolean; 
  confidenceScore: number;       
  categoryScores: Record<string, number>;
  status: "Approved" | "Conditional" | "Rejected";
}

export function calculateScore(answers: Record<string, any>, questions: any[] = QUESTIONS): ScoringResult {
  const categoryData: Record<string, { totalWeight: number; earnedWeight: number }> = {};
  let totalWeight = 0;
  let earnedScore = 0;
  let isKnockOut = false;
  let requiresManualReview = false; 
  
  let totalDocsRequired = 0;
  let docsProvided = 0;

  const activeQuestions = questions.filter(q => q.enabled !== false);

  activeQuestions.forEach(q => {
    if (!categoryData[q.category]) {
      categoryData[q.category] = { totalWeight: 0, earnedWeight: 0 };
    }
  });

  activeQuestions.forEach(q => {
    const answerEntry = answers[q.id];
    let answer = answerEntry;
    let hasAttachment = false;
    
    if (typeof answerEntry === 'object' && answerEntry !== null) {
      answer = answerEntry.value;
      hasAttachment = !!(answerEntry.attachment && answerEntry.attachment.length > 0);
    }

    if (q.isKnockOut || q.weight >= 4) { 
      totalDocsRequired++;
      if (hasAttachment) docsProvided++;
    }
    
    if (q.isKnockOut && answer === "No") {
       if (q.category === "Quality Management" || q.category === "Patient Safety") {
         isKnockOut = true; 
       } else {
         requiresManualReview = true; 
       }
    }

    if (q.weight > 0) {
      categoryData[q.category].totalWeight += q.weight;
      totalWeight += q.weight;

      if (answer === "Yes") {
        earnedScore += q.weight;
        categoryData[q.category].earnedWeight += q.weight;
      }
      else if (q.type === "Text" && typeof answer === "string" && answer.trim().length > 5) {
        earnedScore += q.weight;
        categoryData[q.category].earnedWeight += q.weight;
      }
    }
  });

  const confidenceScore = totalDocsRequired > 0 ? Math.round((docsProvided / totalDocsRequired) * 100) : 100;

  const categoryScores: Record<string, number> = {};
  Object.keys(categoryData).forEach(cat => {
    const { totalWeight, earnedWeight } = categoryData[cat];
    categoryScores[cat] = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
    
    if ((cat === "Quality Management" || cat === "Patient Safety") && categoryScores[cat] < 50) {
      isKnockOut = true;
    } else if ((cat === "Quality Management" || cat === "Patient Safety") && categoryScores[cat] < 60) {
      requiresManualReview = true;
    }
  });

  const finalScore = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 0;
  
  let status: "Approved" | "Conditional" | "Rejected" = "Rejected";
  
  if (isKnockOut) {
    status = "Rejected";
  } else if (requiresManualReview || (finalScore >= 60 && finalScore < 80)) {
    status = "Conditional";
  } else if (finalScore >= 80) {
    status = "Approved";
  } else {
    status = "Rejected";
  }

  return { 
    score: Math.round(finalScore), 
    isKnockOut,
    requiresManualReview,
    confidenceScore,
    categoryScores,
    status
  };
}
