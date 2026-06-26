import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        "soft": "0 18px 60px rgba(15, 23, 42, 0.10)",
        "dark-soft": "0 18px 60px rgba(0, 0, 0, 0.30)"
      },
      colors: {
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          900: "#101114",
          950: "#090a0d"
        },
        signal: {
          cyan: "#22d3ee",
          emerald: "#34d399",
          amber: "#f59e0b",
          rose: "#fb7185",
          violet: "#a78bfa"
        }
      }
    }
  },
  plugins: []
};

export default config;
