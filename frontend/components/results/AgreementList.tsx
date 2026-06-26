import { CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Agreement } from "@/lib/types";

export function AgreementList({ agreements }: { agreements: Agreement[] }) {
  if (agreements.length === 0) {
    return (
      <EmptyState
        description="No shared facts were detected across the selected witness set."
        icon={CheckCircle2}
        title="No agreements found"
      />
    );
  }

  return (
    <div className="space-y-3">
      {agreements.map((agreement, index) => (
        <div
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 p-4"
          key={`${agreement.field}-${agreement.value}-${index}`}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="font-semibold text-zinc-950 dark:text-white">
                {agreement.value}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {agreement.type} agreement across {agreement.witnesses.join(", ")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
