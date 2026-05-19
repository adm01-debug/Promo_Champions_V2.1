import { memo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ChevronDown, ChevronUp, History, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow, differenceInMinutes, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { activityIcons, activityLabels, outcomeLabels } from "./activityConstants";
import { ActivityType, ActivityOutcome } from "@/hooks/activities/useActivities";

interface AuditLog {
  id: string;
  activity_id: string;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  user_id: string | null;
}

interface ActivityItemRowProps {
  activity: {
    id: string;
    activity_type: ActivityType;
    outcome: ActivityOutcome;
    contact_name: string | null;
    notes: string | null;
    duration_minutes: number | null;
    created_at: string;
    salesperson_id: string | null;
  };
  salesperson?: { name: string; avatar_url: string | null } | null;
}

const ActivityItemRowComponent = ({ activity, salesperson }: ActivityItemRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  
  const Icon = activityIcons[activity.activity_type];
  const outcomeStyle = outcomeLabels[activity.outcome];
  
  const isVeryRecent = differenceInMinutes(new Date(), new Date(activity.created_at)) < 5;

  const fetchAuditLogs = useCallback(async () => {
    setLoadingAudit(true);
    const { data, error } = await supabase
      .from('activity_audit_logs')
      .select('*')
      .eq('activity_id', activity.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) setAuditLogs(data as unknown as AuditLog[]);
    setLoadingAudit(false);
  }, [activity.id]);

  const isSuccess = activity.outcome === 'scheduled' || activity.outcome === 'qualified';
  
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all duration-200 space-y-2 hover-lift group",
      isSuccess 
        ? "bg-gradient-to-br from-status-success/5 to-transparent border-status-success/20 shadow-sm" 
        : "bg-muted/30 hover:bg-muted/50 border-border/30 hover:border-border/50"
    )}>
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 shadow-sm">
            <Icon className="h-4 w-4 gradient-primary" />
          </div>
          {isVeryRecent && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-display font-bold group-hover:text-primary transition-colors">{activityLabels[activity.activity_type]}</span>
            <Badge variant="outline" className={`text-[10px] font-bold border ${outcomeStyle.color}`}>{outcomeStyle.label}</Badge>
            {isVeryRecent && <Badge variant="secondary" className="text-[8px] h-4 bg-status-success/10 text-status-success border-none animate-pulse">NOVO</Badge>}
            
            <Popover>
              <PopoverTrigger asChild>
                <button onClick={fetchAuditLogs} className="p-1 rounded-md hover:bg-muted/50 transition-colors">
                  <History className="h-3 w-3 text-muted-foreground hover:text-primary" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 glass border-border/40" align="start">
                <div className="p-3 border-b border-border/40">
                  <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <History className="h-3 w-3 text-primary" />
                    Histórico de Alterações
                  </h4>
                </div>
                <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                  {loadingAudit ? (
                    <div className="text-[10px] text-center py-4 text-muted-foreground">Carregando histórico...</div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-[10px] text-center py-4 text-muted-foreground">Nenhuma alteração registrada</div>
                  ) : (
                    auditLogs.map((log) => {
                      const oldData = log.old_data as Record<string, unknown> | null;
                      const newData = log.new_data as Record<string, unknown> | null;
                      const oldOutcome = oldData?.outcome;
                      const oldNotes = oldData?.notes;
                      const newOutcome = newData?.outcome;
                      const newNotes = newData?.notes;
                      
                      return (
                        <div key={log.id} className="p-2 rounded bg-muted/30 border border-border/20 text-[10px] space-y-1">
                          <div className="flex justify-between items-center text-muted-foreground">
                            <span className="flex items-center gap-1 font-bold">
                              <User className="h-2 w-2" />
                              {log.action}
                            </span>
                            <span>{format(new Date(log.created_at), "dd/MM HH:mm")}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="p-1 rounded bg-red-500/5 border border-red-500/10 line-clamp-1 opacity-70">
                              {JSON.stringify(oldOutcome || oldNotes)}
                            </div>
                            <div className="p-1 rounded bg-green-500/5 border border-green-500/10 line-clamp-1">
                              {JSON.stringify(newOutcome || newNotes)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {activity.contact_name && <p className="text-xs text-muted-foreground mt-0.5 font-medium">{activity.contact_name}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 font-medium">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
          </p>
          {activity.duration_minutes && (
            <p className="text-[10px] text-primary/80 font-black mt-0.5 bg-primary/5 px-1.5 rounded-full inline-block">
              {activity.duration_minutes} min
            </p>
          )}
        </div>
      </div>

      {activity.notes && (
        <div className="pl-11 pr-2">
          <div 
            className={`text-xs text-muted-foreground bg-muted/20 rounded-md px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors relative ${!expanded && activity.notes.length > 100 ? "line-clamp-2" : ""}`}
            onClick={() => activity.notes && activity.notes.length > 100 && setExpanded(!expanded)}
          >
            {activity.notes}
            {activity.notes.length > 100 && (
              <div className="absolute bottom-1 right-1">
                {expanded ? <ChevronUp className="h-3 w-3 opacity-50" /> : <ChevronDown className="h-3 w-3 opacity-50" />}
              </div>
            )}
          </div>
        </div>
      )}

      {salesperson && (
        <div className="flex items-center gap-2 pl-11">
          <Avatar className="h-5 w-5 border border-border/40 shadow-sm">
            <AvatarImage src={salesperson.avatar_url || undefined} />
            <AvatarFallback className="text-[8px] font-bold bg-gradient-to-br from-primary/20 to-accent/10">{salesperson.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground font-semibold tracking-tight">{salesperson.name}</span>
        </div>
      )}
    </div>
  );
}
export const ActivityItemRow = memo(ActivityItemRowComponent);
