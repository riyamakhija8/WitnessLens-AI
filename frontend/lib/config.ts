export const BACKEND_API_URL =
  process.env.WITNESSLENS_API_URL ??
  process.env.NEXT_PUBLIC_WITNESSLENS_API_URL ??
  "http://127.0.0.1:8000";

export const CLIENT_API_BASE_URL = "/api/backend";

export const STORAGE_KEYS = {
  witnesses: "witnesslens.witnesses.v1",
  comparison: "witnesslens.lastComparison.v1",
  reliability: "witnesslens.lastReliability.v1",
  timeline: "witnesslens.lastTimeline.v1"
} as const;
