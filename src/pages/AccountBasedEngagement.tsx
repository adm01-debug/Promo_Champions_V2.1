import { Helmet } from "react-helmet-async";
import { Building2, RefreshCw, Users, Crown, Activity, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTopAccounts, useRecomputeAccountEngagement } from "@/hooks/engagement/useAccountEngagement";
import { TopAccountsLeaderboard } from "@/components/engagement/Account/TopAccountsLeaderboard";
import { useUserRole } from "@/hooks/useUserRole";

export default function AccountBasedEngagement() {
  const { data: top = [] } = useTopAccounts(50);
  const recompute = useRecomputeAccountEngagement();
  const { role } = useUserRole();
  const canRecompute = role === "admin" || role === "manager";

  const tier1 = top.filter((a) => (a.account_score ?? 0) >= 70).length;
  const avgCoverage = top.length > 0
    ? Math.round(top.reduce((s, a) => s + Number(a.coverage ?? 0), 0) / top.length)
    : 0;
  const topScore = top[0]?.account_score ?? 0;

  const stats = [
    { label: "Contas", value: top.length, icon: Building2, tone: "text-primary" },
    { label: "Tier 1 (≥70)", value: tier1, icon: Crown, tone: "text-success" },
    { label: "Cobertura média", value: `${avgCoverage}%`, icon: Activity, tone: "text-info" },
    { label: "Top score", value: topScore, icon: Trophy, tone: "text-warning" },
  ];

  return (
    <>
      <Helmet>
        <title>ABM · Account-Based Engagement | Promo Champions</title>
        <meta name="description" content="Visão consolidada por conta com buying committee, score agregado e cobertura de stakeholders." />
        <link rel="canonical" href="/engagement/abm" />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Account-Based Engagement
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Engajamento consolidado por conta, com buying committee e cobertura de comitê.
            </p>
          </div>
          {canRecompute && (
            <Button
              onClick={() => recompute.mutate({ recompute_all: true })}
              loading={recompute.isPending}
              loadingText="Recalculando..."
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Recalcular contas
            </Button>
          )}
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} variant="modern">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${s.tone}`} />
                    {s.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display text-2xl font-bold tabular-nums">{s.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <TopAccountsLeaderboard limit={20} />
      </div>
    </>
  );
}
