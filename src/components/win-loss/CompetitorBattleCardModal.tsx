import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Swords, Target, ShieldAlert, Sparkles } from "lucide-react";
import { fmtBRL, fmtPct } from "@/components/deal-intelligence/winloss/winLossHelpers";
import type { CompetitorStat } from "@/hooks/win-loss/useWinLossAggregations";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  competitor: CompetitorStat | null;
}

const STRENGTHS_BY_NAME: Record<string, string[]> = {
  default: ["Time consultivo", "ROI rápido", "Onboarding em 7 dias", "Suporte 24/7 em PT-BR"],
};
const WEAKNESSES_BY_NAME: Record<string, string[]> = {
  default: ["Preço de tabela maior", "SKU específico não disponível"],
};
const OBJECTIONS = [
  { q: "Eles entregam mais rápido.", a: "Mostre case de Q1 com SLA real e penalidade contratual." },
  { q: "O preço deles é menor.", a: "Compare TCO 12m incluindo retrabalho e suporte premium." },
  { q: "Já temos contrato com eles.", a: "Proponha piloto de 30 dias paralelo, sem rescisão." },
];

export function CompetitorBattleCardModal({ open, onOpenChange, competitor }: Props) {
  if (!competitor) return null;
  const strengths = STRENGTHS_BY_NAME[competitor.name] ?? STRENGTHS_BY_NAME.default;
  const weaknesses = WEAKNESSES_BY_NAME[competitor.name] ?? WEAKNESSES_BY_NAME.default;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-primary" />
            Battle Card · {competitor.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Card className="border-border/50"><CardContent className="p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Confrontos</p>
                <p className="text-lg font-semibold tabular-nums">{competitor.encounters}</p>
              </CardContent></Card>
              <Card className="border-border/50"><CardContent className="p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Win Rate</p>
                <p className="text-lg font-semibold tabular-nums">{fmtPct(competitor.winRateVs)}</p>
              </CardContent></Card>
              <Card className="border-border/50"><CardContent className="p-3">
                <p className="text-[10px] uppercase text-muted-foreground">W / L</p>
                <p className="text-lg font-semibold tabular-nums">{competitor.wins} / {competitor.losses}</p>
              </CardContent></Card>
              <Card className="border-border/50"><CardContent className="p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Ticket perdido</p>
                <p className="text-lg font-semibold tabular-nums">{fmtBRL(competitor.avgLostAmount)}</p>
              </CardContent></Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="border-emerald-500/30">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5 mb-2">
                    <Target className="h-3.5 w-3.5" /> Nossos pontos fortes
                  </p>
                  <ul className="space-y-1 text-xs">
                    {strengths.map(s => <li key={s}>· {s}</li>)}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-rose-500/30">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-rose-700 flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="h-3.5 w-3.5" /> Pontos a defender
                  </p>
                  <ul className="space-y-1 text-xs">
                    {weaknesses.map(w => <li key={w}>· {w}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-3">
                <p className="text-xs font-medium flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Objeções comuns & resposta
                </p>
                <div className="space-y-3">
                  {OBJECTIONS.map(o => (
                    <div key={o.q} className="rounded-md border border-border/50 p-2 bg-muted/30">
                      <p className="text-xs font-medium">"{o.q}"</p>
                      <p className="text-[11px] text-muted-foreground mt-1">→ {o.a}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {competitor.topReason && competitor.topReason !== "—" && (
              <Card className="border-border/50">
                <CardContent className="p-3">
                  <p className="text-[11px] uppercase text-muted-foreground">Top motivo de perda</p>
                  <Badge variant="outline" className="mt-1">{competitor.topReason}</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
