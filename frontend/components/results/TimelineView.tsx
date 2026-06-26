import { Clock3 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { TimelineItem } from "@/lib/types";

export function TimelineView({ timeline }: { timeline: TimelineItem[] }) {
  if (timeline.length === 0) {
    return (
      <EmptyState
        description="No timestamped events were available for timeline reconstruction."
        icon={Clock3}
        title="No timeline events"
      />
    );
  }

  return (
    <div className="relative space-y-4">
      <div className="absolute left-4 top-2 hidden h-[calc(100%-1rem)] w-px bg-zinc-200 dark:bg-white/10 sm:block" />
      {timeline.map((item) => (
        <article className="relative sm:pl-12" key={`${item.sequence_number}-${item.time}`}>
          <div className="absolute left-0 top-4 hidden h-8 w-8 place-items-center rounded-lg bg-cyan-500 text-zinc-950 sm:grid">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-950/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                  {item.time}
                </p>
                <h3 className="mt-1 text-base font-semibold text-zinc-950 dark:text-white">
                  {item.events.join("; ") || "Event recorded"}
                </h3>
              </div>
              <span className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 dark:border-white/10 dark:text-zinc-300">
                Step {item.sequence_number}
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <FactGroup label="Witnesses" values={item.witnesses} />
              <FactGroup label="Locations" values={item.locations} />
              <FactGroup label="Objects" values={item.objects} />
            </div>
            <div className="mt-4">
              <ProgressBar label="Timeline confidence" tone="cyan" value={item.confidence} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function FactGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
        {values.length ? values.join(", ") : "Not specified"}
      </p>
    </div>
  );
}
