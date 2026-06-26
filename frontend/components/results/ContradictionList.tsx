import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Contradiction } from "@/lib/types";

export function ContradictionList({
  contradictions
}: {
  contradictions: Contradiction[];
}) {
  if (contradictions.length === 0) {
    return (
      <EmptyState
        description="No conflicting testimony signals were found in this run."
        icon={AlertTriangle}
        title="No contradictions found"
      />
    );
  }

  return (
    <div className="space-y-3">
      {contradictions.map((contradiction, index) => (
        <div
          className="rounded-lg border border-rose-500/20 bg-rose-500/8 p-4"
          key={`${contradiction.field}-${index}`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-950 dark:text-white">
                {contradiction.description}
              </p>
              {contradiction.explanation && (
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  {contradiction.explanation}
                </p>
              )}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {contradiction.values.map((value) => (
                  <div
                    className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-950"
                    key={`${value.value}-${value.witnesses.join("-")}`}
                  >
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {value.value}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {value.witnesses.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
