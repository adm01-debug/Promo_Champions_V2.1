import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg relative overflow-hidden transition-transform duration-200 hover:scale-110 active:scale-95"
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
  );
}
