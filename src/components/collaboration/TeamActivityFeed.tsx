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
    <div className="relative overflow-hidden glass-morphism rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 via-card/50 to-background/50 shadow-2xl transition-all duration-500 hover:shadow-primary/5">
      {/* Header with status pulse */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-xl bg-primary/10">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm uppercase tracking-tighter italic">Elite Activity</h3>
            <p className="text-[10px] text-muted-foreground/60 font-bold tracking-widest leading-none">REAL-TIME COMMAND FEED</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent/30 border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">LIVE</span>
        </div>
      </div>

      <div className="p-1">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4 rounded-md" />
                  <Skeleton className="h-2 w-1/4 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : !feed?.length ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
              <Phone className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Aguardando comandos da elite...</p>
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto scrollbar-none hover:scrollbar-thin transition-all pr-1">
            <div className="space-y-1 p-2">
              {feed.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Decorative corner scan line */}
      <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none opacity-5">
        <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-primary to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-primary to-transparent" />
      </div>
    </div>
  );
});
TeamActivityFeed.displayName = "TeamActivityFeed";
