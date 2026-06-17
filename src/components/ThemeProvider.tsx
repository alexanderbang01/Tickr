"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("tickr-theme") as Theme | null;
    const t = saved ?? "dark";
    setThemeState(t);
    applyTheme(t);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("tickr-theme", t);
    applyTheme(t);
  }

  function toggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "light") root.classList.add("light");
  else root.classList.remove("light");
}

export function useTheme() {
  return useContext(ThemeContext);
}
