"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "@/lib/config";
import type { JsonRecord, StoredWitness } from "@/lib/types";
import { getWitnessLabel, loadClientState, saveClientState } from "@/lib/utils";

export function useWitnessWorkspace() {
  const [hydrated, setHydrated] = useState(false);
  const [witnesses, setWitnesses] = useState<StoredWitness[]>([]);

  useEffect(() => {
    setWitnesses(loadClientState<StoredWitness[]>(STORAGE_KEYS.witnesses, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveClientState(STORAGE_KEYS.witnesses, witnesses);
    }
  }, [hydrated, witnesses]);

  const addWitness = useCallback(
    (facts: JsonRecord, label?: string, source = "Manual JSON") => {
      setWitnesses((current) => {
        const fallback = `Witness ${current.length + 1}`;
        const finalLabel = label?.trim() || getWitnessLabel(facts, fallback);
        const stampedFacts = {
          witness_id: finalLabel,
          ...facts
        };

        return [
          ...current,
          {
            id: createId(),
            label: finalLabel,
            source,
            createdAt: new Date().toISOString(),
            facts: stampedFacts
          }
        ];
      });
    },
    []
  );

  const removeWitness = useCallback((id: string) => {
    setWitnesses((current) => current.filter((witness) => witness.id !== id));
  }, []);

  const clearWitnesses = useCallback(() => {
    setWitnesses([]);
  }, []);

  const facts = useMemo(
    () => witnesses.map((witness) => witness.facts),
    [witnesses]
  );

  return {
    hydrated,
    witnesses,
    facts,
    addWitness,
    removeWitness,
    clearWitnesses
  };
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
