import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { useEmailEngagementLeaderboard } from "@/hooks/engagement/useEmailEngagementScore";
import { EmailScoreBadge } from "./EmailScoreBadge";

interface Props { limit?: number }

export function EngagementLeaderboard({ limit = 20 }: Props) {
  const { data, isLoading } = useEmailEngagementLeaderboard(limit);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-warning" /> Top contatos por engajamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum contato pontuado ainda. Recalcule para gerar o ranking.
          </p>
        ) : (
          <ul className="space-y-1">
            {data?.map((entry, idx) => (
              <li
                key={entry.sale_id}
                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-accent/40 transition-colors"
              >
                <span className="text-xs font-mono text-muted-foreground w-6 text-right">{idx + 1}.</span>
                <span className="flex-1 truncate text-sm font-medium">
                  {entry.client_name ?? "Sem nome"}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">
                  {entry.total_sent} env.
                </span>
                <EmailScoreBadge
                  score={entry.score}
                  tier={entry.tier}
                  openRate={entry.open_rate}
                  clickRate={entry.click_rate}
                  replyRate={entry.reply_rate}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
