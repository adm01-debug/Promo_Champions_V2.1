import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { FileDown, Keyboard } from "lucide-react";
import { generateCurrentMonthReport } from "@/lib/generateMonthlyReport";
import { useKeyboardShortcutsContext } from "@/components/keyboard/KeyboardShortcutsProvider";
import { useState } from "react";

export const DashboardHeader = () => {
  const { salesperson } = useAuth();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const [exporting, setExporting] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await generateCurrentMonthReport();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
          {getGreeting()}, {salesperson?.name?.split(" ")[0] || "Usuário"}! 👋
        </h1>
        <p className="text-muted-foreground capitalize">{today}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          disabled={exporting}
          className="gap-1.5 text-xs"
        >
          <FileDown className="h-3.5 w-3.5" />
          {exporting ? "Gerando..." : "Exportar PDF"}
        </Button>
        <kbd className="hidden sm:inline-flex h-7 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground cursor-default">
          <span className="text-xs">⌘</span>K busca
        </kbd>
      </div>
    </div>
  );
};
