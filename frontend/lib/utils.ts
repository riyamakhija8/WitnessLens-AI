import type { JsonRecord } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function getWitnessLabel(facts: JsonRecord, fallback: string) {
  const candidate =
    facts.witness_id ??
    facts.witness ??
    facts.witness_name ??
    facts.name ??
    facts.id;

  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : fallback;
}

export function extractFactsPayload(input: unknown): JsonRecord | null {
  if (!isRecord(input)) {
    return null;
  }

  if (isRecord(input.ai_facts) && !("error" in input.ai_facts)) {
    return input.ai_facts;
  }

  if (isRecord(input.facts)) {
    return input.facts;
  }

  return input;
}

export function loadClientState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveClientState<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
