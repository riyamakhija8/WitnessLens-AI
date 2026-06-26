import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  tone?: "cyan" | "emerald" | "amber" | "rose";
  label?: string;
};

const toneStyles = {
  cyan: "bg-cyan-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400"
};

export function ProgressBar({ value, tone = "cyan", label }: ProgressBarProps) {
  const bounded = Math.max(0, Math.min(100, value));

  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-200">
            {label}
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">{bounded}%</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all", toneStyles[tone])}
          style={{ width: `${bounded}%` }}
        />
      </div>
    </div>
  );
}
