import { useState } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/useMediaQuery";

const shortcuts = [
  { keys: ["⌘", "K"], description: "Buscar / Ações rápidas" },
  { keys: ["⌘", "B"], description: "Toggle sidebar" },
  { keys: ["N"], description: "Nova venda (no dashboard)" },
  { keys: ["P"], description: "Ir ao pipeline" },
  { keys: ["?"], description: "Atalhos de teclado" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Hide on mobile - no keyboard
  if (isMobile) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button className="fixed bottom-4 right-4 z-30 h-8 w-8 rounded-full bg-muted/80 backdrop-blur-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm hover:shadow-md">
                <Keyboard className="h-3.5 w-3.5" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Atalhos de teclado (?)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Keyboard className="h-5 w-5 text-primary" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
