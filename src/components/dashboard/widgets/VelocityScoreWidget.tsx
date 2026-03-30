import { usePipelineVelocity } from "@/hooks/usePipelineVelocity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function VelocityScoreWidget() {
  const { data, isLoading } = usePipelineVelocity();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const top5 = (data || []).slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-yellow-500" />
          Velocity Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {top5.length > 0 ? (
          top5.map((sp, i) => (
            <div key={sp.salespersonId} className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-bold w-5 text-center",
                  i === 0 && "text-amber-500",
                  i === 1 && "text-slate-400",
                  i === 2 && "text-amber-700"
                )}
              >
                {i + 1}º
              </span>
              <span className="text-xs truncate flex-1">{sp.salespersonName}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  sp.avgCycleDays <= 7
                    ? "border-success/30 text-success"
                    : sp.avgCycleDays <= 14
                    ? "border-warning/30 text-warning"
                    : "border-destructive/30 text-destructive"
                )}
              >
                {sp.avgCycleDays > 0 ? `${sp.avgCycleDays}d` : "—"}
              </Badge>
              <span className="text-xs font-semibold text-primary tabular-nums">
                {sp.velocityScore > 1000
                  ? `${(sp.velocityScore / 1000).toFixed(1)}k`
                  : sp.velocityScore}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Sem dados de velocidade
          </p>
        )}
      </CardContent>
    </Card>
  );
}
