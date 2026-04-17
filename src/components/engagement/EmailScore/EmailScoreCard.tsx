import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { useEmailEngagementScore, useEngagementScoreHistory } from "@/hooks/engagement/useEmailEngagementScore";
import { TIER_META, formatPct } from "./engagementScoreHelpers";
import { cn } from "@/lib/utils";

interface Props { saleId: string }

export function EmailScoreCard({ saleId }: Props) {
  const { data: score, isLoading } = useEmailEngagementScore(saleId);
  const { data: history } = useEngagementScoreHistory(saleId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Engajamento por e-mail</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Engajamento por e-mail</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sem histórico de e-mail para este contato.</p>
        </CardContent>
      </Card>
    );
  }

  const meta = TIER_META[score.tier];
  const Icon = meta.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Engajamento por e-mail</span>
          <span className={cn("flex items-center gap-1 text-xs", meta.textClass)}>
            <Icon className="h-3.5 w-3.5" /> {meta.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={cn("relative w-20 h-20 rounded-full ring-4 flex items-center justify-center", meta.ringClass, meta.bgClass)}>
            <span className={cn("text-2xl font-bold", meta.textClass)}>{score.score}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm flex-1">
            <span className="text-muted-foreground">Abertura</span><span className="font-medium">{formatPct(score.open_rate)}</span>
            <span className="text-muted-foreground">Cliques</span><span className="font-medium">{formatPct(score.click_rate)}</span>
            <span className="text-muted-foreground">Respostas</span><span className="font-medium">{formatPct(score.reply_rate)}</span>
            <span className="text-muted-foreground">Enviados</span><span className="font-medium">{score.total_sent}</span>
          </div>
        </div>

        {(history?.length ?? 0) > 1 && (
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="captured_at" hide />
                <YAxis hide domain={[0, 100]} />
                <RTooltip
                  contentStyle={{ fontSize: 12, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }}
                  labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="text-xs text-muted-foreground flex justify-between pt-1 border-t">
          <span>Última atualização: {new Date(score.last_calculated_at).toLocaleString()}</span>
          {score.recency_days !== null && <span>Última atividade: {score.recency_days}d atrás</span>}
        </div>
      </CardContent>
    </Card>
  );
}
