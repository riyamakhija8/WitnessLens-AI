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
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const mobileNavigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/comparison", label: "Compare", icon: GitCompareArrows },
  { href: "/timeline", label: "Timeline", icon: BarChart3 },
  { href: "/reliability", label: "Reliability", icon: Gauge },
  { href: "/report", label: "Report", icon: FileText }
];

export function Topbar() {
  const pathname = usePathname();
  const title =
    mobileNavigation.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/86 backdrop-blur dark:border-white/10 dark:bg-zinc-950/86">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-zinc-950 text-cyan-300 dark:bg-white dark:text-zinc-950 lg:hidden">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">
              {title}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              WitnessLens AI case workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 md:flex">
            Backend proxy: /api/backend
          </div>
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-zinc-200 px-3 py-2 dark:border-white/10 lg:hidden">
        {mobileNavigation.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              className={`flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-semibold ${
                active
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "text-zinc-600 dark:text-zinc-300"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
