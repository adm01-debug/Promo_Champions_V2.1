import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox, RefreshCw, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  onAdjustFilters: () => void;
  onRunAnalysis: () => void;
  isAnalyzing?: boolean;
}

export function WinLossEmptyState({ onAdjustFilters, onRunAnalysis, isAnalyzing }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-dashed border-border/60">
        <CardContent className="py-12 flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-full bg-muted">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Nenhuma análise no período</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Ajuste os filtros para ampliar o intervalo, ou rode a IA para analisar deals fechados recentemente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={onAdjustFilters}>
              <Filter className="h-3.5 w-3.5 mr-1.5" /> Ajustar filtros
            </Button>
            <Button size="sm" onClick={onRunAnalysis} disabled={isAnalyzing}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analisando…" : "Rodar análise agora"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
