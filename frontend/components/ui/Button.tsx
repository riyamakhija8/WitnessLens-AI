import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border-cyan-500 bg-cyan-500 text-zinc-950 hover:bg-cyan-300 dark:border-cyan-400 dark:bg-cyan-400",
  secondary:
    "border-zinc-200 bg-white text-zinc-900 hover:border-cyan-300 hover:text-cyan-700 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:hover:border-cyan-400 dark:hover:text-cyan-200",
  danger:
    "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20",
  ghost:
    "border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
};

export function Button({
  className,
  variant = "primary",
  icon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        variantStyles[variant],
        className
      )}
      type={type}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
