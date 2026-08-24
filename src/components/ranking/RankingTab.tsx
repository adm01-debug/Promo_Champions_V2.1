import { memo } from "react";
import { Trophy, Medal, Star, Swords, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { RankingPodium } from "../vendedores/RankingPodium";
import { motion } from "framer-motion";

interface RankingPerson {
  id: string;
  name: string;
  avatar_url: string | null;
  rank: number;
  totalSales: number;
  dealsCount: number;
  leadsCount: number;
  gapToFirst: number;
  gapToNext: number;
  title: string;
  emoji: string;
  color: string;
  role: string;
}

interface RankingTabProps {
  ranking: RankingPerson[];
  leader: RankingPerson | undefined;
  formatCurrency: (value: number) => string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-6 w-6 text-rank-gold" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-rank-silver" />;
  if (rank === 3) return <Medal className="h-6 w-6 text-rank-bronze" />;
  return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
};

const getRankGradient = (rank: number) => {
  if (rank === 1) return "from-rank-gold/20 via-rank-gold/5 to-transparent border-rank-gold/40 shadow-[0_0_20px_rgba(251,191,36,0.1)]";
  if (rank === 2) return "from-slate-400/20 via-slate-400/5 to-transparent border-slate-400/30";
  if (rank === 3) return "from-amber-700/20 via-amber-700/5 to-transparent border-amber-700/30";
  return "from-muted/20 to-transparent border-border/50";
};

export const RankingTab = memo(function RankingTab({ ranking, leader, formatCurrency }: RankingTabProps) {
  const top3 = ranking.slice(0, 3).map(p => ({
    id: p.id,
    name: p.name,
    avatar_url: p.avatar_url,
    totalSales: p.totalSales,
    completedSales: p.dealsCount,
    goalProgress: leader ? (p.totalSales / leader.totalSales) * 100 : 100
  }));

  const others = ranking.slice(3);

  return (
    <div className="space-y-8">
      {/* Cinematic Podium */}
      {ranking.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <RankingPodium top3={top3} />
        </motion.div>
      )}

      {/* Ranking List */}
      <div className="space-y-4">
        {(ranking.length < 3 ? ranking : others).map((person, idx) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={`glass border overflow-hidden transition-all hover:scale-[1.01] group relative bg-gradient-to-r ${getRankGradient(person.rank)}`}
            >
              {/* Scanlines effect for rank 1-3 in list too */}
              {person.rank <= 3 && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)` }} />
              )}
              
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-background/50 border border-border/50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    {getRankIcon(person.rank)}
                  </div>
                  
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-border/50 shadow-md">
                      <AvatarImage src={person.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-black">
                        {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {person.rank === 1 && (
                      <div className="absolute -top-2 -right-2 bg-rank-gold rounded-full p-1 shadow-lg animate-bounce">
                        <Star className="h-3 w-3 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg truncate tracking-tight group-hover:text-primary transition-colors">{person.name}</h3>
                      {person.title && (
                        <Badge className={`bg-gradient-to-r ${person.color} text-primary-foreground border-0 text-[10px] font-black uppercase tracking-widest`}>
                          {person.emoji} {person.title}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3 text-primary" />
                        {person.dealsCount} vendas
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Swords className="h-3 w-3" />
                        {person.leadsCount} leads
                      </span>
                      <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-muted/30 border-border/40 uppercase">
                        {person.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black italic tracking-tighter gradient-text">{formatCurrency(person.totalSales)}</p>
                    <div className="flex flex-col items-end gap-0.5 mt-1">
                      {person.gapToFirst > 0 && (
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                          -{formatCurrency(person.gapToFirst)} para o topo
                        </p>
                      )}
                      {person.gapToNext > 0 && person.rank > 1 && (
                        <p className="text-[10px] font-black text-primary uppercase tracking-tighter animate-pulse">
                          Faltam {formatCurrency(person.gapToNext)} para subir
                        </p>
                      )}
                    </div>
                  </div>

                  {person.rank > 1 && leader && (
                    <div className="w-24 hidden lg:block ml-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase">Progresso</span>
                        <span className="text-[10px] font-black text-primary">
                          {Math.round((person.totalSales / leader.totalSales) * 100)}%
                        </span>
                      </div>
                      <Progress value={(person.totalSales / leader.totalSales) * 100} className="h-1.5" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
