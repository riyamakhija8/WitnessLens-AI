export type JsonRecord = Record<string, unknown>;

export type UploadResponse = {
  filename: string;
  characters: number;
  entities: JsonRecord;
  facts: JsonRecord;
  ai_facts: JsonRecord;
  preview: string;
};

export type StoredWitness = {
  id: string;
  label: string;
  source: string;
  createdAt: string;
  facts: JsonRecord;
};

export type Agreement = {
  type: string;
  field: string;
  value: string;
  witnesses: string[];
  support_count?: number;
};

export type ContradictionValue = {
  value: string;
  witnesses: string[];
};

export type Contradiction = {
  type: string;
  field: string;
  description: string;
  explanation?: string;
  values: ContradictionValue[];
};

export type ComparisonResponse = {
  agreements: Agreement[];
  contradictions: Contradiction[];
  consistency_score: number;
};

export type TimelineItem = {
  sequence_number: number;
  time: string;
  normalized_time: string;
  witnesses: string[];
  events: string[];
  locations: string[];
  actors: string[];
  objects: string[];
  confidence: number;
};

export type TimelineResponse = {
  timeline: TimelineItem[];
  undated_events: JsonRecord[];
};

export type WitnessReliabilityScore = {
  witness: string;
  reliability_score: number;
  populated_fields: string[];
  agreement_count: number;
  contradiction_count: number;
  uncertainty_count: number;
  assessment: "high" | "moderate" | "low" | "critical" | string;
};

export type ReliabilityResponse = {
  witness_scores: WitnessReliabilityScore[];
  overall_reliability_score: number;
  consistency_score: number;
};
