export interface Vacancy {
  title: string;
  company: string;
  compatPercent: number;
  rationale: string;
  additionalSkillsRequired: string[];
  url: string;
}

export interface Milestone {
  stage: string;
  focus: string;
  actionPlan: string;
}

export interface AnalysisData {
  profileSummary: string;
  keyStrengths: string[];
  vacancies: Vacancy[];
  strategicDecomposition: Milestone[];
  fullReportMarkdown: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}
