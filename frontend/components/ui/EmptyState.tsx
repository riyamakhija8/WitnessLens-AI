import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-white/15">
      <div className="rounded-lg bg-zinc-100 p-3 text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
