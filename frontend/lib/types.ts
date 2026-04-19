export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type PredictionPayload = {
  age: number;
  bmi: number;
  glucose: number;
  blood_pressure: number;
  insulin: number;
  family_history: boolean;
};

export type PredictionResult = {
  risk_score: number;
  category: "low" | "medium" | "high";
  confidence: number;
  insights: string[];
  record_id?: string;
  created_at?: string;
};

export type ReportExtraction = {
  id?: string;
  glucose?: number | null;
  hba1c?: number | null;
  cholesterol?: number | null;
  raw_text: string;
  insights: string[];
  created_at?: string;
};

export type HealthRecord = {
  id: string;
  recorded_at: string;
  source: "prediction" | "report";
  risk_score: number;
  category: "low" | "medium" | "high";
  glucose: number | null;
  hba1c: number | null;
  cholesterol: number | null;
  bmi: number | null;
  blood_pressure: number | null;
  insulin: number | null;
  age: number | null;
  insights: string[];
};

export type DashboardSnapshot = {
  latest_prediction: PredictionResult | null;
  records: HealthRecord[];
  reports: ReportExtraction[];
};

export type HealthAssistantRole = "user" | "assistant";

export type HealthAssistantMessage = {
  role: HealthAssistantRole;
  content: string;
};

export type HealthAssistantResponse = {
  message: HealthAssistantMessage;
  context_summary: string[];
  model: string;
};
