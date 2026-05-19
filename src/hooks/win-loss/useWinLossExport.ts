import { useCallback } from "react";
import { toast } from "sonner";
import { exportToCSV, formatCurrencyForExport, formatDateForExport } from "@/utils/csvExport";
import type { WLAnalysisRow } from "@/hooks/win-loss/useWinLossData";

/**
 * Gera CSV das análises filtradas (outcome, valor, ciclo, motivo, concorrente, segmento).
 */
export const useWinLossExport = (rows: WLAnalysisRow[]) => {
  return useCallback(() => {
    if (!rows.length) {
      toast.error("Nada para exportar — ajuste os filtros");
      return;
    }
    const data = rows.map(r => ({
      Data: formatDateForExport(r.analyzed_at),
      Resultado: r.outcome === "won" ? "Ganho" : "Perdido",
      Valor: formatCurrencyForExport(Number(r.amount) || 0),
      "Ciclo (dias)": r.cycle_days ?? "",
      Motivo: r.primary_reason ?? "",
      Estagio: r.lost_stage ?? "",
      Concorrente: r.competitor ?? "",
      Segmento: r.segment ?? "",
    }));
    const stamp = new Date().toISOString().slice(0, 10);
    exportToCSV(data, `win-loss-${stamp}`);
    toast.success(`${rows.length} análises exportadas`);
  }, [rows]);
};
