import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { FileDown, Sparkles, Sun, Moon, Coffee } from "lucide-react";
import { generateCurrentMonthReport } from "@/lib/generateMonthlyReport";
import { useState, useMemo } from "react";

const motivationalTips = [
  "Cada ligação te aproxima do topo! 🎯",
  "Quem persiste, conquista! 💪",
  "Hoje é dia de bater recorde! 🏆",
  "Foco total, resultados extraordinários! 🚀",
  "Você está mais perto da meta do que imagina! ⭐",
];

export const DashboardHeader = () => {
  const { salesperson } = useAuth();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <GreetingIcon className="h-5 w-5 text-warning hidden sm:block" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              {greeting}, {firstName}!
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm text-muted-foreground capitalize shrink-0">{today}</p>
          <span className="text-muted-foreground/30 hidden sm:inline">·</span>
          <p className="text-sm text-muted-foreground items-center gap-1 truncate hidden sm:flex">
            <Sparkles className="h-3 w-3 text-primary/60 shrink-0" />
            <span className="truncate">{tip}</span>
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={exporting}
        className="gap-1.5 text-xs self-start sm:self-auto"
      >
        <FileDown className="h-3.5 w-3.5" />
        {exporting ? "Gerando..." : "Exportar PDF"}
      </Button>
    </div>
  );
};
