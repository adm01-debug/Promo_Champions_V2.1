import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { FileDown, Sparkles, Sun, Moon, Coffee } from "lucide-react";
import { generateCurrentMonthReport } from "@/lib/generateMonthlyReport";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const motivationalTips = [
  "Cada ligação te aproxima do topo! 🎯",
  "Quem persiste, conquista! 💪",
  "Hoje é dia de bater recorde! 🏆",
  "Foco total, resultados extraordinários! 🚀",
  "Você está mais perto da meta do que imagina! ⭐",
];

export const DashboardHeader = () => {
  const { salesperson } = useAuth();
  const navigate = useNavigate();
  const today = format(new Date(), "EEEE, d 'De' MMMM", { locale: ptBR });
  const [exporting, setExporting] = useState(false);

  const { greeting, icon: GreetingIcon } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return { greeting: "Boa madrugada", icon: Moon };
    if (hour < 12) return { greeting: "Bom dia", icon: Coffee };
    if (hour < 18) return { greeting: "Boa tarde", icon: Sun };
    return { greeting: "Boa noite", icon: Moon };
  }, []);

  const tip = useMemo(() => {
    const dayIndex = new Date().getDate() % motivationalTips.length;
    return motivationalTips[dayIndex];
  }, []);

  const firstName = salesperson?.name?.split(" ")[0] || "Campeão";

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await generateCurrentMonthReport();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.05] bg-[#0d1117]/40 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-white/[0.1]">
      {/* Decorative ambient light */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-xl group transition-all duration-500 hover:scale-110 hover:border-primary/30">
            <GreetingIcon className="h-8 w-8 text-primary/80 group-hover:text-primary transition-colors" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tightest">
                <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                  {greeting}, {firstName}
                </span>
              </h1>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <p className="text-sm font-bold uppercase tracking-widest text-white/40">{today}</p>
              <div className="h-1 w-1 rounded-full bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-full backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-primary/80" />
                <span className="text-xs font-medium text-white/60">{tip}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate("/relatorios/vendas")}
            className="rounded-full px-8 font-bold bg-primary text-primary-foreground hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)] transition-all duration-500 hover:scale-105"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Explorar Performance
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleExportPDF}
            disabled={exporting}
            className="rounded-full px-8 font-bold border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500"
          >
            <FileDown className="h-4 w-4 mr-2 text-primary/60" />
            {exporting ? "Gerando..." : "Instant PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
};
