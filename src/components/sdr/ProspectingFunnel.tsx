import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProspectingFunnel } from "@/hooks/useSDRMetrics";
import { Skeleton } from "@/components/ui/skeleton";

export function ProspectingFunnel() {
  const { data: funnel, isLoading } = useProspectingFunnel();

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Funil de Prospecção</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...(funnel?.map(s => s.count) || [1]));

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Funil de Prospecção</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {funnel?.map((stage, index) => (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{stage.stage}</span>
              <span className="text-muted-foreground">
                {stage.count} ({stage.percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="h-6 bg-muted/30 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-center"
                style={{ 
                  width: `${(stage.count / maxCount) * 100}%`,
                  backgroundColor: stage.color,
                  minWidth: stage.count > 0 ? "20px" : "0"
                }}
              >
                <span className="text-[10px] font-bold text-white drop-shadow-sm">
                  {stage.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
