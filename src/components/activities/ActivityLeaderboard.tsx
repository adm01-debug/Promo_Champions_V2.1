import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSDRLeaderboard } from "@/hooks/activities/useActivities";
import { Trophy, Medal, Target } from "lucide-react";
import { motion } from "framer-motion";

export function ActivityLeaderboard() {
  const { data: leaderboard, isLoading } = useSDRLeaderboard();

  if (isLoading) {
    return <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />;
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const others = leaderboard?.slice(3) || [];

  return (
    <Card className="glass border-border/40 dark:border-glow card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <Trophy className="h-4 w-4 text-rank-gold" />
          Top SDRs (Hoje)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 py-4 border-b border-border/40">
          {topThree[1] && (
            <div className="flex flex-col items-center gap-1 order-1">
              <Avatar className="h-12 w-12 border-2 border-slate-300">
                <AvatarImage src={topThree[1].avatar || undefined} />
                <AvatarFallback>{topThree[1].name[0]}</AvatarFallback>
              </Avatar>
              <Medal className="h-4 w-4 text-slate-300" />
              <p className="text-[10px] font-bold truncate max-w-[60px]">{topThree[1].name}</p>
              <p className="text-xs font-black text-slate-400">{topThree[1].count}</p>
            </div>
          )}
          {topThree[0] && (
            <div className="flex flex-col items-center gap-1 order-2 -mt-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-rank-gold shadow-lg shadow-rank-gold/20">
                  <AvatarImage src={topThree[0].avatar || undefined} />
                  <AvatarFallback>{topThree[0].name[0]}</AvatarFallback>
                </Avatar>
                <Trophy className="h-5 w-5 text-rank-gold absolute -top-2 -right-2 rotate-12" />
              </div>
              <p className="text-xs font-bold mt-1">{topThree[0].name}</p>
              <p className="text-sm font-black text-rank-gold">{topThree[0].count}</p>
            </div>
          )}
          {topThree[2] && (
            <div className="flex flex-col items-center gap-1 order-3">
              <Avatar className="h-10 w-10 border-2 border-amber-600">
                <AvatarImage src={topThree[2].avatar || undefined} />
                <AvatarFallback>{topThree[2].name[0]}</AvatarFallback>
              </Avatar>
              <Medal className="h-4 w-4 text-amber-600" />
              <p className="text-[10px] font-bold truncate max-w-[60px]">{topThree[2].name}</p>
              <p className="text-xs font-black text-amber-700">{topThree[2].count}</p>
            </div>
          )}
        </div>

        {/* List of others */}
        <div className="space-y-3">
          {others.map((sdr, index) => (
            <motion.div 
              key={sdr.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground w-4">{index + 4}</span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={sdr.avatar || undefined} />
                  <AvatarFallback>{sdr.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{sdr.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold">{sdr.count}</span>
                <Target className="h-3 w-3 text-primary opacity-50" />
              </div>
            </motion.div>
          ))}
          {leaderboard?.length === 0 && (
            <p className="text-[10px] text-center text-muted-foreground py-8 italic">
              Nenhuma atividade registrada hoje. <br />Que tal ser o primeiro? 🔥
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
