import React from "react";
// Import with a dummy comment to force change if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, TrendingUp, TrendingDown } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/activities/useActivityGoals";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ActivityVersusDuelProps {
  data: ActivityGoalProgress[];
}

export const ActivityVersusDuel: React.FC<ActivityVersusDuelProps> = ({ data }) => {
  // Pick top 2 for a duel (or random top)
  const duelists = data
    .filter(d => d.hasGoals)
    .sort((a, b) => b.progress.overall - a.progress.overall)
    .slice(0, 2);

  if (duelists.length < 2) return null;

  const [d1, d2] = duelists;

  return (
    <Card variant="glass" className="overflow-hidden border-accent/20 bg-accent/5 backdrop-blur-xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" />
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
          <div className="p-2 rounded-xl bg-accent/20 border border-accent/30 shadow-glow-accent/20 animate-pulse">
            <Swords className="h-4 w-4 text-accent" />
          </div>
          Duelo de Titãs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4 relative">
          {/* Duelist 1 - The Challenger/Leader */}
          <div className="flex-1 text-center space-y-4">
            <div className="relative inline-block group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-md opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <Avatar className="h-20 w-20 border-2 border-primary/50 relative shadow-glow-primary/20 transition-transform group-hover:scale-110">
                <AvatarImage src={d1.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-black text-xl">{d1.salesperson_name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-primary text-[10px] font-black px-2.5 py-1 rounded-md text-white shadow-glow-primary/40 border border-white/20 transform rotate-3">1º PLACE</div>
            </div>
            <div>
              <p className="text-sm font-black truncate tracking-tighter uppercase italic">{d1.salesperson_name.split(' ')[0]}</p>
              <p className="text-lg font-display font-black text-primary drop-shadow-glow">{d1.progress.overall.toFixed(0)}%</p>
            </div>
          </div>

          {/* VS Hologram */}
          <div className="flex flex-col items-center justify-center relative px-4">
            <div className="text-3xl font-display font-black italic text-muted-foreground/20 leading-none select-none">VS</div>
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full scale-150 animate-pulse" />
            <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          </div>

          {/* Duelist 2 - The Defender */}
          <div className="flex-1 text-center space-y-4">
            <div className="relative inline-block group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-accent via-primary to-accent rounded-full blur-md opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <Avatar className="h-20 w-20 border-2 border-accent/50 relative shadow-glow-accent/20 transition-transform group-hover:scale-110">
                <AvatarImage src={d2.avatar_url || undefined} />
                <AvatarFallback className="bg-accent/20 text-accent font-black text-xl">{d2.salesperson_name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-accent text-[10px] font-black px-2.5 py-1 rounded-md text-white shadow-glow-accent/40 border border-white/20 transform -rotate-3">2º PLACE</div>
            </div>
            <div>
              <p className="text-sm font-black truncate tracking-tighter uppercase italic">{d2.salesperson_name.split(' ')[0]}</p>
              <p className="text-lg font-display font-black text-accent drop-shadow-glow">{d2.progress.overall.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Dynamic Gap Bar & Prediction */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest px-1">
            <span className="text-primary flex items-center gap-1.5 drop-shadow-glow">
              <TrendingUp className="h-3.5 w-3.5" /> Liderando
            </span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/60">GAP</span>
              <span className="text-accent font-black">{(d1.progress.overall - d2.progress.overall).toFixed(1)}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden flex shadow-inner border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000 ease-out relative" 
              style={{ width: `${(d1.progress.overall / (d1.progress.overall + d2.progress.overall)) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            <div 
              className="h-full bg-gradient-to-l from-accent to-accent/80 transition-all duration-1000 ease-out relative" 
              style={{ width: `${(d2.progress.overall / (d1.progress.overall + d2.progress.overall)) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
            </div>
          </div>
          
          {/* Prediction Tactical Card */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 group-hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30 shadow-glow-accent/20">
              <TrendingDown className="h-4 w-4 text-accent animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Projeção Arena Predictor</p>
              <p className="text-[10px] font-black text-foreground">
                <span className="text-accent">{d2.salesperson_name.split(' ')[0]}</span> precisa de <span className="text-primary">+{((d1.progress.overall - d2.progress.overall) * 1.5).toFixed(0)} calls</span> para virar o jogo nas próximas 2h.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};