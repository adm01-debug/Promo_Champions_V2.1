import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { AnomalyResult } from "@/hooks/win-loss/useWinLossAnomalies";

interface Props {
  anomaly: AnomalyResult;
  onInvestigate?: (period: string) => void;
}

export function WinLossAnomalyBanner({ anomaly, onInvestigate }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (!anomaly.isAnomaly || dismissed || !anomaly.period) return null;

  const Icon = anomaly.direction === "up" ? TrendingUp : TrendingDown;
  const tone = anomaly.direction === "up"
    ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700"
    : "border-amber-500/40 bg-amber-500/5 text-amber-700";

  const word = anomaly.direction === "up" ? "acima" : "abaixo";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-3 rounded-lg border p-3 ${tone} no-print`}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          Anomalia detectada em <strong className="tabular-nums">{anomaly.period}</strong>
        </p>
        <p className="text-xs opacity-80">
          Win rate de <strong>{anomaly.current.toFixed(1)}%</strong> está{" "}
          <strong>{Math.abs(anomaly.zScore).toFixed(1)}σ {word}</strong> da média histórica ({anomaly.mean.toFixed(1)}%).
        </p>
      </div>
      {onInvestigate && (
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onInvestigate(anomaly.period!)}>
          Investigar
        </Button>
      )}
      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setDismissed(true)} aria-label="Fechar alerta">
        <X className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}
