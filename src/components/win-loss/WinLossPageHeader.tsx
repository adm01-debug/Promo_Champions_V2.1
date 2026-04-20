import { motion } from "framer-motion";
import { Trophy, RefreshCw, Download, Keyboard, Printer, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WinLossSavedViews } from "./WinLossSavedViews";
import type { WinLossFilterState } from "./winLossFiltersHelpers";
import type { SavedView } from "@/hooks/win-loss/useWinLossSavedViews";

interface Props {
  onRun: () => void;
  onExport: () => void;
  onPrint: () => void;
  onCopyDigest?: () => void;
  isRunning?: boolean;
  filters: WinLossFilterState;
  onLoadView: (v: SavedView) => void;
}

export function WinLossPageHeader({ onRun, onExport, onPrint, onCopyDigest, isRunning, filters, onLoadView }: Props) {
  return (
    <motion.div
      className="flex flex-col sm:flex-row sm:items-center gap-3 no-print"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-3 rounded-xl gradient-primary shrink-0">
        <Trophy className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-page-title gradient-text">Win/Loss Intelligence</h1>
        <p className="text-muted-foreground text-sm">
          Padrões de vitória, derrota e concorrência — com IA e drill-down por deal.
        </p>
      </div>
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-wrap gap-2">
          <WinLossSavedViews currentFilters={filters} onLoad={onLoadView} />

          {onCopyDigest && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onCopyDigest} aria-label="Copiar resumo executivo">
                  <Clipboard className="h-3.5 w-3.5 mr-1.5" />
                  Digest
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px]">Copia resumo Markdown</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={onPrint} aria-label="Imprimir relatório">
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Imprimir
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[11px]">Relatório executivo (A4)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={onExport}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Exportar
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[11px]">
              <Keyboard className="h-3 w-3 inline mr-1" /> Ctrl + E
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={onRun} disabled={isRunning}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRunning ? "animate-spin" : ""}`} />
                {isRunning ? "Analisando…" : "Rodar análise"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[11px]">
              <Keyboard className="h-3 w-3 inline mr-1" /> Ctrl + R
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </motion.div>
  );
}
