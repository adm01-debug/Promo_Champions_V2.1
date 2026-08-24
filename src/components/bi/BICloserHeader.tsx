import { memo } from "react";
import { Star, Sparkles, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BICloserHeaderProps {
  salesperson: { name?: string; avatar_url?: string | null } | null;
  periodLabel: string;
  goalProgress: number;
  commissionRate: number;
  currentRank: number;
}

export const BICloserHeader = memo(function BICloserHeader({
  salesperson, periodLabel, goalProgress, commissionRate, currentRank
}: BICloserHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-4 ring-primary/30 shadow-xl hover-scale">
              <AvatarImage src={salesperson?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xl font-bold">
                {salesperson?.name?.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {goalProgress >= 100 && (
              <div className="absolute -top-1 -right-1 p-1.5 bg-success rounded-full shadow-lg animate-bounce-in">
                <Star className="h-4 w-4 text-success-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-display flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="gradient-text">BI Closer</span>
            </h1>
            <p className="text-muted-foreground font-medium">{salesperson?.name} • {periodLabel}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <Badge className="bg-primary/10 text-primary border-primary/20">{commissionRate}% comissão</Badge>
              {currentRank <= 3 && (
                <Badge className="rank-gold text-rank-gold-foreground animate-pulse-glow">
                  <Trophy className="h-3 w-3 mr-1" /> Top {currentRank}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-muted-foreground font-medium">Progresso da Meta</span>
            <div className="relative w-28 h-28">
              <svg className="w-full h-full transform -rotate-90" aria-label={`Progresso: ${goalProgress.toFixed(0)}%`}>
                <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="56" cy="56" r="48" fill="none"
                  stroke={goalProgress >= 100 ? "hsl(var(--success))" : "url(#gradientCloser)"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${Math.min(goalProgress, 100) * 3.02} 302`} />
                <defs>
                  <linearGradient id="gradientCloser" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-xl font-black", goalProgress >= 100 ? "text-success" : "gradient-text")}>
                  {goalProgress.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
