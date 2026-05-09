import { memo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { activityIcons, activityLabels, outcomeLabels } from "./activityConstants";
import { ActivityType, ActivityOutcome } from "@/hooks/useActivities";

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

const ActivityItemRowInner = function ActivityItemRow({ activity, salesperson }: ActivityItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = activityIcons[activity.activity_type];
  const outcomeStyle = outcomeLabels[activity.outcome];
  
  const isVeryRecent = differenceInMinutes(new Date(), new Date(activity.created_at)) < 5;

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
export const ActivityItemRow = memo(ActivityItemRowInner);
