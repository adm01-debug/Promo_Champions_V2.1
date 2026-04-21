import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { GitCompare, Swords, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AtRiskDealFromPattern, RiskBreakdown } from "@/hooks/win-loss/useAtRiskFromPatterns";

const fmtBRL = (n: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n || 0);

const tone = (score: number) =>
  score >= 75 ? "border-destructive/40 bg-destructive/10 text-destructive" :
  score >= 50 ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" :
  "border-muted bg-muted text-muted-foreground";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  dealA: AtRiskDealFromPattern | null;
  dealB: AtRiskDealFromPattern | null;
}

interface CompRow {
  label: string;
  max: number;
  pick: (b: RiskBreakdown) => number;
}

const COMP_ROWS: CompRow[] = [
  { label: "Estagnação", max: 50, pick: (b) => b.stagnation },
  { label: "Alinhamento de ticket", max: 25, pick: (b) => b.amount_alignment },
  { label: "Estágio travado", max: 25, pick: (b) => b.stage_match },
];

function deltaCell(a: number, b: number, abs = false) {
  const d = a - b;
  if (d === 0) {
    return <span className="tabular-nums text-muted-foreground">0</span>;
  }
  const positive = d > 0;
  return (
    <span
      className={cn(
        "tabular-nums font-semibold",
        positive ? "text-status-success" : "text-destructive",
      )}
      aria-label={`Diferença: ${positive ? "Deal A maior" : "Deal B maior"} em ${Math.abs(d)}${abs ? "" : " pontos"}`}
    >
      {positive ? "+" : ""}{d}
    </span>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1 w-full rounded-full bg-muted overflow-hidden mt-0.5" aria-hidden>
      <div className="h-full bg-primary/60" style={{ width: `${pct}%` }} />
    </div>
  );
}

function ConfBadge({ original, applied }: { original: number; applied: number }) {
  const pisoApplied = original < 0.5 && applied >= 0.5;
  const tetoApplied = original > 1 && applied <= 1;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="tabular-nums">{original.toFixed(2)}</span>
      {pisoApplied && (
        <>
          <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
          <span className="tabular-nums">{applied.toFixed(2)}</span>
          <Badge variant="warning" className="text-[9px] px-1 py-0">piso 0.5</Badge>
        </>
      )}
      {tetoApplied && (
        <>
          <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
          <span className="tabular-nums">{applied.toFixed(2)}</span>
          <Badge variant="warning" className="text-[9px] px-1 py-0">teto 1.0</Badge>
        </>
      )}
    </div>
  );
}

export function diffKeywords(a: string[], b: string[]) {
  const setA = new Set(a.map((k) => k.toLowerCase()));
  const setB = new Set(b.map((k) => k.toLowerCase()));
  const onlyA = a.filter((k) => !setB.has(k.toLowerCase()));
  const onlyB = b.filter((k) => !setA.has(k.toLowerCase()));
  const common = a.filter((k) => setB.has(k.toLowerCase()));
  return { onlyA, onlyB, common };
}

export function buildCompareSummary(
  a: AtRiskDealFromPattern,
  b: AtRiskDealFromPattern,
): string {
  if (!a.breakdown || !b.breakdown) return "";
  const finalDelta = (a.breakdown.final_score ?? a.risk_score) - (b.breakdown.final_score ?? b.risk_score);
  const winner = finalDelta === 0 ? null : finalDelta > 0 ? "A" : "B";
  const absDelta = Math.abs(finalDelta);

  // Find dominant component contributor (by raw delta).
  const contribs = COMP_ROWS.map((r) => ({
    label: r.label,
    delta: r.pick(a.breakdown!) - r.pick(b.breakdown!),
  }));
  const dominant = contribs.reduce((best, cur) =>
    Math.abs(cur.delta) > Math.abs(best.delta) ? cur : best,
  );

  const confA = a.breakdown.matched_confidence;
  const confB = b.breakdown.matched_confidence;
  const pisoNote =
    confA < 0.5 && confB >= 0.5 ? " Deal A sofreu piso de confiança aplicado." :
    confB < 0.5 && confA >= 0.5 ? " Deal B sofreu piso de confiança aplicado." :
    "";

  if (!winner) {
    return `Ambos os deals têm score final idêntico (${a.risk_score}). Maior divergência: ${dominant.label} (Δ ${dominant.delta > 0 ? "+" : ""}${dominant.delta} raw em favor de Deal ${dominant.delta > 0 ? "A" : "B"}).${pisoNote}`;
  }

  return `Deal ${winner} tem score final ${absDelta} pontos maior que Deal ${winner === "A" ? "B" : "A"}. Principal contribuinte: ${dominant.label} (Δ ${dominant.delta > 0 ? "+" : ""}${dominant.delta} raw) e padrão "${winner === "A" ? a.breakdown.matched_pattern_label : b.breakdown.matched_pattern_label}" (confiança ${(winner === "A" ? confA : confB).toFixed(2)} vs ${(winner === "A" ? confB : confA).toFixed(2)}).${pisoNote}`;
}

function DealHeader({ deal, side }: { deal: AtRiskDealFromPattern; side: "A" | "B" }) {
  const borderColor = side === "A" ? "border-l-primary" : "border-l-destructive";
  return (
    <div className={cn("rounded-md border border-l-4 p-2.5 space-y-1", borderColor)}>
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono shrink-0">Deal {side}</Badge>
        <Badge variant="outline" className={cn("tabular-nums shrink-0", tone(deal.risk_score))}>
          {deal.risk_score}/100
        </Badge>
      </div>
      <p className="text-sm font-medium truncate" title={deal.client_name ?? "Cliente"}>
        {deal.client_name ?? "Cliente"}
      </p>
      <p className="text-[10px] text-muted-foreground tabular-nums">
        {fmtBRL(deal.amount)} · {deal.stage ?? "—"}
      </p>
      <p className="text-[10px] text-muted-foreground truncate" title={deal.matched_pattern}>
        {deal.matched_pattern}
      </p>
    </div>
  );
}

export function RiskCompareModal({ open, onOpenChange, dealA, dealB }: Props) {
  const ready = !!(dealA?.breakdown && dealB?.breakdown);

  const summary = useMemo(() => {
    if (!ready) return "";
    return buildCompareSummary(dealA!, dealB!);
  }, [ready, dealA, dealB]);

  const kwDiff = useMemo(() => {
    if (!ready) return { onlyA: [], onlyB: [], common: [] };
    return diffKeywords(
      dealA!.breakdown!.matched_keywords ?? [],
      dealB!.breakdown!.matched_keywords ?? [],
    );
  }, [ready, dealA, dealB]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-primary" aria-hidden />
            Comparar deals em risco
          </DialogTitle>
          <DialogDescription>
            Veja como cada sinal altera raw_score, confidence_weight e final_score lado a lado.
          </DialogDescription>
        </DialogHeader>

        {!ready ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Selecione 2 deals para comparar.
          </p>
        ) : (
          <div className="space-y-5">
            {/* Identificação */}
            <div className="grid grid-cols-2 gap-3">
              <DealHeader deal={dealA!} side="A" />
              <DealHeader deal={dealB!} side="B" />
            </div>

            {/* Componentes do raw_score */}
            <section aria-labelledby="comp-raw">
              <h3 id="comp-raw" className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Componentes do raw_score
              </h3>
              <table className="w-full text-xs">
                <caption className="sr-only">
                  Comparação dos componentes que somam para formar o raw_score.
                </caption>
                <thead className="text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="p-2 text-left font-normal">Componente</th>
                    <th className="p-2 text-right font-normal">Deal A</th>
                    <th className="p-2 text-right font-normal">Deal B</th>
                    <th className="p-2 text-right font-normal w-16">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {COMP_ROWS.map((row) => {
                    const va = row.pick(dealA!.breakdown!);
                    const vb = row.pick(dealB!.breakdown!);
                    return (
                      <tr key={row.label} className="border-b border-border/30">
                        <td className="p-2 align-top">
                          <p className="font-medium">{row.label}</p>
                          <p className="text-[10px] text-muted-foreground">max {row.max}</p>
                        </td>
                        <td className="p-2 text-right align-top w-1/3">
                          <span className="tabular-nums font-medium">{va}</span>
                          <MiniBar value={va} max={row.max} />
                        </td>
                        <td className="p-2 text-right align-top w-1/3">
                          <span className="tabular-nums font-medium">{vb}</span>
                          <MiniBar value={vb} max={row.max} />
                        </td>
                        <td className="p-2 text-right align-top">{deltaCell(va, vb)}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-semibold bg-muted/30">
                    <td className="p-2">Raw total</td>
                    <td className="p-2 text-right tabular-nums">
                      {dealA!.breakdown!.raw_score ?? COMP_ROWS.reduce((s, r) => s + r.pick(dealA!.breakdown!), 0)}
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {dealB!.breakdown!.raw_score ?? COMP_ROWS.reduce((s, r) => s + r.pick(dealB!.breakdown!), 0)}
                    </td>
                    <td className="p-2 text-right">
                      {deltaCell(
                        dealA!.breakdown!.raw_score ?? COMP_ROWS.reduce((s, r) => s + r.pick(dealA!.breakdown!), 0),
                        dealB!.breakdown!.raw_score ?? COMP_ROWS.reduce((s, r) => s + r.pick(dealB!.breakdown!), 0),
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Confiança e clamp */}
            <section aria-labelledby="comp-conf">
              <h3 id="comp-conf" className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Confiança e clamp
              </h3>
              <table className="w-full text-xs">
                <caption className="sr-only">
                  Comparação de confidence_weight, multiplicação e clamp aplicado.
                </caption>
                <thead className="text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="p-2 text-left font-normal w-1/3">Passo</th>
                    <th className="p-2 text-left font-normal w-1/3">Deal A</th>
                    <th className="p-2 text-left font-normal w-1/3">Deal B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/30">
                    <td className="p-2 font-medium">Padrão casado</td>
                    <td className="p-2 truncate" title={dealA!.breakdown!.matched_pattern_label}>
                      {dealA!.breakdown!.matched_pattern_label}
                    </td>
                    <td className="p-2 truncate" title={dealB!.breakdown!.matched_pattern_label}>
                      {dealB!.breakdown!.matched_pattern_label}
                    </td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="p-2 font-medium">Tipo do padrão</td>
                    <td className="p-2 font-mono text-[10px]">{dealA!.breakdown!.matched_pattern_type}</td>
                    <td className="p-2 font-mono text-[10px]">{dealB!.breakdown!.matched_pattern_type}</td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="p-2 font-medium">Confidence</td>
                    <td className="p-2">
                      <ConfBadge
                        original={dealA!.breakdown!.matched_confidence}
                        applied={dealA!.breakdown!.confidence_weight ?? Math.max(0.5, Math.min(1, dealA!.breakdown!.matched_confidence))}
                      />
                    </td>
                    <td className="p-2">
                      <ConfBadge
                        original={dealB!.breakdown!.matched_confidence}
                        applied={dealB!.breakdown!.confidence_weight ?? Math.max(0.5, Math.min(1, dealB!.breakdown!.matched_confidence))}
                      />
                    </td>
                  </tr>
                  {(["A", "B"] as const).map((side) => null)}
                  <tr className="border-b border-border/30">
                    <td className="p-2 font-medium">raw × conf</td>
                    {([dealA, dealB] as const).map((deal, i) => {
                      const b = deal!.breakdown!;
                      const raw = b.raw_score ?? COMP_ROWS.reduce((s, r) => s + r.pick(b), 0);
                      const cw = b.confidence_weight ?? Math.max(0.5, Math.min(1, b.matched_confidence));
                      const product = Math.round(raw * cw);
                      return (
                        <td key={i} className="p-2 tabular-nums font-mono text-[11px]">
                          {raw} × {cw.toFixed(2)} = {product}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="p-2 font-medium">Clamp aplicado?</td>
                    {([dealA, dealB] as const).map((deal, i) => {
                      const b = deal!.breakdown!;
                      const raw = b.raw_score ?? COMP_ROWS.reduce((s, r) => s + r.pick(b), 0);
                      const cw = b.confidence_weight ?? Math.max(0.5, Math.min(1, b.matched_confidence));
                      const product = raw * cw;
                      if (product > 100) {
                        return (
                          <td key={i} className="p-2">
                            <Badge variant="destructive" className="text-[9px] px-1 py-0">
                              Sim → teto 100
                            </Badge>
                          </td>
                        );
                      }
                      if (product < 0) {
                        return (
                          <td key={i} className="p-2">
                            <Badge variant="warning" className="text-[9px] px-1 py-0">
                              Sim → piso 0
                            </Badge>
                          </td>
                        );
                      }
                      return (
                        <td key={i} className="p-2 text-muted-foreground">Não</td>
                      );
                    })}
                  </tr>
                  <tr className="font-semibold bg-muted/30">
                    <td className="p-2">Final score</td>
                    <td className="p-2 tabular-nums text-base">
                      {dealA!.breakdown!.final_score ?? dealA!.risk_score}
                    </td>
                    <td className="p-2 tabular-nums text-base">
                      {dealB!.breakdown!.final_score ?? dealB!.risk_score}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Diff de keywords */}
            <section aria-labelledby="comp-kw">
              <h3 id="comp-kw" className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                <Swords className="h-3 w-3" aria-hidden />
                Diff de keywords competitivas
              </h3>
              {kwDiff.onlyA.length === 0 && kwDiff.onlyB.length === 0 && kwDiff.common.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">
                  Nenhuma keyword competitiva detectada em qualquer dos deals.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground">Deal A</p>
                      <div className="flex flex-wrap gap-1">
                        {[...kwDiff.onlyA.map((k) => ({ k, exclusive: true })), ...kwDiff.common.map((k) => ({ k, exclusive: false }))].map(({ k, exclusive }) => (
                          <Badge
                            key={`a-${k}`}
                            variant={exclusive ? "success" : "outline"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {k}
                          </Badge>
                        ))}
                        {kwDiff.onlyA.length === 0 && kwDiff.common.length === 0 && (
                          <span className="text-[10px] text-muted-foreground italic">—</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground">Deal B</p>
                      <div className="flex flex-wrap gap-1">
                        {[...kwDiff.onlyB.map((k) => ({ k, exclusive: true })), ...kwDiff.common.map((k) => ({ k, exclusive: false }))].map(({ k, exclusive }) => (
                          <Badge
                            key={`b-${k}`}
                            variant={exclusive ? "success" : "outline"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {k}
                          </Badge>
                        ))}
                        {kwDiff.onlyB.length === 0 && kwDiff.common.length === 0 && (
                          <span className="text-[10px] text-muted-foreground italic">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {kwDiff.onlyA.length} exclusivas de A · {kwDiff.onlyB.length} exclusivas de B · {kwDiff.common.length} em comum
                  </p>
                </>
              )}
            </section>

            {/* Conclusão automática */}
            <section
              aria-labelledby="comp-summary"
              className="rounded-md border border-primary/30 bg-primary/5 p-3"
            >
              <h3 id="comp-summary" className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">
                Conclusão
              </h3>
              <p className="text-xs leading-relaxed">{summary}</p>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
