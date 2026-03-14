import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomTheme } from "@/hooks/useCustomTheme";

const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

export function ThemeToggle() {
  const { config, setMode } = useCustomTheme();

  const resolvedTheme =
    config.mode === "system"
      ? window.matchMedia(SYSTEM_THEME_QUERY).matches
        ? "dark"
        : "light"
      : config.mode;

  const toggleTheme = () => {
    setMode(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-lg relative overflow-hidden hover-scale-lg"
      aria-label="Alternar tema"
      title={resolvedTheme === "dark" ? "Modo claro" : "Modo escuro"}
    >
      <Sun
        className={`h-4 w-4 absolute transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`h-4 w-4 absolute transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "-rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
