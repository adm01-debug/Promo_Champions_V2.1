import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, TrendingUp, TrendingDown } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/useActivityGoals";
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
        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
          <Swords className="h-5 w-5 text-accent animate-bounce-subtle" />
          Duelo de Titãs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4 relative">
          {/* Duelist 1 */}
          <div className="flex-1 text-center space-y-4">
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <Avatar className="h-16 w-16 border-2 border-background relative">
                <AvatarImage src={d1.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary">{d1.salesperson_name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-primary text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-lg">1º</div>
            </div>
            <div>
              <p className="text-sm font-black truncate">{d1.salesperson_name.split(' ')[0]}</p>
              <p className="text-[10px] font-bold text-primary">{d1.progress.overall.toFixed(0)}%</p>
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-2xl font-display font-black italic text-muted-foreground/30 leading-none">VS</div>
            <div className="h-20 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>

          {/* Duelist 2 */}
          <div className="flex-1 text-center space-y-4">
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <Avatar className="h-16 w-16 border-2 border-background relative">
                <AvatarImage src={d2.avatar_url || undefined} />
                <AvatarFallback className="bg-accent/20 text-accent">{d2.salesperson_name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-accent text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-lg">2º</div>
            </div>
            <div>
              <p className="text-sm font-black truncate">{d2.salesperson_name.split(' ')[0]}</p>
              <p className="text-[10px] font-bold text-accent">{d2.progress.overall.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Dynamic Gap Bar */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
            <span className="text-primary flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Liderando</span>
            <span className="text-muted-foreground">Gap: {(d1.progress.overall - d2.progress.overall).toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out" 
              style={{ width: `${(d1.progress.overall / (d1.progress.overall + d2.progress.overall)) * 100}%` }}
            />
            <div 
              className="h-full bg-accent transition-all duration-1000 ease-out" 
              style={{ width: `${(d2.progress.overall / (d1.progress.overall + d2.progress.overall)) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};