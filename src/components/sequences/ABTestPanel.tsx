import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, FlaskConical, Inbox, Zap } from "lucide-react";
import { useSequenceVariantsOverview, type StepVariantOverviewRow } from "@/hooks/sequences/useSequenceVariantsOverview";
import { usePromoteSequenceWinners } from "@/hooks/sequences/usePromoteWinners";
import { analyzeWinner } from "./abTestHelpers";
import { CHANNEL_META, type ChannelKey } from "./sequenceHelpers";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  sequenceId: string;
}

interface StepGroup {
  step_id: string;
  step_order: number;
  channel: string;
  rows: StepVariantOverviewRow[];
}

export function ABTestPanel({ sequenceId }: Props) {
  const { data, isLoading } = useSequenceVariantsOverview(sequenceId);
  const promote = usePromoteSequenceWinners();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  const groups = new Map<string, StepGroup>();
  for (const r of data ?? []) {
    const g = groups.get(r.step_id) ?? { step_id: r.step_id, step_order: r.step_order, channel: r.channel, rows: [] };
    g.rows.push(r);
    groups.set(r.step_id, g);
  }
  const groupList = Array.from(groups.values()).sort((a, b) => a.step_order - b.step_order);

  if (groupList.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="text-lg font-semibold mb-1">Nenhum teste A/B em execução</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Edite um passo da sequência e adicione variantes na aba "Teste A/B" para começar a comparar conteúdos.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">{groupList.length} step(s) com variantes ativas</p>
            <p className="text-xs text-muted-foreground">Promova vencedores automaticamente quando houver significância (≥30 envios + 90% confiança).</p>
          </div>
        </div>
        <Button
          onClick={() => promote.mutate(sequenceId)}
          loading={promote.isPending}
        >
          <Zap className="h-4 w-4 mr-2" />
          Promover vencedores
        </Button>
      </Card>

      {groupList.map((g) => {
        const meta = CHANNEL_META[g.channel as ChannelKey] ?? CHANNEL_META.task;
        const Icon = meta.icon;
        const analysis = analyzeWinner(g.rows.map((r) => ({
          step_id: r.step_id, variant_id: r.variant_id, label: r.label,
          sent: r.sent, replied: r.replied, reply_rate: r.reply_rate,
        })));
        const totalSent = g.rows.reduce((s, r) => s + r.sent, 0);
        return (
          <Card key={g.step_id} className="p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">#{g.step_order + 1}</Badge>
                <div className={`p-1.5 rounded-md bg-muted ${meta.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{meta.label}</span>
                <span className="text-xs text-muted-foreground">· {totalSent} envios totais</span>
              </div>
              {analysis.significant && analysis.winnerLabel && (
                <Badge className="gap-1">
                  <Trophy className="h-3 w-3" />
                  Vencedor: {analysis.winnerLabel}
                </Badge>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left py-2">Variante</th>
                    <th className="text-right py-2">Envios</th>
                    <th className="text-right py-2">Respostas</th>
                    <th className="text-right py-2">Reply rate</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.sort((a, b) => a.label.localeCompare(b.label)).map((r) => {
                    const isWinner = analysis.significant && analysis.winnerLabel === r.label;
                    return (
                      <tr key={r.variant_id} className="border-b last:border-0">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={isWinner ? "default" : "outline"}>{r.label}</Badge>
                            {isWinner && <Trophy className="h-3.5 w-3.5 text-primary" />}
                          </div>
                        </td>
                        <td className="text-right py-2 tabular-nums">{r.sent}</td>
                        <td className="text-right py-2 tabular-nums">{r.replied}</td>
                        <td className={`text-right py-2 tabular-nums font-semibold ${isWinner ? "text-primary" : ""}`}>
                          {r.reply_rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <Inbox className="h-3 w-3" />
              {analysis.reason}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
