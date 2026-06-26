"use client";

import { useState } from "react";
import { FileJson, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { JsonBlock } from "@/components/ui/JsonBlock";
import { Panel } from "@/components/ui/Panel";
import { useWitnessWorkspace } from "@/hooks/useWitnessWorkspace";
import { extractFactsPayload, getWitnessLabel, isRecord } from "@/lib/utils";

type WitnessWorkspaceProps = {
  minimum?: number;
};

export function WitnessWorkspace({ minimum = 1 }: WitnessWorkspaceProps) {
  const { witnesses, facts, addWitness, removeWitness, clearWitnesses } =
    useWitnessWorkspace();
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");

  async function handleJsonFiles(files: File[]) {
    setError("");

    for (const file of files) {
      try {
        const parsed = JSON.parse(await file.text()) as unknown;
        addParsedWitnessPayload(parsed, file.name);
      } catch {
        setError(`${file.name} is not valid JSON.`);
      }
    }
  }

  function addFromText() {
    setError("");

    try {
      const parsed = JSON.parse(jsonText) as unknown;
      addParsedWitnessPayload(parsed, "Pasted JSON");
      setJsonText("");
    } catch {
      setError("Pasted content is not valid JSON.");
    }
  }

  function addParsedWitnessPayload(payload: unknown, source: string) {
    if (isRecord(payload) && Array.isArray(payload.witnesses)) {
      payload.witnesses.forEach((item, index) => {
        const factsPayload = extractFactsPayload(item);
        if (factsPayload) {
          addWitness(
            factsPayload,
            getWitnessLabel(factsPayload, `Witness ${index + 1}`),
            source
          );
        }
      });
      return;
    }

    if (Array.isArray(payload)) {
      payload.forEach((item, index) => {
        const factsPayload = extractFactsPayload(item);
        if (factsPayload) {
          addWitness(
            factsPayload,
            getWitnessLabel(factsPayload, `Witness ${index + 1}`),
            source
          );
        }
      });
      return;
    }

    const factsPayload = extractFactsPayload(payload);
    if (!factsPayload) {
      setError("JSON must be an object, an array, or { witnesses: [...] }.");
      return;
    }

    addWitness(factsPayload, getWitnessLabel(factsPayload, "Witness"), source);
  }

  return (
    <Panel
      action={
        witnesses.length > 0 ? (
          <Button icon={<Trash2 className="h-4 w-4" />} onClick={clearWitnesses} variant="ghost">
            Clear
          </Button>
        ) : null
      }
      eyebrow="Evidence Input"
      title="Witness JSON Workspace"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <FileDropzone
            accept="application/json,.json"
            description="Drop one or more extracted witness JSON files."
            label="Upload witness JSON"
            multiple
            onFiles={handleJsonFiles}
          />
          <div>
            <textarea
              className="field-input min-h-40 resize-y"
              onChange={(event) => setJsonText(event.target.value)}
              placeholder='Paste {"actors":[],"actions":[],"locations":[],"times":[],"objects":[],"claims":[],"uncertainties":[]}'
              value={jsonText}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {facts.length} witness payload{facts.length === 1 ? "" : "s"} ready.
              </p>
              <Button
                disabled={!jsonText.trim()}
                icon={<FileJson className="h-4 w-4" />}
                onClick={addFromText}
                variant="secondary"
              >
                Add JSON
              </Button>
            </div>
          </div>
          {error && (
            <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </p>
          )}
        </div>
        <div className="space-y-3">
          {witnesses.length === 0 ? (
            <EmptyState
              description={`Add at least ${minimum} witness payload${minimum === 1 ? "" : "s"} to run this analysis.`}
              icon={Users}
              title="No witness payloads loaded"
            />
          ) : (
            witnesses.map((witness) => (
              <div
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                key={witness.id}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-950 dark:text-white">
                      {witness.label}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {witness.source}
                    </p>
                  </div>
                  <Button
                    aria-label={`Remove ${witness.label}`}
                    className="h-9 w-9 px-0"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => removeWitness(witness.id)}
                    variant="ghost"
                  >
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                <JsonBlock value={witness.facts} />
              </div>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}
