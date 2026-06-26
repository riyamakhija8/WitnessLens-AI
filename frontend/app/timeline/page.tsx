"use client";

import { useState } from "react";
import { BarChart3, Clock3 } from "lucide-react";
import { TimelineView } from "@/components/results/TimelineView";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { WitnessWorkspace } from "@/components/witness/WitnessWorkspace";
import { useWitnessWorkspace } from "@/hooks/useWitnessWorkspace";
import { reconstructTimeline } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/config";
import type { TimelineResponse } from "@/lib/types";
import { saveClientState } from "@/lib/utils";

export default function TimelinePage() {
  const { facts } = useWitnessWorkspace();
  const [result, setResult] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runTimeline() {
    setError("");

    if (facts.length < 1) {
      setError("Add at least one witness JSON payload.");
      return;
    }

    setLoading(true);
    try {
      const timeline = await reconstructTimeline(facts);
      setResult(timeline);
      saveClientState(STORAGE_KEYS.timeline, timeline);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Timeline reconstruction failed.");
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
            icon={<BarChart3 className="h-4 w-4" />}
            onClick={runTimeline}
          >
            {loading ? "Reconstructing..." : "Build Timeline"}
          </Button>
        }
        eyebrow="Chronology"
        title="Timeline Analysis"
      >
        {error && (
          <p className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </p>
        )}
        {result ? (
          <TimelineView timeline={result.timeline} />
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300">
            <Clock3 className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            Build a chronological event chain from witness time, action, location, actor, and object facts.
          </div>
        )}
      </Panel>
    </div>
  );
}
