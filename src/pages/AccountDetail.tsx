import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, Globe, Briefcase, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useAccountSummary } from "@/hooks/engagement/useAccountEngagement";
import { AccountScoreBadge } from "@/components/engagement/Account/AccountScoreBadge";
import { AccountCoverageBar } from "@/components/engagement/Account/AccountCoverageBar";
import { BuyingCommitteeCard } from "@/components/engagement/Account/BuyingCommitteeCard";

export default function AccountDetail() {
  const { accountId } = useParams<{ accountId: string }>();
  const { data: account, isLoading } = useAccount(accountId);
  const { data: summary } = useAccountSummary(accountId);

  if (isLoading || !account) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{account.name} · Conta ABM | Promo Champions</title>
        <meta name="description" content={`Detalhes ABM da conta ${account.name}, comitê e engajamento consolidado.`} />
        <link rel="canonical" href={`/engagement/abm/${account.id}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
          <Link to="/engagement/abm">
            <ArrowLeft className="h-4 w-4" />
            Todas as contas
          </Link>
        </Button>

        <Card variant="modern">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-2">
                <CardTitle className="font-display text-2xl flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  {account.name}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {account.industry && (
                    <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{account.industry}</span>
                  )}
                  {account.website && (
                    <a href={account.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
                      <Globe className="h-3.5 w-3.5" />{account.website}
                    </a>
                  )}
                </div>
              </div>
              <AccountScoreBadge tier={account.tier} score={account.account_score} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Score consolidado" value={account.account_score ?? 0} />
              <Stat label="Contatos engajados" value={`${account.engaged_contacts ?? 0}`} />
              <Stat label="Champions" value={account.champion_count ?? 0} />
              <Stat label="Decisores" value={account.decision_maker_count ?? 0} />
            </div>
            <AccountCoverageBar
              coverage={account.coverage}
              engaged={summary?.engaged_contacts}
              total={summary?.total_contacts}
            />
            {summary && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/40 pt-3">
                <MessageSquare className="h-3.5 w-3.5" />
                {summary.interactions_30d} interações nos últimos 30 dias
              </div>
            )}
          </CardContent>
        </Card>

        <BuyingCommitteeCard accountId={account.id} />
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
