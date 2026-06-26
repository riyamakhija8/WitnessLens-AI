"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  GitCompareArrows,
  Gauge,
  LayoutDashboard,
  ShieldCheck,
  UploadCloud
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Witness", icon: UploadCloud },
  { href: "/comparison", label: "Witness Comparison", icon: GitCompareArrows },
  { href: "/timeline", label: "Timeline Analysis", icon: BarChart3 },
  { href: "/reliability", label: "Reliability Analysis", icon: Gauge },
  { href: "/report", label: "Investigation Report", icon: FileText }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white/82 backdrop-blur dark:border-white/10 dark:bg-zinc-950/82 lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 px-6 py-5 dark:border-white/10">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-zinc-950 text-cyan-300 dark:bg-white dark:text-zinc-950">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold text-zinc-950 dark:text-white">
                WitnessLens AI
              </span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                Testimony intelligence
              </span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                  active
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-200 p-4 dark:border-white/10">
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">
              Investigation Mode
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Evidence-oriented workflows for cross-witness intelligence.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
