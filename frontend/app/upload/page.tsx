"use client";

import { useState } from "react";
import { Database, FileCheck2, Save } from "lucide-react";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { JsonBlock } from "@/components/ui/JsonBlock";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { uploadWitnessPdf } from "@/lib/api";
import type { UploadResponse } from "@/lib/types";
import { extractFactsPayload } from "@/lib/utils";
import { useWitnessWorkspace } from "@/hooks/useWitnessWorkspace";

export default function UploadWitnessPage() {
  const { addWitness } = useWitnessWorkspace();
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: File[]) {
    const file = files[0];
    if (!file) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const uploadResult = await uploadWitnessPdf(file);
      setResult(uploadResult);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function saveToWorkspace() {
    if (!result) {
      return;
    }

    const facts = extractFactsPayload(result);
    if (facts) {
      addWitness(facts, result.filename, "PDF extraction");
    }
  }

  return (
    <div className="space-y-6">
      <Panel
        action={
          result ? (
            <Button icon={<Save className="h-4 w-4" />} onClick={saveToWorkspace}>
              Add to Workspace
            </Button>
          ) : null
        }
        eyebrow="Ingestion"
        title="Upload Witness Statement"
      >
        <FileDropzone
          accept="application/pdf,.pdf"
          description="Drag and drop a PDF witness statement to extract facts with the backend pipeline."
          label={loading ? "Processing witness statement..." : "Upload PDF statement"}
          onFiles={handleFiles}
        />
        {error && (
          <p className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </p>
        )}
      </Panel>

      {result && (
        <div className="grid gap-6 xl:grid-cols-3">
          <Panel eyebrow="Rule Engine" title="Extracted Facts">
            <JsonBlock value={result.facts} />
          </Panel>
          <Panel eyebrow="Entity Parser" title="Entities">
            <JsonBlock value={result.entities} />
          </Panel>
          <Panel eyebrow="Gemini AI" title="AI Facts">
            <JsonBlock value={result.ai_facts} />
          </Panel>
          <Panel className="xl:col-span-3" eyebrow="Document Preview" title="Cleaned Text">
            <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <FileCheck2 className="mt-1 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-300" />
              <div>
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  {result.filename}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {result.characters} cleaned characters
                </p>
                <p className="mt-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  {result.preview}
                </p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {!result && (
        <Panel eyebrow="Workspace" title="Operational Flow">
          <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            Upload output can be saved to the shared witness workspace for comparison,
            timeline, reliability, and report generation.
          </div>
        </Panel>
      )}
    </div>
  );
}
