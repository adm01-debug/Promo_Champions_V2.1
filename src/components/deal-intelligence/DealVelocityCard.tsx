import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Gauge, RefreshCw, CalendarClock, TrendingUp, TrendingDown } from "lucide-react";
import { useDealVelocityPrediction, usePredictDealVelocity } from "@/hooks/deal-intelligence/useDealAnalyticsVelocity";
import { VelocityStatusBadge } from "./VelocityStatusBadge";
import { VelocityForecastTimeline } from "./VelocityForecastTimeline";
import { confidenceTierLabel, formatCloseDate, formatDaysRemaining, velocityRingColor } from "./velocityHelpers";

export function DealVelocityCard({ saleId }: { saleId: string }) {
  const { data, isLoading } = useDealVelocityPrediction(saleId);
  const predict = usePredictDealVelocity();

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card variant="elevated" className="glass border-border/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" /> Velocidade & Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">Previsão ainda não calculada</p>
          <Button size="sm" onClick={() => predict.mutate({ saleId })} disabled={predict.isPending}>
            <Gauge className="h-3.5 w-3.5 mr-1" /> Prever agora
          </Button>
        </CardContent>
      </Card>
    );
  }

  const conf = data.confidence_score;
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (conf / 100) * circumference;

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="gradient-text">Velocidade & Forecast</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => predict.mutate({ saleId })} disabled={predict.isPending} className="h-7 w-7 p-0">
            <RefreshCw className={`h-3.5 w-3.5 ${predict.isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
              <circle cx="44" cy="44" r="38" className="stroke-muted fill-none" strokeWidth="6" />
              <circle
                cx="44" cy="44" r="38"
                className={`fill-none ${velocityRingColor(data.velocity_status)} transition-all duration-700`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-display font-bold tabular-nums">{conf}</span>
              <span className="text-[10px] text-muted-foreground">confiança</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <VelocityStatusBadge status={data.velocity_status} />
            <div className="flex items-center gap-1.5 text-sm">
              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{formatDaysRemaining(data.predicted_days_remaining)}</span>
              <span className="text-xs text-muted-foreground">· {formatCloseDate(data.predicted_close_date)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Confiança {confidenceTierLabel(data.confidence_tier)}</p>
          </div>
        </div>

        {data.current_stage && data.expected_days_in_stage != null && (
          <VelocityForecastTimeline
            daysInStage={data.days_in_stage ?? 0}
            expectedDays={Number(data.expected_days_in_stage)}
            remainingDays={data.predicted_days_remaining ?? 0}
            currentStage={data.current_stage}
          />
        )}

        {(data.factors?.drivers?.length || data.factors?.brakes?.length) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {!!data.factors?.drivers?.length && (
              <div className="p-2 rounded-lg glass border border-emerald-500/20">
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                  <TrendingUp className="h-3 w-3" /> Aceleradores
                </div>
                <ul className="space-y-0.5">
                  {data.factors.drivers.slice(0, 3).map((d, i) => (
                    <li key={i} className="text-[11px] text-foreground/80 leading-snug">• {d}</li>
                  ))}
                </ul>
              </div>
            )}
            {!!data.factors?.brakes?.length && (
              <div className="p-2 rounded-lg glass border border-destructive/20">
                <div className="flex items-center gap-1 text-[11px] font-medium text-destructive mb-1">
                  <TrendingDown className="h-3 w-3" /> Freios
                </div>
                <ul className="space-y-0.5">
                  {data.factors.brakes.slice(0, 3).map((b, i) => (
                    <li key={i} className="text-[11px] text-foreground/80 leading-snug">• {b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
