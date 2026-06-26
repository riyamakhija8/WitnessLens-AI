import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function Panel({
  title,
  eyebrow,
  action,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <section className={cn("investigation-panel", className)} {...props}>
      {(title || eyebrow || action) && (
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-1 text-base font-semibold text-zinc-950 dark:text-white">
                {title}
              </h2>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
