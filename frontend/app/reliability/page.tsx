"use client";

import { useState } from "react";
import { Gauge, ShieldCheck } from "lucide-react";
import { ReliabilityCards } from "@/components/results/ReliabilityCards";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { WitnessWorkspace } from "@/components/witness/WitnessWorkspace";
import { useWitnessWorkspace } from "@/hooks/useWitnessWorkspace";
import { scoreReliability } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/config";
import type { ReliabilityResponse } from "@/lib/types";
import { saveClientState } from "@/lib/utils";

export default function ReliabilityPage() {
  const { facts } = useWitnessWorkspace();
  const [result, setResult] = useState<ReliabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runReliability() {
    setError("");

    if (facts.length < 1) {
      setError("Add at least one witness JSON payload.");
      return;
    }

    setLoading(true);
    try {
      const reliability = await scoreReliability(facts);
      setResult(reliability);
      saveClientState(STORAGE_KEYS.reliability, reliability);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Reliability scoring failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <WitnessWorkspace />
      <Panel
        action={
          <Button
            disabled={loading}
            icon={<Gauge className="h-4 w-4" />}
            onClick={runReliability}
          >
            {loading ? "Scoring..." : "Score Reliability"}
          </Button>
        }
        eyebrow="Credibility Signals"
        title="Reliability Analysis"
      >
        {error && (
          <p className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </p>
        )}
        {result ? (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <ScoreGauge
                  label="Overall Reliability"
                  tone="emerald"
                  value={result.overall_reliability_score}
                />
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <ScoreGauge
                  label="Consistency Context"
                  tone="cyan"
                  value={result.consistency_score}
                />
              </div>
            </div>
            <ReliabilityCards scores={result.witness_scores} />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300">
            <ShieldCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            Score witness reliability from completeness, corroboration, contradictions, and uncertainty.
          </div>
        )}
      </Panel>
    </div>
  );
}
