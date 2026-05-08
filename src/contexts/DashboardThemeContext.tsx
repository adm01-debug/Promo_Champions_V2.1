import React, { createContext, useContext, useEffect, useState } from "react";

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

  const setTheme = (newTheme: DashboardTheme) => {
    setThemeState(newTheme);
    window.localStorage.setItem("dashboard-style-theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "standard" ? "cyber" : "standard");
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("standard-mode", "cyber-mode");
    root.classList.add(`${theme}-mode`);
  }, [theme]);

  return (
    <DashboardThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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