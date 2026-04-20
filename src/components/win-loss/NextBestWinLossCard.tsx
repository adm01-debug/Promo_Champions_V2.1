import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button">;
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useNextBestWinLossDeal } from "@/hooks/win-loss/useNextBestWinLossDeal";
import { fmtBRL } from "@/components/deal-intelligence/winloss/winLossHelpers";

export function NextBestWinLossCard() {
  const { data, isLoading } = useNextBestWinLossDeal();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="py-4"><Skeleton className="h-16" /></CardContent>
      </Card>
    );
  }
  if (!data) return null;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Próximo melhor movimento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{data.clientName}</p>
            <p className="text-xs text-muted-foreground">{data.reason}</p>
            {data.amount && (
              <p className="text-xs tabular-nums text-primary mt-0.5">{fmtBRL(data.amount)}</p>
            )}
          </div>
          {data.accountId ? (
            <Button asChild size="sm" className="shrink-0">
              <Link to={`/contas/${data.accountId}`}>
                Abrir <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled className="shrink-0">Sem conta</Button>
          )}
        </div>
        <p className="text-[11px] italic text-muted-foreground border-l-2 border-primary/40 pl-2">
          {data.suggestedScript}
        </p>
      </CardContent>
    </Card>
  );
}
