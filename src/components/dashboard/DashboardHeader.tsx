import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { FileDown, Sparkles, Sun, Moon, Coffee, Terminal, Radio, Monitor, Zap, BarChart3 } from "lucide-react";
import { generateCurrentMonthReport } from "@/lib/generateMonthlyReport";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { cn } from "@/lib/utils";

const motivationalTips = [
  "SYSTEM STATUS: PEAK PERFORMANCE REQUIRED 🎯",
  "OBJECTIVE: DOMINAR O CIRCUITO 💪",
  "NEW RECORD DETECTED WITHIN REACH 🏆",
  "FOCUS PROTOCOL: ACTIVE 🚀",
  "TARGET ACQUISITION: META STRIKE ⭐",
];

export const DashboardHeader = () => {
  const { salesperson } = useAuth();
  const { theme, toggleTheme } = useDashboardTheme();
  const navigate = useNavigate();
  const today = format(new Date(), "EEEE, d 'De' MMMM", { locale: ptBR });
  const [exporting, setExporting] = useState(false);

  const { greeting, icon: GreetingIcon, color } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return { greeting: "Boa madrugada", icon: Moon, color: "text-indigo-400" };
    if (hour < 12) return { greeting: "Bom dia", icon: Coffee, color: "text-amber-400" };
    if (hour < 18) return { greeting: "Boa tarde", icon: Sun, color: "text-orange-400" };
    return { greeting: "Boa noite", icon: Moon, color: "text-indigo-400" };
  }, []);

  const tip = useMemo(() => {
    const dayIndex = new Date().getDate() % motivationalTips.length;
    return motivationalTips[dayIndex];
  }, []);

  const firstName = salesperson?.name?.split(" ")[0] || "Operator";

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await generateCurrentMonthReport();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl p-5 sm:p-6 group">
      {/* Decorative cyber elements */}
      <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
        <Terminal className="h-20 w-20 text-primary/10" />
      </div>

      {/* Animated corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/40 rounded-tl-sm" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/40 rounded-br-sm" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <motion.div 
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-primary/20 blur-xl rounded-full" 
            />
            <div className="relative h-14 w-14 flex items-center justify-center rounded-2xl bg-black/60 border border-primary/40 shadow-[inset_0_0_15px_rgba(14,165,233,0.1)]">
              <GreetingIcon className={`h-7 w-7 ${color}`} />
              <div className="absolute -top-1 -right-1 h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-primary/60">Session Established</span>
              <div className="h-[1px] w-8 bg-primary/20" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tighter font-display uppercase text-foreground">
              {greeting}, <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-primary animate-pulse" style={{ textShadow: '0 0 25px rgba(14,165,233,0.5)' }}>{firstName}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                <Radio className="h-3 w-3 text-success animate-pulse" />
                <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{today}</p>
              </div>
              <div className="flex items-center gap-2 text-primary/80">
                <Sparkles className="h-3 w-3 animate-bounce" />
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest">{tip}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            aria-label={theme === "cyber" ? "Ativar Modo Padrão" : "Ativar Modo Cyber"}
            className={cn(
              "h-9 border-primary/30 text-primary hover:bg-primary/10 text-[10px] font-mono font-bold uppercase tracking-[0.2em]",
              theme === "cyber" ? "bg-black/60 shadow-[0_0_15_rgba(14,165,233,0.1)]" : "bg-background"
            )}
          >
            {theme === "cyber" ? <Zap className="h-3.5 w-3.5 mr-2" aria-hidden="true" /> : <Monitor className="h-3.5 w-3.5 mr-2" aria-hidden="true" />}
            {theme === "cyber" ? "Standard Mode" : "Cyber Mode"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            aria-label="Ir para Central de Business Intelligence"
            onClick={() => {
              if (salesperson?.role === 'sdr') navigate("/bi-sdr");
              else if (salesperson?.role === 'closer' || salesperson?.role === 'hybrid') navigate("/bi-closer");
              else navigate("/bi-gestor");
            }}
            className="h-9 bg-black/40 border-primary/30 text-primary hover:bg-primary/10 text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
          >
            <BarChart3 className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
            Central BI
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportPDF}
            disabled={exporting}
            aria-label={exporting ? "Gerando relatório..." : "Exportar relatório mensal para PDF"}
            className="h-9 bg-primary text-primary-foreground shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
          >
            <FileDown className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
            {exporting ? "Compiling..." : "Export HUD"}
          </Button>
        </div>
      </div>
      
      {/* Scanline decoration */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-[1px] bg-primary/10"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};