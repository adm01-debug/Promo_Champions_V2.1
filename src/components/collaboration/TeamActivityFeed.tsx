import React from "react";
import { useTeamActivityFeed, TeamActivity } from "@/hooks/useTeamActivityFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Phone, ArrowRight, UserPlus } from "lucide-react";

const TYPE_CONFIG: Record<TeamActivity["type"], { icon: React.ElementType; color: string; bg: string; label: string }> = {
  sale: { icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "VENDA" },
  activity: { icon: Phone, color: "text-blue-500", bg: "bg-blue-500/10", label: "ATIVIDADE" },
  deal_move: { icon: ArrowRight, color: "text-amber-500", bg: "bg-amber-500/10", label: "PIPELINE" },
  client_new: { icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-500/10", label: "CLIENTE" },
};

const ActivityItem = React.memo(({ item }: { item: TeamActivity }) => {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div className="group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-accent/40 border border-transparent hover:border-border/50 overflow-hidden">
      <div className="relative">
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background ring-offset-2 ring-offset-muted/20 group-hover:ring-primary/20 transition-all">
          <AvatarImage src={item.avatar_url || undefined} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-muted to-muted/50 font-bold">
            {item.salesperson_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className={cn("absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-background shadow-sm", config.bg)}>
          <Icon className={cn("h-2.5 w-2.5", config.color)} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[9px] font-black tracking-tighter uppercase text-muted-foreground/60 group-hover:text-primary/60 transition-colors">
            {config.label}
          </span>
          <span className="text-[9px] font-medium text-muted-foreground tabular-nums">
            {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
        
        <p className="text-xs leading-relaxed">
          <span className="font-bold text-foreground group-hover:text-primary transition-colors">
            {item.salesperson_name}
          </span>{" "}
          <span className="text-muted-foreground font-medium">{item.description}</span>
          {item.amount != null && (
            <span className="ml-1.5 font-black text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded-md">
              {new Intl.NumberFormat("pt-BR", { 
                style: "currency", 
                currency: "BRL", 
                notation: "compact",
                maximumFractionDigits: 1
              }).format(item.amount)}
            </span>
          )}
        </p>
      </div>

      {/* Futuristic accent on hover */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
