import { cn } from "@/lib/utils";

type ScoreGaugeProps = {
  value: number;
  label: string;
  tone?: "cyan" | "emerald" | "amber" | "rose";
};

const toneStyles = {
  cyan: "text-cyan-500",
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  rose: "text-rose-500"
};

export function ScoreGauge({ value, label, tone = "cyan" }: ScoreGaugeProps) {
  const bounded = Math.max(0, Math.min(100, value));
  const background = `conic-gradient(currentColor ${bounded * 3.6}deg, rgba(113, 113, 122, 0.18) 0deg)`;

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "grid h-24 w-24 shrink-0 place-items-center rounded-full",
          toneStyles[tone]
        )}
        style={{ background }}
      >
        <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">
          <span className="text-2xl font-semibold">{bounded}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Scored from extracted witness facts.
        </p>
      </div>
    </div>
  );
}
