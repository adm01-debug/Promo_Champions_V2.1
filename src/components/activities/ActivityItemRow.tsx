import { memo, useState } from "react";
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
  const Icon = activityIcons[activity.activity_type];
  const outcomeStyle = outcomeLabels[activity.outcome];

  return (
    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border/50 transition-all duration-200 space-y-2 hover-lift">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 shadow-sm">
          <Icon className="h-4 w-4 gradient-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-display font-medium">{activityLabels[activity.activity_type]}</span>
            <Badge variant="outline" className={`text-[10px] border ${outcomeStyle.color}`}>{outcomeStyle.label}</Badge>
          </div>
          {activity.contact_name && <p className="text-xs text-muted-foreground mt-0.5">{activity.contact_name}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
          </p>
          {activity.duration_minutes && <p className="text-[10px] text-muted-foreground font-medium">{activity.duration_minutes} min</p>}
        </div>
      </div>

      {activity.notes && (
        <p className="text-xs text-muted-foreground pl-11 line-clamp-2 bg-muted/30 rounded-md px-2 py-1">{activity.notes}</p>
      )}

      {salesperson && (
        <div className="flex items-center gap-2 pl-11">
          <Avatar className="h-5 w-5 border border-border/40">
            <AvatarImage src={salesperson.avatar_url || undefined} />
            <AvatarFallback className="text-[8px] bg-gradient-to-br from-primary/20 to-accent/10">{salesperson.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground font-medium">{salesperson.name}</span>
        </div>
      )}
    </div>
  );
}
export const ActivityItemRow = memo(ActivityItemRowInner);
