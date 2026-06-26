import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { WitnessReliabilityScore } from "@/lib/types";

export function ReliabilityCards({
  scores
}: {
  scores: WitnessReliabilityScore[];
}) {
  if (scores.length === 0) {
    return (
      <EmptyState
        description="Run reliability analysis to score witness statements."
        icon={ShieldCheck}
        title="No reliability scores"
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {scores.map((score) => (
        <div
          className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-950/80"
          key={score.witness}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-zinc-950 dark:text-white">
                {score.witness}
              </h3>
              <p className="mt-1 text-sm capitalize text-zinc-500 dark:text-zinc-400">
                {score.assessment} reliability
              </p>
            </div>
            <span className="rounded-lg border border-zinc-200 px-3 py-1 text-sm font-semibold text-zinc-700 dark:border-white/10 dark:text-zinc-200">
              {score.reliability_score}
            </span>
          </div>
          <div className="mt-5">
            <ProgressBar
              label="Reliability score"
              tone={toneForScore(score.reliability_score)}
              value={score.reliability_score}
            />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Stat label="Agreements" value={score.agreement_count} />
            <Stat label="Conflicts" value={score.contradiction_count} />
            <Stat label="Uncertain" value={score.uncertainty_count} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {score.populated_fields.map((field) => (
              <span
                className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-white/5 dark:text-zinc-300"
                key={field}
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-white/5">
      <p className="text-lg font-semibold text-zinc-950 dark:text-white">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function toneForScore(score: number) {
  if (score >= 80) {
    return "emerald";
  }

  if (score >= 60) {
    return "cyan";
  }

  if (score >= 40) {
    return "amber";
  }

  return "rose";
}
