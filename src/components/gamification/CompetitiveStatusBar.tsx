import { useAuth } from "@/contexts/AuthContext";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { Crown, Swords, Trophy, TrendingUp, Target, Users, Zap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RANK_ICONS: Record<number, React.ElementType> = {
  1: Crown,
  2: Swords,
  3: Trophy,
};

export function CompetitiveStatusBar() {
  const { salesperson } = useAuth();
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const navigate = useNavigate();

  if (!salesperson) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] border border-white/[0.05] bg-[#0d1117]/30 backdrop-blur-2xl p-6 sm:p-8 flex items-center justify-between group cursor-pointer hover:border-white/[0.1] transition-all duration-700"
        onClick={() => navigate("/auth")}
      >
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Users className="h-6 w-6 text-white/20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tightest text-white/90">Authentication Required</h3>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Enter the arena to claim your ranking</p>
          </div>
        </div>
        <Button variant="default" className="rounded-full px-8 font-black bg-primary text-primary-foreground">LOGIN</Button>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-[2.5rem] border border-white/[0.05] bg-[#0d1117]/30 backdrop-blur-2xl p-6 sm:p-8">
        <div className="flex items-center gap-6">
          <Skeleton className="h-14 w-14 rounded-2xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-3 w-48 bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  const myRanking = ranking?.find(r => r.id === salesperson.id);
  
  if (!myRanking) return null;

  const RankIcon = RANK_ICONS[myRanking.rank] || TrendingUp;
  const isTopThree = myRanking.rank <= 3;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-[2.5rem] border backdrop-blur-2xl p-6 sm:p-8 relative overflow-hidden group",
        isTopThree ? "bg-primary/5 border-primary/20" : "bg-[#0d1117]/30 border-white/[0.05]"
      )}
    >
      <div className="relative z-10 flex items-center gap-8 flex-wrap lg:flex-nowrap">
        {/* === RANK POSITION === */}
        <div className="flex items-center gap-6 shrink-0">
          <div 
            className={cn(
              "h-20 w-20 rounded-[2rem] flex items-center justify-center border transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 shadow-2xl relative",
              myRanking.rank === 1 ? "bg-gradient-to-br from-rank-gold/30 to-rank-gold/5 border-rank-gold/30 shadow-rank-gold/20" : 
              myRanking.rank === 2 ? "bg-gradient-to-br from-rank-silver/30 to-rank-silver/5 border-rank-silver/30 shadow-rank-silver/20" :
              myRanking.rank === 3 ? "bg-gradient-to-br from-rank-bronze/30 to-rank-bronze/5 border-rank-bronze/30 shadow-rank-bronze/20" :
              "bg-white/[0.03] border-white/[0.08]"
            )}
          >
            <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-background border-2 border-current flex items-center justify-center font-black text-xs shadow-xl">
               #{myRanking.rank}
            </div>
            <RankIcon className={cn("h-8 w-8", isTopThree ? "text-white" : "text-white/20")} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black uppercase tracking-tightest text-white">
                {myRanking.title || "Elite Operator"}
              </h3>
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest px-3 py-0.5">
                <Zap className="h-3 w-3 mr-1" />
                Active Season
              </Badge>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex h-5 w-5 rounded-full bg-white/5 border border-white/10 items-center justify-center text-[10px] font-black text-white/40 uppercase">
                 {salesperson.name?.[0]}
               </div>
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">
                 {myRanking.rank === 1 
                   ? "Absolute Dominion • Peak Performance"
                   : `${formatCurrency(myRanking.gapToFirst)} to reach Apex Position`
                 }
               </p>
            </div>
          </div>
        </div>

        {/* === DIVIDER === */}
        <div className="hidden lg:block w-px h-16 bg-white/5 mx-4" />

        {/* === STATS === */}
        <div className="flex-1 flex items-center gap-6 justify-between w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Total Revenue</p>
              <p className="text-xl font-black text-primary tracking-tight tabular-nums">{formatCurrency(myRanking.totalSales)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Success Count</p>
              <p className="text-xl font-black text-white tracking-tight tabular-nums">{myRanking.dealsCount}</p>
            </div>
            {myRanking.leadsCount > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Active Targets</p>
                <div className="flex items-center gap-2">
                   <p className="text-xl font-black text-info tracking-tight tabular-nums">{myRanking.leadsCount}</p>
                   <ShieldCheck className="h-4 w-4 text-info/40" />
                </div>
              </div>
            )}
          </div>

          {myRanking.rank > 1 && (
            <div className="hidden xl:flex flex-col items-end gap-1 px-6 border-l border-white/5">
              <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Delta to Next</p>
              <div className="flex items-center gap-2 text-primary">
                 <TrendingUp className="h-4 w-4" />
                 <span className="text-sm font-black tracking-tighter">+{formatCurrency(myRanking.gapToNext)}</span>
              </div>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-full px-8 font-black border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all shrink-0 ml-4"
            onClick={() => navigate("/pipeline")}
          >
            MANAGE OPS
          </Button>
        </div>
      </div>
      {/* Background glow for top rank */}
      {isTopThree && <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />}
    </motion.div>
  );
}
