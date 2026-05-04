export interface AnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  optimizedFullCv: {
    summary: string;
    experience: string;
    skills: string;
  };
  suggestions?: {
    before: string;
    after: string;
    explanation: string;
  }[];
}

export interface CvHistoryItem {
  id: number;
  originalFileName: string;
  matchScore: number | null;
  createdAt: string;
}

export interface ApiResponse<T = AnalysisResult> {
  data: T;
  message?: string;
}