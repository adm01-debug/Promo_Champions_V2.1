import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCloserPipeline } from "@/hooks/useCloserMetrics";
import { Skeleton } from "@/components/ui/skeleton";

export function CloserPipeline() {
  const { data: pipeline, isLoading } = useCloserPipeline();

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pipeline de Fechamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalValue = pipeline?.reduce((sum, p) => sum + p.value, 0) || 1;

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Pipeline de Fechamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pipeline?.map((stage) => (
          <div key={stage.stage} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{stage.stage}</span>
              <div className="text-right">
                <span className="text-muted-foreground">{stage.count} deals • </span>
                <span className="font-bold">R$ {stage.value.toLocaleString("pt-BR")}</span>
              </div>
            </div>
            <div className="h-6 bg-muted/30 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-center"
                style={{ 
                  width: `${(stage.value / totalValue) * 100}%`,
                  backgroundColor: stage.color,
                  minWidth: stage.count > 0 ? "40px" : "0"
                }}
              >
              <span className="text-[10px] font-bold text-primary-foreground drop-shadow-sm">
                {((stage.value / totalValue) * 100).toFixed(0)}%
              </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
