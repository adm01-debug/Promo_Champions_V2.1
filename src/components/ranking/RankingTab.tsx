import { memo } from "react";
import { Trophy, Medal, Crown, Star, TrendingUp, Zap, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  if (rank === 1) return "from-rank-gold/20 via-rank-gold/10 to-transparent border-rank-gold/30";
  if (rank === 2) return "from-rank-silver/20 via-rank-silver/10 to-transparent border-rank-silver/30";
  if (rank === 3) return "from-rank-bronze/20 via-rank-bronze/10 to-transparent border-rank-bronze/30";
  return "from-muted/20 to-transparent border-border/50";
};

export const RankingTab = memo(function RankingTab({ ranking, leader, formatCurrency }: RankingTabProps) {
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-10">
      {/* Top 3 Podium Experience */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-8">
        {/* Second Place */}
        {top3[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 md:order-1"
          >
            <Card className="glass border-rank-silver/30 bg-gradient-to-b from-rank-silver/10 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <Medal className="h-10 w-10 text-rank-silver/40" />
              </div>
              <CardContent className="pt-10 pb-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-24 w-24 border-4 border-rank-silver shadow-2xl mx-auto">
                    <AvatarImage src={top3[1].avatar_url || ""} />
                    <AvatarFallback>{top3[1].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-rank-silver text-white h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 border-background">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-black truncate px-4">{top3[1].name}</h3>
                <Badge variant="outline" className="mt-1 border-rank-silver/50 text-rank-silver">{top3[1].title}</Badge>
                <div className="mt-4">
                  <p className="text-2xl font-black text-rank-silver">{formatCurrency(top3[1].totalSales)}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{top3[1].dealsCount} CONTRATOS</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* First Place */}
        {top3[0] && (top3[0].id === leader?.id) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="order-1 md:order-2"
          >
            <Card className="glass border-rank-gold/50 bg-gradient-to-b from-rank-gold/20 via-rank-gold/5 to-transparent relative overflow-hidden shadow-2xl shadow-rank-gold/20 ring-2 ring-rank-gold/20">
              <div className="absolute top-0 inset-x-0 h-1 bg-rank-gold" />
              <div className="absolute top-4 right-4 animate-bounce">
                <Crown className="h-12 w-12 text-rank-gold" />
              </div>
              <CardContent className="pt-12 pb-8 text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-rank-gold rounded-full blur-2xl opacity-20 animate-pulse" />
                  <Avatar className="h-32 w-32 border-4 border-rank-gold shadow-2xl mx-auto relative z-10">
                    <AvatarImage src={top3[0].avatar_url || ""} />
                    <AvatarFallback>{top3[0].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 -right-3 bg-rank-gold text-white h-10 w-10 rounded-full flex items-center justify-center font-black text-xl border-4 border-background shadow-lg">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-black truncate px-4 bg-gradient-to-r from-rank-gold to-yellow-500 bg-clip-text text-transparent">
                  {top3[0].name}
                </h3>
                <Badge className="mt-2 bg-rank-gold text-white border-0 px-4 py-1 text-sm font-bold animate-pulse">
                  {top3[0].emoji} {top3[0].title}
                </Badge>
                <div className="mt-6 space-y-1">
                  <p className="text-4xl font-black gradient-text tracking-tighter">
                    {formatCurrency(top3[0].totalSales)}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                    DOMINAÇÃO TOTAL: {top3[0].dealsCount} VENDAS
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Third Place */}
        {top3[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="order-3 md:order-3"
          >
            <Card className="glass border-rank-bronze/30 bg-gradient-to-b from-rank-bronze/10 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Medal className="h-10 w-10 text-rank-bronze/40" />
              </div>
              <CardContent className="pt-10 pb-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-24 w-24 border-4 border-rank-bronze shadow-2xl mx-auto">
                    <AvatarImage src={top3[2].avatar_url || ""} />
                    <AvatarFallback>{top3[2].name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-rank-bronze text-white h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 border-background">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-black truncate px-4">{top3[2].name}</h3>
                <Badge variant="outline" className="mt-1 border-rank-bronze/50 text-rank-bronze">{top3[2].title}</Badge>
                <div className="mt-4">
                  <p className="text-2xl font-black text-rank-bronze">{formatCurrency(top3[2].totalSales)}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{top3[2].dealsCount} CONTRATOS</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Rest of the Ranking List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Performers</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Métricas de Elite</span>
        </div>
        {rest.map((person) => (
          <motion.div key={person.id} variants={itemVariants}>
            <Card
              className={`glass border overflow-hidden transition-all duration-300 hover:border-primary/50 bg-gradient-to-r ${getRankGradient(person.rank)} group`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center font-black text-muted-foreground group-hover:text-primary transition-colors">
                    #{person.rank}
                  </div>
                  <Avatar className="h-14 w-14 border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={person.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                      {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{person.name}</h3>
                      {person.title && (
                        <Badge className={`bg-gradient-to-r ${person.color} text-primary-foreground border-0 shadow-sm`}>
                          {person.emoji} {person.title}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        <span>{person.dealsCount} vendas</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Target className="h-3.5 w-3.5 text-accent" />
                        <span>{person.leadsCount} leads</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-bold h-5 px-1.5">{person.role.toUpperCase()}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black gradient-text tracking-tight">{formatCurrency(person.totalSales)}</p>
                    <div className="flex flex-col items-end gap-0.5">
                      {person.gapToFirst > 0 && (
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">GAP 1º: {formatCurrency(person.gapToFirst)}</p>
                      )}
                      {person.gapToNext > 0 && person.rank > 1 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-tighter">
                          <TrendingUp className="h-3 w-3" />
                          <span>PRÓXIMO: {formatCurrency(person.gapToNext)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {leader && (
                    <div className="w-24 hidden lg:block ml-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground">POWER</span>
                        <span className="text-[10px] font-bold text-primary">{Math.round((person.totalSales / leader.totalSales) * 100)}%</span>
                      </div>
                      <Progress value={(person.totalSales / leader.totalSales) * 100} className="h-1.5" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});
