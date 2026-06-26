import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "WitnessLens AI",
  description: "AI-powered witness testimony intelligence platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem("witnesslens.theme");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (theme === "dark" || (!theme && prefersDark)) {
                  document.documentElement.classList.add("dark");
                }
              } catch (_) {}
            `
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
