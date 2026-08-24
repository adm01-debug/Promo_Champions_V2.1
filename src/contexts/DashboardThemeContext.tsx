import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

type DashboardTheme = "standard" | "cyber";

interface DashboardThemeContextType {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  toggleTheme: () => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextType | undefined>(undefined);

export const DashboardThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<DashboardTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("dashboard-style-theme");
      return (saved === "cyber" || saved === "standard") ? saved : "cyber"; // Default to cyber based on previous requests
    }
    return "cyber";
  });

  const setTheme = useCallback((newTheme: DashboardTheme) => {
    setThemeState(newTheme);
    window.localStorage.setItem("dashboard-style-theme", newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === "standard" ? "cyber" : "standard");
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("standard-mode", "cyber-mode");
    root.classList.add(`${theme}-mode`);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
};

export const useDashboardTheme = () => {
  const context = useContext(DashboardThemeContext);
  if (context === undefined) {
    throw new Error("useDashboardTheme must be used within a DashboardThemeProvider");
  }
  return context;
};