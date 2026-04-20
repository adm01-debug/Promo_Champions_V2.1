import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useScriptABTest } from "@/hooks/win-loss/useScriptABTest";

export function ScriptABPanel() {
  const { data, isLoading } = useScriptABTest();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConical className="h-4 w-4 text-primary" />
          A/B de scripts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24" />
        ) : !data || !data.variants.length ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Marque o campo <code className="text-[10px] bg-muted px-1 py-0.5 rounded">script_variant</code> nos deals para comparar abordagens.
          </p>
        ) : (
          <div className="space-y-3">
            <ul className="space-y-2">
              {data.variants.slice(0, 4).map((v) => {
                const isWinner = v.variant === data.winnerVariant;
                return (
                  <li
                    key={v.variant}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg border ${isWinner ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/40"}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isWinner && <Trophy className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                      <span className="text-sm font-medium truncate">{v.variant}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-muted-foreground tabular-nums">{v.total} deals</span>
                      <Badge variant="outline" className={isWinner ? "border-emerald-500/40 text-emerald-700" : ""}>
                        {v.winRate.toFixed(0)}%
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
            {data.chiSquare !== null && (
              <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-2">
                χ² = {data.chiSquare.toFixed(2)} ·{" "}
                {data.significant
                  ? "Diferença estatisticamente significativa (p < 0.05)"
                  : "Sem significância estatística — colete mais dados"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
