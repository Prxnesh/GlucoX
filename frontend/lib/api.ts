import type {
  AuthResponse,
  ClearHistoryResult,
  DashboardSnapshot,
  HealthAssistantMessage,
  HealthAssistantResponse,
  PredictionPayload,
  PredictionResult,
  ReportExtraction,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: BodyInit | null;
  isFormData?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();

  if (!options.isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ?? null,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unexpected server error." }));
    throw new Error(error.detail ?? "Unexpected server error.");
  }

  return response.json() as Promise<T>;
}

export async function signup(payload: { name: string; email: string; password: string }) {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function predictRisk(token: string, payload: PredictionPayload) {
  return request<PredictionResult>("/predict", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function analyzeReport(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return request<ReportExtraction>("/reports/analyze", {
    method: "POST",
    token,
    body: formData,
    isFormData: true,
  });
}

export async function fetchDashboard(token: string) {
  return request<DashboardSnapshot>("/records/dashboard", {
    token,
  });
}

export async function clearDashboardHistory(token: string) {
  return request<ClearHistoryResult>("/records/history", {
    method: "DELETE",
    token,
  });
}

export async function askHealthAssistant(
  token: string,
  payload: {
    messages: HealthAssistantMessage[];
    lifestyle_profile: Record<string, string>;
  }
) {
  return request<HealthAssistantResponse>("/chat", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}
