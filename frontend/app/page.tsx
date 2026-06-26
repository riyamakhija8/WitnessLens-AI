"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Gauge,
  GitCompareArrows,
  Users
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { STORAGE_KEYS } from "@/lib/config";
import type { ComparisonResponse, ReliabilityResponse, StoredWitness } from "@/lib/types";
import { loadClientState } from "@/lib/utils";

export default function DashboardPage() {
  const [witnesses, setWitnesses] = useState<StoredWitness[]>([]);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [reliability, setReliability] = useState<ReliabilityResponse | null>(null);

  useEffect(() => {
    setWitnesses(loadClientState<StoredWitness[]>(STORAGE_KEYS.witnesses, []));
    setComparison(loadClientState<ComparisonResponse | null>(STORAGE_KEYS.comparison, null));
    setReliability(loadClientState<ReliabilityResponse | null>(STORAGE_KEYS.reliability, null));
  }, []);

  const metrics = useMemo(
    () => ({
      witnesses: witnesses.length,
      agreements: comparison?.agreements.length ?? 0,
      contradictions: comparison?.contradictions.length ?? 0,
      reliability: reliability?.overall_reliability_score ?? 0,
      consistency: comparison?.consistency_score ?? 0
    }),
    [comparison, reliability, witnesses.length]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          caption="Loaded in local case workspace"
          icon={Users}
          label="Total Witnesses"
          tone="cyan"
          value={metrics.witnesses}
        />
        <MetricCard
          caption="Corroborated facts from comparison"
          icon={CheckCircle2}
          label="Agreements"
          tone="emerald"
          value={metrics.agreements}
        />
        <MetricCard
          caption="Conflicting testimony signals"
          icon={AlertTriangle}
          label="Contradictions"
          tone="rose"
          value={metrics.contradictions}
        />
        <MetricCard
          caption="Overall witness reliability"
          icon={Gauge}
          label="Reliability Score"
          tone="violet"
          value={`${metrics.reliability}%`}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <Panel eyebrow="Case Signal" title="Intelligence Overview">
          <div className="space-y-6">
            <ProgressBar label="Consistency score" tone="cyan" value={metrics.consistency} />
            <ProgressBar label="Reliability score" tone="emerald" value={metrics.reliability} />
            <div className="grid gap-3 sm:grid-cols-3">
              <DashboardTile icon={GitCompareArrows} label="Comparison" value={comparison ? "Ready" : "Pending"} />
              <DashboardTile icon={Gauge} label="Reliability" value={reliability ? "Ready" : "Pending"} />
              <DashboardTile icon={FileText} label="Report" value={witnesses.length ? "Available" : "Pending"} />
            </div>
          </div>
        </Panel>

        <Panel eyebrow="Witness Queue" title="Loaded Witnesses">
          <div className="space-y-3">
            {witnesses.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No witness facts have been added to the workspace.
              </p>
            ) : (
              witnesses.map((witness) => (
                <div
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.03]"
                  key={witness.id}
                >
                  <p className="font-semibold text-zinc-950 dark:text-white">
                    {witness.label}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {witness.source}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function DashboardTile({
  icon: Icon,
  label,
  value
}: {
  icon: typeof GitCompareArrows;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-zinc-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}
