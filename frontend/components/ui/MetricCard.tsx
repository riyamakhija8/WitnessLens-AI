import type { LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone: "cyan" | "emerald" | "amber" | "rose" | "violet";
  caption?: string;
};

const toneStyles = {
  cyan: "bg-cyan-500/12 text-cyan-700 ring-cyan-500/20 dark:text-cyan-200",
  emerald:
    "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-200",
  amber: "bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:text-amber-200",
  rose: "bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-200",
  violet:
    "bg-violet-500/12 text-violet-700 ring-violet-500/20 dark:text-violet-200"
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  caption
}: MetricCardProps) {
  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <div className="investigation-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-white">
            {displayValue}
          </p>
          {caption && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {caption}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5 ring-1", toneStyles[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
