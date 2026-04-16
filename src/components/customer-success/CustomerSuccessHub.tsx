import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Heart, AlertTriangle, TrendingUp, DollarSign, Activity, Users } from "lucide-react";
import { useCustomerSuccess, type AccountHealth } from "@/hooks/useCustomerSuccess";

const RISK_VARIANTS: Record<AccountHealth["churn_risk"], "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "default",
  critical: "destructive",
};

const RISK_LABELS: Record<AccountHealth["churn_risk"], string> = {
  low: "Saudável",
  medium: "Atenção",
  high: "Em Risco",
  critical: "Crítico",
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export function CustomerSuccessHub() {
  const { data, isLoading } = useCustomerSuccess();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const summary = data?.summary;
  const accounts = data?.accounts ?? [];

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>Customer Success Hub | Promo Champions</title>
        <meta name="description" content="Saúde de clientes, risco de churn e oportunidades de expansão" />
      </Helmet>

      <div>
        <h1 className="text-3xl font-display font-bold gradient-text">Customer Success Hub</h1>
        <p className="text-muted-foreground mt-1">Saúde de clientes, churn risk e oportunidades de expansão</p>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Contas Totais</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_accounts}</div>
              <p className="text-xs text-muted-foreground">Health médio: {summary.avg_health_score}/100</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Em Risco</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summary.at_risk}</div>
              <p className="text-xs text-muted-foreground">{summary.critical} crítico(s)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Expansão</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{summary.expansion_ready}</div>
              <p className="text-xs text-muted-foreground">Prontas para upsell</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Receita em Risco</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBRL(summary.total_revenue_at_risk)}</div>
              <p className="text-xs text-muted-foreground">Anual</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" />Saúde por Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma conta encontrada.</p>
          ) : (
            accounts.slice(0, 25).map((acc) => (
              <div key={acc.account_id} className="border border-border/40 rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{acc.account_name}</span>
                      <Badge variant="outline" className="text-xs">{acc.tier}</Badge>
                      <Badge variant={RISK_VARIANTS[acc.churn_risk]} className="text-xs">
                        {RISK_LABELS[acc.churn_risk]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Última atividade: {acc.days_since_last_activity}d atrás · Receita: {formatBRL(acc.total_revenue)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">Health</div>
                    <div className="text-lg font-bold">{acc.health_score}</div>
                  </div>
                </div>
                <Progress value={acc.health_score} className="h-1.5" />
                <p className="text-sm text-foreground/80 pt-1">{acc.recommended_action}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
