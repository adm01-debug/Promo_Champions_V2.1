import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HudAlertProps {
  activeHudAlert: {
    title: string;
    message: string;
  } | null;
}

export const HudAlert = ({ activeHudAlert }: HudAlertProps) => {
  return (
    <AnimatePresence>
      {activeHudAlert && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
        >
          <div className="relative overflow-hidden rounded-2xl bg-background/60 backdrop-blur-3xl border border-primary/30 shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <div className="p-5 flex items-start gap-4">
              <div className="relative">
                <div className="p-3 rounded-xl bg-primary/20 border border-primary/40">
                  <Bell className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-ping" />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black font-mono uppercase tracking-[0.2em] text-primary">System Alert :: HUD</h3>
                  <Badge variant="outline" className="text-[8px] font-mono border-primary/40 text-primary">Real-time</Badge>
                </div>
                <h4 className="text-sm font-bold text-foreground">{activeHudAlert.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                  {activeHudAlert.message}
                </p>
              </div>
            </div>
            
            <div className="h-1 w-full bg-muted/20">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
