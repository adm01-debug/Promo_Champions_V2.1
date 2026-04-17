import { Helmet } from "react-helmet-async";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EngagementLeaderboard } from "@/components/engagement/EmailScore/EngagementLeaderboard";
import {
  useEmailEngagementLeaderboard,
  useRecomputeEngagementScores,
} from "@/hooks/engagement/useEmailEngagementScore";
import { TIER_META, type EngagementTier } from "@/components/engagement/EmailScore/engagementScoreHelpers";
import { cn } from "@/lib/utils";

export default function EmailEngagementScoringPage() {
  const { data, isLoading } = useEmailEngagementLeaderboard(100);
  const recompute = useRecomputeEngagementScores();

  const counts: Record<EngagementTier, number> = { cold: 0, warm: 0, hot: 0, champion: 0 };
  (data ?? []).forEach((row) => { counts[row.tier] += 1; });

  return (
    <>
      <Helmet>
        <title>Email Engagement Scoring | Promo Champions</title>
        <meta name="description" content="Pontuação de engajamento por e-mail (0–100) por contato, com tiers cold/warm/hot/champion e ranking dinâmico." />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-page-title flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" /> Email Engagement Scoring
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Score 0–100 por contato baseado em aberturas, cliques, respostas e recência (últimos 90 dias).
            </p>
          </div>
          <Button onClick={() => recompute.mutate({ recompute_all: true })} disabled={recompute.isPending}>
            <RefreshCw className={cn("h-4 w-4", recompute.isPending && "animate-spin")} />
            Recalcular tudo
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(TIER_META) as EngagementTier[]).map((tier) => {
            const meta = TIER_META[tier];
            const Icon = meta.icon;
            return (
              <Card key={tier}>
                <CardHeader className="pb-2">
                  <CardTitle className={cn("text-sm font-medium flex items-center gap-2", meta.textClass)}>
                    <Icon className="h-4 w-4" /> {meta.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-3xl font-bold">{counts[tier]}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">contatos</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <EngagementLeaderboard limit={20} />
      </div>
    </>
  );
}
