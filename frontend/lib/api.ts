import { CLIENT_API_BASE_URL } from "@/lib/config";
import type {
  ComparisonResponse,
  JsonRecord,
  ReliabilityResponse,
  TimelineResponse,
  UploadResponse
} from "@/lib/types";

export async function uploadWitnessPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const payload = await requestJson<UploadResponse | { success: boolean; error?: string; details?: string }>("/upload", {
    method: "POST",
    body: formData
  });

  if (typeof payload === "object" && payload && "success" in payload && payload.success === false) {
    throw new Error(payload.details || payload.error || "Upload failed.");
  }

  return payload as UploadResponse;
}

export async function compareWitnesses(
  witnesses: JsonRecord[]
): Promise<ComparisonResponse> {
  return requestJson<ComparisonResponse>("/compare", {
    method: "POST",
    body: JSON.stringify({ witnesses })
  });
}

export async function reconstructTimeline(
  witnesses: JsonRecord[]
): Promise<TimelineResponse> {
  return requestJson<TimelineResponse>("/timeline", {
    method: "POST",
    body: JSON.stringify({ witnesses })
  });
}

export async function scoreReliability(
  witnesses: JsonRecord[]
): Promise<ReliabilityResponse> {
  return requestJson<ReliabilityResponse>("/reliability", {
    method: "POST",
    body: JSON.stringify({ witnesses })
  });
}

export async function generateReport(witnesses: JsonRecord[]): Promise<Blob> {
  const response = await fetch(`${CLIENT_API_BASE_URL}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ witnesses })
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  return response.blob();
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${CLIENT_API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  let payload: unknown = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(payload, response.status);
    throw new Error(message);
  }

  if (payload && typeof payload === "object" && "success" in payload && payload.success === false) {
    throw new Error(extractErrorMessage(payload, response.status));
  }

  return (payload ?? ({} as T)) as Promise<T>;
}

function extractErrorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === "object") {
    const record = payload as { detail?: string; error?: string; details?: string };
    if (record.detail) {
      return record.detail;
    }
    if (record.error) {
      return record.details ? `${record.error}: ${record.details}` : record.error;
    }
    if (record.details) {
      return record.details;
    }
  }

  return `Request failed with status ${status}`;
}
