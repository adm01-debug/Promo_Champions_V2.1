import { useAuditLogs } from "@/hooks/admin/useAuditLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText, User, Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-status-success/10 text-status-success border-status-success/30",
  update: "bg-primary/10 text-primary border-primary/30",
  delete: "bg-destructive/10 text-destructive border-destructive/30",
};

export function ActivityAuditTrail() {
  const { data: logs, isLoading } = useAuditLogs({ entity_type: 'activity' }, 20);

  return (
    <Card className="glass border-border/40 hover-lift h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          Audit Trail de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !logs?.length ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-xl">
            <ScrollText className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhuma atividade registrada</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6 pb-4 border-l border-primary/10 last:pb-0">
                  <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary/40 ring-4 ring-background" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-[9px] h-4 px-1 uppercase", 
                        ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground")}>
                        {log.action}
                      </Badge>
                      <span className="text-[11px] font-medium text-foreground truncate">
                        {log.entity_type} {log.entity_id?.slice(0, 6)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{log.actor_email?.split('@')[0] || "Sistema"}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}