import { useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, RefreshCw, Info, Layers, ChevronDown, Bug, X, GitCompare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAtRiskFromPatterns } from "@/hooks/win-loss/useAtRiskFromPatterns";
import { useAtRiskSettings } from "@/hooks/win-loss/useAtRiskSettings";
import { DOMINANT_PATTERNS_LIST } from "@/lib/winloss";
import { inferReasonCode } from "@/lib/winloss/riskReasons";
import { RiskDebugPanel } from "./RiskDebugPanel";
import { AtRiskSettingsPopover } from "./AtRiskSettingsPopover";
import { RiskCompareModal } from "./RiskCompareModal";

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n || 0);

const tone = (score: number) =>
  score >= 75 ? "border-destructive/40 bg-destructive/10 text-destructive" :
  score >= 50 ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" :
  "border-muted bg-muted text-muted-foreground";

const scoreLabel = (score: number) =>
  score >= 75 ? "Crítico" : score >= 50 ? "Alto risco" : "Atenção";

export function AtRiskDealsFromPatterns() {
  const { settings, update, reset, clearFilters } = useAtRiskSettings();
  const { data = [], isLoading, refresh, isRefreshing } = useAtRiskFromPatterns({
    threshold: settings.threshold,
    limit: settings.limit,
  });
  const [showCatalog, setShowCatalog] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev; // cap at 2
      return [...prev, id];
    });
  }, []);
  const clearCompare = useCallback(() => setCompareIds([]), []);

  const availableStages = useMemo(() => {
    const set = new Set<string>();
    for (const d of data) {
      if (d.stage && d.stage.trim()) set.add(d.stage);
    }
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const kw = settings.keywordFilter.trim().toLowerCase();
    const stages = settings.stageFilter;
    const codes = settings.reasonCodes;
    if (stages.length === 0 && !kw && codes.length === 0) return data;
    return data.filter((d) => {
      if (stages.length > 0 && !stages.includes(d.stage ?? "")) return false;
      if (kw) {
        const hay = `${d.client_name ?? ""} ${d.matched_pattern ?? ""} ${d.suggested_action ?? ""}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      if (codes.length > 0) {
        const dealCodes = (d.breakdown?.reasons_v2 ?? []).map((r) => r.code);
        const effective = dealCodes.length
          ? dealCodes
          : (d.breakdown?.reasons ?? d.reasons ?? []).map((m) => inferReasonCode(m));
        if (!codes.some((c) => effective.includes(c))) return false;
      }
      return true;
    });
  }, [data, settings.keywordFilter, settings.stageFilter, settings.reasonCodes]);

  const visible = filtered.slice(0, settings.maxVisible);
  const filtersActive =
    settings.stageFilter.length > 0 ||
    settings.keywordFilter.length > 0 ||
    settings.reasonCodes.length > 0;
  const debug = settings.debug;

  /** Set of dominant-pattern labels matched by at least one currently visible (filtered) deal. */
  const matchedFamilyLabels = useMemo(() => {
    const set = new Set<string>();
    for (const d of filtered) {
      const haystack = (d.matched_pattern ?? "").toLowerCase();
      for (const entry of DOMINANT_PATTERNS_LIST) {
        if (haystack.includes(entry.label.toLowerCase())) set.add(entry.label);
      }
    }
    return set;
  }, [filtered]);

  return (
    <TooltipProvider delayDuration={150}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
            Deals em risco — padrões de loss
            {settings.debug && (
              <button
                type="button"
                onClick={() => update({ debug: false })}
                aria-label="Modo debug ativo — clique para desligar"
                title="Modo debug ativo (persistido). Clique para desligar."
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Badge
                  variant="warning"
                  className="gap-1 text-[10px] px-2 py-0.5 cursor-pointer"
                >
                  <Bug className="h-3 w-3" aria-hidden />
                  Debug
                  <X className="h-3 w-3 opacity-70" aria-hidden />
                </Badge>
              </button>
            )}
            <div className="ml-auto flex items-center gap-1">
              <AtRiskSettingsPopover
                settings={settings}
                onUpdate={update}
                onReset={reset}
                onClearFilters={clearFilters}
                totalAnalyzed={data.length}
                totalShown={visible.length}
                availableStages={availableStages}
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
            </div>
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
          ) : !filtered.length ? (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Nenhum deal corresponde aos filtros atuais.
              </p>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          ) : (
            <>
              {debug && compareIds.length > 0 && (
                <div
                  className="mb-2 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5"
                  role="region"
                  aria-label="Seleção para comparar"
                >
                  <GitCompare className="h-3 w-3 text-primary shrink-0" aria-hidden />
                  <span className="text-[11px] text-muted-foreground">
                    {compareIds.length === 1
                      ? "Selecione mais 1 deal para comparar"
                      : "2 deals selecionados"}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[11px] gap-1"
                      disabled={compareIds.length < 2}
                      onClick={() => setCompareOpen(true)}
                    >
                      <GitCompare className="h-3 w-3" aria-hidden />
                      Comparar ({compareIds.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[11px]"
                      onClick={clearCompare}
                      aria-label="Limpar seleção de comparação"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <ul className="space-y-2" aria-label="Deals em risco identificados">
              {visible.map(d => (
                <li key={d.sale_id} className={`rounded-md border px-3 py-2 ${tone(d.risk_score)}`}>
                  <div className="flex items-center justify-between gap-2">
                    {debug && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Checkbox
                              checked={compareIds.includes(d.sale_id)}
                              disabled={!compareIds.includes(d.sale_id) && compareIds.length >= 2}
                              onCheckedChange={() => toggleCompare(d.sale_id)}
                              aria-label={`Selecionar ${d.client_name ?? "deal"} para comparar`}
                              className="shrink-0"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {compareIds.includes(d.sale_id)
                            ? "Remover da comparação"
                            : compareIds.length >= 2
                              ? "Máximo 2 deals para comparar"
                              : "Selecionar para comparar"}
                        </TooltipContent>
                      </Tooltip>
                    )}
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
            </>
          )}
          {filtered.length > visible.length && (
            <p className="mt-2 text-[10px] text-muted-foreground text-center">
              Exibindo {visible.length} de {filtered.length}
              {filtersActive && data.length !== filtered.length ? ` (de ${data.length} analisados)` : ""}
              {" — ajuste em ⚙"}
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
      <RiskCompareModal
        open={compareOpen}
        onOpenChange={setCompareOpen}
        dealA={data.find((x) => x.sale_id === compareIds[0]) ?? null}
        dealB={data.find((x) => x.sale_id === compareIds[1]) ?? null}
      />
    </TooltipProvider>
  );
}
