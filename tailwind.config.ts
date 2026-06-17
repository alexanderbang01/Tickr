import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#080a10",
          900: "#0a0c13",
          800: "#0f1117",
          700: "#13151f",
          600: "#181b28",
          500: "#1e2130",
          400: "#252840",
          300: "#2d3148",
        },
        buy: {
          DEFAULT: "#10d48e",
          dim: "rgba(16, 212, 142, 0.12)",
          border: "rgba(16, 212, 142, 0.25)",
        },
        sell: {
          DEFAULT: "#f04f5e",
          dim: "rgba(240, 79, 94, 0.12)",
          border: "rgba(240, 79, 94, 0.25)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "shimmer": "shimmer 2.2s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
