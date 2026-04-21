import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Trophy, TrendingDown, Clock, Target, BarChart3, Zap, Sparkles } from "lucide-react";
import type { WLKpis } from "@/hooks/win-loss/useWinLossAggregations";
import { fmtBRL, fmtDays, fmtPct } from "@/components/deal-intelligence/winloss/winLossHelpers";
import type { LucideIcon } from "lucide-react";
import { WinLossKpiDelta } from "./WinLossKpiDelta";
import type { KpiDelta } from "@/hooks/win-loss/usePreviousPeriodKpis";
import type { ForecastResult } from "@/hooks/win-loss/useWinLossForecast";
import { Badge } from "@/components/ui/badge";

interface Props {
  kpis: WLKpis;
  isLoading?: boolean;
  onWinsClick?: () => void;
  onLossesClick?: () => void;
  delta?: KpiDelta;
  forecast?: ForecastResult;
}

interface Item {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "success" | "danger" | "info" | "primary" | "warning";
  delta?: number;
  invertDelta?: boolean;
  badge?: string;
}

const toneClasses: Record<Item["tone"], string> = {
  success: "text-emerald-600 bg-emerald-500/10",
  danger: "text-rose-600 bg-rose-500/10",
  info: "text-sky-600 bg-sky-500/10",
  primary: "text-primary bg-primary/10",
  warning: "text-amber-600 bg-amber-500/10",
};

export function WinLossKpiBanner({ kpis, isLoading, onWinsClick, onLossesClick, delta, forecast }: Props) {
  const forecastValue = forecast ? fmtPct(forecast.next14d) : fmtPct(kpis.forecastWinRate);
  const items: Item[] = [
    { label: "Win Rate", value: fmtPct(kpis.winRate), icon: Trophy, tone: "success", delta: delta?.winRate },
    { label: "Forecast 14d", value: forecastValue, icon: Zap, tone: "warning", badge: forecast ? `IA · ${forecast.confidence}%` : undefined },
    { label: "Total analisado", value: String(kpis.total), icon: BarChart3, tone: "info", delta: delta?.total },
    { label: "Ciclo médio (Won)", value: fmtDays(kpis.avgCycleWon), icon: Clock, tone: "primary", delta: delta?.avgCycleWon },
    { label: "Ciclo médio (Lost)", value: fmtDays(kpis.avgCycleLost), icon: Clock, tone: "danger" },
    { label: "Ticket médio (Won)", value: fmtBRL(kpis.avgAmountWon), icon: Target, tone: "primary", delta: delta?.avgAmountWon },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3" role="region" aria-label="KPIs Win/Loss">
      {items.map((it, idx) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          whileHover={{ y: -2, transition: { type: "spring", stiffness: 380, damping: 22 } }}
        >
          <Card className="border-border/50 transition-shadow hover:shadow-md">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5 gap-1">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{it.label}</span>
                <div className={`p-1 rounded-md ${toneClasses[it.tone]}`}>
                  <it.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p
                className="text-xl font-display font-semibold tabular-nums"
                aria-live="polite"
              >
                {isLoading ? "…" : it.value}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 min-h-[14px]">
                {it.delta != null && (
                  <WinLossKpiDelta value={it.delta} invert={it.invertDelta} label={`${it.label} vs. período anterior`} />
                )}
                {it.badge && (
                  <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-500/40 text-amber-700">
                    <Sparkles className="h-2 w-2 mr-0.5" /> {it.badge}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      {/* Wins/Losses inline visual */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-6">
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <TrendingDown className="h-4 w-4 text-muted-foreground rotate-180" />
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
              <button
                type="button"
                onClick={onWinsClick}
                className="bg-emerald-500 transition-opacity hover:opacity-80 cursor-pointer"
                style={{ width: `${kpis.winRate}%` }}
                aria-label={`Ver ${kpis.wins} wins`}
              />
              <button
                type="button"
                onClick={onLossesClick}
                className="bg-rose-500 transition-opacity hover:opacity-80 cursor-pointer"
                style={{ width: `${100 - kpis.winRate}%` }}
                aria-label={`Ver ${kpis.losses} losses`}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              <button type="button" onClick={onWinsClick} className="hover:text-emerald-600 transition-colors">{kpis.wins} won</button>
              {" · "}
              <button type="button" onClick={onLossesClick} className="hover:text-rose-600 transition-colors">{kpis.losses} lost</button>
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
