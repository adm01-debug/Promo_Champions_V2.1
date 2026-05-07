import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { FileDown, Sparkles, Sun, Moon, Coffee } from "lucide-react";
import { generateCurrentMonthReport } from "@/lib/generateMonthlyReport";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-card via-card to-card/80 p-5 sm:p-6 shadow-sm">
      {/* Decorative mesh background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'var(--gradient-mesh)' }} />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/10 shadow-sm">
            <GreetingIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-page-title">
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                {greeting}, {firstName}!
              </span>
            </h1>
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-caption capitalize shrink-0">{today}</p>
              <span className="text-muted-foreground/30 hidden sm:inline">·</span>
              <p className="text-caption items-center gap-1 truncate hidden sm:flex">
                <Sparkles className="h-3 w-3 text-primary/60 shrink-0" />
                <span className="truncate">{tip}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/relatorios/vendas")}
            className="gap-1.5 text-xs"
          >
            <FileDown className="h-3.5 w-3.5" />
            Relatório de Vendas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={exporting}
            className="gap-1.5 text-xs"
          >
            <FileDown className="h-3.5 w-3.5" />
            {exporting ? "Gerando..." : "PDF rápido"}
          </Button>
        </div>
      </div>
    </div>
  );
};
