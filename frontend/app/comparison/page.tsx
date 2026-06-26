"use client";

import { useState } from "react";
import { GitCompareArrows, Radar } from "lucide-react";
import { AgreementList } from "@/components/results/AgreementList";
import { ContradictionList } from "@/components/results/ContradictionList";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { WitnessWorkspace } from "@/components/witness/WitnessWorkspace";
import { useWitnessWorkspace } from "@/hooks/useWitnessWorkspace";
import { compareWitnesses } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/config";
import type { ComparisonResponse } from "@/lib/types";
import { saveClientState } from "@/lib/utils";

export default function ComparisonPage() {
  const { facts } = useWitnessWorkspace();
  const [result, setResult] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runComparison() {
    setError("");

    if (facts.length < 2) {
      setError("Add at least two witness JSON payloads.");
      return;
    }

    setLoading(true);
    try {
      const comparison = await compareWitnesses(facts);
      setResult(comparison);
      saveClientState(STORAGE_KEYS.comparison, comparison);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <WitnessWorkspace minimum={2} />
      <Panel
        action={
          <Button
            disabled={loading}
            icon={<GitCompareArrows className="h-4 w-4" />}
            onClick={runComparison}
          >
            {loading ? "Comparing..." : "Run Comparison"}
          </Button>
        }
        eyebrow="Multi-Witness Intelligence"
        title="Agreement and Contradiction Detection"
      >
        {error && (
          <p className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </p>
        )}
        {result ? (
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <ScoreGauge label="Consistency Score" tone="cyan" value={result.consistency_score} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Agreements">
                <AgreementList agreements={result.agreements} />
              </Panel>
              <Panel title="Contradictions">
                <ContradictionList contradictions={result.contradictions} />
              </Panel>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300">
            <Radar className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            Load witness payloads and run comparison to surface corroborated and conflicting testimony.
          </div>
        )}
      </Panel>
    </div>
  );
}
