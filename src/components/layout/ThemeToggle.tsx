import React, { forwardRef, memo } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ThemeToggle = memo(forwardRef<HTMLDivElement>(function ThemeToggle(_props, ref) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div ref={ref}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon" aria-label="Tema claro"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg relative overflow-hidden hover-scale-lg"
          >
            <Sun 
              className={`h-4 w-4 absolute transition-all duration-300 ${
                theme === "dark" 
                  ? "rotate-0 scale-100 opacity-100" 
                  : "rotate-90 scale-0 opacity-0"
              }`} 
            />
            <Moon 
              className={`h-4 w-4 absolute transition-all duration-300 ${
                theme === "dark" 
                  ? "-rotate-90 scale-0 opacity-0" 
                  : "rotate-0 scale-100 opacity-100"
              }`} 
            />
            <span className="sr-only">Alternar tema</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{theme === "dark" ? "Modo claro" : "Modo escuro"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}));

ThemeToggle.displayName = "ThemeToggle";
