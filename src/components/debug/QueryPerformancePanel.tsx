import { useState, useEffect } from "react";
import { getQueryMetrics, clearQueryMetrics, logQueryMetrics } from "@/hooks/useQueryPerformance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Trash2, RefreshCw, AlertTriangle, Clock, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export function QueryPerformancePanel() {
  const [metrics, setMetrics] = useState(getQueryMetrics());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getQueryMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (!import.meta.env.DEV) return null;

  const handleClear = () => {
    clearQueryMetrics();
    setMetrics(getQueryMetrics());
  };

  const handleLog = () => {
    logQueryMetrics();
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 gap-2 shadow-lg"
        onClick={() => setIsExpanded(true)}
      >
        <Activity className="h-4 w-4" />
        <span>{metrics.totalQueries} queries</span>
        {metrics.slowQueries > 0 && (
          <Badge variant="destructive" className="ml-1">
            {metrics.slowQueries} slow
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[400px] overflow-hidden shadow-xl">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Query Performance
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleLog}>
            <Database className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(false)}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4 space-y-3 max-h-[320px] overflow-y-auto">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{metrics.totalQueries}</div>
            <div className="text-[10px] text-muted-foreground">Total</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{metrics.avgDuration}ms</div>
            <div className="text-[10px] text-muted-foreground">Avg</div>
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            metrics.slowQueries > 0 ? "bg-destructive/20" : "bg-muted/50"
          )}>
            <div className="text-lg font-bold flex items-center justify-center gap-1">
              {metrics.slowQueries > 0 && <AlertTriangle className="h-3 w-3 text-destructive" />}
              {metrics.slowQueries}
            </div>
            <div className="text-[10px] text-muted-foreground">Slow</div>
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            metrics.errorRate > 0 ? "bg-destructive/20" : "bg-muted/50"
          )}>
            <div className="text-lg font-bold">{metrics.errorRate}%</div>
            <div className="text-[10px] text-muted-foreground">Errors</div>
          </div>
        </div>

        {/* By Query Key */}
        {Object.keys(metrics.byQueryKey).length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">By Query</div>
            <div className="space-y-1">
              {Object.entries(metrics.byQueryKey)
                .sort((a, b) => b[1].avgDuration - a[1].avgDuration)
                .slice(0, 8)
                .map(([key, data]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30"
                  >
                    <span className="truncate max-w-[180px] font-mono text-[10px]">
                      {key}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {data.count}x
                      </Badge>
                      <span className={cn(
                        "flex items-center gap-1",
                        data.avgDuration > 1000 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        <Clock className="h-3 w-3" />
                        {data.avgDuration}ms
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Metrics */}
        {metrics.recentMetrics && metrics.recentMetrics.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Recent</div>
            <div className="space-y-1">
              {metrics.recentMetrics.slice(0, 5).map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[10px] p-1 rounded bg-muted/20"
                >
                  <span className="truncate max-w-[200px] font-mono">{m.queryKey}</span>
                  <span className={cn(
                    m.status === "error" ? "text-destructive" : "",
                    m.duration > 1000 ? "text-warning" : ""
                  )}>
                    {m.duration}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
