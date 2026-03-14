import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Focus, X, Coffee, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFocusMode } from "@/hooks/useFocusMode";
import { cn } from "@/lib/utils";

interface FocusModeToggleProps {
  variant?: "icon" | "full";
  className?: string;
}

export const FocusModeToggle = forwardRef<HTMLDivElement, FocusModeToggleProps>(
  function FocusModeToggle({ variant = "icon", className }, ref) {
  const { isEnabled, formattedTime, toggleFocusMode } = useFocusMode();

  if (variant === "icon") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isEnabled ? "default" : "ghost"}
            size="icon"
            onClick={toggleFocusMode}
            className={cn(
              "relative h-9 w-9 transition-all",
              isEnabled && "bg-primary text-primary-foreground",
              className
            )}
          >
            <AnimatePresence mode="wait">
              {isEnabled ? (
                <motion.div
                  key="enabled"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="disabled"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Focus className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {isEnabled && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-3 w-3"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </motion.span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isEnabled ? `Modo Foco ativo (${formattedTime})` : "Ativar Modo Foco"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <motion.div
      layout
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg transition-colors",
        isEnabled ? "bg-primary/10" : "bg-muted/50",
        className
      )}
    >
      <Button
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        onClick={toggleFocusMode}
        className="gap-2"
      >
        {isEnabled ? <X className="h-4 w-4" /> : <Focus className="h-4 w-4" />}
        {isEnabled ? "Sair do Foco" : "Modo Foco"}
      </Button>
      
      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <Badge variant="secondary" className="gap-1 font-mono">
              <Clock className="h-3 w-3" />
              {formattedTime}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

FocusModeToggle.displayName = "FocusModeToggle";

export const FocusModeBreakReminder = forwardRef<HTMLDivElement>(function FocusModeBreakReminder(_props, _ref) {
  const { shouldShowBreakReminder, dismissBreakReminder, config } = useFocusMode();

  return (
    <AnimatePresence>
      {shouldShowBreakReminder && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 md:bottom-6 right-6 z-50"
        >
          <div className="glass-card p-4 rounded-xl shadow-xl border border-primary/20 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coffee className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Hora de uma pausa!</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Você está focado há {config.breakIntervalMinutes} minutos. 
                  Que tal uma pausa rápida?
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={dismissBreakReminder}>
                    Continuar
                  </Button>
                  <Button size="sm" onClick={dismissBreakReminder}>
                    Fazer pausa
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
