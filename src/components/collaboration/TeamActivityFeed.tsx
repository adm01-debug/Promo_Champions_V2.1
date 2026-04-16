import React from "react";
import { useTeamActivityFeed, TeamActivity } from "@/hooks/useTeamActivityFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Phone, ArrowRight, UserPlus } from "lucide-react";

const TYPE_CONFIG: Record<TeamActivity["type"], { icon: React.ElementType; color: string }> = {
  sale: { icon: DollarSign, color: "text-status-success" },
  activity: { icon: Phone, color: "text-primary" },
  deal_move: { icon: ArrowRight, color: "text-status-warning" },
  client_new: { icon: UserPlus, color: "text-info" },
};

const ActivityItem = React.memo(({ item }: { item: TeamActivity }) => {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/20 last:border-0 group">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarImage src={item.avatar_url || undefined} />
        <AvatarFallback className="text-[10px] bg-muted">{item.salesperson_name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed">
          <span className="font-semibold text-foreground">{item.salesperson_name}</span>{" "}
          <span className="text-muted-foreground">{item.description}</span>
          {item.amount != null && (
            <span className="ml-1 font-semibold text-status-success">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(item.amount)}
            </span>
          )}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
      <Icon className={cn("h-3.5 w-3.5 shrink-0 mt-1", config.color)} />
    </div>
  );
});
ActivityItem.displayName = "ActivityItem";

export const TeamActivityFeed = React.memo(() => {
  const { data: feed, isLoading } = useTeamActivityFeed(15);

  return (
    <div className="glass rounded-xl border border-border/40 p-4">
      <h3 className="font-display font-semibold text-sm mb-3">Feed da Equipe</h3>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : !feed?.length ? (
        <p className="text-xs text-muted-foreground text-center py-4">Nenhuma atividade recente</p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
          {feed.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
});
TeamActivityFeed.displayName = "TeamActivityFeed";
