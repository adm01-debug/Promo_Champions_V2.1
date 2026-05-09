import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, Medal, Trophy, ChevronRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const RANK_CONFIG = [
  { icon: Crown, color: "text-warning", glow: "rgba(234, 179, 8, 0.4)", label: "Apex" },
  { icon: Medal, color: "text-slate-300", glow: "rgba(148, 163, 184, 0.3)", label: "Elite" },
  { icon: Trophy, color: "text-orange-400", glow: "rgba(251, 146, 60, 0.3)", label: "Ace" },
];

function _MiniLeaderboard() {
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const { salesperson } = useAuth();

  const top3 = ranking?.slice(0, 3) || [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Scanning Pilot Ranks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!top3.length) return <DashboardEmptyState type="leaderboard" />;

  return (
    <Card className="relative overflow-hidden bg-black/40 border-white/5 backdrop-blur-md group">
      {/* Decorative scanline */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-[1px] bg-primary/10"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Crown className="h-3.5 w-3.5" />
            </div>
            Elite Pilots
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/10">
            <Link to="/ranking" className="flex items-center gap-1">
              Full Spectrum
              <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pb-4 relative z-10">
        {top3.map((person, index) => {
          const config = RANK_CONFIG[index];
          const RankIcon = config.icon;
          const isCurrentUser = salesperson?.id === person.id;

          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group/item relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 border",
                isCurrentUser 
                  ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]" 
                  : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]"
              )}
            >
              {/* Rank Badge */}
              <div className="relative shrink-0 flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-black/60 border border-white/10 overflow-hidden">
                <RankIcon className={cn("h-4 w-4 relative z-10", config.color)} style={{ filter: `drop-shadow(0 0 5px ${config.glow})` }} />
                <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: config.glow.replace('0.4', '1').replace('0.3', '1') }} />
              </div>

              {/* Pilot Identity */}
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage src={person.avatar_url || undefined} alt={person.name} />
                  <AvatarFallback className="text-[9px] font-mono font-bold bg-muted/40">
                    {person.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isCurrentUser && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-black flex items-center justify-center">
                    <Zap className="h-1.5 w-1.5 text-black font-black" />
                  </div>
                )}
              </div>

              {/* Data Streams */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "text-[11px] font-mono font-black uppercase tracking-tight truncate",
                    isCurrentUser ? "text-primary" : "text-foreground"
                  )}>
                    {person.name}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest">{config.label}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                   <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden mr-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - (index * 20)}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className={cn("h-full", isCurrentUser ? "bg-primary" : "bg-white/20")}
                      />
                   </div>
                   <span className={cn(
                     "text-[10px] font-mono font-black tabular-nums",
                     isCurrentUser ? "text-primary" : "text-foreground/80"
                   )}>
                    {formatCurrency(person.totalSales)}
                  </span>
                </div>
              </div>

              {/* Status decoration */}
              {isCurrentUser && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3/5 bg-primary" />
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export const MiniLeaderboard = React.memo(_MiniLeaderboard);