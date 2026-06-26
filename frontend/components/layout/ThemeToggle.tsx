"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("witnesslens.theme", next ? "dark" : "light");
  }

  return (
    <Button
      aria-label="Toggle dark mode"
      className="h-10 w-10 px-0"
      icon={
        darkMode ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )
      }
      onClick={toggleTheme}
      variant="secondary"
    >
      <span className="sr-only">Theme</span>
    </Button>
  );
}
