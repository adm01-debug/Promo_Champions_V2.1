import React from "react";
import { useTeamActivityFeed, TeamActivity } from "@/hooks/useTeamActivityFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Phone, ArrowRight, UserPlus, Zap, Radio } from "lucide-react";
import { motion } from "framer-motion";

const TYPE_CONFIG: Record<TeamActivity["type"], { icon: React.ElementType; color: string; bg: string; label: string; glow: string }> = {
  sale: { icon: DollarSign, color: "text-success", bg: "bg-success/10", label: "Confirmed Sale", glow: "rgba(34, 197, 94, 0.4)" },
  activity: { icon: Phone, color: "text-primary", bg: "bg-primary/10", label: "Sector Comms", glow: "rgba(14, 165, 233, 0.4)" },
  deal_move: { icon: ArrowRight, color: "text-warning", bg: "bg-warning/10", label: "Pipeline Shift", glow: "rgba(234, 179, 8, 0.4)" },
  client_new: { icon: UserPlus, color: "text-indigo-400", bg: "bg-indigo-400/10", label: "New Asset", glow: "rgba(129, 140, 248, 0.4)" },
};

const ActivityItem = React.memo(({ item, index }: { item: TeamActivity; index: number }) => {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-white/[0.04] border border-transparent hover:border-white/5 overflow-hidden"
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 ring-1 ring-white/10 group-hover:ring-primary/40 transition-all">
          <AvatarImage src={item.avatar_url || undefined} />
          <AvatarFallback className="text-[10px] font-mono font-black bg-black/60 border border-white/5">
            {item.salesperson_name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={cn("absolute -bottom-1 -right-1 p-1 rounded-lg border border-black shadow-lg", config.bg)}>
          <Icon className={cn("h-3 w-3", config.color)} style={{ filter: `drop-shadow(0 0 5px ${config.glow})` }} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={cn("text-[9px] font-mono font-black uppercase tracking-[0.2em]", config.color)}>
            {config.label}
          </span>
          <span className="text-[8px] font-mono font-bold text-muted-foreground/40 uppercase tracking-tighter">
            {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
        
        <p className="text-[11px] font-mono leading-relaxed">
          <span className="font-black text-foreground group-hover:text-primary transition-colors">
            {item.salesperson_name}
          </span>{" "}
          <span className="text-muted-foreground/80 lowercase">{item.description}</span>
          {item.amount != null && (
            <span className="ml-2 font-black text-success tabular-nums bg-success/5 px-1.5 py-0.5 rounded border border-success/20">
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

      {/* Decorative pulse line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 group-hover:h-3/5 bg-primary transition-all duration-300" />
    </motion.div>
  );
});
ActivityItem.displayName = "ActivityItem";

export const TeamActivityFeed = React.memo(() => {
  const { data: feed, isLoading } = useTeamActivityFeed(15);

  return (
    <div className="relative overflow-hidden bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <div className="flex items-center justify-between p-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
             <motion.div 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 blur-lg rounded-full" 
             />
             <div className="relative p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
             </div>
          </div>
          <div>
            <h3 className="text-xs font-mono font-black uppercase tracking-[0.3em] text-primary">Sector Comms</h3>
            <div className="flex items-center gap-2">
               <Radio className="h-3 w-3 text-success animate-pulse" />
               <p className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">Command Stream Active</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 border border-white/5">
           <span className="text-[9px] font-mono font-black text-primary uppercase tracking-widest">Live Link</span>
        </div>
      </div>

      <div className="relative z-10">
        {isLoading ? (
          <div className="space-y-4 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-white/5 animate-pulse rounded" />
                  <div className="h-2 w-1/4 bg-white/5 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !feed?.length ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-6 opacity-30">
            <Radio className="h-10 w-10 text-muted-foreground animate-pulse mb-4" />
            <p className="font-mono text-[10px] uppercase tracking-[0.4em]">Listening for transmissions...</p>
          </div>
        ) : (
          <div className="max-h-[440px] overflow-y-auto scrollbar-none hover:scrollbar-thin transition-all pr-1">
            <div className="space-y-1 px-2 pb-4">
              {feed.map((item, idx) => (
                <ActivityItem key={item.id} item={item} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Decorative vertical scanline */}
      <motion.div 
        className="absolute top-0 right-0 w-[1px] h-full bg-primary/10"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </div>
  );
});
TeamActivityFeed.displayName = "TeamActivityFeed";