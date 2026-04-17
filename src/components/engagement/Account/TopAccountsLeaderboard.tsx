import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useTopAccounts } from "@/hooks/engagement/useAccountEngagement";
import { AccountScoreBadge } from "./AccountScoreBadge";
import { AccountCoverageBar } from "./AccountCoverageBar";

interface Props {
  limit?: number;
}

export function TopAccountsLeaderboard({ limit = 20 }: Props) {
  const { data = [], isLoading } = useTopAccounts(limit);

  return (
    <Card variant="modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Top Contas por Engajamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Nenhuma conta agregada ainda. Recalcule para popular.
          </div>
        ) : (
          <ol className="space-y-2">
            {data.map((acc, idx) => (
              <li key={acc.id}>
                <Link
                  to={`/engagement/abm/${acc.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-muted/40 transition-colors"
                >
                  <span className="w-7 text-center font-bold text-muted-foreground tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{acc.name}</span>
                      {acc.industry && (
                        <Badge variant="outline" size="sm">{acc.industry}</Badge>
                      )}
                    </div>
                    <div className="mt-1.5 max-w-xs">
                      <AccountCoverageBar coverage={acc.coverage} engaged={acc.engaged_contacts} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <AccountScoreBadge tier={acc.tier} score={acc.account_score} size="sm" />
                    {acc.champion_count > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        👑 {acc.champion_count} · 🛡 {acc.decision_maker_count}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
