import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Eye, MousePointerClick, MessageSquare } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useEngagementScore,
  useRecomputeEngagement,
  type ContactType,
} from "@/hooks/engagement/useEngagementScore";
import { EngagementScoreBadge } from "./EngagementScoreBadge";
import { TIER_META } from "./engagementScoreHelpers";

interface Props {
  contactId: string;
  contactType: ContactType;
}

export function EngagementScoreCard({ contactId, contactType }: Props) {
  const { data, isLoading } = useEngagementScore(contactId, contactType);
  const recompute = useRecomputeEngagement();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const score = data?.score;
  const history = data?.history ?? [];
  const tier = score?.tier ?? "cold";
  const meta = TIER_META[tier];

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <meta.icon className="h-4 w-4" />
          Engajamento de Email
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => recompute.mutate({ contactId, contactType })}
          disabled={recompute.isPending}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${recompute.isPending ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold tabular-nums">{Math.round(score?.score ?? 0)}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
          <EngagementScoreBadge score={score?.score} tier={tier} showLabel className="ml-auto" />
        </div>

        {history.length >= 2 ? (
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="captured_at" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{ fontSize: 11, padding: 4 }}
                  labelFormatter={(v) => format(new Date(v as string), "dd/MM", { locale: ptBR })}
                  formatter={(v: any) => [Math.round(v), "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={meta.hexAccent}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">
            Sem histórico suficiente
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded border p-2">
            <Eye className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <div className="font-semibold tabular-nums">{score?.total_opens ?? 0}</div>
            <div className="text-[10px] text-muted-foreground">Aberturas</div>
          </div>
          <div className="rounded border p-2">
            <MousePointerClick className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <div className="font-semibold tabular-nums">{score?.total_clicks ?? 0}</div>
            <div className="text-[10px] text-muted-foreground">Cliques</div>
          </div>
          <div className="rounded border p-2">
            <MessageSquare className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <div className="font-semibold tabular-nums">{score?.total_replies ?? 0}</div>
            <div className="text-[10px] text-muted-foreground">Respostas</div>
          </div>
        </div>

        {score?.last_signal_at && (
          <div className="text-[11px] text-muted-foreground text-center">
            Último sinal: {format(new Date(score.last_signal_at), "dd MMM HH:mm", { locale: ptBR })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
