import React from "react";
import { useActivityQualityScore } from "@/hooks/activities/useActivityQualityScore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const ActivityQualityWidget = React.memo(function ActivityQualityWidget() {
  const { data, isLoading } = useActivityQualityScore();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const top5 = (data || []).slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-primary" />
          Qualidade de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {top5.length > 0 ? (
          top5.map((sp, i) => (
            <div key={sp.salespersonId} className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-bold w-5 text-center",
                    i === 0 && "text-rank-gold",
                    i === 1 && "text-rank-silver",
                    i === 2 && "text-rank-bronze"
                  )}
                >
                  {i + 1}º
                </span>
                <span className="text-xs truncate flex-1">{sp.salespersonName}</span>
                <span className="text-xs font-semibold text-primary">
                  {sp.qualityScore}%
                </span>
              </div>
              <Progress
                value={sp.qualityScore}
                className={cn(
                  "h-1 ml-7",
                  sp.qualityScore >= 70 && "[&>div]:bg-success",
                  sp.qualityScore >= 40 && sp.qualityScore < 70 && "[&>div]:bg-warning",
                  sp.qualityScore < 40 && "[&>div]:bg-destructive"
                )}
              />
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Sem dados de atividades
          </p>
        )}
      </CardContent>
    </Card>
  );
});

ActivityQualityWidget.displayName = "ActivityQualityWidget";
