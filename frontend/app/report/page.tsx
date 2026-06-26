"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { WitnessWorkspace } from "@/components/witness/WitnessWorkspace";
import { useWitnessWorkspace } from "@/hooks/useWitnessWorkspace";
import { generateReport } from "@/lib/api";
import { downloadBlob } from "@/lib/utils";

export default function ReportPage() {
  const { facts, witnesses } = useWitnessWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  async function downloadReport() {
    setError("");
    setReady(false);

    if (facts.length < 1) {
      setError("Add at least one witness JSON payload.");
      return;
    }

    setLoading(true);
    try {
      const report = await generateReport(facts);
      downloadBlob(report, `witnesslens-investigation-report-${Date.now()}.pdf`);
      setReady(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Report generation failed.");
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
            icon={<Download className="h-4 w-4" />}
            onClick={downloadReport}
          >
            {loading ? "Generating..." : "Download Report"}
          </Button>
        }
        eyebrow="Case Export"
        title="Investigation Report"
      >
        {error && (
          <p className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </p>
        )}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-300" />
              <div>
                <h3 className="font-semibold text-zinc-950 dark:text-white">
                  PDF investigation packet
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  The report endpoint generates a PDF containing agreements,
                  contradictions, reconstructed timeline, and reliability scoring for
                  the witness set in this workspace.
                </p>
                {ready && (
                  <p className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
                    Report generated and downloaded.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-950/80">
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">
              Report Contents
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <ReportStat label="Witnesses" value={witnesses.length} />
              <ReportStat label="Comparison" value="Included" />
              <ReportStat label="Timeline" value="Included" />
              <ReportStat label="Reliability" value="Included" />
            </dl>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-white/5">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-semibold text-zinc-950 dark:text-white">{value}</dd>
    </div>
  );
}
