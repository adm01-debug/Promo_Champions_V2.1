import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pause, Play, XCircle, X } from "lucide-react";
import {
  useBulkPauseQuoteCadences,
  useBulkResumeQuoteCadences,
  useBulkCancelQuoteCadences,
} from "@/hooks/cadences/useBulkQuoteCadenceMutations";

interface Props {
  selectedIds: string[];
  onClear: () => void;
}

export function QuoteCadenceBulkBar({ selectedIds, onClear }: Props) {
  const pause = useBulkPauseQuoteCadences();
  const resume = useBulkResumeQuoteCadences();
  const cancel = useBulkCancelQuoteCadences();
  const count = selectedIds.length;
  const loading = pause.isPending || resume.isPending || cancel.isPending;

  const run = (fn: () => void) => () => {
    fn();
    onClear();
  };

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          role="region"
          aria-label="Ações em lote para cadências selecionadas"
        >
          <div className="flex items-center gap-2 bg-background border border-border shadow-lg rounded-full px-4 py-2">
            <span className="text-sm font-medium px-2">
              {count} selecionado{count > 1 ? "s" : ""}
            </span>
            <div className="h-5 w-px bg-border" />
            <Button
              size="sm"
              variant="outline"
              onClick={run(() => pause.mutate({ ids: selectedIds }))}
              disabled={loading}
              aria-label="Pausar cadências selecionadas"
            >
              <Pause className="h-3.5 w-3.5 mr-1.5" /> Pausar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={run(() => resume.mutate({ ids: selectedIds }))}
              disabled={loading}
              aria-label="Retomar cadências selecionadas"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" /> Retomar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={run(() => cancel.mutate({ ids: selectedIds }))}
              disabled={loading}
              aria-label="Cancelar cadências selecionadas"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Cancelar
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClear}
              aria-label="Limpar seleção"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
