import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, Info, Bug, Layers, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAtRiskFromPatterns } from "@/hooks/win-loss/useAtRiskFromPatterns";
import { useAtRiskSettings } from "@/hooks/win-loss/useAtRiskSettings";
import { DOMINANT_PATTERNS_LIST } from "@/lib/winloss";
import { RiskDebugPanel } from "./RiskDebugPanel";
import { AtRiskSettingsPopover } from "./AtRiskSettingsPopover";

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n || 0);

const tone = (score: number) =>
  score >= 75 ? "border-destructive/40 bg-destructive/10 text-destructive" :
  score >= 50 ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" :
  "border-muted bg-muted text-muted-foreground";

const scoreLabel = (score: number) =>
  score >= 75 ? "Crítico" : score >= 50 ? "Alto risco" : "Atenção";

export function AtRiskDealsFromPatterns() {
  const { settings, update, reset } = useAtRiskSettings();
  const { data = [], isLoading, refresh, isRefreshing } = useAtRiskFromPatterns({
    threshold: settings.threshold,
    limit: settings.limit,
  });
  const [debug, setDebug] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const visible = data.slice(0, settings.maxVisible);

  /** Set of dominant-pattern labels matched by at least one current deal. */
  const matchedFamilyLabels = useMemo(() => {
    const set = new Set<string>();
    for (const d of data) {
      const haystack = (d.matched_pattern ?? "").toLowerCase();
      for (const entry of DOMINANT_PATTERNS_LIST) {
        if (haystack.includes(entry.label.toLowerCase())) set.add(entry.label);
      }
    }
    return set;
  }, [data]);

  return (
    <TooltipProvider delayDuration={150}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
            Deals em risco — padrões de loss
            <Button
              size="sm"
              variant={debug ? "secondary" : "ghost"}
              className="ml-auto h-7 px-2 gap-1"
              onClick={() => setDebug(v => !v)}
              aria-pressed={debug}
              aria-label="Alternar modo debug"
              title="Modo debug: mostra contribuição de cada sinal"
            >
              <Bug className="h-3 w-3" />
              <span className="text-[10px] font-medium">Debug</span>
            </Button>
            <AtRiskSettingsPopover
              settings={settings}
              onUpdate={update}
              onReset={reset}
              totalAnalyzed={data.length}
              totalShown={visible.length}
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => refresh()}
              disabled={isRefreshing}
              aria-label="Atualizar análise de risco"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[0, 1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : !data.length ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              {settings.threshold > 40
                ? `Nenhum deal cruza padrões com score ≥ ${settings.threshold}.`
                : "Nenhum deal aberto cruza padrões críticos no momento."}
            </p>
          ) : (
            <ul className="space-y-2" aria-label="Deals em risco identificados">
              {visible.map(d => (
                <li key={d.sale_id} className={`rounded-md border px-3 py-2 ${tone(d.risk_score)}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{d.client_name ?? "Cliente"}</p>
                      <p className="text-[11px] opacity-80 truncate" title={d.matched_pattern}>
                        {d.matched_pattern}
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="tabular-nums shrink-0 cursor-help gap-1"
                          aria-label={`Risco ${d.risk_score} de 100 — ${scoreLabel(d.risk_score)}`}
                        >
                          {d.risk_score}
                          <Info className="h-3 w-3 opacity-60" aria-hidden />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs text-xs">
                        <p className="font-medium mb-1">{scoreLabel(d.risk_score)} · {d.risk_score}/100</p>
                        {d.breakdown && (
                          <ul className="space-y-0.5 mb-2 opacity-90">
                            <li>Estagnação: <span className="tabular-nums">{d.breakdown.stagnation}</span>/50</li>
                            <li>Alinhamento de ticket: <span className="tabular-nums">{d.breakdown.amount_alignment}</span>/25</li>
                            <li>Estágio travado: <span className="tabular-nums">{d.breakdown.stage_match}</span>/25</li>
                            <li>Confiança do padrão: <span className="tabular-nums">{Math.round(d.breakdown.matched_confidence * 100)}%</span></li>
                          </ul>
                        )}
                        {d.reasons && d.reasons.length > 0 && (
                          <ul className="space-y-0.5 list-disc pl-4 opacity-90">
                            {d.reasons.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[11px] opacity-75 truncate pr-2" title={d.suggested_action}>
                      {d.suggested_action}
                    </p>
                    <span className="text-[11px] tabular-nums font-medium shrink-0">{fmtBRL(d.amount)}</span>
                  </div>
                  {debug && d.breakdown && (
                    <RiskDebugPanel breakdown={d.breakdown} riskScore={d.risk_score} />
                  )}
                </li>
              ))}
            </ul>
          )}
          {data.length > visible.length && (
            <p className="mt-2 text-[10px] text-muted-foreground text-center">
              Exibindo {visible.length} de {data.length} deals — ajuste em ⚙
            </p>
          )}

          <Collapsible open={showCatalog} onOpenChange={setShowCatalog} className="mt-3 pt-3 border-t border-border/50">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between h-8 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                aria-expanded={showCatalog}
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3 w-3" aria-hidden />
                  Padrões dominantes considerados ({DOMINANT_PATTERNS_LIST.length})
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showCatalog ? "rotate-180" : ""}`} aria-hidden />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ul className="grid gap-1.5" aria-label="Catálogo de padrões dominantes">
                {DOMINANT_PATTERNS_LIST.map(entry => {
                  const matched = matchedFamilyLabels.has(entry.label);
                  const p = entry.pattern;
                  return (
                    <li
                      key={entry.family}
                      className={`rounded border px-2.5 py-1.5 text-[11px] ${
                        matched
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/50 bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{entry.theme}</span>
                        {matched && (
                          <Badge variant="outline" className="h-4 px-1 text-[9px] border-primary/40 text-primary shrink-0">
                            ativo
                          </Badge>
                        )}
                      </div>
                      <p className="opacity-70 truncate" title={entry.label}>
                        {entry.label}
                      </p>
                      {p && (
                        <p className="mt-0.5 opacity-60 tabular-nums text-[10px]">
                          ticket-alvo {fmtBRL(p.avg_amount ?? 0)} · ciclo {(p.avg_cycle_days ?? 0)}d · conf {Math.round((p.confidence ?? 0) * 100)}%
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Famílias destacadas correspondem ao padrão dominante de pelo menos um deal acima.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
